import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env directly
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const getEnv = (key) => envFile.match(new RegExp(`^${key}="(.*)"$`, 'm'))?.[1]?.trim() || envFile.match(new RegExp(`^${key}=(.*)$`, 'm'))?.[1]?.trim();

const connectionString = getEnv('DATABASE_URL');

if (!connectionString) {
  console.error('❌ ERROR: DATABASE_URL not found in .env');
  process.exit(1);
}

const sql = postgres(connectionString);

async function migrate() {
  console.log('🚀 Starting Database Migration...');
  try {
    await sql.begin(async (sql) => {
      // 1. Check if the old table exists
      const tableExists = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'transactions'
        );
      `;
      const hasOldTable = tableExists[0].exists;

      if (hasOldTable) {
        console.log('📦 Found existing "transactions" table. Renaming to "transactions_old"...');
        await sql`ALTER TABLE public.transactions RENAME TO transactions_old`;
      } else {
        console.log('ℹ️ No existing "transactions" table found. Skipping data migration.');
      }

      // 2. Read and execute the new schema
      console.log('📝 Executing new schema.sql...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Execute schema directly as raw query
      await sql.unsafe(schemaSql);
      
      if (hasOldTable) {
        console.log('🔄 Migrating data from "transactions_old"...');
        
        // Profiles migration
        await sql`
          INSERT INTO public.profiles (id, full_name)
          SELECT DISTINCT user_id, 'Migrated User' FROM public.transactions_old
          ON CONFLICT (id) DO NOTHING;
        `;
        
        // Categories migration
        await sql`
          INSERT INTO public.categories (user_id, name, type, icon)
          SELECT DISTINCT user_id, category, type, '📁'
          FROM public.transactions_old
          ON CONFLICT DO NOTHING;
        `;

        // Transactions migration
        await sql`
          INSERT INTO public.transactions (id, user_id, category_id, type, amount, transaction_date, notes, created_at)
          SELECT 
              t.id, 
              t.user_id, 
              c.id, 
              t.type, 
              t.amount, 
              t.date, 
              t.notes, 
              t.created_at
          FROM public.transactions_old t
          JOIN public.categories c ON c.name = t.category AND c.user_id = t.user_id AND c.type = t.type
        `;

        console.log('🗑️ Dropping "transactions_old" table...');
        await sql`DROP TABLE public.transactions_old`;
      }

      console.log('✅ Migration completed successfully!');
    });
  } catch (error) {
    console.error('❌ Migration failed! Rolling back changes...', error);
  } finally {
    await sql.end();
  }
}

migrate();
