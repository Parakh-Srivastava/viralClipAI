import { Play } from "lucide-react";

export const VideoPlayer = ({ videoUrl, videoRef, onTimeUpdate }) => {
  if (!videoUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-700">
        <Play size={64} strokeWidth={1} className="mb-4 opacity-20" />
        <p className="font-mono text-xs tracking-widest uppercase">No Signal</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black relative w-full h-full max-h-[60vh] flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        className="w-full h-full object-contain"
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
      />
    </div>
  );
};
