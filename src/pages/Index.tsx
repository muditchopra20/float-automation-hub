
import React from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { WhyFloSection } from "@/components/landing/why-flo-section";
import { WorkflowGallery } from "@/components/landing/workflow-gallery";
import { FinalCta } from "@/components/landing/final-cta";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <WhyFloSection />
        <WorkflowGallery />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
