import { Client } from '@neondb/serverless';
import { ResumeData } from '../types';

export const saveResumeToCloud = async (data: ResumeData, connectionString: string) => {
  const client = new Client(connectionString);
  await client.connect();
  try {
    // Ensure table exists (simple migration check)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_resumes (
        id SERIAL PRIMARY KEY,
        data JSONB NOT NULL,
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Save the resume
    await client.query('INSERT INTO user_resumes (data) VALUES ($1)', [JSON.stringify(data)]);
  } finally {
    await client.end();
  }
};

export const loadLatestResume = async (connectionString: string): Promise<ResumeData | null> => {
  const client = new Client(connectionString);
  await client.connect();
  try {
    // Check if table exists first to avoid errors on fresh DB
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'user_resumes'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
        return null;
    }

    const result = await client.query('SELECT data FROM user_resumes ORDER BY saved_at DESC LIMIT 1');
    if (result.rows.length > 0) {
      return result.rows[0].data;
    }
    return null;
  } finally {
    await client.end();
  }
};
