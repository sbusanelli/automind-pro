import request from 'supertest';
import express from 'express';
import { createApp } from '../../index';
import { connectDatabase } from '../../config/database';
import { connectRedis } from '../../config/redis';

describe('API Integration Tests', () => {
  // Initialize database and cache for testing
  beforeAll(async () => {
    await connectDatabase();
    await connectRedis();
  });

  const app = createApp();

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Job Management', () => {
    describe('GET /api/jobs', () => {
      it('should return list of jobs', async () => {
        const response = await request(app)
          .get('/api/jobs')
          .expect(200);
        
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('jobs');
        expect(response.body.jobs).toBeInstanceOf(Array);
      });
    });

    describe('POST /api/jobs', () => {
      it('should create a new job', async () => {
        const jobData = {
          name: 'Test Job',
          schedule: '0 2 * * *',
          config: { type: 'batch' }
        };
        
        const response = await request(app)
          .post('/api/jobs')
          .send(jobData)
          .expect(200);
        
        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('job');
        expect(response.body.job.name).toBe(jobData.name);
      });
    });

    describe('GET /api/jobs/:id', () => {
      it('should return 404 for non-existent job', async () => {
        const response = await request(app)
          .get('/api/jobs/non-existent-id')
          .expect(404);
        
        expect(response.body).toHaveProperty('error');
      });
    });
  });
});
