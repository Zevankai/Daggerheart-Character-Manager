const { requireAuth } = require('../lib/auth.js');
const { getDb } = require('../lib/database.js');

const handler = async (req, res) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = getDb();
        const userId = req.user.id;

        console.log(`🗑️ Resetting all data for user ${userId}...`);

        // Use transaction to ensure all operations succeed or fail together
        await sql.transaction([
            // Delete all character saves for this user
            sql`DELETE FROM character_saves WHERE user_id = ${userId}`,
            
            // Delete all characters for this user
            sql`DELETE FROM characters WHERE user_id = ${userId}`,
            
            // Reset user's active character
            sql`UPDATE users SET active_character_id = NULL WHERE id = ${userId}`
        ]);

        console.log(`✅ Successfully reset all data for user ${userId}`);

        res.status(200).json({
            success: true,
            message: 'All character data deleted successfully',
            deletedCharacters: true,
            deletedSaves: true,
            resetActiveCharacter: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Failed to reset user data:', error);
        res.status(500).json({
            error: 'Failed to reset data',
            message: error.message
        });
    }
};

module.exports = requireAuth(handler);