import React from 'react';
import { ClipCard } from './ClipCard';
import { Scissors, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const EditorTab = ({ clips, onSeekTo, onClipUpdate, onDeleteClip, onRender, isRendering }) => {
  
  // 1. Empty State
  if (clips.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
        <div className="w-20 h-20 mb-6 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <Scissors className="w-10 h-10 text-neutral-600" />
        </div>
        <h3 className="text-lg font-bold text-neutral-300">Timeline Empty</h3>
        <p className="text-sm text-neutral-500 mt-2 max-w-[200px]">
          Upload a video and run AI analysis to generate clips.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      
      {/* 2. Header Stats */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Timeline Editor</h2>
          <p className="text-[11px] text-neutral-500 font-mono mt-1 uppercase tracking-wider">
            Review & Fine-tune Segments
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-[10px] font-bold text-violet-300 font-mono">
            {clips.length} DETECTED
          </span>
        </div>
      </div>

      {/* 3. Scrollable List of Cards */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
        <AnimatePresence>
          {clips.map((clip, index) => (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <ClipCard 
                clip={clip}
                onSeekTo={onSeekTo}
                // IMPORTANT: We pass 'onClipUpdate' from App.jsx to 'onUpdate' in ClipCard
                onUpdate={onClipUpdate}
                onDelete={onDeleteClip}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 4. Render Action Button */}
      <div className="pt-6 mt-2 border-t border-white/5">
        <button
          onClick={onRender}
          disabled={isRendering}
          className="w-full group relative overflow-hidden py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          
          <div className="relative flex items-center justify-center gap-2">
            {isRendering ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={18} />
                </motion.div>
                <span className="font-mono tracking-wider">PROCESSING...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-violet-200 group-hover:text-white group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">RENDER FINAL VIDEO</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
};