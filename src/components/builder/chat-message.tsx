
import React from 'react';
import { Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    workflowId?: string;
    actions?: Array<{
      type: 'activate' | 'execute' | 'edit';
      label: string;
      workflowId?: string;
    }>;
  };
  onAction?: (action: string, workflowId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onAction }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-urban-blue rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`max-w-xs lg:max-w-md ${
        isUser 
          ? 'bg-urban-blue text-white' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
      } rounded-lg`}>
        <div className="px-4 py-2">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-1 opacity-70 ${
            isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        {/* Action buttons for assistant messages with workflows */}
        {!isUser && message.actions && message.actions.length > 0 && (
          <div className="px-4 pb-3 pt-1 border-t border-gray-200 dark:border-gray-600">
            <div className="flex gap-2 flex-wrap">
              {message.actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.type === 'activate' ? 'default' : 'outline'}
                  onClick={() => onAction?.(action.type, action.workflowId || message.workflowId || '')}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};
