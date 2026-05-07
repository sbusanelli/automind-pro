import { Request, Response } from 'express';
import { AIService } from '../services/aiService';
import { logger } from '../utils/logger';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  // Analyze job for AI-powered optimization
  public analyzeJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;
      const jobData = await this.getJobData(jobId);

      if (!jobData) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const analysis = await this.aiService.analyzeJobForOptimization(jobData);
      
      res.json({
        success: true,
        data: {
          jobId,
          analysis,
          recommendations: this.generateOptimizationRecommendations(analysis)
        }
      });

    } catch (error) {
      logger.error('Job analysis failed:', error);
      res.status(500).json({ error: 'Analysis failed' });
    }
  };

  // Predict potential job failures
  public predictFailures = async (req: Request, res: Response): Promise<void> => {
    try {
      const { timeRange } = req.query;
      const jobs = await this.getJobsData(timeRange as string);

      const prediction = await this.aiService.predictJobFailures(jobs);
      
      res.json({
        success: true,
        data: {
          prediction,
          highRiskJobs: prediction.potentialIssues.slice(0, 5),
          preventiveActions: prediction.recommendedActions
        }
      });

    } catch (error) {
      logger.error('Failure prediction failed:', error);
      res.status(500).json({ error: 'Prediction failed' });
    }
  };

  // Generate AI-powered performance insights
  public getPerformanceInsights = async (req: Request, res: Response): Promise<void> => {
    try {
      const metrics = await this.getSystemMetrics();
      const insights = await this.aiService.generatePerformanceInsights(metrics);

      res.json({
        success: true,
        data: {
          insights,
          actionableItems: insights.optimizationSuggestions,
          efficiencyScore: insights.efficiencyScore
        }
      });

    } catch (error) {
      logger.error('Performance insights failed:', error);
      res.status(500).json({ error: 'Insights generation failed' });
    }
  };

  // AI-powered job scheduling optimization
  public optimizeSchedule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobs } = req.body;
      const optimizedSchedule = await this.aiService.suggestJobSchedule(jobs);

      res.json({
        success: true,
        data: {
          currentSchedule: jobs,
          optimizedSchedule: optimizedSchedule.schedule,
          improvements: optimizedSchedule.optimization,
          estimatedBenefits: this.calculateScheduleBenefits(optimizedSchedule.optimization)
        }
      });

    } catch (error) {
      logger.error('Schedule optimization failed:', error);
      res.status(500).json({ error: 'Schedule optimization failed' });
    }
  };

  // Real-time anomaly detection
  public getAnomalyAlerts = async (req: Request, res: Response): Promise<void> => {
    try {
      const systemMetrics = await this.getRealTimeMetrics();
      const anomalies = await this.aiService.generateAnomalyAlerts(systemMetrics);

      res.json({
        success: true,
        data: {
          anomalies: anomalies.anomalies,
          trends: anomalies.trends,
          alertLevel: this.calculateAlertLevel(anomalies.anomalies),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Anomaly detection failed:', error);
      res.status(500).json({ error: 'Anomaly detection failed' });
    }
  };

  // AI-powered failure explanation
  public explainFailure = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;
      const { context } = req.body;
      
      const jobFailure = await this.getJobFailure(jobId);
      const explanation = await this.aiService.explainJobFailure(jobId, jobFailure.error, context);

      res.json({
        success: true,
        data: {
          jobId,
          explanation: JSON.parse(explanation),
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('Failure explanation failed:', error);
      res.status(500).json({ error: 'Explanation failed' });
    }
  };

  // AI chat interface for natural language queries
  public chat = async (req: Request, res: Response): Promise<void> => {
    try {
      const { message, context } = req.body;
      
      const prompt = `
        As a FlowOps AI assistant, help with this query about batch job management:
        Message: ${message}
        Context: ${JSON.stringify(context || {}, null, 2)}

        Provide helpful, actionable assistance for:
        - Job optimization
        - Performance troubleshooting
        - Scheduling recommendations
        - System monitoring
        - Best practices
      `;

      const response = await this.aiService.openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500
      });

      res.json({
        success: true,
        data: {
          query: message,
          response: response.choices[0].message.content,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      logger.error('AI chat failed:', error);
      res.status(500).json({ error: 'Chat service unavailable' });
    }
  };

  // Helper methods
  private async getJobData(jobId: string): Promise<any> {
    // Implementation would fetch from database
    return { id: jobId, name: 'Sample Job', /* ... */ };
  }

  private async getJobsData(timeRange?: string): Promise<any[]> {
    // Implementation would fetch jobs from database
    return [];
  }

  private async getSystemMetrics(): Promise<any> {
    // Implementation would fetch metrics from monitoring system
    return {};
  }

  private async getRealTimeMetrics(): Promise<any> {
    // Implementation would fetch real-time metrics
    return {};
  }

  private async getJobFailure(jobId: string): Promise<any> {
    // Implementation would fetch job failure details
    return { error: 'Sample error', timestamp: new Date() };
  }

  private generateOptimizationRecommendations(analysis: any): string[] {
    const recommendations = [];
    
    if (analysis.confidence > 80) {
      recommendations.push('High-confidence optimization detected - consider auto-approval');
    }
    
    if (analysis.estimatedDuration > 300) {
      recommendations.push('Consider breaking down into smaller jobs for better reliability');
    }
    
    if (analysis.resourceRequirements.cpu > 7) {
      recommendations.push('Schedule during off-peak hours to reduce resource contention');
    }
    
    return recommendations;
  }

  private calculateScheduleBenefits(optimization: any): any {
    return {
      timeReduction: optimization.totalTimeReduction || 0,
      resourceEfficiency: optimization.resourceUtilization || 0,
      conflictsResolved: optimization.conflictsResolved || 0
    };
  }

  private calculateAlertLevel(anomalies: any[]): string {
    const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
    const warningCount = anomalies.filter(a => a.severity === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 2) return 'warning';
    return 'info';
  }
}
