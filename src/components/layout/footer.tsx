import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border py-12 mt-24 bg-background text-foreground transition-colors">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="text-2xl font-bold gradient-text">Flo AI</div>
            </Link>
            <p className="text-muted-foreground text-sm mt-4 max-w-xs">
              Build workflows and AI agents using natural language. Flo builds it all.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-3 text-foreground">Product</h3>
            <ul className="space-y-2">
              <FooterLink to="/builder">Builder</FooterLink>
              <FooterLink to="/workflows">Workflows</FooterLink>
              <FooterLink to="/agents">Agents</FooterLink>
              <FooterLink to="/integrations">Integrations</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 text-foreground">Resources</h3>
            <ul className="space-y-2">
              <FooterLink to="#">Documentation</FooterLink>
              <FooterLink to="#">API Reference</FooterLink>
              <FooterLink to="#">Blog</FooterLink>
              <FooterLink to="#">Community</FooterLink>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-3 text-foreground">Company</h3>
            <ul className="space-y-2">
              <FooterLink to="#">About</FooterLink>
              <FooterLink to="#">Careers</FooterLink>
              <FooterLink to="#">Privacy</FooterLink>
              <FooterLink to="#">Terms</FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Flo AI. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <SocialLink href="#">Twitter</SocialLink>
            <SocialLink href="#">GitHub</SocialLink>
            <SocialLink href="#">Discord</SocialLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) => (
  <li>
    <Link
      to={to}
      className="text-sm text-muted-foreground hover:text-urban-blue transition-colors"
    >
      {children}
    </Link>
  </li>
);

const SocialLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-muted-foreground hover:text-urban-blue transition-colors"
  >
    {children}
  </a>
);