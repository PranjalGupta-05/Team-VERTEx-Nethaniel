"use client";

import React, { useEffect, useRef } from "react";

export type ThemePreset = "obsidian" | "violet" | "cyan" | "emerald";

interface CinematicBackgroundProps {
  theme?: ThemePreset;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
}

interface Orb {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  speed: number;
  pulsePhase: number;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  theme = "obsidian",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    // Color palettes per theme
    const getThemeColors = (t: ThemePreset) => {
      switch (t) {
        case "violet":
          return {
            bg: "#06030c",
            orbs: [
              "rgba(147, 51, 234, 0.28)",
              "rgba(219, 39, 119, 0.22)",
              "rgba(79, 70, 229, 0.25)",
            ],
            particles: ["#c084fc", "#e879f9", "#818cf8"],
            cursorGlow: "rgba(168, 85, 247, 0.15)",
          };
        case "cyan":
          return {
            bg: "#030a0f",
            orbs: [
              "rgba(6, 182, 212, 0.28)",
              "rgba(59, 130, 246, 0.24)",
              "rgba(20, 184, 166, 0.22)",
            ],
            particles: ["#22d3ee", "#60a5fa", "#2dd4bf"],
            cursorGlow: "rgba(6, 182, 212, 0.15)",
          };
        case "emerald":
          return {
            bg: "#020a07",
            orbs: [
              "rgba(16, 185, 129, 0.26)",
              "rgba(5, 150, 105, 0.22)",
              "rgba(132, 204, 22, 0.20)",
            ],
            particles: ["#34d399", "#a3e635", "#10b981"],
            cursorGlow: "rgba(16, 185, 129, 0.14)",
          };
        case "obsidian":
        default:
          return {
            bg: "#07090e",
            orbs: [
              "rgba(84, 231, 218, 0.22)",
              "rgba(99, 102, 241, 0.24)",
              "rgba(197, 246, 111, 0.18)",
            ],
            particles: ["#54e7da", "#c5f66f", "#a5b4fc"],
            cursorGlow: "rgba(84, 231, 218, 0.12)",
          };
      }
    };

    let colors = getThemeColors(theme);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    // Optimized Particle count based on device power
    const densityFactor = isMobile ? 32000 : 20000;
    const particleCount = Math.min(80, Math.floor((width * height) / densityFactor));

    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.8,
      alpha: Math.random() * 0.5 + 0.2,
      baseAlpha: Math.random() * 0.4 + 0.2,
      color: (colors.particles[Math.floor(Math.random() * colors.particles.length)] as string) || "#54e7da",
    }));

    // Initialize Glowing Ambient Orbs
    const orbs: Orb[] = colors.orbs.map((color, idx) => ({
      x: (width / (colors.orbs.length + 1)) * (idx + 1),
      y: height * (0.3 + idx * 0.2),
      targetX: (width / (colors.orbs.length + 1)) * (idx + 1),
      targetY: height * (0.3 + idx * 0.2),
      radius: Math.min(width, height) * 0.35 + idx * 40,
      color,
      speed: 0.008 + idx * 0.003,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Render loop
    let time = 0;
    let isPaused = false;

    const handleVisibilityChange = () => {
      isPaused = document.hidden;
      if (!isPaused) {
        render();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const render = () => {
      if (isPaused) return;

      time += 0.01;
      colors = getThemeColors(theme);

      // Smooth Lerp for Mouse
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      // Clear Canvas & Fill Background Gradient
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        10,
        width / 2,
        height / 2,
        Math.max(width, height)
      );
      bgGrad.addColorStop(0, colors.bg);
      bgGrad.addColorStop(1, "#030407");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Orbs with blend mode
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      orbs.forEach((orb, i) => {
        const floatX = Math.sin(time * 0.7 + i) * 50;
        const floatY = Math.cos(time * 0.5 + i * 1.5) * 40;
        const pulse = Math.sin(time * 1.2 + orb.pulsePhase) * 15;

        const dx = mouseRef.current.x - width / 2;
        const dy = mouseRef.current.y - height / 2;
        const mouseShiftX = dx * (0.015 + i * 0.008);
        const mouseShiftY = dy * (0.015 + i * 0.008);

        const currentX = orb.x + floatX + mouseShiftX;
        const currentY = orb.y + floatY + mouseShiftY;
        const currentRadius = Math.max(10, orb.radius + pulse);

        const grad = ctx.createRadialGradient(
          currentX,
          currentY,
          0,
          currentX,
          currentY,
          currentRadius
        );
        const orbColor = colors.orbs[i % colors.orbs.length] || "rgba(84, 231, 218, 0.22)";
        grad.addColorStop(0, orbColor);
        grad.addColorStop(0.6, orbColor.replace(/[\d\.]+\)$/, "0.08)"));
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(currentX, currentY, currentRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse Spotlight Glow
      if (mouseRef.current.x > 0 && mouseRef.current.y > 0 && !isMobile) {
        const mouseGrad = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          400
        );
        mouseGrad.addColorStop(0, colors.cursorGlow);
        mouseGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.015)");
        mouseGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = mouseGrad;
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 400, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Render Subtle Grid Pattern
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.018)";
      ctx.lineWidth = 1;
      const gridSize = 56;
      const gridOffsetX = (mouseRef.current.x * 0.012) % gridSize;
      const gridOffsetY = (mouseRef.current.y * 0.012) % gridSize;

      ctx.beginPath();
      for (let x = gridOffsetX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridOffsetY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Render Particles (High performance batching)
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        if (!isMobile) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 transform-gpu"
    />
  );
};
