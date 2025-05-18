
import React from "react";
import { ButtonWithGlow } from "@/components/ui/button-with-glow";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const FinalCta: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="container">
        <div className="bg-gradient-to-r from-urban-blue to-violet rounded-2xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Start automating the smart way.
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Join thousands of teams who are saving time and reducing errors with
            Flo AI's natural language automation platform.
          </p>
          <ButtonWithGlow
            size="lg"
            className="bg-white text-urban-blue hover:bg-white/90"
            asChild
          >
            <Link to="/signup">
              Get Started with Flo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </ButtonWithGlow>
        </div>
      </div>
    </div>
  );
};
