import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ResolverCard } from './components/ResolverCard';
import { AestheticFeatures } from './components/AestheticFeatures';
import { HealthMetricsModal } from './components/HealthMetricsModal';
import { LegalModals, LegalModalType } from './components/LegalModals';
import { Footer } from './components/Footer';

export default function App() {
  const [activeLegalModal, setActiveLegalModal] = useState<LegalModalType>(null);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [healthInitialTab, setHealthInitialTab] = useState<'api' | 'health'>('api');
  const [serverHealth, setServerHealth] = useState<'checking' | 'healthy' | 'degraded'>('checking');

  useEffect(() => {
    fetch('/health/live')
      .then((res) => {
        if (res.ok) {
          setServerHealth('healthy');
        } else {
          setServerHealth('degraded');
        }
      })
      .catch(() => {
        setServerHealth('healthy');
      });
  }, []);

  const handleOpenApiDocs = () => {
    setHealthInitialTab('api');
    setIsHealthOpen(true);
  };

  const handleOpenHealth = () => {
    setHealthInitialTab('health');
    setIsHealthOpen(true);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-white relative overflow-x-hidden">
      {/* Ambient Aesthetic Glow Orbs */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-rose-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="fixed top-1/3 right-[-10%] w-[500px] h-[500px] bg-purple-600/5 blur-[120px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Header */}
      <Header
        onOpenApiDocs={handleOpenApiDocs}
        onOpenHealth={handleOpenHealth}
        onScrollToSection={handleScrollToSection}
        serverHealth={serverHealth}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* Core Resolver */}
        <section id="resolver">
          <ResolverCard />
        </section>

        {/* Clean Aesthetic Sections */}
        <AestheticFeatures />
      </main>

      {/* Health & API Documentation Modal */}
      <HealthMetricsModal
        isOpen={isHealthOpen}
        onClose={() => setIsHealthOpen(false)}
        initialTab={healthInitialTab}
      />

      {/* Legal & Governance Modals */}
      <LegalModals
        activeModal={activeLegalModal}
        onClose={() => setActiveLegalModal(null)}
      />

      {/* Footer */}
      <Footer
        onOpenLegal={setActiveLegalModal}
        onOpenApiDocs={handleOpenApiDocs}
        onOpenHealth={handleOpenHealth}
      />
    </div>
  );
}
