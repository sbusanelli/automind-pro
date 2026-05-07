/**
 * @jest-environment node
 */

import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import axios from 'axios';

describe('Workflow E2E Tests', () => {
  let driver: WebDriver;
  let baseUrl: string;

  beforeAll(async () => {
    baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
    
    const options = new chrome.Options();
    options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  describe('Complete Workflow Flow', () => {
    it('should handle complete job lifecycle', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Create new job
      await driver.findElement(By.id('create-job-btn')).click();
      await driver.findElement(By.id('job-name')).sendKeys('E2E Test Job');
      await driver.findElement(By.id('job-type')).sendKeys('batch');
      await driver.findElement(By.id('job-priority')).sendKeys('high');
      await driver.findElement(By.id('job-schedule')).sendKeys('0 2 * * *');
      await driver.findElement(By.id('create-job-submit')).click();
      
      // Wait for job creation
      await driver.wait(until.elementLocated(By.className('job-item')), 10000);
      
      // Verify job appears in list
      const jobItems = await driver.findElements(By.className('job-item'));
      expect(jobItems.length).toBeGreaterThan(0);
      
      // Click on job to view details
      await jobItems[0].click();
      
      // Wait for job details page
      await driver.wait(until.elementLocated(By.id('job-details')), 10000);
      
      // Start the job
      await driver.findElement(By.id('start-job-btn')).click();
      
      // Wait for job to start
      await driver.wait(until.elementLocated(By.className('job-running')), 10000);
      
      // Verify AI insights are loaded
      await driver.wait(until.elementLocated(By.id('ai-insights')), 10000);
      const aiInsights = await driver.findElement(By.id('ai-insights'));
      expect(await aiInsights.isDisplayed()).toBe(true);
      
      // Wait for job completion
      await driver.wait(until.elementLocated(By.className('job-completed')), 30000);
      
      // Verify job completed successfully
      const jobStatus = await driver.findElement(By.id('job-status'));
      expect(await jobStatus.getText()).toBe('Completed');
    }, 60000);

    it('should handle AI chat functionality', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Open AI chat
      await driver.findElement(By.id('ai-chat-btn')).click();
      
      // Wait for chat interface
      await driver.wait(until.elementLocated(By.id('chat-input')), 10000);
      
      // Send a message
      const chatInput = await driver.findElement(By.id('chat-input'));
      await chatInput.sendKeys('How can I optimize my job performance?');
      await driver.findElement(By.id('send-message-btn')).click();
      
      // Wait for AI response
      await driver.wait(until.elementLocated(By.className('ai-response')), 15000);
      
      // Verify AI response
      const aiResponse = await driver.findElement(By.className('ai-response'));
      expect(await aiResponse.isDisplayed()).toBe(true);
      expect(await aiResponse.getText()).toContain('optimize');
    }, 45000);

    it('should handle job optimization with AI', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Navigate to job optimization
      await driver.findElement(By.id('job-optimization-btn')).click();
      
      // Wait for optimization page
      await driver.wait(until.elementLocated(By.id('optimization-form')), 10000);
      
      // Select job for optimization
      await driver.findElement(By.id('job-select')).click();
      await driver.findElement(By.css('option[value="test-job-1"]')).click();
      
      // Run optimization
      await driver.findElement(By.id('run-optimization-btn')).click();
      
      // Wait for optimization results
      await driver.wait(until.elementLocated(By.id('optimization-results')), 20000);
      
      // Verify optimization results
      const optimizationResults = await driver.findElement(By.id('optimization-results'));
      expect(await optimizationResults.isDisplayed()).toBe(true);
      
      // Check for AI recommendations
      const aiRecommendations = await driver.findElements(By.className('ai-recommendation'));
      expect(aiRecommendations.length).toBeGreaterThan(0);
    }, 60000);

    it('should handle real-time monitoring', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Navigate to monitoring
      await driver.findElement(By.id('monitoring-btn')).click();
      
      // Wait for monitoring dashboard
      await driver.wait(until.elementLocated(By.id('monitoring-dashboard')), 10000);
      
      // Verify real-time metrics are displayed
      const metrics = await driver.findElements(By.className('metric-card'));
      expect(metrics.length).toBeGreaterThan(0);
      
      // Check for live updates
      const liveIndicator = await driver.findElement(By.id('live-indicator'));
      expect(await liveIndicator.isDisplayed()).toBe(true);
      
      // Wait for real-time updates
      await driver.sleep(5000);
      
      // Verify metrics are updating
      const updatedMetrics = await driver.findElements(By.className('metric-value'));
      expect(updatedMetrics.length).toBeGreaterThan(0);
    }, 30000);
  });

  describe('Error Handling', () => {
    it('should handle login failures gracefully', async () => {
      await driver.get(baseUrl);
      
      // Try to login with invalid credentials
      await driver.findElement(By.id('username')).sendKeys('invaliduser');
      await driver.findElement(By.id('password')).sendKeys('invalidpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for error message
      await driver.wait(until.elementLocated(By.className('error-message')), 10000);
      
      // Verify error message
      const errorMessage = await driver.findElement(By.className('error-message'));
      expect(await errorMessage.isDisplayed()).toBe(true);
      expect(await errorMessage.getText()).toContain('Invalid credentials');
    }, 30000);

    it('should handle network errors gracefully', async () => {
      // Mock network error by navigating to invalid URL
      await driver.get(`${baseUrl}/invalid-page`);
      
      // Wait for error page
      await driver.wait(until.elementLocated(By.className('error-page')), 10000);
      
      // Verify error page is displayed
      const errorPage = await driver.findElement(By.className('error-page'));
      expect(await errorPage.isDisplayed()).toBe(true);
    }, 30000);
  });

  describe('Performance Tests', () => {
    it('should load dashboard within performance threshold', async () => {
      const startTime = Date.now();
      
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      const loadTime = Date.now() - startTime;
      
      // Verify dashboard loads within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    }, 30000);

    it('should handle concurrent operations', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Open multiple tabs/windows for concurrent operations
      await driver.executeScript('window.open("/jobs", "_blank");');
      await driver.executeScript('window.open("/monitoring", "_blank");');
      await driver.executeScript('window.open("/ai-chat", "_blank");');
      
      // Switch to different windows and verify they load
      const handles = await driver.getAllWindowHandles();
      
      for (let i = 1; i < handles.length; i++) {
        await driver.switchTo().window(handles[i]);
        await driver.sleep(2000);
        
        // Verify each window loaded successfully
        const currentUrl = await driver.getCurrentUrl();
        expect(currentUrl).toContain(baseUrl);
      }
      
      // Switch back to main window
      await driver.switchTo().window(handles[0]);
    }, 45000);
  });

  describe('API Integration Tests', () => {
    it('should verify API endpoints are accessible', async () => {
      try {
        // Test health endpoint
        const healthResponse = await axios.get(`${baseUrl}/health`);
        expect(healthResponse.status).toBe(200);
        
        // Test jobs endpoint
        const jobsResponse = await axios.get(`${baseUrl}/api/jobs`);
        expect(jobsResponse.status).toBe(200);
        
        // Test AI endpoints
        const aiResponse = await axios.get(`${baseUrl}/api/ai/status`);
        expect(aiResponse.status).toBe(200);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`API integration test failed: ${errorMessage}`);
      }
    }, 30000);

    it('should verify WebSocket connections', async () => {
      await driver.get(baseUrl);
      
      // Login
      await driver.findElement(By.id('username')).sendKeys('testuser');
      await driver.findElement(By.id('password')).sendKeys('testpassword');
      await driver.findElement(By.id('login-btn')).click();
      
      // Wait for dashboard
      await driver.wait(until.elementLocated(By.id('dashboard')), 10000);
      
      // Check WebSocket connection status
      const wsStatus = await driver.executeScript(`
        return window.wsConnection && window.wsConnection.readyState === WebSocket.OPEN;
      `);
      
      expect(wsStatus).toBe(true);
    }, 30000);
  });
});
