import {fileURLToPath} from "url";
import path from "path";
import dotenv from "dotenv";
import {FeatureManager} from "./featureManager";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
await FeatureManager.enable(__dirname);