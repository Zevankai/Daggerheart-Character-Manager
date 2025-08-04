-- Database schema for Zevi Character Sheet Application

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    active_character_id INTEGER REFERENCES characters(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters table for storing character data
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    character_data JSONB NOT NULL DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    share_token VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_share_token (share_token),
    INDEX idx_user_active (user_id, is_active)
);

-- Sessions table for user authentication (optional - for session management)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Character saves table for tracking save history and testing
CREATE TABLE IF NOT EXISTS character_saves (
    id SERIAL PRIMARY KEY,
    character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    save_data JSONB NOT NULL,
    save_type VARCHAR(50) DEFAULT 'auto', -- 'auto', 'manual', 'backup'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_character_saves_character_id (character_id),
    INDEX idx_character_saves_user_id (user_id),
    INDEX idx_character_saves_created_at (created_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_share_token ON characters(share_token);
CREATE INDEX IF NOT EXISTS idx_characters_user_active ON characters(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_active_character ON users(active_character_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to ensure only one active character per user
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
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to ensure only one active character per user
CREATE TRIGGER ensure_single_active_character_trigger AFTER UPDATE OF is_active ON characters
    FOR EACH ROW EXECUTE FUNCTION ensure_single_active_character();