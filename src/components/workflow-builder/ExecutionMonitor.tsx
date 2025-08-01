import { useState, useEffect } from 'react';
import { useExecutions } from '@/hooks/use-executions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Square, RotateCcw, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExecutionMonitorProps {
  workflowId?: string;
}

export function ExecutionMonitor({ workflowId }: ExecutionMonitorProps) {
  const [executions, setExecutions] = useState([]);
  const [logs, setLogs] = useState([]);
  const { executeWorkflow } = useExecutions();
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleExecute = async () => {
    if (!workflowId) {
      toast({
        title: "Error",
        description: "No workflow selected",
        variant: "destructive",
      });
      return;
    }

    try {
      await executeWorkflow(workflowId, {});
      toast({
        title: "Success",
        description: "Workflow execution started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      {/* Execution Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Execution Controls</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleExecute} 
              size="sm" 
              disabled={!workflowId}
            >
              <Play className="w-4 h-4 mr-2" />
              Execute
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
            <Button variant="outline" size="sm" disabled>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Execution History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-full">
          <ScrollArea className="h-full">
            {executions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No executions yet</p>
                <p className="text-xs mt-1">Run your workflow to see execution history</p>
              </div>
            ) : (
              <div className="space-y-2">
                {executions.map((execution: any) => (
                  <div 
                    key={execution.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(execution.status)}
                      <div>
                        <div className="text-sm font-medium">
                          Execution #{execution.id.slice(-8)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(execution.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(execution.status)}>
                      {execution.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Execution Logs */}
      <Card className="flex-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Execution Logs</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 h-full">
          <ScrollArea className="h-full">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No logs yet</p>
                <p className="text-xs mt-1">Logs will appear during execution</p>
              </div>
            ) : (
              <div className="space-y-1 font-mono text-xs">
                {logs.map((log: any, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${
                      log.level === 'error' ? 'bg-red-50 text-red-700' :
                      log.level === 'warn' ? 'bg-yellow-50 text-yellow-700' :
                      log.level === 'info' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-muted-foreground">
                      [{new Date(log.created_at).toLocaleTimeString()}]
                    </span>{' '}
                    {log.message}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}