"use client";

import React, { useState, Component, ReactNode } from "react";
import dynamic from "next/dynamic";
import { ScanLine, Layers, AlertTriangle, RefreshCw } from "lucide-react";
import type { SceneModel, CameraMode, SceneObject } from "./scene-3d-canvas";
import { ReconstructionControls } from "./reconstruction-controls";

// React Error Boundary for 3D Canvas
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class CanvasErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("3D Canvas Error Boundary caught an error:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[480px] bg-slate-950 flex flex-col items-center justify-center p-6 text-center gap-3 border border-red-500/20 rounded-xl">
          <AlertTriangle className="w-10 h-10 text-amber-400 animate-pulse" />
          <h2 className="text-sm font-bold font-mono text-white">3D Renderer Initialization Exception</h2>
          <p className="text-xs font-mono text-slate-400 max-w-md">
            WebGL context hardware acceleration was unavailable or blocked by GPU policies.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-400/40 rounded-xl text-xs font-mono font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Scene Canvas
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamically import 3D canvas (client-side only, no SSR)
const Scene3DCanvas = dynamic(
  () => import("./scene-3d-canvas").then((m) => ({ default: m.Scene3DCanvas })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 gap-3 min-h-[480px]">
      <div className="w-8 h-8 border-2 border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-500">Initializing Scene Renderer...</span>
    </div>
  )}
);

const DEFAULT_OBJECTS: SceneObject[] = [
  { id: "door1", type: "door", label: "Front Door", isOpen: false },
  { id: "door2", type: "door", label: "Rear Door", isOpen: false },
  { id: "door3", type: "door", label: "Office Door", isOpen: false },
  { id: "vault_door", type: "door", label: "Vault Door", isOpen: false },
  { id: "cabinet1", type: "cabinet", label: "Living Room Cabinet", isOpen: false },
  { id: "cabinet2", type: "cabinet", label: "Filing Cabinet A", isOpen: false },
];

export function ReconstructionsView() {
  const [model, setModel] = useState<SceneModel>("residence");
  const [cameraMode, setCameraMode] = useState<CameraMode>("orbit");
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>(DEFAULT_OBJECTS);
  const [showTrajectory, setShowTrajectory] = useState(false);
  const [shooterPos, setShooterPos] = useState({ x: -3, y: 1.6, z: 3 });
  const [impactPos, setImpactPos] = useState({ x: 3, y: 0.9, z: -3 });
  const [personAPos, setPersonAPos] = useState({ x: -2, y: 0, z: 2 });
  const [personBPos, setPersonBPos] = useState({ x: 2.5, y: 0, z: -2 });

  const handleObjectToggle = (id: string) => {
    setSceneObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, isOpen: !obj.isOpen } : obj))
    );
  };

  const MODEL_LABELS: Record<SceneModel, string> = {
    residence: "Suburban Residence",
    office: "Executive Office Suite",
    vault: "High-Security Vault Corridor",
    alley: "Urban Alleyway",
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-78px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
        <ScanLine className="w-5 h-5 text-cyan-400" />
        <div>
          <h1 className="text-sm font-bold text-white tracking-tight">
            3D Crime Scene Reconstruction Suite
          </h1>
          <p className="text-[10px] text-slate-400 font-mono">
            Current Scene: <span className="text-cyan-300 font-bold">{MODEL_LABELS[model]}</span>
            {" · "}{cameraMode.toUpperCase()} MODE
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-[10px] font-mono">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Tactical Reconstruction Engine</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* Content: 3D Canvas + Controls sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Canvas with Error Boundary */}
        <div className="flex-1 overflow-hidden relative">
          <CanvasErrorBoundary>
            <Scene3DCanvas
              model={model}
              cameraMode={cameraMode}
              sceneObjects={sceneObjects}
              onObjectsChange={setSceneObjects}
              showTrajectory={showTrajectory}
              shooterPos={shooterPos}
              impactPos={impactPos}
              personAPos={personAPos}
              personBPos={personBPos}
            />
          </CanvasErrorBoundary>

          {/* Overlay Legend */}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 border border-white/10 rounded-xl p-2.5 text-[10px] font-mono space-y-1 backdrop-blur-md z-10 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
              <span className="text-slate-300">Suspect / Person A</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
              <span className="text-slate-300">Victim / Person B</span>
            </div>
            {showTrajectory && (
              <div className="flex items-center gap-2">
                <span className="w-3 h-0.5 bg-red-500 shrink-0" />
                <span className="text-slate-300">Bullet Trajectory</span>
              </div>
            )}
            <div className="text-slate-500 pt-0.5 border-t border-white/10">
              Drag to orbit · Scroll to zoom
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-56 shrink-0 bg-slate-950/80 border-l border-white/10 p-3 flex flex-col overflow-hidden backdrop-blur-md">
          <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Controls
          </div>
          <div className="flex-1 overflow-y-auto">
            <ReconstructionControls
              model={model}
              onModelChange={setModel}
              cameraMode={cameraMode}
              onCameraModeChange={setCameraMode}
              sceneObjects={sceneObjects}
              onObjectToggle={handleObjectToggle}
              showTrajectory={showTrajectory}
              onTrajectoryToggle={() => setShowTrajectory((v) => !v)}
              shooterPos={shooterPos}
              impactPos={impactPos}
              onShooterChange={(v) => setShooterPos((p) => ({ ...p, ...v }))}
              onImpactChange={(v) => setImpactPos((p) => ({ ...p, ...v }))}
              personAPos={personAPos}
              personBPos={personBPos}
              onPersonAChange={(v) => setPersonAPos((p) => ({ ...p, ...v }))}
              onPersonBChange={(v) => setPersonBPos((p) => ({ ...p, ...v }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
