
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link2, Database, Server, Webhook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Integrations = () => {
  const { toast } = useToast();

  const handleConnect = (integration: string) => {
    toast({
      title: "Connection initiated",
      description: `Connecting to ${integration}...`,
    });
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect your favorite apps and services</p>
        </div>
        <Button variant="outline">
          <Link2 className="h-4 w-4 mr-2" />
          Sync connections
        </Button>
      </div>

      <Tabs defaultValue="apps" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="apps">Apps</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="apis">APIs</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="apps" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard 
              name="Gmail" 
              description="Access emails, send messages, and manage labels" 
              icon={<Link2 className="h-5 w-5" />}
              status="connected"
              onConnect={() => handleConnect("Gmail")}
            />
            <IntegrationCard 
              name="Slack" 
              description="Send messages and interact with channels" 
              icon={<Link2 className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Slack")}
            />
            <IntegrationCard 
              name="Notion" 
              description="Create and edit pages, databases and more" 
              icon={<Link2 className="h-5 w-5" />}
              status="connected"
              onConnect={() => handleConnect("Notion")}
            />
            <IntegrationCard 
              name="Google Drive" 
              description="Access files, folders and documents" 
              icon={<Link2 className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Google Drive")}
            />
          </div>
        </TabsContent>

        <TabsContent value="databases" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard 
              name="Postgres" 
              description="Connect to PostgreSQL databases" 
              icon={<Database className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Postgres")}
            />
            <IntegrationCard 
              name="MongoDB" 
              description="Connect to MongoDB instances" 
              icon={<Database className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("MongoDB")}
            />
            <IntegrationCard 
              name="Supabase" 
              description="Use Supabase for database and authentication" 
              icon={<Database className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Supabase")}
            />
          </div>
        </TabsContent>

        <TabsContent value="apis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <IntegrationCard 
              name="OpenAI" 
              description="Access GPT models and other AI capabilities" 
              icon={<Server className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("OpenAI")}
            />
            <IntegrationCard 
              name="Stripe" 
              description="Process payments and manage subscriptions" 
              icon={<Server className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Stripe")}
            />
            <IntegrationCard 
              name="Custom API" 
              description="Connect to any API with a custom endpoint" 
              icon={<Server className="h-5 w-5" />}
              status="not_connected"
              onConnect={() => handleConnect("Custom API")}
            />
          </div>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Webhook className="h-5 w-5 mr-2" />
                  Zapier Webhook
                </CardTitle>
                <CardDescription>Connect Flo AI to Zapier via a webhook URL</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <Input id="webhook-url" placeholder="https://hooks.zapier.com/..." />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Test connection</Button>
                <Button onClick={() => handleConnect("Zapier")}>Save webhook</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  status: "connected" | "not_connected";
  onConnect: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  icon,
  status,
  onConnect,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-md mr-3">
            {icon}
          </div>
          {name}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div>
          {status === "connected" ? (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Connected
            </span>
          ) : (
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
              Not connected
            </span>
          )}
        </div>
        <Button
          variant={status === "connected" ? "outline" : "default"}
          onClick={onConnect}
        >
          {status === "connected" ? "Disconnect" : "Connect"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Integrations;
