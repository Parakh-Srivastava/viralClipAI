import React from "react";
import { Terminal } from "lucide-react";
import { motion } from "framer-motion";

export const StatusBar = ({ log }) => {
  return (
    <div className="border-t border-white/10 bg-black/80 backdrop-blur-md px-6 py-3 flex items-center gap-4 text-xs font-mono">
      <Terminal size={14} className="text-violet-500" />
      <span className="text-neutral-600">
        {new Date().toLocaleTimeString()}
      </span>
      <motion.span
        key={log}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-violet-300 truncate"
      >
        {log}
      </motion.span>
    </div>
  );
};
