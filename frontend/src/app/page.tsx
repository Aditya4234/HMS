'use client';

import { useEffect } from 'react';
import { useGsapAnimation } from '@/hooks/useGsapAnimation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import TrustedCompanies from '@/components/landing/TrustedCompanies';
import Features from '@/components/landing/Features';
import DashboardPreview from '@/components/landing/DashboardPreview';
import RoomShowcase from '@/components/landing/RoomShowcase';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTABanner from '@/components/landing/CTABanner';

export default function HomePage() {
  useGsapAnimation();

  return (
    <main className="min-h-screen bg-[#0b1120]">
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <DashboardPreview />
      <RoomShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </main>
  );
}
