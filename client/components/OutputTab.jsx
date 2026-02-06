import React from "react";
import { Download, CheckCircle2, Film } from "lucide-react";
import { motion } from "framer-motion";

export const OutputTab = ({ clips, videoUrl, formatTime }) => {
  if (clips.length === 0) return null;

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 flex items-center gap-3"
      >
        <CheckCircle2 className="text-green-400" />
        <div>
          <h3 className="font-bold text-green-400 text-sm">Render Complete</h3>
          <p className="text-xs text-green-500/70">
            Video successfully processed.
          </p>
        </div>
      </motion.div>

      <div className="flex-1 overflow-auto space-y-2 mb-4">
        <h4 className="text-[10px] uppercase font-bold text-neutral-500 mb-2">
          Clip Summary
        </h4>
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="bg-neutral-900/50 p-3 rounded-lg border border-white/5 flex justify-between text-xs text-neutral-400"
          >
            <span>Clip {clip.index}</span>
            <span className="font-mono text-neutral-300">
              {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
            </span>
          </div>
        ))}
      </div>

      <a
        href={videoUrl}
        download="Viral_Summary.mp4"
        className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-white shadow-lg transition-colors flex items-center justify-center gap-2"
      >
        <Download size={18} />
        <span>DOWNLOAD VIDEO</span>
      </a>
    </div>
  );
};
