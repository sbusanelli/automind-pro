import { Router } from 'express';
import { logger } from '../utils/logger';
import { getDatabase } from '../config/database';
import { getCache } from '../config/redis';

const router = Router();

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const cache = getCache();
    
    // Try cache first
    const cacheKey = 'jobs:all';
    let jobs = await cache.get(cacheKey);
    
    if (!jobs) {
      logger.info('Fetching all jobs from database');
      jobs = await db.all('SELECT * FROM jobs ORDER BY created_at DESC');
      
      // Cache for 5 minutes
      await cache.set(cacheKey, jobs, 300);
    } else {
      logger.info('Fetching all jobs from cache');
    }
    
    res.json({
      message: 'Jobs retrieved successfully',
      jobs
    });
  } catch (error) {
    logger.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  try {
    const { name, schedule, config } = req.body;
    const db = getDatabase();
    const cache = getCache();
    
    logger.info(`Creating new job: ${name}`);
    
    const result = await db.run(
      'INSERT INTO jobs (name, schedule, config) VALUES (?, ?, ?)',
      [name, schedule, JSON.stringify(config)]
    );
    
    // Clear cache
    await cache.del('jobs:all');
    
    const newJob = await db.get('SELECT * FROM jobs WHERE id = ?', [result.lastID]);
    
    res.json({
      message: 'Job created successfully',
      job: newJob
    });
  } catch (error) {
    logger.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Get a specific job
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    logger.info(`Fetching job with id: ${id}`);
    
    const job = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    return res.json({
      message: 'Job retrieved successfully',
      job
    });
  } catch (error) {
    logger.error('Get job error:', error);
    return res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, schedule, config } = req.body;
    const db = getDatabase();
    const cache = getCache();
    
    logger.info(`Updating job with id: ${id}`);
    
    await db.run(
      'UPDATE jobs SET name = ?, schedule = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, schedule, JSON.stringify(config), id]
    );
    
    // Clear cache
    await cache.del('jobs:all');
    
    const updatedJob = await db.get('SELECT * FROM jobs WHERE id = ?', [id]);
    
    if (!updatedJob) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    return res.json({
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    logger.error('Update job error:', error);
    return res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const cache = getCache();
    
    logger.info(`Deleting job with id: ${id}`);
    
    const result = await db.run('DELETE FROM jobs WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Clear cache
    await cache.del('jobs:all');
    
    return res.json({
      message: 'Job deleted successfully',
      deleted: true
    });
  } catch (error) {
    logger.error('Delete job error:', error);
    return res.status(500).json({ error: 'Failed to delete job' });
  }
});

export { router as jobRoutes };
