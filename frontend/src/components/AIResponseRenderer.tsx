import React, { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Target, Zap, Shield, BarChart3, Activity, ChevronDown, ChevronRight } from 'lucide-react';

interface AIResponseRendererProps {
  content: string;
}

const AIResponseRenderer: React.FC<AIResponseRendererProps> = ({ content }) => {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());
  const [showFullDetails, setShowFullDetails] = useState(false);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllSections = (sectionsLength: number) => {
    if (expandedSections.size === sectionsLength) {
      setExpandedSections(new Set());
    } else {
      setExpandedSections(new Set(Array.from({length: sectionsLength}, (_, index) => index)));
    }
  };

  const parseContent = (text: string) => {
    const sections = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentSection: any = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Headers
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        if (currentSection) {
          sections.push(currentSection);
        }
        const title = trimmedLine.replace(/\*\*/g, '');
        currentSection = {
          type: 'section',
          title,
          content: []
        };
      }
      // Lists
      else if (trimmedLine.match(/^\d+\.\s/)) {
        const item = trimmedLine.replace(/^\d+\.\s/, '');
        if (currentSection) {
          currentSection.content.push({
            type: 'numbered-item',
            content: item
          });
        }
      }
      // Bullet points with emojis
      else if (trimmedLine.match(/^[\w\s]+\*\*:/)) {
        const parts = trimmedLine.split(':');
        const label = parts[0].replace(/\*\*/g, '');
        const value = parts.slice(1).join(':').trim();
        if (currentSection) {
          currentSection.content.push({
            type: 'metric',
            label,
            value
          });
        }
      }
      // Regular bullet points
      else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
        const item = trimmedLine.replace(/^[-•]\s/, '');
        if (currentSection) {
          currentSection.content.push({
            type: 'bullet-item',
            content: item
          });
        }
      }
      // Standalone content
      else if (trimmedLine && currentSection) {
        currentSection.content.push({
          type: 'text',
          content: trimmedLine
        });
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  };

  const getIconForContent = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('health') || lowerContent.includes('status')) {
      return <Activity className="w-4 h-4 text-green-500" />;
    }
    if (lowerContent.includes('risk') || lowerContent.includes('failure')) {
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    }
    if (lowerContent.includes('performance') || lowerContent.includes('metrics')) {
      return <BarChart3 className="w-4 h-4 text-blue-500" />;
    }
    if (lowerContent.includes('recommendation') || lowerContent.includes('suggestion')) {
      return <Target className="w-4 h-4 text-purple-500" />;
    }
    if (lowerContent.includes('immediate') || lowerContent.includes('urgent')) {
      return <Zap className="w-4 h-4 text-red-500" />;
    }
    if (lowerContent.includes('trend') || lowerContent.includes('improving')) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    }
    return <Shield className="w-4 h-4 text-gray-500" />;
  };

  const getStatusBadge = (content: string) => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('excellent') || lowerContent.includes('optimal')) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">EXCELLENT</span>;
    }
    if (lowerContent.includes('good') || lowerContent.includes('moderate')) {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">GOOD</span>;
    }
    if (lowerContent.includes('medium') || lowerContent.includes('moderate load')) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">MODERATE</span>;
    }
    if (lowerContent.includes('high') || lowerContent.includes('critical')) {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">HIGH</span>;
    }
    return null;
  };

  const renderSection = (section: any, index: number) => {
    const icon = getIconForContent(section.title);
    const statusBadge = getStatusBadge(section.title);
    const isExpanded = expandedSections.has(index);
    
    // Create a summary of the content (first 2-3 items)
    const summaryItems = section.content.slice(0, 2);
    const hasMoreItems = section.content.length > 2;
    
    return (
      <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {icon}
            <h4 className="text-sm font-semibold text-gray-900">{section.title}</h4>
          </div>
          <div className="flex items-center space-x-2">
            {statusBadge}
            <button
              onClick={() => toggleSection(index)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        {/* Always show summary */}
        <div className="space-y-2">
          {summaryItems.map((item: any, itemIndex: number) => {
            switch (item.type) {
              case 'metric':
                return (
                  <div key={itemIndex} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs text-gray-900">{item.value}</span>
                  </div>
                );
              
              case 'numbered-item':
              case 'bullet-item':
                return (
                  <div key={itemIndex} className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-200">
                    <div className="flex-shrink-0 w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
                    <span className="text-xs text-gray-700 line-clamp-2">{item.content}</span>
                  </div>
                );
              
              case 'text':
                return (
                  <div key={itemIndex} className="p-2 bg-white rounded border border-gray-200">
                    <p className="text-xs text-gray-700 line-clamp-2">{item.content}</p>
                  </div>
                );
              
              default:
                return null;
            }
          })}
        </div>
        
        {/* Expandable details */}
        {isExpanded && (
          <div className="mt-3 space-y-2 border-t border-gray-200 pt-3">
            {section.content.slice(2).map((item: any, itemIndex: number) => {
              const actualIndex = itemIndex + 2;
              switch (item.type) {
                case 'metric':
                  return (
                    <div key={actualIndex} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <span className="text-xs font-medium text-gray-700">{item.label}</span>
                      <span className="text-xs text-gray-900">{item.value}</span>
                    </div>
                  );
                
                case 'numbered-item':
                  return (
                    <div key={actualIndex} className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-200">
                      <span className="flex-shrink-0 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {actualIndex + 1}
                      </span>
                      <span className="text-xs text-gray-700">{item.content}</span>
                    </div>
                  );
                
                case 'bullet-item':
                  return (
                    <div key={actualIndex} className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-200">
                      <div className="flex-shrink-0 w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                      <span className="text-xs text-gray-700">{item.content}</span>
                    </div>
                  );
                
                case 'text':
                  return (
                    <div key={actualIndex} className="p-2 bg-white rounded border border-gray-200">
                      <p className="text-xs text-gray-700">{item.content}</p>
                    </div>
                  );
                
                default:
                  return null;
              }
            })}
          </div>
        )}
        
        {/* Show more indicator */}
        {!isExpanded && hasMoreItems && (
          <div className="mt-2 text-xs text-gray-500">
            +{section.content.length - 2} more items
          </div>
        )}
      </div>
    );
  };

  const sections = parseContent(content);

  if (sections.length === 0) {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.length > 1 && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => toggleAllSections(sections.length)}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
          >
            <span>
              {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
            </span>
          </button>
        </div>
      )}
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export { AIResponseRenderer };
