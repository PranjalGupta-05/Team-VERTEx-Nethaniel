"use client";

import React, { useState } from "react";
import {
  Home, Briefcase, Vault, Route,
  DoorOpen, FolderOpen, Eye, EyeOff,
  Target, User, Armchair, Save, RotateCcw,
  ChevronDown,
} from "lucide-react";
import type { SceneModel, CameraMode, SceneObject } from "./scene-3d-canvas";
import { calculateTrajectory } from "@/lib/trajectory-calculator";
import { sounds } from "@/lib/sound-effects";

interface ReconstructionControlsProps {
  model: SceneModel;
  onModelChange: (m: SceneModel) => void;
  cameraMode: CameraMode;
  onCameraModeChange: (m: CameraMode) => void;
  sceneObjects: SceneObject[];
  onObjectToggle: (id: string) => void;
  showTrajectory: boolean;
  onTrajectoryToggle: () => void;
  shooterPos: { x: number; y: number; z: number };
  impactPos: { x: number; y: number; z: number };
  onShooterChange: (v: Partial<{ x: number; y: number; z: number }>) => void;
  onImpactChange: (v: Partial<{ x: number; y: number; z: number }>) => void;
  personAPos: { x: number; y: number; z: number };
  personBPos: { x: number; y: number; z: number };
  onPersonAChange: (v: Partial<{ x: number; y: number; z: number }>) => void;
  onPersonBChange: (v: Partial<{ x: number; y: number; z: number }>) => void;
}

const MODELS: { id: SceneModel; label: string; icon: React.ReactNode }[] = [
  { id: "residence", label: "Suburban Residence", icon: <Home className="w-3.5 h-3.5" /> },
  { id: "office", label: "Executive Office", icon: <Briefcase className="w-3.5 h-3.5" /> },
  { id: "vault", label: "Vault Corridor", icon: <Vault className="w-3.5 h-3.5" /> },
  { id: "alley", label: "Urban Alleyway", icon: <Route className="w-3.5 h-3.5" /> },
];

function SliderXYZ({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (v: Partial<{ x: number; y: number; z: number }>) => void;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className={`text-[10px] font-mono font-bold ${color}`}>{label}</div>
      {(["x", "y", "z"] as const).map((axis) => (
        <div key={axis} className="flex items-center gap-2">
          <span className="w-3 text-[9px] font-mono font-bold text-slate-400 uppercase">{axis}</span>
          <input
            type="range"
            min={-9}
            max={9}
            step={0.5}
            value={value[axis]}
            onChange={(e) => onChange({ [axis]: Number(e.target.value) })}
            className="flex-1 h-1 accent-cyan-400 cursor-pointer"
          />
          <span className="w-6 text-[9px] font-mono text-slate-400 text-right">{value[axis]}</span>
        </div>
      ))}
    </div>
  );
}

