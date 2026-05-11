import { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import PortfolioGrid from '@/sections/work/PortfolioGrid';
import CTASection from '@/components/CTASection';

export default function Work() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <PageHeader
        label="Portafolio"
        heading="Cada render cuenta una historia"
        subtext="Una selección de nuestras mejores visualizaciones arquitectónicas — desde villas mediterráneas hasta lofts urbanos."
      />
      <PortfolioGrid />
      <CTASection
        heading="¿Tienes un proyecto en mente?"
        subtext="Nos encantaría saber de él."
        ctaText="Contáctanos →"
        ctaLink="/contact"
      />
    </main>
  );
}
