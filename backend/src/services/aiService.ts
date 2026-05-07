import OpenAI from 'openai';
import { logger } from '../utils/logger';

export interface AIAnalysis {
  jobOptimization: {
    suggestedPriority: 'low' | 'medium' | 'high';
    estimatedDuration: number;
    resourceRequirements: {
      cpu: number;
      memory: number;
      io: number;
    };
    confidence: number;
  };
  errorPrediction: {
    failureProbability: number;
    potentialIssues: string[];
    recommendedActions: string[];
  };
  performanceInsights: {
    bottlenecks: string[];
    optimizationSuggestions: string[];
    efficiencyScore: number;
  };
}

export class AIService {
  private openai: OpenAI;
  private model: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = 'gpt-4-turbo';
  }

  async analyzeJobForOptimization(jobData: any): Promise<AIAnalysis['jobOptimization']> {
    try {
      const prompt = `
        As an expert systems administrator, analyze this batch job for optimization:

        Job Details:
        ${JSON.stringify(jobData, null, 2)}

        Provide analysis in JSON format with:
        1. Suggested priority (low/medium/high) based on business impact
        2. Estimated duration in seconds
        3. Resource requirements (cpu, memory, io on scale 1-10)
        4. Confidence score (0-100)

        Consider:
        - System resource availability
        - Business criticality
        - Dependencies on other jobs
        - Historical performance data
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI job optimization analysis completed', { jobId: jobData.id, analysis });
      return analysis;

    } catch (error) {
      logger.error('AI analysis failed:', error);
      throw new Error('Failed to analyze job for optimization');
    }
  }

  async predictJobFailures(jobs: any[]): Promise<AIAnalysis['errorPrediction']> {
    try {
      const prompt = `
        As a machine learning specialist, analyze these batch jobs for failure prediction:

        Jobs Data:
        ${JSON.stringify(jobs, null, 2)}

        Provide analysis in JSON format with:
        1. Overall failure probability (0-100)
        2. List of potential issues that could cause failures
        3. Recommended preventive actions

        Consider:
        - Historical failure patterns
        - Resource constraints
        - Dependency chains
        - External system dependencies
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const prediction = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI failure prediction completed', { jobCount: jobs.length, prediction });
      return prediction;

    } catch (error) {
      logger.error('AI prediction failed:', error);
      throw new Error('Failed to predict job failures');
    }
  }

  async generatePerformanceInsights(metrics: any): Promise<AIAnalysis['performanceInsights']> {
    try {
      const prompt = `
        As a performance optimization expert, analyze these system metrics:

        Metrics Data:
        ${JSON.stringify(metrics, null, 2)}

        Provide analysis in JSON format with:
        1. Identified bottlenecks (max 5)
        2. Optimization suggestions (max 5)
        3. Overall efficiency score (0-100)

        Focus on:
        - Resource utilization patterns
        - Job execution times
        - Queue performance
        - System throughput
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const insights = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI performance insights generated', { metrics, insights });
      return insights;

    } catch (error) {
      logger.error('AI insights generation failed:', error);
      throw new Error('Failed to generate performance insights');
    }
  }

  async suggestJobSchedule(jobs: any[]): Promise<any> {
    try {
      const prompt = `
        As an expert in job scheduling and resource optimization, analyze these jobs:

        Job Data:
        ${JSON.stringify(jobs, null, 2)}

        Provide an optimized schedule in JSON format:
        {
          "schedule": [
            {
              "jobId": "string",
              "startTime": "ISO datetime",
              "priority": "low|medium|high",
              "estimatedDuration": number,
              "dependencies": ["jobId1", "jobId2"]
            }
          ],
          "optimization": {
            "totalTimeReduction": percentage,
            "resourceUtilization": percentage,
            "conflictsResolved": number
          }
        }

        Consider:
        - Resource conflicts
        - Priority-based execution
        - Dependency chains
        - System load balancing
        - Peak/off-peak scheduling
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      const schedule = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI schedule optimization completed', { jobCount: jobs.length, schedule });
      return schedule;

    } catch (error) {
      logger.error('AI scheduling failed:', error);
      throw new Error('Failed to generate optimized schedule');
    }
  }

  async generateAnomalyAlerts(systemMetrics: any): Promise<any> {
    try {
      const prompt = `
        As a monitoring and alerting expert, analyze these system metrics for anomalies:

        System Metrics:
        ${JSON.stringify(systemMetrics, null, 2)}

        Identify anomalies and provide alerts in JSON format:
        {
          "anomalies": [
            {
              "type": "performance|security|resource",
              "severity": "critical|warning|info",
              "description": "Human readable description",
              "metrics": ["metric1", "metric2"],
              "threshold": number,
              "currentValue": number,
              "recommendedAction": "Action to take"
            }
          ],
          "trends": {
            "improving": ["metric1"],
            "degrading": ["metric2"],
            "stable": ["metric3"]
          }
        }

        Look for:
        - Performance degradation
        - Unusual resource usage
        - Security anomalies
        - Job failure patterns
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      });

      const anomalies = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI anomaly detection completed', { anomalies });
      return anomalies;

    } catch (error) {
      logger.error('AI anomaly detection failed:', error);
      throw new Error('Failed to generate anomaly alerts');
    }
  }

  async explainJobFailure(jobId: string, error: string, context: any): Promise<string> {
    try {
      const prompt = `
        As a systems reliability expert, explain this job failure:

        Job ID: ${jobId}
        Error: ${error}
        Context: ${JSON.stringify(context, null, 2)}

        Provide a detailed explanation in JSON format:
        {
          "rootCause": "Primary cause of failure",
          "contributingFactors": ["factor1", "factor2"],
          "impactAssessment": "low|medium|high",
          "preventionMeasures": ["measure1", "measure2"],
          "estimatedRecoveryTime": minutes
        }

        Focus on:
        - Technical accuracy
        - Actionable insights
        - Prevention strategies
      `;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const explanation = JSON.parse(response.choices[0].message.content || '{}');
      
      logger.info('AI failure explanation generated', { jobId, error, explanation });
      return JSON.stringify(explanation, null, 2);

    } catch (error) {
      logger.error('AI explanation failed:', error);
      throw new Error('Failed to explain job failure');
    }
  }
}