export function ReconstructionControls({
  model,
  onModelChange,
  cameraMode,
  onCameraModeChange,
  sceneObjects,
  onObjectToggle,
  showTrajectory,
  onTrajectoryToggle,
  shooterPos,
  impactPos,
  onShooterChange,
  onImpactChange,
  personAPos,
  personBPos,
  onPersonAChange,
  onPersonBChange,
}: ReconstructionControlsProps) {
  const [openSection, setOpenSection] = useState<string | null>("model");

  const traj = calculateTrajectory(shooterPos, impactPos);

  const toggle = (s: string) => {
    sounds.playFocus();
    setOpenSection((prev) => (prev === s ? null : s));
  };

  const SectionHeader = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => toggle(id)}
      className="flex items-center justify-between w-full px-3 py-2 text-xs font-mono font-bold text-slate-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
    >
      <span className="flex items-center gap-2">
        <span className="text-cyan-400">{icon}</span>
        {label}
      </span>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${openSection === id ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <div className="flex flex-col gap-1 text-xs select-none overflow-y-auto h-full pr-0.5">

      {/* Model Selector */}
      <SectionHeader id="model" label="Crime Scene Model" icon={<Home className="w-3.5 h-3.5" />} />
      {openSection === "model" && (
        <div className="px-2 pb-2 grid grid-cols-2 gap-1.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => { sounds.playFocus(); onModelChange(m.id); }}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg font-mono transition-all border ${
                model === m.id
                  ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 font-bold"
                  : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/25"
              }`}
            >
              {m.icon}
              <span className="text-[10px] leading-tight">{m.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Camera Modes */}
      <SectionHeader id="camera" label="Camera Mode" icon={<Eye className="w-3.5 h-3.5" />} />
      {openSection === "camera" && (
        <div className="px-2 pb-2 flex flex-col gap-1.5">
          {[
            { id: "orbit" as CameraMode, label: "3D Orbit View" },
            { id: "topdown" as CameraMode, label: "Floorplan (Top-Down)" },
            { id: "nightvision" as CameraMode, label: "Night Vision / Thermal" },
          ].map((cm) => (
            <button
              key={cm.id}
              onClick={() => { sounds.playFocus(); onCameraModeChange(cm.id); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono transition-all border ${
                cameraMode === cm.id
                  ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300"
                  : "bg-slate-900/60 border-white/10 text-slate-400 hover:text-white"
              }`}
            >
              {cameraMode === cm.id ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 opacity-40" />}
              {cm.label}
            </button>
          ))}
        </div>
      )}

      {/* Interactive Objects */}
      <SectionHeader id="objects" label="Open / Close Objects" icon={<DoorOpen className="w-3.5 h-3.5" />} />
      {openSection === "objects" && (
        <div className="px-2 pb-2 space-y-1.5">
          {sceneObjects.filter((o) => o.type === "door" || o.type === "cabinet").map((obj) => (
            <button
              key={obj.id}
              onClick={() => { sounds.playKeystroke(); onObjectToggle(obj.id); }}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-white/10 hover:border-cyan-400/40 transition-all"
            >
              <span className="flex items-center gap-2 text-slate-300">
                {obj.type === "door" ? (
                  <DoorOpen className="w-3 h-3 text-cyan-400" />
                ) : (
                  <FolderOpen className="w-3 h-3 text-amber-400" />
                )}
                {obj.label}
              </span>
              <span className={`text-[10px] font-bold font-mono ${obj.isOpen ? "text-emerald-400" : "text-slate-500"}`}>
                {obj.isOpen ? "OPEN" : "CLOSED"}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Entity Poser */}
      <SectionHeader id="entities" label="Entity Poser" icon={<User className="w-3.5 h-3.5" />} />
      {openSection === "entities" && (
        <div className="px-2 pb-2 space-y-3">
          <SliderXYZ label="🔴 Suspect A" value={personAPos} onChange={onPersonAChange} color="text-rose-400" />
          <SliderXYZ label="🔵 Victim B" value={personBPos} onChange={onPersonBChange} color="text-blue-400" />
        </div>
      )}

      {/* Bullet Trajectory */}
      <SectionHeader id="trajectory" label="Bullet Trajectory" icon={<Target className="w-3.5 h-3.5" />} />
      {openSection === "trajectory" && (
        <div className="px-2 pb-2 space-y-3">
          <button
            onClick={() => { sounds.playFocus(); onTrajectoryToggle(); }}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-mono font-bold border transition-all ${
              showTrajectory
                ? "bg-rose-500/20 border-rose-400/60 text-rose-300"
                : "bg-slate-900/60 border-white/10 text-slate-400 hover:border-red-400/40"
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            {showTrajectory ? "Hide Trajectory Ray" : "Show Trajectory Ray"}
          </button>

          {showTrajectory && (
            <>
              <SliderXYZ label="Shooter Origin" value={shooterPos} onChange={onShooterChange} color="text-amber-400" />
              <SliderXYZ label="Impact Point" value={impactPos} onChange={onImpactChange} color="text-rose-400" />

              {/* Calculated Stats */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-white/10 space-y-1.5 font-mono text-[10px]">
                <div className="text-slate-400 font-bold uppercase tracking-wider mb-2">Ballistic Analysis</div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Distance</span>
                  <span className="text-white font-bold">{traj.distanceMeters}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pitch (Vertical Angle)</span>
                  <span className="text-white font-bold">{traj.pitchDegrees}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Azimuth (Horizontal)</span>
                  <span className="text-white font-bold">{traj.yawDegrees}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Shooter Height</span>
                  <span className="text-cyan-300 font-bold">{traj.estimatedShooterHeight}m</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Save Scenario */}
      <div className="mt-auto pt-3 border-t border-white/10 flex gap-2 px-1">
        <button
          onClick={() => sounds.playFocus()}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/25 font-mono text-[10px] transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
        <button
          onClick={async () => {
            sounds.playSuccess();
            const scenario = { model, cameraMode, showTrajectory, shooterPos, impactPos, personAPos, personBPos, timestamp: new Date().toISOString() };
            console.log("Scenario saved:", scenario);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/90 hover:bg-cyan-400 border border-cyan-400/50 text-slate-950 font-mono font-bold text-[10px] shadow-[0_0_15px_rgba(84,231,218,0.25)] transition-all"
        >
          <Save className="w-3 h-3" />
          Save Scenario
        </button>
      </div>
    </div>
  );
}
