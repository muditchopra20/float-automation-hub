
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ButtonWithGlow } from "@/components/ui/button-with-glow";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold gradient-text">Flo AI</div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <ButtonWithGlow asChild>
              <Link to="/signup">Sign Up</Link>
            </ButtonWithGlow>
          </div>
        </div>

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden p-4 pb-6 bg-white border-b border-gray-100 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <MobileNavLinks closeMenu={() => setIsMenuOpen(false)} />
            <div className="flex flex-col gap-2 pt-4">
              <Button variant="ghost" asChild className="w-full">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              </Button>
              <ButtonWithGlow asChild className="w-full">
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
              </ButtonWithGlow>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const NavLinks = () => (
  <nav className="flex gap-6">
    <NavLink to="/builder">Builder</NavLink>
    <NavLink to="/workflows">Workflows</NavLink>
    <NavLink to="/agents">Agents</NavLink>
    <NavLink to="/integrations">Integrations</NavLink>
  </nav>
);

const MobileNavLinks = ({ closeMenu }: { closeMenu: () => void }) => (
  <nav className="flex flex-col space-y-3">
    <MobileNavLink to="/builder" onClick={closeMenu}>
      Builder
    </MobileNavLink>
    <MobileNavLink to="/workflows" onClick={closeMenu}>
      Workflows
    </MobileNavLink>
    <MobileNavLink to="/agents" onClick={closeMenu}>
      Agents
    </MobileNavLink>
    <MobileNavLink to="/integrations" onClick={closeMenu}>
      Integrations
    </MobileNavLink>
  </nav>
);

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="text-gray-700 hover:text-urban-blue transition-colors text-sm font-medium"
  >
    {children}
  </Link>
);

const MobileNavLink = ({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <Link
    to={to}
    onClick={onClick}
    className="text-gray-700 hover:text-urban-blue transition-colors text-lg font-medium py-1"
  >
    {children}
  </Link>
);
