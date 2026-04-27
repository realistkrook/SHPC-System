import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars manually since we are running this with node
// We'll try to read .env.local or just hardcode/ask user if missing.
// For this environment, we'll try to read from the file system if possible,
// or assume the user has them set in their environment.
// Actually, we can't easily read .env in this script without dotenv, 
// but we can try to parse it.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env file
function readEnv(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        return {};
    }
}

const envPath = path.resolve(__dirname, '../.env'); // Adjust path as needed
const env = readEnv(envPath);

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
// Note: To run migrations, we usually need the SERVICE_ROLE_KEY, not the anon key.
// If we only have the anon key, we might be blocked from running DDL statements.
// However, if RLS is not enabled on the `houses` table yet, maybe we can?
// No, `create policy` requires admin privileges.

// If we don't have the service role key, we CANNOT apply migrations from here.
// We must ask the user to run them in the dashboard.

console.log("Checking for Service Role Key...");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error("ERROR: Missing SUPABASE_SERVICE_ROLE_KEY.");
    console.error("I cannot apply migrations without the service role key.");
    console.error("Please run the SQL files in 'supabase/migrations' manually in your Supabase Dashboard SQL Editor.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runMigration(filePath) {
    console.log(`Running migration: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');

    // Supabase JS client doesn't have a direct 'query' method for raw SQL exposed easily 
    // unless we use the pg driver or a specific RPC.
    // But wait, if we have the service role key, we can use the REST API to call a function?
    // No, we need to execute raw SQL.

    // Actually, the standard supabase-js client DOES NOT support running raw SQL strings 
    // unless you have a stored procedure to do so (like `exec_sql`).

    console.log("----------------------------------------------------------------");
    console.log("CONTENT TO RUN:");
    console.log(sql);
    console.log("----------------------------------------------------------------");
    console.log("NOTE: supabase-js cannot execute raw SQL directly.");
    console.log("Please copy the SQL above and run it in the Supabase Dashboard SQL Editor.");
}

async function main() {
    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

    for (const file of files) {
        await runMigration(path.join(migrationsDir, file));
    }
}

main();
