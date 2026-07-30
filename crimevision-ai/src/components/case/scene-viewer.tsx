"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Crosshair, Maximize2, RotateCcw, Scan } from "lucide-react";
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
  const [ready, setReady] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090d0f, 0.065);
    const camera = new THREE.PerspectiveCamera(48, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(7.4, 5.2, 8.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
      renderer.render(scene, camera);
      frame += 1;
    };
    animate();
    setReady(true);

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
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [resetSignal]);

  return (
    <div className="relative h-full min-h-[430px] overflow-hidden rounded-[17px] bg-[#090d0f]">
      <div ref={containerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,.35))]" />
      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="status-pill status-ready"><span className="status-dot" /> SCENE REGISTERED</span>
        <span className="mono rounded-full border border-white/[0.09] bg-black/40 px-2.5 py-1.5 text-[8px] text-[#83918e] backdrop-blur">1.8M SPLATS</span>
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button aria-label="Reset camera" onClick={() => setResetSignal((value) => value + 1)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.1] bg-black/45 text-[#879491] backdrop-blur transition hover:text-white"><RotateCcw size={13} /></button>
        <button aria-label="Fullscreen scene" onClick={() => void containerRef.current?.parentElement?.requestFullscreen()} className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.1] bg-black/45 text-[#879491] backdrop-blur transition hover:text-white"><Maximize2 size={13} /></button>
      </div>
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/[0.09] bg-black/55 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Crosshair size={12} className="text-acid" />
          <span className="mono text-[8px] font-bold tracking-[0.11em] text-[#d8e4e1]">MARKER E-14</span>
        </div>
        <p className="mt-1 text-[9px] text-[#7f8d8a]">Recovered plate fragment · 88.7%</p>
      </div>
      <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/50 px-3 py-2 backdrop-blur">
        <Box size={12} className="text-cyan" />
        <span className="mono text-[8px] text-[#7f8c89]">ORBIT · SCROLL · INSPECT</span>
      </div>
      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-[#090d0f]">
          <div className="text-center">
            <Scan className="mx-auto animate-pulse text-cyan" size={24} />
            <span className="mono mt-3 block text-[8px] tracking-[0.14em] text-[#6c7977]">MATERIALIZING DIGITAL TWIN</span>
          </div>
        </div>
      )}
    </div>
  );
}
