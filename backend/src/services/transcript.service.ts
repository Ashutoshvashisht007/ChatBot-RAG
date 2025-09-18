import pool from './db';

export async function persistTranscript(sessionId: string, history: any[]) {
  const metadata = {};
  
  try {
    console.log('💾 Persisting transcript for session:', sessionId);
    console.log('📝 History length:', history.length);
    console.log('📋 Sample history item:', history[0]);
    
    const query = `
      INSERT INTO transcripts (session_id, transcript, metadata)
      VALUES ($1, $2, $3)
      RETURNING id, session_id, created_at
    `;
    
    const values = [
      sessionId, 
      JSON.stringify(history), 
      JSON.stringify(metadata)
    ];
    
    console.log('🔍 Query values:', {
      sessionId: values[0],
      transcriptLength: values[1].length,
      metadata: values[2]
    });
    
    const result = await pool.query(query, values);
    console.log('✅ Transcript persisted successfully:', result.rows[0]);
    return result.rows[0];
    
  } catch (error: any) {
    console.error('❌ Error in persistTranscript:', error);
    console.error('🔍 Error details:', {
      code: error?.code,
      detail: error?.detail,
      table: error?.table,
      column: error?.column
    });
    throw error;
  }
}

export async function getTranscriptsForSession(sessionId: string) {
  try {
    console.log('🔍 Getting transcripts for session:', sessionId);
    
    const query = `
      SELECT id, session_id, created_at, transcript, metadata
      FROM transcripts 
      WHERE session_id = $1 
      ORDER BY created_at DESC
    `;
    
    const res = await pool.query(query, [sessionId]);
    console.log('📋 Found transcripts:', res.rows.length);
    return res.rows;
    
  } catch (error: any) {
    console.error('❌ Error in getTranscriptsForSession:', error);
    throw error;
  }
}

// Debug function to check table structure
export async function debugTableStructure() {
  try {
    const query = `
      SELECT 
        column_name, 
        data_type, 
        is_nullable, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'transcripts' 
      ORDER BY ordinal_position
    `;
    
    const result = await pool.query(query);
    console.log('🔍 Current table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    return result.rows;
  } catch (error: any) {
    console.error('❌ Error checking table structure:', error);
    throw error;
  }
}

// Simple table verification
export async function ensureTableExists() {
  try {
    console.log('🔄 Verifying database connection and table...');
    
    // Test connection
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected at:', connectionTest.rows[0].current_time);
    
    // Debug table structure
    await debugTableStructure();
    
    // Test table accessibility
    const countTest = await pool.query('SELECT COUNT(*) as count FROM transcripts');
    console.log('📊 Current records in transcripts:', countTest.rows[0].count);
    
    console.log('✅ Database verification completed successfully');
    
  } catch (error: any) {
    console.error('❌ Database verification failed:', error);
    console.error('💡 Try running the clean database setup commands');
    throw error;
  }
}