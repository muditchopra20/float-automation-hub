
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-urban-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="font-bold text-xl">Flo AI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`${isActive('/dashboard') ? 'text-urban-blue' : 'text-gray-600 hover:text-urban-blue'} transition-colors`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/builder" 
                  className={`${isActive('/builder') ? 'text-urban-blue' : 'text-gray-600 hover:text-urban-blue'} transition-colors`}
                >
                  Builder
                </Link>
                <Link 
                  to="/workflows" 
                  className={`${isActive('/workflows') ? 'text-urban-blue' : 'text-gray-600 hover:text-urban-blue'} transition-colors`}
                >
                  Workflows
                </Link>
                <Link 
                  to="/agents" 
                  className={`${isActive('/agents') ? 'text-urban-blue' : 'text-gray-600 hover:text-urban-blue'} transition-colors`}
                >
                  Agents
                </Link>
                <Link 
                  to="/integrations" 
                  className={`${isActive('/integrations') ? 'text-urban-blue' : 'text-gray-600 hover:text-urban-blue'} transition-colors`}
                >
                  Integrations
                </Link>
              </>
            ) : (
              <>
                <a href="#features" className="text-gray-600 hover:text-urban-blue transition-colors">
                  Features
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-urban-blue transition-colors">
                  How it works
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-urban-blue transition-colors">
                  Pricing
                </a>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <Button 
                  variant="outline" 
                  onClick={signOut}
                  className="text-gray-600 hover:text-urban-blue"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button className="bg-urban-blue hover:bg-urban-blue/90" asChild>
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
