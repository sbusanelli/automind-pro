import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { chmod } from 'fs/promises';
import { logger } from '../utils/logger';

let db: Database | null = null;

export const connectDatabase = async (): Promise<Database> => {
  try {
    const dbPath = process.env.DB_PATH || './automind.db';
    
    // Set secure file permissions (read/write for owner only)
    try {
      await chmod(dbPath, 0o600);
      logger.info('Database file permissions set to 600 (owner read/write only)');
    } catch (error) {
      logger.warn('Could not set database file permissions (file may not exist yet):', error);
    }
    
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Create tables if they don't exist
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'active'
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        schedule TEXT,
        config TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER,
        status TEXT,
        started_at DATETIME,
        completed_at DATETIME,
        result TEXT,
        error TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs (id)
      );
    `);

    // Test connection
    await db.get('SELECT datetime("now") as current_time');

    logger.info('SQLite database connected successfully');
    return db;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

export const getDatabase = (): Database => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDatabase() first.');
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.close();
    logger.info('Database connection closed');
  }
};
