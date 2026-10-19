#!/usr/bin/env node
/**
 * Fail closed on npm advisories except two time-limited, development-only
 * advisories that lack a non-breaking upgrade on the Tailwind 3 toolchain.
 * The CI separately runs npm audit --omit=dev to enforce a clean runtime tree.
 */
import { spawnSync } from "node:child_process";

const exceptionExpiry = "2026-11-19";
const exceptions = new Map([
  ["braces", new Set(["GHSA-vfj7-8cjw-p6xm"])],
  ["postcss-selector-parser", new Set(["GHSA-rj75-hqrm-r3gf"])],
]);

if (new Date().toISOString().slice(0, 10) >= exceptionExpiry) {
  console.error("The temporary development-audit exception has expired; re-review advisories.");
  process.exit(1);
}

const result = spawnSync("npm", ["audit", "--json"], {
  encoding: "utf8",
  maxBuffer: 8 * 1024 * 1024,
});
if (result.error || (result.status !== 0 && result.status !== 1)) {
  console.error("Unable to obtain an npm audit report", result.error ?? result.stderr);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(result.stdout);
} catch {
  console.error("npm audit returned malformed JSON.");
  process.exit(1);
}
if (report.error || !report.vulnerabilities || !report.metadata?.vulnerabilities) {
  console.error("npm audit returned an incomplete/error report.", report.error);
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities;
const checked = new Set();
const visiting = new Set();

function allowedPath(name) {
  if (checked.has(name)) return true;
  if (visiting.has(name)) return false;
  const entry = vulnerabilities[name];
  if (!entry || !Array.isArray(entry.via) || entry.via.length === 0) return false;
  visiting.add(name);
  const allowed = entry.via.every((source) => {
    if (typeof source === "string") return allowedPath(source);
    const identifier = /GHSA-[a-z0-9-]+/.exec(source.url || "")?.[0];
    return exceptions.get(name)?.has(identifier) === true;
  });
  visiting.delete(name);
  if (allowed) checked.add(name);
  return allowed;
}

const unapproved = Object.keys(vulnerabilities).filter((name) => !allowedPath(name));
if (unapproved.length) {
  console.error("Unapproved npm audit findings:", unapproved.join(", "));
  console.error("See npm audit for details; do not broaden the exception without a new review.");
  process.exit(1);
}

console.log(
  "Only reviewed, temporary Tailwind 3 development-toolchain advisories remain:",
  Object.keys(vulnerabilities).join(", "),
);
console.log("Exception expires:", exceptionExpiry);
