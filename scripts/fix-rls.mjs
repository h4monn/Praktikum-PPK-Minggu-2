import fs from 'fs';
import postgres from 'postgres';

// Load .env
const envFile = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => envFile.match(new RegExp(`^${key}="(.*)"$|^${key}=(.*)$`, 'm'))?.[1]?.trim() || envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[2]?.trim();

let dbUrl = getEnv('DATABASE_URL');
if (dbUrl && dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1);
}

const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    console.log('Connecting to database to fix RLS for Mockup...');
    
    // First, let's drop the policy if it exists to be safe
    await sql`DROP POLICY IF EXISTS "Mockup testing anon access" ON public.transactions`;
    
    // Create the mockup policy
    await sql`
      CREATE POLICY "Mockup testing anon access" ON public.transactions
      FOR ALL TO anon
      USING (user_id = '11111111-1111-1111-1111-111111111111')
      WITH CHECK (user_id = '11111111-1111-1111-1111-111111111111');
    `;
    
    console.log('✅ RLS Policy "Mockup testing anon access" successfully created!');
    console.log('You can now test CRUD operations from the UI.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to update RLS Policy:', err);
    process.exit(1);
  }
}

run();
