import { Pool } from 'pg';
import { logger } from '../utils/logger';

export interface Job {
  id: string;
  name: string;
  description?: string;
  schedule: string; // Cron expression
  status: 'pending' | 'running' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  maxRetries: number;
  currentRetries: number;
  timeout: number; // Timeout in seconds
  payload?: any;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdBy: string;
}

export class JobModel {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  async create(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
    const query = `
      INSERT INTO jobs (name, description, schedule, status, priority, max_retries, timeout, payload, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      jobData.name,
      jobData.description || null,
      jobData.schedule,
      'pending',
      jobData.priority,
      jobData.maxRetries || 3,
      jobData.timeout || 300,
      JSON.stringify(jobData.payload || {}),
      jobData.createdBy
    ];

    try {
      const result = await this.pool.query(query, values);
      return result.rows[0] as Job;
    } catch (error) {
      logger.error('Error creating job:', error);
      throw new Error('Failed to create job');
    }
  }

  async findById(id: string): Promise<Job | null> {
    const query = 'SELECT * FROM jobs WHERE id = $1';
    
    try {
      const result = await this.pool.query(query, [id]);
      return result.rows[0] as Job || null;
    } catch (error) {
      logger.error('Error finding job:', error);
      throw new Error('Failed to find job');
    }
  }

  async findAll(userId?: string): Promise<Job[]> {
    let query = 'SELECT * FROM jobs ORDER BY created_at DESC';
    const params: any[] = [];
    
    if (userId) {
      query = 'SELECT * FROM jobs WHERE created_by = $1 ORDER BY created_at DESC';
      params.push(userId);
    }

    try {
      const result = await this.pool.query(query, params);
      return result.rows as Job[];
    } catch (error) {
      logger.error('Error finding jobs:', error);
      throw new Error('Failed to find jobs');
    }
  }

  async updateStatus(id: string, status: Job['status'], result?: any, error?: string): Promise<void> {
    const query = `
      UPDATE jobs 
      SET status = $2, result = $3, error = $4, updated_at = NOW()
      WHERE id = $1
    `;
    
    const values = [id, status, result ? JSON.stringify(result) : null, error || null];

    try {
      await this.pool.query(query, values);
      logger.info(`Job ${id} status updated to ${status}`);
    } catch (error) {
      logger.error('Error updating job status:', error);
      throw new Error('Failed to update job status');
    }
  }

  async updateNextRun(id: string, nextRunAt: Date): Promise<void> {
    const query = `
      UPDATE jobs 
      SET next_run_at = $1, last_run_at = NOW()
      WHERE id = $2
    `;
    
    try {
      await this.pool.query(query, [nextRunAt, id]);
    } catch (error) {
      logger.error('Error updating next run time:', error);
      throw new Error('Failed to update next run time');
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const query = 'DELETE FROM jobs WHERE id = $1 AND created_by = $2';
    
    try {
      await this.pool.query(query, [id, userId]);
      logger.info(`Job ${id} deleted`);
    } catch (error) {
      logger.error('Error deleting job:', error);
      throw new Error('Failed to delete job');
    }
  }

  async findPendingJobs(): Promise<Job[]> {
    const query = `
      SELECT * FROM jobs 
      WHERE status = 'pending' 
      AND (next_run_at IS NULL OR next_run_at <= NOW())
      ORDER BY priority DESC, created_at ASC
    `;

    try {
      const result = await this.pool.query(query);
      return result.rows as Job[];
    } catch (error) {
      logger.error('Error finding pending jobs:', error);
      throw new Error('Failed to find pending jobs');
    }
  }
}
