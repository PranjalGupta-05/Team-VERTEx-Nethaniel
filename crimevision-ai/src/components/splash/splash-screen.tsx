"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Volume2, VolumeX, Shield, ArrowRight, SkipForward } from "lucide-react";
import { sounds } from "@/lib/sound-effects";

interface SplashScreenProps {
  onComplete: () => void;
  autoPlay?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  autoPlay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setHasEnded(true);
      setIsPlaying(false);
      sounds.playSuccess();
      setTimeout(() => {
        onComplete();
      }, 1000);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    if (autoPlay) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked fallback
        setIsPlaying(false);
      });
    }

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [autoPlay, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
      sounds.playFocus();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
    sounds.playFocus();
  };

  const handleSkip = () => {
    sounds.playFocus();
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden font-sans select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src="/splashscreen.mp4"
        playsInline
        muted={isMuted}
        className="absolute inset-0 w-full h-full object-cover filter brightness-90 contrast-105"
      />

      {/* Atmospheric Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/70 pointer-events-none" />

      {/* Top Header Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-lg">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-widest font-mono">
              CRIMEVISION<span className="text-cyan-400"> AI</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider">
              INTRO CINEMATIC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audio Toggle */}
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-slate-950/70 border border-white/20 text-white hover:border-cyan-400/60 transition-all backdrop-blur-md"
            title={isMuted ? "Unmute video audio" : "Mute video audio"}
          >
            {isMuted ? (
              <VolumeX className="w-4.5 h-4.5 text-rose-400" />
            ) : (
              <Volume2 className="w-4.5 h-4.5 text-cyan-400" />
            )}
          </button>

          {/* Skip Intro Button */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-white/20 text-xs font-mono font-semibold text-slate-200 hover:text-white hover:border-cyan-400/60 transition-all backdrop-blur-md group"
          >
            <span>Skip Intro</span>
            <SkipForward className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Center Play Overlay Button if Autoplay was blocked or paused */}
      <AnimatePresence>
        {!isPlaying && !hasEnded && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={togglePlay}
            className="relative z-20 flex items-center justify-center w-20 h-20 rounded-full bg-slate-950/80 border border-cyan-400/60 text-cyan-400 shadow-[0_0_50px_rgba(84,231,218,0.3)] backdrop-blur-md hover:scale-110 transition-transform"
          >
            <Play className="w-8 h-8 translate-x-0.5 fill-current" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Floating Bar with Progress */}
      <div className="absolute bottom-8 left-6 right-6 z-20 max-w-xl mx-auto space-y-4">
        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Enter Platform Main Action */}
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            System Initialization Sequence
          </div>

          <button
            onClick={handleSkip}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900/90 border border-cyan-400/60 text-xs font-mono font-bold text-white shadow-[0_0_25px_rgba(84,231,218,0.25)] hover:shadow-[0_0_35px_rgba(84,231,218,0.4)] hover:bg-slate-800 transition-all group"
          >
            <span>Enter Terminal</span>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
