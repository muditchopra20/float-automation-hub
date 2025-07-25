
import React from "react";
import { ButtonWithGlow } from "@/components/ui/button-with-glow";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FinalCta: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-900/50 transition-colors">
      <div className="container">
        <div className="bg-gradient-to-r from-urban-blue to-violet rounded-2xl p-12 text-center relative overflow-hidden shadow-xl dark:shadow-urban-blue/10">
          {/* Abstract shapes */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20">
            <div className="absolute top-10 right-10 w-40 h-40 rounded-full border-8 border-white"></div>
            <div className="absolute bottom-10 left-20 w-20 h-20 rounded-full border-4 border-white"></div>
            <div className="absolute top-40 left-10 w-10 h-10 rounded-full bg-white"></div>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fade-in dark:text-white dark:text-shadow-glow">
              Start automating the smart way.
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 animate-fade-in dark:text-white/90" style={{ animationDelay: "0.2s" }}>
              Join thousands of teams who are saving time and reducing errors with
              Flo AI's natural language automation platform.
            </p>
            <ButtonWithGlow
              size="lg"
              className="bg-white text-urban-blue hover:bg-white/90 animate-fade-in dark:bg-gray-900 dark:text-urban-blue dark:hover:bg-gray-900/90 dark:shadow-lg dark:shadow-black/20"
              style={{ animationDelay: "0.4s" }}
            >
              <Link to="/signup" className="flex items-center">
                Get Started with Flo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </ButtonWithGlow>
          </div>
        </div>
      </div>
    </div>
  );
};
