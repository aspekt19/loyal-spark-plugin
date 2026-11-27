#!/usr/bin/env node
/**
 * Single-plugin validator adapted from cursor/plugin-template and
 * https://github.com/cursor/plugins schemas. Run from repo root:
 *   node scripts/validate-plugin.mjs
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const errors = [];
const warnings = [];
const oks = [];

const pluginNamePattern = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;

function ok(msg) {
  oks.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}
function err(msg) {
  errors.push(msg);
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJson(p) {
  const raw = await fs.readFile(p, "utf8");
  return JSON.parse(raw);
}

function isSafeRelative(p) {
  if (typeof p !== "string" || !p) return false;
  if (path.isAbsolute(p)) return false;
  if (p.includes("..")) return false;
  return true;
}

function parseFrontmatter(content) {
  const normalized = content.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return null;
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) return null;
  const block = normalized.slice(4, end);
  const fields = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fields[m[1]] = value;
  }
  return fields;
}

async function checkManifest() {
  const marketplacePath = path.join(repoRoot, ".cursor-plugin", "marketplace.json");
  const manifestPath = path.join(repoRoot, ".cursor-plugin", "plugin.json");

  if (await exists(marketplacePath)) {
    err("This repo is a single plugin; do not add .cursor-plugin/marketplace.json here.");
  }

  if (!(await exists(manifestPath))) {
    err(".cursor-plugin/plugin.json is missing");
    return null;
  }
  ok(".cursor-plugin/plugin.json exists");

  let manifest;
  try {
    manifest = await readJson(manifestPath);
    ok("plugin.json is valid JSON");
  } catch (e) {
    err(`plugin.json invalid JSON: ${e.message}`);
    return null;
  }

  if (!manifest.name) err("plugin.json missing required field: name");
  else if (!pluginNamePattern.test(manifest.name))
    err(`plugin.json name "${manifest.name}" does not match kebab-case pattern`);
  else ok(`plugin.json name "${manifest.name}"`);

  if (manifest.logo) {
    if (!isSafeRelative(manifest.logo) && !/^https?:\/\//.test(manifest.logo)) {
      err(`plugin.json logo path unsafe: "${manifest.logo}"`);
    } else if (isSafeRelative(manifest.logo)) {
      const logoPath = path.join(repoRoot, manifest.logo);
      if (!(await exists(logoPath))) err(`plugin.json logo path does not resolve: ${manifest.logo}`);
      else ok(`plugin.json logo "${manifest.logo}" resolves`);
    }
  } else {
    warn("plugin.json has no logo field");
  }

  if (manifest.variables) {
    if (manifest.variables.type !== "object") {
      err('plugin.json variables.type must be "object"');
    } else {
      ok("plugin.json variables schema present");
    }
  }

  return manifest;
}

async function checkMcp(manifest) {
  const mcpPath = path.join(repoRoot, "mcp.json");
  if (!(await exists(mcpPath))) {
    warn("mcp.json not found (optional if mcpServers is inline)");
    return;
  }
  let mcp;
  try {
    mcp = await readJson(mcpPath);
    ok("mcp.json is valid JSON");
  } catch (e) {
    err(`mcp.json invalid JSON: ${e.message}`);
    return;
  }
  if (!mcp.mcpServers || typeof mcp.mcpServers !== "object") {
    err('mcp.json must contain an "mcpServers" object');
    return;
  }
  const varNames = new Set(
    Object.keys(manifest?.variables?.properties || {})
  );
  const placeholderRe = /\$\{([A-Z0-9_]+)\}/g;
  for (const [serverName, cfg] of Object.entries(mcp.mcpServers)) {
    if (!cfg.url && !cfg.command) {
      err(`mcp server "${serverName}" needs url or command`);
    } else {
      ok(`mcp server "${serverName}" has transport`);
    }
    const blob = JSON.stringify(cfg);
    let m;
    while ((m = placeholderRe.exec(blob)) !== null) {
      if (!varNames.has(m[1])) {
        err(
          `mcp.json uses \${${m[1]}} but plugin.json variables.properties does not declare it`
        );
      } else {
        ok(`variable \${${m[1]}} declared for server "${serverName}"`);
      }
    }
  }
}

async function checkSkills() {
  const skillsDir = path.join(repoRoot, "skills");
  if (!(await exists(skillsDir))) {
    warn("skills/ directory not found");
    return;
  }
  const entries = await fs.readdir(skillsDir, { withFileTypes: true });
  const dirs = entries.filter((e) => e.isDirectory());
  if (dirs.length === 0) {
    warn("skills/ has no skill directories");
    return;
  }
  for (const d of dirs) {
    const skillPath = path.join(skillsDir, d.name, "SKILL.md");
    if (!(await exists(skillPath))) {
      err(`skills/${d.name}/ is missing SKILL.md`);
      continue;
    }
    const content = await fs.readFile(skillPath, "utf8");
    const fm = parseFrontmatter(content);
    if (!fm) {
      err(`skills/${d.name}/SKILL.md missing YAML frontmatter`);
      continue;
    }
    if (!fm.name) err(`skills/${d.name}/SKILL.md frontmatter missing name`);
    if (!fm.description)
      err(`skills/${d.name}/SKILL.md frontmatter missing description`);
    if (fm.name && fm.name !== d.name) {
      warn(
        `skills/${d.name}/SKILL.md name "${fm.name}" differs from directory name`
      );
    }
    ok(`skill ${d.name}`);
  }
}

async function checkGemini() {
  const geminiPath = path.join(repoRoot, "gemini-extension.json");
  if (!(await exists(geminiPath))) {
    warn("gemini-extension.json not found");
    return;
  }
  try {
    const gemini = await readJson(geminiPath);
    ok("gemini-extension.json is valid JSON");
    if (!gemini.name) err("gemini-extension.json missing name");
    if (!gemini.version) err("gemini-extension.json missing version");
    if (!gemini.mcpServers) err("gemini-extension.json missing mcpServers");
    else {
      for (const [name, cfg] of Object.entries(gemini.mcpServers)) {
        if (!cfg.httpUrl && !cfg.url && !cfg.command) {
          err(`gemini mcp server "${name}" needs httpUrl, url, or command`);
        } else {
          ok(`gemini mcp server "${name}" configured`);
        }
      }
    }
  } catch (e) {
    err(`gemini-extension.json invalid JSON: ${e.message}`);
  }
}

async function main() {
  const manifest = await checkManifest();
  await checkMcp(manifest);
  await checkSkills();
  await checkGemini();

  console.log(`\nSummary: ${oks.length} ok, ${warnings.length} warnings, ${errors.length} errors`);
  for (const m of oks) console.log(`  OK  ${m}`);
  for (const m of warnings) console.log(`  WARN  ${m}`);
  for (const m of errors) console.log(`  ERR  ${m}`);
  if (manifest?.name) console.log(`Plugin: ${manifest.name}@${manifest.version ?? "?"}`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
