import HeroSection from '@/sections/home/HeroSection';
import ServicesSection from '@/sections/home/ServicesSection';
import FeaturedWorkSection from '@/sections/home/FeaturedWorkSection';
import ProcessSection from '@/sections/home/ProcessSection';
import StatsSection from '@/sections/home/StatsSection';
import CTASection from '@/components/CTASection';
import { trpc } from '@/providers/trpc';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { data: ctaContent, isLoading: ctaLoading } = trpc.content.get.useQuery('cta');

  const ctaData = ctaContent?.data as {
    heading: string;
    subtext: string;
    ctaText: string;
    ctaLink: string;
  } | undefined;

  return (
    <main>
      <div className="relative">
        {/* Shared video background: Hero + Services */}
        <video
          src="/videos/hero-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="hero-bg absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay: 0% opacity at top → 40% at bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(18, 18, 18, 0.15) 0%, rgba(18, 18, 18, 0.40) 100%)',
          }}
        />
        <HeroSection />
        <ServicesSection />
      </div>
      <FeaturedWorkSection />
      <ProcessSection />
      <StatsSection />
      {ctaLoading || !ctaData ? (
        <section className="bg-bg-primary py-24 md:py-32 lg:py-40">
          <div className="max-w-content mx-auto px-4 md:px-6 text-center space-y-4">
            <Skeleton className="h-12 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <Skeleton className="h-10 w-40 mx-auto" />
          </div>
        </section>
      ) : (
        <CTASection
          heading={ctaData.heading}
          subtext={ctaData.subtext}
          ctaText={ctaData.ctaText}
          ctaLink={ctaData.ctaLink}
        />
      )}
    </main>
  );
}
