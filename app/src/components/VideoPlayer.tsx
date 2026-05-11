import { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

export default function VideoPlayer({ src, poster, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const pct = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (Number(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setProgress(Number(e.target.value));
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    videoRef.current.requestFullscreen();
  };

  return (
    <div
      className={`group relative bg-bg-primary rounded overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        preload="metadata"
      />

      {/* Play/Pause overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-bg-primary/30 transition-opacity"
        >
          <div className="w-16 h-16 rounded-full bg-bg-primary/70 flex items-center justify-center border border-text-muted/30 hover:border-accent hover:bg-bg-primary/90 transition-colors">
            <Play size={28} className="text-text-primary ml-1" />
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(transparent, rgba(18,18,18,0.8))' }}
      >
        {/* Progress bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 mb-3 appearance-none bg-text-muted/30 rounded cursor-pointer accent-accent hover:accent-accent-hover"
        />

        <div className="flex items-center gap-3">
          <button onClick={togglePlay} className="text-text-primary hover:text-accent transition-colors">
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={toggleMute} className="text-text-primary hover:text-accent transition-colors">
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button onClick={handleFullscreen} className="text-text-primary hover:text-accent transition-colors ml-auto">
            <Maximize size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
