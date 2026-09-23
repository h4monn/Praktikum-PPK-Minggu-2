import fs from 'fs';
import postgres from 'postgres';

// Load .env
const envFile = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => envFile.match(new RegExp(`^${key}="(.*)"$|^${key}=(.*)$`, 'm'))?.[1]?.trim() || envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[2]?.trim();

let dbUrl = getEnv('DATABASE_URL');

// Remove quotes if present
if (dbUrl && dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
  dbUrl = dbUrl.slice(1, -1);
}

// In case the user wrote [password] literally in .env, this checks and logs
console.log('Testing connection to:', dbUrl.replace(/:([^:@]+)@/, ':***@'));

const sql = postgres(dbUrl, { ssl: 'require' });

async function run() {
  try {
    const [{ version }] = await sql`select version()`;
    console.log('✅ Connected successfully to PostgreSQL!');
    console.log('Database version:', version);
    
    console.log('\nReading schema.sql...');
    const schema = fs.readFileSync('scripts/schema.sql', 'utf8');
    
    console.log('Executing schema.sql...');
    await sql.unsafe(schema);
    console.log('✅ Schema and dummy data inserted successfully!');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection or Execution Failed:');
    console.error(err.message);
    if (err.message.includes('password authentication failed')) {
      console.log('\n💡 Hint: It seems the password in DATABASE_URL might be wrong or contains literal brackets like [password] when it shouldn\'t.');
    }
    process.exit(1);
  }
}

run();
