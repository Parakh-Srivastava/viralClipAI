import React, { useState, useRef } from "react";
import { VideoPlayer } from "./components/VideoPlayer";
import { SourceTab } from "./components/SourceTab";
import { EditorTab } from "./components/EditorTab";
import { OutputTab } from "./components/OutputTab";
import { StatusBar } from "./components/StatusBar";
import { motion } from "framer-motion";
import "./App.css";

export default function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [clips, setClips] = useState([]);
  const [currentTab, setCurrentTab] = useState("source");
  const [statusLog, setStatusLog] = useState("Ready to upload video...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedClips, setRenderedClips] = useState([]);

  const videoRef = useRef(null);

  // --- UTILS ---
  const parseTimeString = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // --- HANDLERS ---
  const handleVideoUpload = (file) => {
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setStatusLog(`Video loaded: ${file.name}`);
    setCurrentTab("source");
    setClips([]);
    setRenderedClips([]);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setStatusLog("🚀 Sending to Llama 3.2 for analysis...");

    try {
      // We trigger the backend to analyze the file at the hardcoded path
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
      });
      const data = await response.json();

      if (data.status === "success") {
        const mappedClips = data.clips.map((c, idx) => ({
          id: `clip-${Date.now()}-${idx}`,
          startTime: parseTimeString(c.start_time),
          endTime: parseTimeString(c.end_time),
          index: idx + 1,
        }));

        setClips(mappedClips);
        setIsAnalyzing(false);
        setStatusLog(
          `✅ Analysis complete. Found ${mappedClips.length} viral moments.`,
        );
        setCurrentTab("editor");
      } else {
        setStatusLog(`❌ Error: ${data.message}`);
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error(error);
      setStatusLog("❌ Failed to connect to Python Backend");
      setIsAnalyzing(false);
    }
  };

  const handleRender = async () => {
    setIsRendering(true);
    setStatusLog("🎬 Rendering final clips with FFmpeg...");

    try {
      // Convert seconds back to HH:MM:SS for Python
      const payload = clips.map((c) => ({
        start_time: formatTime(c.startTime),
        end_time: formatTime(c.endTime),
      }));

      const response = await fetch("http://localhost:5000/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clips: payload }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setRenderedClips([...clips]);
        setIsRendering(false);
        setStatusLog(`✨ Success! Rendered ${clips.length} clips.`);
        setCurrentTab("output");
        // If backend returns a summary URL, use it
        if (data.summary_url) {
          setVideoUrl(data.summary_url);
        }
      } else {
        setStatusLog(`❌ Render Failed: ${data.message}`);
        setIsRendering(false);
      }
    } catch (error) {
      setStatusLog("❌ Render Connection Failed");
      setIsRendering(false);
    }
  };

  const handleSeekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setStatusLog(`Seeking to ${formatTime(time)}`);
    }
  };

  const handleClipUpdate = (id, startTime, endTime) => {
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === id ? { ...clip, startTime, endTime } : clip,
      ),
    );
    setStatusLog(
      `Clip updated: ${formatTime(startTime)} → ${formatTime(endTime)}`,
    );
  };

  const handleDeleteClip = (id) => {
    setClips((prev) => {
      const filtered = prev.filter((clip) => clip.id !== id);
      return filtered.map((clip, idx) => ({ ...clip, index: idx + 1 }));
    });
    setStatusLog("Clip deleted");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans selection:bg-violet-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-violet-500/30 bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent tracking-tighter">
              VIRAL<span className="text-white">COMMAND</span>
            </h1>
            <p className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase mt-0.5">
              AI-Powered Non-Linear Editor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isAnalyzing || isRendering ? "bg-yellow-400 animate-pulse" : "bg-green-500"}`}
            ></div>
            <span className="text-xs font-mono text-neutral-500">
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Video Player */}
        <div className="w-[55%] border-r border-violet-500/30 bg-neutral-900/50 p-6 flex flex-col justify-center relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/5 to-transparent pointer-events-none"></div>
          <VideoPlayer
            videoUrl={videoUrl}
            videoRef={videoRef}
            onTimeUpdate={(time) => {}}
          />
        </div>

        {/* Right Panel - Control Deck */}
        <div className="w-[45%] flex flex-col bg-neutral-950 relative z-10 shadow-2xl">
          {/* Tab Navigation */}
          <div className="flex border-b border-violet-500/30 bg-black/40">
            {["source", "editor", "output"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                disabled={!videoFile && tab !== "source"}
                className={`flex-1 px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  currentTab === tab
                    ? "bg-violet-600/10 text-violet-400 border-b-2 border-violet-500"
                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                } disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-violet-900 scrollbar-track-transparent">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentTab === "source" && (
                <SourceTab
                  onVideoUpload={handleVideoUpload}
                  onAnalyze={handleAnalyze}
                  hasVideo={!!videoFile}
                  isAnalyzing={isAnalyzing}
                  videoFile={videoFile}
                />
              )}
              {currentTab === "editor" && (
                <EditorTab
                  clips={clips}
                  onSeekTo={handleSeekTo}
                  onClipUpdate={handleClipUpdate}
                  onDeleteClip={handleDeleteClip}
                  onRender={handleRender}
                  isRendering={isRendering}
                  formatTime={formatTime}
                />
              )}
              {currentTab === "output" && (
                <OutputTab
                  clips={renderedClips}
                  videoUrl={videoUrl}
                  formatTime={formatTime}
                />
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar log={statusLog} />
    </div>
  );
}
