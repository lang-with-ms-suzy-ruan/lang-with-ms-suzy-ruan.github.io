#!/usr/bin/env node
// Usage:
//   node manage-students.js list
//   node manage-students.js add <StudentID> <password>
//   node manage-students.js delete <StudentID>
// After changes, commit src/data/students.json and push to redeploy.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "src", "data", "students.json");

function hash(password) {
  return createHash("sha256").update(password).digest("hex");
}

function load() {
  return JSON.parse(readFileSync(DATA_PATH, "utf8"));
}

function save(data) {
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n");
}

const [, , command, id, password] = process.argv;

if (command === "list") {
  const { students } = load();
  if (students.length === 0) {
    console.log("No students.");
  } else {
    console.log(`${students.length} student(s):`);
    students.forEach(s => console.log(`  - ${s.id}`));
  }
} else if (command === "add") {
  if (!id || !password) {
    console.error("Usage: node manage-students.js add <StudentID> <password>");
    process.exit(1);
  }
  const data = load();
  if (data.students.find(s => s.id === id)) {
    console.error(`Student ID "${id}" already exists.`);
    process.exit(1);
  }
  data.students.push({ id, hash: hash(password) });
  save(data);
  console.log(`Added student "${id}".`);
} else if (command === "delete") {
  if (!id) {
    console.error("Usage: node manage-students.js delete <StudentID>");
    process.exit(1);
  }
  const data = load();
  const before = data.students.length;
  data.students = data.students.filter(s => s.id !== id);
  if (data.students.length === before) {
    console.error(`Student ID "${id}" not found.`);
    process.exit(1);
  }
  save(data);
  console.log(`Deleted student "${id}".`);
} else {
  console.log("Usage: node manage-students.js <list|add|delete> [StudentID] [password]");
}
