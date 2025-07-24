import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/use-auth';

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-urban-blue rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl text-foreground">Flo AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`transition-colors ${
                    isActive('/dashboard') 
                      ? 'text-urban-blue font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/builder" 
                  className={`transition-colors ${
                    isActive('/builder') 
                      ? 'text-urban-blue font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Builder
                </Link>
                <Link 
                  to="/workflows" 
                  className={`transition-colors ${
                    isActive('/workflows') 
                      ? 'text-urban-blue font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Workflows
                </Link>
                <Link 
                  to="/agents" 
                  className={`transition-colors ${
                    isActive('/agents') 
                      ? 'text-urban-blue font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Agents
                </Link>
                <Link 
                  to="/integrations" 
                  className={`transition-colors ${
                    isActive('/integrations') 
                      ? 'text-urban-blue font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Integrations
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it works
                </a>
                <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </a>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="text-muted-foreground hover:text-foreground border-border hover:bg-accent"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="bg-urban-blue hover:bg-urban-blue/90 text-white shadow-sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};