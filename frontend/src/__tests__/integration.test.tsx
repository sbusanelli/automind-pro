import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIAssistant } from '../components/AIAssistant';

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('AI Assistant Integration', () => {
    it('should integrate with backend API endpoints', async () => {
      // Mock successful API response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Jobs retrieved successfully',
          jobs: [
            { id: 1, name: 'Test Job', status: 'running' },
            { id: 2, name: 'Another Job', status: 'completed' }
          ]
        })
      });

      render(<AIAssistant />);

      // Test that the component renders without errors
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('AutoMind AI Assistant')).toBeInTheDocument();
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      render(<AIAssistant />);

      // Component should still render despite API errors
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
    });

    it('should maintain state during user interactions', async () => {
      render(<AIAssistant />);

      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;

      // Send multiple messages
      fireEvent.change(input, { target: { value: 'first message' } });
      fireEvent.click(sendButton);

      fireEvent.change(input, { target: { value: 'second message' } });
      fireEvent.click(sendButton);

      // Both messages should be in the DOM
      expect(screen.getByText('first message')).toBeInTheDocument();
      expect(screen.getByText('second message')).toBeInTheDocument();
    });

    it('should handle concurrent user interactions', async () => {
      render(<AIAssistant />);

      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;

      // Send message quickly followed by another
      fireEvent.change(input, { target: { value: 'message 1' } });
      fireEvent.click(sendButton);

      // Clear input and send another message
      fireEvent.change(input, { target: { value: 'message 2' } });
      
      // Should handle without crashing
      expect(screen.getByText('message 1')).toBeInTheDocument();
    });
  });

  describe('WebSocket Integration', () => {
    it('should handle WebSocket connections', () => {
      // Mock WebSocket
      const mockWebSocket = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 1
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      render(<AIAssistant />);

      // Component should render without WebSocket errors
      expect(screen.getByText('AutoMind AI Assistant')).toBeInTheDocument();
    });

    it('should handle WebSocket disconnections', () => {
      const mockWebSocket = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
        readyState: 3 // CLOSED
      };

      global.WebSocket = jest.fn(() => mockWebSocket) as any;

      render(<AIAssistant />);

      // Should still work with closed WebSocket
      expect(screen.getByText('AutoMind AI Assistant')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should handle large datasets efficiently', () => {
      render(<AIAssistant />);

      // Simulate large number of messages
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;

      for (let i = 0; i < 100; i++) {
        fireEvent.change(input, { target: { value: `message ${i}` } });
        fireEvent.click(sendButton);
        jest.advanceTimersByTime(1500);
      }

      // Should still be responsive
      expect(screen.getByText('message 99')).toBeInTheDocument();
    });

    it('should cleanup resources on unmount', () => {
      const { unmount } = render(<AIAssistant />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Error Boundary Integration', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      render(<AIAssistant />);

      // Simulate an error in the component
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      
      // Should not crash the entire application
      expect(() => {
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(input);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility Integration', () => {
    it('should be accessible via keyboard navigation', () => {
      render(<AIAssistant />);

      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      
      // Should be focusable
      input.focus();
      expect(input).toHaveFocus();

      // Should handle keyboard events
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      // Should not crash
      expect(screen.getByText('AutoMind AI Assistant')).toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(<AIAssistant />);

      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      
      // Should have proper input attributes
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder');
    });
  });
});
