#!/usr/bin/env node
/**
 * seyhunakyurek CLI — https://seyhunakyurek.com
 * Thin wrapper over the public portfolio API + MCP discovery.
 * Usage: npx seyhunakyurek [projects|project <slug>|profile|mcp] [--json]
 */

const API = (process.env.SEYHUNAKYUREK_API || "https://seyhunakyurek.com").replace(/\/$/, "");
const args = process.argv.slice(2);
const jsonFlag = args.includes("--json");
const cmd = args.find(a => !a.startsWith("-") && !a.startsWith("http://") && !a.startsWith("https://")) || "help";
const baseUrlIndex = args.indexOf("--base-url");
const baseUrl = baseUrlIndex !== -1 ? args[baseUrlIndex + 1] : API;
if (baseUrlIndex !== -1 && !baseUrl) {
  console.error("--base-url requires a URL");
  process.exit(1);
}

function printHelp() {
  console.log(`seyhunakyurek — CLI for https://seyhunakyurek.com
Usage:
  npx seyhunakyurek projects [--json] [--category <cat>]
  npx seyhunakyurek project <slug> [--json]
  npx seyhunakyurek profile [--json]
  npx seyhunakyurek mcp [--json]
  npx seyhunakyurek openapi [--json]
  npx seyhunakyurek --base-url http://localhost:3000 projects --json
  npx seyhunakyurek --help

Docs: https://seyhunakyurek.com/developers
OpenAPI: https://seyhunakyurek.com/openapi.json
MCP: https://seyhunakyurek.com/api/mcp
`);
}

async function fetchJson(path) {
  const res = await fetch(`${baseUrl}${path}`, { headers: { "Accept": "application/json" }});
  let body;
  try { body = await res.json(); } catch { body = {}; }
  const rl = {
    limit: res.headers.get("RateLimit-Limit"),
    remaining: res.headers.get("RateLimit-Remaining"),
    reset: res.headers.get("RateLimit-Reset"),
    version: res.headers.get("API-Version"),
  };
  if (!res.ok) {
    const err = body?.error?.message || res.statusText;
    throw new Error(`${res.status} ${err} (RateLimit: ${rl.remaining}/${rl.limit})`);
  }
  return { body, rl };
}
async function fetchWithFallback(v1Path, unversionedPath) {
  try {
    return await fetchJson(v1Path);
  } catch (e) {
    if (String(e.message).startsWith("404")) return await fetchJson(unversionedPath);
    throw e;
  }
}

async function main() {
  if (args.includes("--help") || args.includes("-h") || cmd === "help") {
    printHelp();
    return;
  }
  if (cmd === "projects") {
    const catIdx = args.indexOf("--category");
    const cat = catIdx !== -1 ? args[catIdx+1] : null;
    const q = cat ? `?category=${encodeURIComponent(cat)}` : "";
    // Prefer versioned endpoint, fallback to unversioned until deployed
    const { body, rl } = await fetchWithFallback(`/api/v1/webmcp/projects${q}`, `/api/webmcp/projects${q}`);
    if (jsonFlag) console.log(JSON.stringify(body, null, 2));
    else {
      console.log(`Seyhun Akyurek — ${body.count}/${body.total} projects (v1)  RateLimit ${rl.remaining}/${rl.limit}`);
      for (const p of body.projects) console.log(`- ${p.slug}  ${p.title} [${p.category}]  ${API}${p.href}`);
      console.log(`\nCategories: ${body.categories.join(", ")}`);
    }
    return;
  }
  if (cmd === "project") {
    const slug = args[args.indexOf(cmd)+1];
    if (!slug || slug.startsWith("-")) { console.error("Missing slug. Usage: npx seyhunakyurek project <slug>"); process.exit(1); }
    const { body } = await fetchWithFallback(`/api/v1/webmcp/projects/${encodeURIComponent(slug)}`, `/api/webmcp/projects/${encodeURIComponent(slug)}`);
    if (jsonFlag) console.log(JSON.stringify(body, null, 2));
    else {
      console.log(`${body.title} — ${body.subtitle}\nCategory: ${body.category}\n${body.description}\n\nTech: ${(body.techStack||[]).join(", ")}\nURL: ${API}/projects/${body.slug}`);
    }
    return;
  }
  if (cmd === "profile") {
    const { body } = await fetchJson(`/api/mcp`); // discovery as proxy for profile
    // Use MCP tool get_site_profile via POST
    const res = await fetch(`${baseUrl}/api/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc:"2.0", id:1, method:"tools/call", params:{ name:"get_site_profile", arguments:{} }})
    });
    const data = await res.json();
    const profile = data.result?.structuredContent || data.result;
    if (jsonFlag) console.log(JSON.stringify(profile, null, 2));
    else console.log(JSON.stringify(profile, null, 2));
    return;
  }
  if (cmd === "mcp") {
    const { body } = await fetchJson(`/api/mcp`);
    if (jsonFlag) console.log(JSON.stringify(body, null, 2));
    else {
      console.log(`MCP discovery — ${API}/api/mcp (Streamable HTTP, Seyhun Akyurek)`);
      console.log(JSON.stringify(body, null, 2));
    }
    return;
  }
  if (cmd === "openapi") {
    const { body } = await fetchJson(`/openapi.json`);
    const output = { openapi: body.openapi, info: body.info, version: body.info?.version };
    if (jsonFlag) console.log(JSON.stringify(output, null, 2));
    else {
      console.log(`${baseUrl}/openapi.json  (alias ${baseUrl}/api/openapi.json)`);
      console.log(JSON.stringify(output, null, 2));
    }
    return;
  }
  console.error(`Unknown command: ${cmd}`);
  printHelp();
  process.exit(1);
}

main().catch(e => { console.error(e.message); process.exit(1); });
