
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, value, onChange }) => {
  const [internalMessage, setInternalMessage] = useState("");
  
  // Use controlled value if provided, otherwise use internal state
  const message = value !== undefined ? value : internalMessage;
  const setMessage = onChange || setInternalMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <div className="border-t border-gray-100 bg-white py-4 px-4 md:px-6 sticky bottom-0 z-10 dark:bg-gray-800 dark:border-gray-700">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-4xl mx-auto"
      >
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What do you want Flo to automate?"
          className="flex-1 py-6 text-base dark:bg-gray-700/80 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
        />
        <Button 
          type="submit" 
          className="bg-urban-blue hover:bg-urban-blue/90 dark:bg-urban-blue/90 dark:hover:bg-urban-blue dark:shadow-lg dark:shadow-urban-blue/20"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
