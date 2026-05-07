import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, Clock, Activity, BarChart3 } from 'lucide-react';

interface ProblemData {
  timestamp: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  types: string[];
}

interface ProblemHistoryChartProps {
  problems: ProblemData[];
  summary: {
    total: number;
    highSeverity: number;
    mediumSeverity: number;
    lowSeverity: number;
    timeRange: string;
  };
}

const ProblemHistoryChart: React.FC<ProblemHistoryChartProps> = ({ problems, summary }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-50 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatHour = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-gray-900">24-Hour Problem History</h3>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-gray-700 font-medium">High: {summary.highSeverity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Med: {summary.mediumSeverity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-700 font-medium">Low: {summary.lowSeverity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-4">
        {problems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <Activity className="w-8 h-8 text-gray-300 mb-2" />
            <span className="text-sm font-medium">No problems detected</span>
            <span className="text-xs text-gray-400">System running smoothly</span>
          </div>
        ) : (
          <>
            {/* Simple Bar Chart */}
            <div className="mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-end justify-between h-32 mb-2">
                  {problems.slice(-12).map((problem, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className="w-6 bg-gray-200 rounded-t flex items-end justify-center" style={{ height: '100px' }}>
                        <div 
                          className={`w-full ${getSeverityColor(problem.severity)} rounded-t transition-colors`}
                          style={{ height: `${Math.min(problem.count * 20, 100)}px` }}
                          title={`${problem.count} ${problem.severity} problems at ${formatTime(problem.timestamp)}`}
                        >
                          {problem.count > 0 && (
                            <span className="text-xs text-white font-bold leading-none">
                              {problem.count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-center">
                        {index % 2 === 0 ? formatHour(problem.timestamp) : ''}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>0</span>
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5+</span>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-blue-600">{summary.total}</div>
                <div className="text-xs text-blue-700">Total Issues</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-orange-600">
                  {problems.filter(p => p.severity === 'high').reduce((sum, p) => sum + p.count, 0)}
                </div>
                <div className="text-xs text-orange-700">High Risk</div>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <div className="text-lg font-bold text-green-600">
                  {problems.length > 0 ? Math.round((problems.filter(p => p.count === 0).length / problems.length) * 100) : 100}%
                </div>
                <div className="text-xs text-green-700">Uptime</div>
              </div>
            </div>

            {/* Recent Problems List */}
            <div className="border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3 h-3 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-700">Recent Issues</span>
                </div>
                <span className="text-xs text-gray-500">Last 3 events</span>
              </div>
              <div className="space-y-1.5">
                {problems.slice(-3).reverse().map((problem, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all hover:shadow-sm ${getSeverityBgColor(problem.severity)}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 ${getSeverityColor(problem.severity).replace('hover:', '')} rounded-full`}></div>
                      <div>
                        <span className="text-xs font-medium">{formatTime(problem.timestamp)}</span>
                        <div className="text-xs opacity-75">
                          {problem.types.slice(0, 2).join(', ')}
                          {problem.types.length > 2 && ` +${problem.types.length - 2}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getSeverityBgColor(problem.severity)}`}>
                        {problem.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { ProblemHistoryChart };
