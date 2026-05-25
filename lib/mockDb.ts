import * as fs from "fs";
import * as path from "path";

const MOCK_DB_PATH = path.resolve(process.cwd(), "scratch/mock_db.json");

export function isMockMode() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !url || !key || url.includes("tu-proyecto") || key.includes("tu-clave-service-role");
}

export function getMockDb() {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const initial = { orders: {}, intakes: {} };
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  
  const content = fs.readFileSync(MOCK_DB_PATH, "utf-8");
  return JSON.parse(content);
}

export function saveMockDb(db: any) {
  const dir = path.dirname(MOCK_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}
