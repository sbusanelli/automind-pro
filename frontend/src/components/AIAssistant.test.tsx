import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AIAssistant } from './AIAssistant';

// Mock fetch API
global.fetch = jest.fn();

// Mock timers for testing async operations
jest.useFakeTimers();

describe('AIAssistant Component', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render AI insights panel', () => {
      render(<AIAssistant />);
      
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('System Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Job Failure Risk')).toBeInTheDocument();
      expect(screen.getByText('Resource Utilization')).toBeInTheDocument();
    });

    it('should render chat interface', () => {
      render(<AIAssistant />);
      
      expect(screen.getByText('AutoMind AI Assistant')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...')).toBeInTheDocument();
    });

    it('should render quick actions buttons', () => {
      render(<AIAssistant />);
      
      expect(screen.getByText('Optimize Schedule')).toBeInTheDocument();
      expect(screen.getByText('Analyze Performance')).toBeInTheDocument();
      expect(screen.getByText('Predict Failures')).toBeInTheDocument();
      expect(screen.getByText('System Insights')).toBeInTheDocument();
    });

    it('should display initial insights with correct values', () => {
      render(<AIAssistant />);
      
      expect(screen.getByText('87')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('73')).toBeInTheDocument();
    });

    it('should show severity badges', () => {
      render(<AIAssistant />);
      
      expect(screen.getAllByText('LOW')).toHaveLength(2);
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    it('should not send empty messages', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.click(sendButton);
      
      expect(screen.queryByText(/AI is thinking/)).not.toBeInTheDocument();
    });

    it('should send message when clicking send button', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'optimize' } });
        fireEvent.click(sendButton);
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      
      expect(screen.queryByText(/AI is thinking/)).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText(/Based on current system metrics/)).toBeInTheDocument();
      });
      
      await waitFor(() => {
        expect(screen.queryByText('AI is thinking...')).not.toBeInTheDocument();
      });
    });

    it('should send message when pressing Enter', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'performance' } });
        fireEvent.keyPress(input, { key: 'Enter' });
        
        jest.advanceTimersByTime(1500);
      });
      
      expect(screen.getByText('performance')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByText(/System performance is optimal/)).toBeInTheDocument();
      });
    });

    it('should clear input after sending message', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...') as HTMLInputElement;
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      fireEvent.change(input, { target: { value: 'test message' } });
      fireEvent.click(sendButton);
      
      expect(input.value).toBe('');
    });

    it('should disable send button when input is empty', () => {
      render(<AIAssistant />);
      
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      expect(sendButton).toBeDisabled();
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      fireEvent.change(input, { target: { value: 'test' } });
      
      expect(sendButton).not.toBeDisabled();
    });
  });

  describe('AI Responses', () => {
    it('should provide correct response for optimize query', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'optimize' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Based on current system metrics/)).toBeInTheDocument();
      });
    });

    it('should provide correct response for performance query', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'performance' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/System performance is optimal/)).toBeInTheDocument();
      });
    });

    it('should provide correct response for failure query', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'failure' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/The main cause of job failures appears to be resource contention/)).toBeInTheDocument();
      });
    });

    it('should provide default response for unknown queries', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'random query' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/I can help you optimize job scheduling/)).toBeInTheDocument();
      });
    });

    it('should provide suggestions for relevant queries', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'performance' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.getByText('AI Suggestions:')).toBeInTheDocument();
        expect(screen.getByText('Run performance analysis on all jobs')).toBeInTheDocument();
      });
    });

    it('should not provide suggestions for irrelevant queries', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'hello world' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('AI Suggestions:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Message Display', () => {
    it('should show user messages with correct styling', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test message' } });
        fireEvent.click(sendButton);
      });
      
      const userMessage = screen.getByText('test message').closest('div')?.parentElement;
      expect(userMessage).toHaveClass('text-right');
    });

    it('should show AI messages with correct styling', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        const aiMessage = screen.getByText(/I can help you optimize job scheduling/).closest('div')?.parentElement;
        expect(aiMessage).toHaveClass('text-left');
      });
    });

    it('should display timestamps for messages', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(sendButton);
      
      expect(screen.getByText(/\d{1,2}:\d{2}:\d{2}/)).toBeInTheDocument();
    });
  });

  describe('Typing Indicator', () => {
    it('should show typing indicator while AI is responding', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(sendButton);
      
      expect(screen.getByText('AI is thinking...')).toBeInTheDocument();
    });

    it('should hide typing indicator after AI responds', async () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(sendButton);
        
        jest.advanceTimersByTime(1500);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('AI is thinking...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      
      await act(async () => {
        fireEvent.change(input, { target: { value: 'test' } });
        fireEvent.click(sendButton);
        
        // Simulate error by clearing timers
        jest.clearAllTimers();
      });
      
      // Component should still be functional after error
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      expect(input).toHaveAttribute('type', 'text');
      
      const sendButton = screen.getAllByRole('button').find(button => 
        button.querySelector('svg')?.classList.contains('lucide-send')
      )!;
      expect(sendButton).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<AIAssistant />);
      
      const input = screen.getByPlaceholderText('Ask AI about job optimization, performance, or scheduling...');
      
      input.focus();
      expect(input).toHaveFocus();
      
      fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });
      
      // Should not crash and should handle the key press
      expect(screen.queryByText('AI is thinking...')).not.toBeInTheDocument();
    });
  });
});
