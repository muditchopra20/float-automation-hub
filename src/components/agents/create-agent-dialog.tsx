import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CheckIcon, PlusCircle, UploadCloud, X } from "lucide-react";
import { useAgents } from '@/hooks/use-agents';
import { useIntegrations } from '@/hooks/use-integrations';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  systemPrompt: z.string().min(10, { message: "System prompt must be at least 10 characters." }),
  executionMode: z.enum(["Manual", "Workflow Step", "Scheduled"]),
  hasMemory: z.boolean().default(false),
  enableLogs: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateAgentDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function CreateAgentDialog({ trigger, onSuccess }: CreateAgentDialogProps) {
  const { createAgent } = useAgents();
  const { integrations } = useIntegrations();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      systemPrompt: "",
      executionMode: "Manual",
      hasMemory: false,
      enableLogs: true,
    },
  });

  const handleToolSelect = (toolName: string) => {
    setSelectedTools((prev) => {
      if (prev.includes(toolName)) {
        return prev.filter((t) => t !== toolName);
      } else {
        return [...prev, toolName];
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileName: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);

      // Create a representation of files to store in the database
      const fileData = attachedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }));

      const agent = await createAgent(
        values.name, 
        'custom',
        values.description
      );

      if (agent) {
        // Update the agent with additional configuration
        await updateAgentConfiguration(agent.id, {
          ...values,
          toolAccess: selectedTools,
          attachedFiles: fileData
        });

        toast({
          title: "Agent created",
          description: `${values.name} has been created successfully.`,
        });

        // Reset form and close dialog
        form.reset();
        setSelectedTools([]);
        setAttachedFiles([]);
        setOpen(false);

        // Call onSuccess callback if provided
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const updateAgentConfiguration = async (agentId: string, config: any) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({
          system_prompt: config.systemPrompt,
          tool_access: config.toolAccess,
          execution_mode: config.executionMode,
          has_memory: config.hasMemory,
          attached_files: config.attachedFiles,
          enable_logs: config.enableLogs,
        })
        .eq('id', agentId)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating agent configuration:", error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button className="bg-urban-blue hover:bg-urban-blue/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create AI Agent</DialogTitle>
          <DialogDescription>
            Create a new AI agent to help automate tasks and workflows
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            {/* Agent Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sales Closer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Follows up with leads via email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* System Prompt */}
            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Define agent behavior, task and tone..."
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Define how the agent should behave, what tasks it should perform, and its tone.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tool Access */}
            <div className="space-y-2">
              <FormLabel>Tool Access</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <span>
                      {selectedTools.length > 0
                        ? `${selectedTools.length} tool${selectedTools.length === 1 ? '' : 's'} selected`
                        : "Select tools..."}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search tools..." />
                    <CommandList>
                      <CommandEmpty>No tools found.</CommandEmpty>
                      <CommandGroup>
                        {integrations.map((integration) => (
                          <CommandItem
                            key={integration.id}
                            onSelect={() => handleToolSelect(integration.name)}
                            className="flex items-center justify-between px-2"
                          >
                            <span>{integration.name}</span>
                            {selectedTools.includes(integration.name) && (
                              <CheckIcon className="h-4 w-4" />
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedTools.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTools.map((tool) => (
                    <Badge key={tool} variant="secondary" className="py-1">
                      {tool}
                      <button
                        type="button"
                        onClick={() => handleToolSelect(tool)}
                        className="ml-1 rounded-full hover:bg-muted p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tool}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Execution Mode */}
            <FormField
              control={form.control}
              name="executionMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Execution Mode</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select execution mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Execution Mode</SelectLabel>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Workflow Step">Workflow Step</SelectItem>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Memory Toggle */}
            <FormField
              control={form.control}
              name="hasMemory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Memory</FormLabel>
                    <FormDescription>
                      Enable memory for chat continuity and knowledge building
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* File Upload */}
            <div className="space-y-2">
              <FormLabel>Attach Files/Docs</FormLabel>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-2 text-neutral-gray" />
                    <p className="text-sm text-neutral-gray">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-neutral-gray/70">
                      PDF, TXT, DOCX, CSV (max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachedFiles.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <span className="ml-2 text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(file.name)}
                        className="p-1 rounded-full hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove {file.name}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enable Logs Toggle */}
            <FormField
              control={form.control}
              name="enableLogs"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Enable Logs</FormLabel>
                    <FormDescription>
                      Save input/output & tool usage for observability/debugging
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}