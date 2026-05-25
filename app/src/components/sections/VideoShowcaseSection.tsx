import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { Section, SectionMedia } from '@db/schema';
import VideoPlayer from '@/components/VideoPlayer';

interface SectionWithMedia extends Section {
  media?: SectionMedia[];
}

export default function VideoShowcaseSection({ section }: { section: SectionWithMedia }) {
  const data = section.data as {
    sectionLabel?: string;
    sectionTitle?: string;
    description?: string;
  } | undefined;

  const settings = (section.settings ?? {}) as {
    autoplay?: boolean;
    loop?: boolean;
    muted?: boolean;
    aspectRatio?: string;
  };

  const videos = (section.media ?? []).filter((m) => m.type === 'video');
  const videoUrl = videos[0]?.url ?? '';

  const ref = useScrollAnimation<HTMLDivElement>({
    animation: 'fade-up',
    duration: 1,
  });

  return (
    <div ref={ref} className="relative py-24 md:py-32 bg-bg-secondary/30">
      <div className="max-w-content mx-auto px-4 md:px-6">
        {(data?.sectionLabel || data?.sectionTitle) && (
          <div className="text-center mb-12">
            {data.sectionLabel && (
              <span className="text-xs uppercase tracking-[0.2em] text-accent mb-4 block">
                {data.sectionLabel}
              </span>
            )}
            {data.sectionTitle && (
              <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-4">
                {data.sectionTitle}
              </h2>
            )}
            {data?.description && (
              <p className="text-text-secondary max-w-2xl mx-auto">
                {data.description}
              </p>
            )}
          </div>
        )}

        {videoUrl && (
          <div className={`relative overflow-hidden ${settings.aspectRatio === '21:9' ? 'aspect-[21/9]' : 'aspect-video'}`}>
            <VideoPlayer
              src={videoUrl}
              className="w-full h-full"
              autoPlay={settings.autoplay ?? true}
              loop={settings.loop ?? true}
              muted={settings.muted ?? true}
              controls
            />
          </div>
        )}
      </div>
    </div>
  );
}
