import fs from "fs";
import path from "path";

const source = "emojis.json";
const target = "emojis_db.json";

const emojis = JSON.parse(fs.readFileSync(source, "utf8"));

const base = emojis.emojis;
const groupNames = Object.keys(base);

