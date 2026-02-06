import React, { useState } from "react";
import { Play, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export function ClipCard({ clip, onSeekTo, onUpdate, onDelete }) {
  const [isHovered, setIsHovered] = useState(false);

  // Helper: Convert seconds (90) -> "00:01:30" for the input
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Helper: Convert "00:01:30" -> seconds (90) for the backend
  const parseTime = (timeStr) => {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const handleStartChange = (value) => {
    // We allow the user to type, but we only update parent if it looks valid
    // For a smoother experience, usually you'd use local state,
    // but this direct connection works for quick edits.
    const newStart = parseTime(value);
    onUpdate(clip.id, newStart, clip.endTime);
  };

  const handleEndChange = (value) => {
    const newEnd = parseTime(value);
    onUpdate(clip.id, clip.startTime, newEnd);
  };

  const duration = Math.max(0, clip.endTime - clip.startTime);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative p-4 bg-gradient-to-br from-black/60 to-violet-900/10 backdrop-blur-sm rounded-lg border border-violet-500/30 hover:border-violet-400/60 transition-all"
    >
      {/* Index Badge */}
      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center border-2 border-neutral-950 shadow-lg z-10">
        <span className="text-sm font-bold text-white">
          #{String(clip.index).padStart(2, "0")}
        </span>
      </div>

      <div className="flex items-start gap-4 pt-2">
        {/* Time Inputs */}
        <div className="flex-1 space-y-3">
          <div className="flex gap-3">
            {/* Start Time */}
            <div className="flex-1">
              <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-bold">
                Start
              </label>
              <input
                type="text"
                // defaultValue allows typing without forcing re-render on every keystroke
                defaultValue={formatTime(clip.startTime)}
                onBlur={(e) => handleStartChange(e.target.value)}
                onFocus={() => onSeekTo(clip.startTime)}
                className="w-full px-3 py-2 bg-black/60 border border-violet-500/30 rounded text-violet-300 font-mono text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                placeholder="00:00:00"
              />
            </div>

            {/* End Time */}
            <div className="flex-1">
              <label className="block text-[10px] text-neutral-500 uppercase tracking-wider mb-1 font-bold">
                End
              </label>
              <input
                type="text"
                defaultValue={formatTime(clip.endTime)}
                onBlur={(e) => handleEndChange(e.target.value)}
                onFocus={() => onSeekTo(clip.endTime)}
                className="w-full px-3 py-2 bg-black/60 border border-violet-500/30 rounded text-violet-300 font-mono text-sm focus:outline-none focus:border-violet-400 focus:ring-1 focus:ring-violet-400 transition-all"
                placeholder="00:00:00"
              />
            </div>
          </div>

          {/* Duration Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-2 py-1 bg-violet-500/10 rounded">
              <span className="text-[10px] text-neutral-500 uppercase font-bold">
                Duration:
              </span>
              <span className="font-mono text-xs text-violet-400">
                {duration.toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-5">
          <button
            onClick={() => onSeekTo(clip.startTime)}
            className="p-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition-all shadow-lg hover:shadow-violet-500/20"
            title="Play Preview"
          >
            <Play className="w-4 h-4 text-white" />
          </button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(clip.id)}
            className="p-2 bg-red-500/10 hover:bg-red-500 rounded-lg transition-all group"
            title="Delete Clip"
          >
            <Trash2 className="w-4 h-4 text-red-400 group-hover:text-white" />
          </motion.button>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-violet-500/5 rounded-lg pointer-events-none"
        />
      )}
    </motion.div>
  );
}
