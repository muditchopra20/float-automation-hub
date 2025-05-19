
import React, { useEffect } from 'react';
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { WhyFloSection } from "@/components/landing/why-flo-section";
import { WorkflowGallery } from "@/components/landing/workflow-gallery";
import { ChatboxPreview } from "@/components/landing/chatbox-preview";
import { FinalCta } from "@/components/landing/final-cta";

const Index = () => {
  // Add smooth scrolling reveal effect for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('.reveal-section');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <div className="reveal-section">
          <HowItWorksSection />
        </div>
        <div className="reveal-section">
          <WhyFloSection />
        </div>
        <div className="reveal-section">
          <WorkflowGallery />
        </div>
        <div className="reveal-section">
          <ChatboxPreview />
        </div>
        <div className="reveal-section">
          <FinalCta />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
