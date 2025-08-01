import { memo } from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface NodeExecutionStatusProps {
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'idle';
  className?: string;
}

function NodeExecutionStatus({ status = 'idle', className = '' }: NodeExecutionStatusProps) {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'running':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'text-blue-500',
          bg: 'bg-blue-100',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-3 h-3" />,
          color: 'text-green-500',
          bg: 'bg-green-100',
        };
      case 'failed':
        return {
          icon: <XCircle className="w-3 h-3" />,
          color: 'text-red-500',
          bg: 'bg-red-100',
        };
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3" />,
          color: 'text-yellow-500',
          bg: 'bg-yellow-100',
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          color: 'text-gray-500',
          bg: 'bg-gray-100',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`absolute -top-2 -right-2 rounded-full p-1 ${config.bg} ${config.color} ${className}`}
      title={`Status: ${status}`}
    >
      {config.icon}
    </div>
  );
}

export default memo(NodeExecutionStatus);