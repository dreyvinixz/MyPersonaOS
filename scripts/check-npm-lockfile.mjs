#!/usr/bin/env node
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
if (lock.lockfileVersion !== 3 || !lock.packages || !lock.packages[""]) {
  throw new Error("Expected npm package-lock v3 with a root manifest.");
}
const root = lock.packages[""];
for (const group of ["dependencies", "devDependencies", "optionalDependencies"]) {
  const expected = manifest[group] ?? {};
  const actual = root[group] ?? {};
  if (JSON.stringify(Object.entries(expected).sort()) !== JSON.stringify(Object.entries(actual).sort())) {
    throw new Error("The npm lockfile root does not match package.json: " + group);
  }
}
let count = 0;
for (const [location, dependency] of Object.entries(lock.packages)) {
  if (!location) continue;
  if (dependency.link || !dependency.resolved || !dependency.integrity) {
    throw new Error("Unpinned or locally linked dependency: " + location);
  }
  const url = new URL(dependency.resolved);
  if (url.protocol !== "https:" || url.hostname !== "registry.npmjs.org" || url.port || url.username || url.password) {
    throw new Error("Dependency outside the official HTTPS npm registry: " + location);
  }
  if (!/^sha512-[A-Za-z0-9+/=]+(?: sha512-[A-Za-z0-9+/=]+)*$/.test(dependency.integrity)) {
    throw new Error("Missing SHA-512 integrity metadata: " + location);
  }
  count++;
}
console.log("Checked " + count + " npm packages: official registry, sha512 integrity, no git/file/tarball links.");
