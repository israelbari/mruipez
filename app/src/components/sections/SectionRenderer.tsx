import type { Section, SectionMedia } from '@db/schema';
import HeroSection from './HeroSection';
import ServicesSection from './ServicesSection';
import ProcessSection from './ProcessSection';
import StatsSection from './StatsSection';
import CTASection from './CTASection';
import GallerySection from './GallerySection';
import VideoShowcaseSection from './VideoShowcaseSection';
import FullscreenSliderSection from './FullscreenSliderSection';

interface SectionWithMedia extends Section {
  media?: SectionMedia[];
}

interface SectionRendererProps {
  section: SectionWithMedia;
}

const sectionComponents: Record<string, React.ComponentType<{ section: SectionWithMedia }>> = {
  hero: HeroSection,
  services: ServicesSection,
  process: ProcessSection,
  stats: StatsSection,
  cta: CTASection,
  gallery: GallerySection,
  video_showcase: VideoShowcaseSection,
  fullscreen_slider: FullscreenSliderSection,
};

export default function SectionRenderer({ section }: SectionRendererProps) {
  if (!section.isActive) return null;

  const Component = sectionComponents[section.type];
  if (!Component) {
    console.warn(`Unknown section type: ${section.type}`);
    return null;
  }

  return (
    <section id={`section-${section.id}`} className="relative">
      <Component section={section} />
    </section>
  );
}
