import {fileURLToPath} from "url";
import path from "path";
import dotenv from "dotenv";
import {Features} from "./features.mjs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
await Features.enable(__dirname);