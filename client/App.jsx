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
  const [serverVideoPath, setServerVideoPath] = useState(""); // Stores the dynamic path from Python
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

  /**
   * STEP 1: UPLOAD
   * Sends the physical file to the server's 'uploaded_videos' folder.
   * Receives an absolute path in return.
   */
  const handleVideoUpload = async (file) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file)); // For local browser preview
    setStatusLog("📤 Uploading video to server...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.status === "success") {
        setServerVideoPath(data.video_path); // Save path for Step 2
        setStatusLog(`✅ Uploaded: ${file.name}. Ready for AI analysis.`);
      } else {
        setStatusLog(`❌ Upload Failed: ${data.message}`);
      }
    } catch (error) {
      setStatusLog("❌ Connection error: Is the Python backend running?");
    }
  };

  /**
   * STEP 2: ANALYZE
   * Sends the server-side path to the AI worker.
   */
  const handleAnalyze = async () => {
    if (!serverVideoPath) {
      setStatusLog("❌ Error: Upload not finished. Please wait.");
      return; // Stop the function here
    }

    setIsAnalyzing(true);
    setStatusLog("🚀 AI is transcribing and finding viral moments...");

    try {
      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_path: serverVideoPath }), // Send dynamic path
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
        setStatusLog(`✅ Found ${mappedClips.length} clips!`);
        setCurrentTab("editor");
      } else {
        setStatusLog(`❌ AI Error: ${data.message}`);
      }
    } catch (error) {
      setStatusLog("❌ Failed to connect to Analysis Engine.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * STEP 3: RENDER
   * Sends the edited timestamps and source path for FFmpeg processing.
   */
  const handleRender = async () => {
    setIsRendering(true);
    setStatusLog("🎬 FFmpeg is cutting and stitching your clips...");

    try {
      const payload = clips.map((c) => ({
        start_time: formatTime(c.startTime),
        end_time: formatTime(c.endTime),
      }));

      const response = await fetch("http://localhost:5000/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clips: payload,
          video_path: serverVideoPath, // Ensure the engine knows which source to cut
        }),
      });
      const data = await response.json();

      if (data.status === "success") {
        setRenderedClips([...clips]);
        setStatusLog(`✨ Render Complete!`);
        setCurrentTab("output");
        if (data.summary_url) setVideoUrl(data.summary_url); // Switch preview to output
      } else {
        setStatusLog(`❌ Render Error: ${data.message}`);
      }
    } catch (error) {
      setStatusLog("❌ Render Connection Failed.");
    } finally {
      setIsRendering(false);
    }
  };

  // --- EDITOR UI LOGIC ---
  const handleSeekTo = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
  };

  const handleClipUpdate = (id, startTime, endTime) => {
    setClips((prev) =>
      prev.map((clip) =>
        clip.id === id ? { ...clip, startTime, endTime } : clip,
      ),
    );
  };

  const handleDeleteClip = (id) => {
    setClips((prev) => {
      const filtered = prev.filter((clip) => clip.id !== id);
      return filtered.map((clip, idx) => ({ ...clip, index: idx + 1 }));
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col font-sans">
      <header className="border-b border-violet-500/30 bg-black/40 backdrop-blur-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-black bg-gradient-to-r from-violet-400 to-purple-600 bg-clip-text text-transparent">
          VIRAL<span className="text-white">COMMAND</span>
        </h1>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
          <div
            className={`w-2 h-2 rounded-full ${isAnalyzing || isRendering ? "bg-yellow-400 animate-pulse" : "bg-green-500"}`}
          />
          SYSTEM{" "}
          {isAnalyzing ? "ANALYZING" : isRendering ? "RENDERING" : "READY"}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <div className="w-[55%] border-r border-violet-500/30 bg-neutral-900/50 p-6 flex items-center justify-center">
          <VideoPlayer
            videoUrl={videoUrl}
            videoRef={videoRef}
            onTimeUpdate={() => {}}
          />
        </div>

        {/* RIGHT PANEL */}
        <div className="w-[45%] flex flex-col bg-neutral-950">
          <div className="flex border-b border-violet-500/30">
            {["source", "editor", "output"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                disabled={!serverVideoPath && tab !== "source"}
                className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                  currentTab === tab
                    ? "bg-violet-600/10 text-violet-400 border-b-2 border-violet-500"
                    : "text-neutral-500"
                } disabled:opacity-20`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {currentTab === "source" && (
                <SourceTab
                  onVideoUpload={handleVideoUpload}
                  onAnalyze={handleAnalyze}
                  hasVideo={!!serverVideoPath}
                  isAnalyzing={isAnalyzing}
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

      <StatusBar log={statusLog} />
    </div>
  );
}
