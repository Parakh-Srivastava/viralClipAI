import React, { useRef } from "react";
import { Upload, Wand, FileVideo } from "lucide-react";
import { motion } from "framer-motion";

// notice the 'export const' here - this is what App.jsx is looking for
export const SourceTab = ({
  onVideoUpload,
  onAnalyze,
  hasVideo,
  isAnalyzing,
  videoFile,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="p-8 h-full flex flex-col">
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`flex-1 border-2 border-dashed rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center group ${
          hasVideo
            ? "border-violet-500/50 bg-violet-500/5"
            : "border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900"
        }`}
      >
        <div className="text-center p-6">
          {hasVideo ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <FileVideo className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <p className="font-bold text-white">{videoFile.name}</p>
              <p className="text-xs text-neutral-500 mt-2">
                {(videoFile.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </motion.div>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800/50 flex items-center justify-center group-hover:bg-neutral-800 transition-colors">
                <Upload className="w-8 h-8 text-neutral-500 group-hover:text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Upload Source
              </h3>
              <p className="text-sm text-neutral-500">Click to browse files</p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={(e) =>
            e.target.files[0] && onVideoUpload(e.target.files[0])
          }
          className="hidden"
        />
      </div>

      <button
        onClick={onAnalyze}
        disabled={!hasVideo || isAnalyzing}
        className="mt-6 w-full py-4 bg-white text-black rounded-xl font-bold shadow-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <Wand size={18} />
            </motion.div>
            <span>ANALYZING...</span>
          </>
        ) : (
          <>
            <Wand size={18} />
            <span>START AI ANALYSIS</span>
          </>
        )}
      </button>
    </div>
  );
};
