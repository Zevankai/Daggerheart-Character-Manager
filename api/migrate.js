const { getDb } = require('./lib/database.js');

async function runMigration() {
  const sql = getDb();
  
  try {
    console.log('Starting database migration...');
    
    // Check if columns exist before adding them
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'characters' 
      AND column_name IN ('is_active')
    `;
    
    const checkUsersColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('active_character_id')
    `;
    
    // Add is_active column to characters table if it doesn't exist
    if (!checkColumns.find(col => col.column_name === 'is_active')) {
      console.log('Adding is_active column to characters table...');
      await sql`
        ALTER TABLE characters 
        ADD COLUMN is_active BOOLEAN DEFAULT false
      `;
      console.log('✅ Added is_active column');
    } else {
      console.log('✅ is_active column already exists');
    }
    
    // Add active_character_id column to users table if it doesn't exist
    if (!checkUsersColumns.find(col => col.column_name === 'active_character_id')) {
      console.log('Adding active_character_id column to users table...');
      await sql`
        ALTER TABLE users 
        ADD COLUMN active_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL
      `;
      console.log('✅ Added active_character_id column');
    } else {
      console.log('✅ active_character_id column already exists');
    }
    
    // Create character_saves table if it doesn't exist
    console.log('Creating character_saves table if it doesn\'t exist...');
    await sql`
      CREATE TABLE IF NOT EXISTS character_saves (
        id SERIAL PRIMARY KEY,
        character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        save_data JSONB NOT NULL,
        save_type VARCHAR(50) DEFAULT 'auto',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ character_saves table ready');
    
    // Create indexes if they don't exist
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_characters_user_active ON characters(user_id, is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_character_saves_character_id ON character_saves(character_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_character_saves_user_id ON character_saves(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_character_saves_created_at ON character_saves(created_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_active_character ON users(active_character_id)`;
    console.log('✅ Indexes created');
    
    // Create the trigger function if it doesn't exist
    console.log('Creating trigger function...');
    await sql`
      CREATE OR REPLACE FUNCTION ensure_single_active_character()
      RETURNS TRIGGER AS $$
      BEGIN
          -- If setting a character as active, deactivate all others for this user
          IF NEW.is_active = TRUE THEN
              UPDATE characters 
              SET is_active = FALSE 
              WHERE user_id = NEW.user_id 
              AND id != NEW.id 
              AND is_active = TRUE;
              
              -- Update the user's active_character_id
              UPDATE users 
              SET active_character_id = NEW.id 
              WHERE id = NEW.user_id;
          END IF;
          
          -- If deactivating the last active character, clear user's active_character_id
          IF NEW.is_active = FALSE AND OLD.is_active = TRUE THEN
              UPDATE users 
              SET active_character_id = NULL 
              WHERE id = NEW.user_id 
              AND active_character_id = NEW.id;
          END IF;
          
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✅ Trigger function created');
    
    // Create the trigger if it doesn't exist
    console.log('Creating trigger...');
    await sql`
      DROP TRIGGER IF EXISTS ensure_single_active_character_trigger ON characters
    `;
    await sql`
      CREATE TRIGGER ensure_single_active_character_trigger 
      AFTER UPDATE OF is_active ON characters
      FOR EACH ROW EXECUTE FUNCTION ensure_single_active_character()
    `;
    console.log('✅ Trigger created');
    
    console.log('🎉 Migration completed successfully!');
    
    // Test the migration by querying the new columns
    const testQuery = await sql`
      SELECT id, name, is_active, created_at 
      FROM characters 
      LIMIT 1
    `;
    console.log('✅ Migration test passed - can query new columns');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };