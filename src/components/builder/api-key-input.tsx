
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  const [showKey, setShowKey] = useState(false);
  const [isEditing, setIsEditing] = useState(!apiKey);

  if (!isEditing && apiKey) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <Key className="h-4 w-4 text-green-500" />
        <span className="text-sm text-green-600 dark:text-green-400">API Key configured</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="text-xs"
        >
          Change
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder="Enter your OpenAI API key (sk-...)"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="pr-10 text-sm"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {apiKey && (
          <Button
            size="sm"
            onClick={() => setIsEditing(false)}
            className="bg-urban-blue hover:bg-urban-blue/90"
          >
            Save
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Your API key is stored locally and never sent to our servers
      </p>
    </div>
  );
};
