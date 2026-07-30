"use client";

import { useEffect, useRef, useState } from "react";
import { Crosshair, Maximize2, RotateCcw, ShieldCheck, Activity } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function SceneViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const [resetSignal, setResetSignal] = useState(0);
  const [webglFailed, setWebglFailed] = useState(false);

  // 3D Three.js Renderer Effect
  useEffect(() => {
    const container = containerRef.current;
    if (!container || webglFailed) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        failIfMajorPerformanceCaveat: false,
      });
    } catch (err) {
      console.warn("WebGL Context creation failed in SceneViewer — activating 2D Point-Cloud fallback", err);
      setWebglFailed(true);
      return;
    }

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d0f, 0.065);
    const camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(7.4, 5.2, 8.6);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x090d0f, 1);
    container.prepend(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.7, 0);
    controls.maxDistance = 20;
    controls.minDistance = 3;

    const grid = new THREE.GridHelper(22, 44, 0x2b817e, 0x1b292b);
    grid.position.y = -1.5;
    scene.add(grid);

    const positions: number[] = [];
    const colors: number[] = [];
    const random = seededRandom(41);
    const cyan = new THREE.Color(0x54e7da);
    const gray = new THREE.Color(0x8ba09d);
    const acid = new THREE.Color(0xc5f66f);
    for (let index = 0; index < 12_000; index += 1) {
      const region = index % 7;
      let x = (random() - 0.5) * 9;
      let y = (random() - 0.5) * 4;
      let z = (random() - 0.5) * 7;
      if (region < 3) y = -1.35 + random() * 0.18;
      if (region === 3) {
        x = -4.1 + random() * 0.15;
        y = -1.3 + random() * 4.8;
      }
      if (region === 4) {
        x = 4.1 - random() * 0.15;
        y = -1.3 + random() * 4.8;
      }
      if (region === 5) {
        x = 1.2 + (random() - 0.5) * 2.5;
        y = -0.8 + random() * 1.8;
        z = 0.8 + (random() - 0.5) * 3.2;
      }
      positions.push(x, y, z);
      const base = region === 5 ? acid : random() > 0.83 ? cyan : gray;
      const shade = 0.35 + random() * 0.65;
      colors.push(base.r * shade, base.g * shade, base.b * shade);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const evidenceMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xc5f66f })
    );
    evidenceMarker.position.set(1.3, -0.3, 1.1);
    scene.add(evidenceMarker);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.22, 32),
      new THREE.MeshBasicMaterial({ color: 0xc5f66f, side: THREE.DoubleSide, transparent: true, opacity: 0.7 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(evidenceMarker.position);
    scene.add(ring);

    let frame = 0;
    let animationId = 0;
    const animate = () => {
      animationId = window.requestAnimationFrame(animate);
      controls.update();
      ring.scale.setScalar(1 + Math.sin(frame * 0.035) * 0.22);
      ring.material.opacity = 0.45 + Math.sin(frame * 0.035) * 0.25;
      try {
        renderer.render(scene, camera);
      } catch (renderErr) {
        console.warn("WebGL render error, switching to 2D fallback:", renderErr);
        setWebglFailed(true);
      }
      frame += 1;
    };
    animate();

    const resize = new ResizeObserver(() => {
      if (container.clientWidth === 0 || container.clientHeight === 0) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resize.observe(container);

    return () => {
      window.cancelAnimationFrame(animationId);
      resize.disconnect();
      controls.dispose();
      geometry.dispose();
      material.dispose();
      try {
        renderer.dispose();
      } catch {}
      renderer.domElement.remove();
    };
  }, [resetSignal, webglFailed]);

  // 2D Tactical Point-Cloud Canvas Fallback
  useEffect(() => {
    if (!webglFailed) return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 700;
    const height = canvas.parentElement?.clientHeight || 450;
    canvas.width = width;
    canvas.height = height;

    const random = seededRandom(41);
    const particleCount = 2000;
    const particles: { x: number; y: number; color: string; size: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const px = (random() - 0.5) * (width * 0.8) + width / 2;
      const py = (random() - 0.5) * (height * 0.7) + height / 2;
      const isAcid = random() > 0.88;
      const isCyan = random() > 0.7;
      const color = isAcid ? "#c5f66f" : isCyan ? "#54e7da" : "#4a6068";
      particles.push({ x: px, y: py, color, size: random() * 1.8 + 0.8 });
    }

    let frame = 0;
    let animId = 0;

    const render2D = () => {
      animId = requestAnimationFrame(render2D);
      frame++;

      ctx.fillStyle = "#090d0f";
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = "#1b292b";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Draw point cloud
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Evidence Target Beacon
      const targetX = width * 0.62;
      const targetY = height * 0.48;
      const ringScale = 12 + Math.sin(frame * 0.05) * 4;

      ctx.strokeStyle = "#c5f66f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetX, targetY, ringScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#c5f66f";
      ctx.beginPath();
      ctx.arc(targetX, targetY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#c5f66f";
      ctx.fillText("EVIDENCE #01 — IMPACT BEACON", targetX + 16, targetY + 4);
    };

    render2D();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [webglFailed]);

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-[17px] bg-[#090d0f]">
      {webglFailed ? (
        <canvas ref={canvas2dRef} className="w-full h-full min-h-[430px]" />
      ) : (
        <div ref={containerRef} className="absolute inset-0" />
      )}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.35))]" />

      {/* Top Left HUD */}
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="status-pill status-ready">
          <span className="status-dot" /> SCENE REGISTERED
        </span>
        <span className="mono rounded-full border border-white/[0.09] bg-black/40 px-2.5 py-1.5 text-[8px] font-bold text-[#83918e] backdrop-blur">
          {webglFailed ? "2D TACTICAL SPATIAL VIEW" : "1.8M SPLATS"}
        </span>
      </div>

      {/* Top Right Controls */}
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          aria-label="Reset camera"
          onClick={() => { setWebglFailed(false); setResetSignal((v) => v + 1); }}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.1] bg-black/45 text-[#879491] backdrop-blur transition hover:text-white"
        >
          <RotateCcw size={13} />
        </button>
        <button
          aria-label="Fullscreen scene"
          onClick={() => void (containerRef.current?.parentElement || canvas2dRef.current?.parentElement)?.requestFullscreen()}
          className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.1] bg-black/45 text-[#879491] backdrop-blur transition hover:text-white"
        >
          <Maximize2 size={13} />
        </button>
      </div>

      {/* Bottom Left Info Panel */}
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/[0.09] bg-black/55 p-3 backdrop-blur font-mono text-xs">
        <div className="flex items-center gap-2">
          <Crosshair size={12} className="text-[#c5f66f]" />
          <span className="font-bold text-white">SPATIAL RECONSTRUCTION</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-cyan-400" />
          <span>Point Cloud & Ballistic Alignment Verified</span>
        </div>
      </div>
    </div>
  );
}
