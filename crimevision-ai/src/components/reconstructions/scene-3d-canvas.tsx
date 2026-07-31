"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { calculateTrajectory } from "@/lib/trajectory-calculator";

export type SceneModel = "residence" | "office" | "vault" | "alley";
export type CameraMode = "orbit" | "topdown" | "nightvision";

export interface SceneObject {
  id: string;
  type: "door" | "cabinet" | "window" | "person" | "furniture";
  label: string;
  isOpen: boolean;
  mesh?: THREE.Object3D;
}

interface Scene3DCanvasProps {
  model: SceneModel;
  cameraMode: CameraMode;
  sceneObjects: SceneObject[];
  onObjectsChange: (objects: SceneObject[]) => void;
  showTrajectory: boolean;
  shooterPos: { x: number; y: number; z: number };
  impactPos: { x: number; y: number; z: number };
  personAPos: { x: number; y: number; z: number };
  personBPos: { x: number; y: number; z: number };
  onWebGLError?: () => void;
}

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ── Three.js Tactical Builder Helpers ────────────────────────────────────────

function box(w: number, h: number, d: number, color: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.2 })
  );
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function addBox(
  scene: THREE.Scene,
  x: number, y: number, z: number,
  w: number, h: number, d: number,
  color: number
): THREE.Mesh {
  const m = box(w, h, d, color);
  m.position.set(x, y, z);
  scene.add(m);
  return m;
}

function addFloor(scene: THREE.Scene, color: number) {
  const floorMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.2,
    metalness: 0.3,
  });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(24, 24), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(24, 24, 0x00f0ff, 0x1b2b3f);
  grid.position.y = 0.01;
  scene.add(grid);
}

function addWalls(scene: THREE.Scene, color: number) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
  const specs: [number, number, number, number, number, number][] = [
    [0, 2.5, -10, 20, 5, 0.3],
    [-10, 2.5, 0, 0.3, 5, 20],
    [10, 2.5, 0, 0.3, 5, 20],
  ];
  for (const [x, y, z, w, h, d] of specs) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.receiveShadow = true;
    scene.add(m);
  }
}

function addDoor(
  scene: THREE.Scene,
  x: number, z: number,
  isOpen: boolean,
  color = 0x3d2b1f
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, 1.25, z);

  const doorMesh = box(0.12, 2.5, 1.2, color);
  doorMesh.position.set(0, 0, 0.6);
  group.add(doorMesh);

  // Metallic Handle Wheel / Knob
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 0.15, 12),
    new THREE.MeshStandardMaterial({ color: 0xd4a435, metalness: 0.8, roughness: 0.2 })
  );
  knob.rotation.z = Math.PI / 2;
  knob.position.set(0.12, 0, 1.0);
  group.add(knob);

  group.rotation.y = isOpen ? -Math.PI / 2.1 : 0;
  scene.add(group);
  return group;
}

// Ultra Cool Detailed Human Figure with Bounding Reticle
function addPerson(
  scene: THREE.Scene,
  x: number, y: number, z: number,
  color: number,
  label: string
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.2 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x111622, roughness: 0.5 });

  // Legs (Booted)
  for (const lx of [-0.12, 0.12]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.7, 8), darkMat);
    leg.position.set(lx, 0.35, 0);
    group.add(leg);
  }

  // Torso / Tactical Vest
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.25), mat);
  torso.position.y = 0.95;
  group.add(torso);

  // Tactical Vest Armor Plate
  const armor = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.28), darkMat);
  armor.position.y = 0.95;
  group.add(armor);

  // Arms
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), mat);
  armL.position.set(-0.27, 0.95, 0.1);
  armL.rotation.x = -Math.PI / 6;
  group.add(armL);

  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6, 8), mat);
  armR.position.set(0.27, 0.95, 0.1);
  armR.rotation.x = -Math.PI / 4;
  group.add(armR);

  // Head + Tactical Cap
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), mat);
  head.position.y = 1.45;
  group.add(head);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.22), darkMat);
  visor.position.set(0, 1.52, 0.05);
  group.add(visor);

  // Floor LED Ring Halo
  const ringGeo = new THREE.RingGeometry(0.45, 0.52, 32);
  const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  // 3D Tactical Wireframe Box Reticle
  const boxGeo = new THREE.BoxGeometry(0.7, 1.7, 0.7);
  const wireMat = new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.35 });
  const wireBox = new THREE.Mesh(boxGeo, wireMat);
  wireBox.position.y = 0.85;
  group.add(wireBox);

  scene.add(group);
  return group;
}

// Cool Animated Neon Trajectory Beam
function addTrajectory(scene: THREE.Scene, from: THREE.Vector3, to: THREE.Vector3) {
  const distance = from.distanceTo(to);
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

  // Primary Neon Beam Cylinder
  const beamGeo = new THREE.CylinderGeometry(0.035, 0.035, distance, 12);
  const beamMat = new THREE.MeshBasicMaterial({ color: 0xff1100, transparent: true, opacity: 0.9 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.copy(mid);
  beam.lookAt(to);
  beam.rotateX(Math.PI / 2);
  scene.add(beam);

  // Outer Glowing Laser Core
  const outerBeamGeo = new THREE.CylinderGeometry(0.08, 0.08, distance, 12);
  const outerBeamMat = new THREE.MeshBasicMaterial({ color: 0xff5500, transparent: true, opacity: 0.35 });
  const outerBeam = new THREE.Mesh(outerBeamGeo, outerBeamMat);
  outerBeam.position.copy(mid);
  outerBeam.lookAt(to);
  outerBeam.rotateX(Math.PI / 2);
  scene.add(outerBeam);

  // Shooter Point
  const shooterDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffaa00 })
  );
  shooterDot.position.copy(from);
  scene.add(shooterDot);

  // Impact Point + Pulsing Ring Normal
  const impactDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  impactDot.position.copy(to);
  scene.add(impactDot);

  const impactRing = new THREE.Mesh(
    new THREE.RingGeometry(0.25, 0.32, 32),
    new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
  );
  impactRing.position.copy(to);
  impactRing.position.y += 0.02;
  impactRing.rotation.x = Math.PI / 2;
  scene.add(impactRing);

  // Evidence Tag Cone #01
  const tagCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.12, 0.3, 4),
    new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })
  );
  tagCone.position.set(to.x + 0.3, to.y, to.z + 0.3);
  scene.add(tagCone);
}

function setupLights(scene: THREE.Scene, nightvision: boolean) {
  if (nightvision) {
    scene.add(new THREE.AmbientLight(0x003a00, 0.9));
    const spot = new THREE.SpotLight(0x00ff66, 2.0, 35, Math.PI / 3);
    spot.position.set(0, 12, 0);
    scene.add(spot);
    return;
  }

  // Realistic Studio Lighting
  scene.add(new THREE.AmbientLight(0x405570, 0.6));

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(8, 12, 8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  scene.add(keyLight);

  const cyanRim = new THREE.PointLight(0x00f0ff, 1.2, 20);
  cyanRim.position.set(-8, 6, -8);
  scene.add(cyanRim);

  const amberFill = new THREE.PointLight(0xff8800, 0.8, 20);
  amberFill.position.set(8, 4, -8);
  scene.add(amberFill);
}

// ── Realistic Environments ───────────────────────────────────────────────────

function buildResidence(scene: THREE.Scene, objects: SceneObject[]) {
  addFloor(scene, 0x161c26);
  addWalls(scene, 0x1b2433);

  // Modern Sectional Couch
  addBox(scene, -3, 0.5, -5, 3.2, 0.9, 1.3, 0x223344);
  addBox(scene, -3, 1.1, -5.5, 3.2, 0.7, 0.25, 0x1a2636);
  addBox(scene, -4.4, 0.7, -4.9, 0.4, 0.6, 1.3, 0x1a2636);

  // Coffee Table + Accessories
  addBox(scene, -3, 0.35, -3.5, 1.6, 0.1, 0.8, 0x3d2b1f);
  for (const [ox, oz] of [[-0.6, -0.25], [0.6, -0.25], [-0.6, 0.25], [0.6, 0.25]] as [number, number][]) {
    addBox(scene, -3 + ox, 0.17, -3.5 + oz, 0.08, 0.35, 0.08, 0x2d1b0f);
  }
  // Coffee Mug on table
  const mug = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  mug.position.set(-3.2, 0.46, -3.5);
  scene.add(mug);

  // TV Console + Screen
  addBox(scene, 0, 0.45, -9.5, 3.0, 0.9, 0.5, 0x151b24);
  const tvScreen = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 1.3, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x050d18, emissive: 0x00f0ff, emissiveIntensity: 0.15 })
  );
  tvScreen.position.set(0, 1.4, -9.5);
  scene.add(tvScreen);

  // Floor Lamp with Warm Light Beam
  addBox(scene, 3.2, 0.8, -3, 0.1, 1.6, 0.1, 0x8a8060);
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.4, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xeab308, emissive: 0xeab308, emissiveIntensity: 0.4 })
  );
  shade.position.set(3.2, 1.7, -3);
  scene.add(shade);

  // Bookshelf with colorful books
  addBox(scene, -9.5, 1.6, -4, 0.3, 3.2, 2.6, 0x3d2b1f);

  // Doors & Cabinet
  const d1 = objects.find((o) => o.id === "door1")?.isOpen ?? false;
  const d2 = objects.find((o) => o.id === "door2")?.isOpen ?? false;
  addDoor(scene, -9.5, -8, d1, 0x4a3425);
  addDoor(scene, 9.5, 2, d2, 0x4a3425);

  const c1 = objects.find((o) => o.id === "cabinet1")?.isOpen ?? false;
  addBox(scene, 5, 1.1, -8, 1.6, 2.2, 0.8, 0x2b1e15);
  if (!c1) {
    addBox(scene, 5, 1.1, -7.55, 1.5, 2.1, 0.05, 0x3b2e25);
  }
}

function buildOffice(scene: THREE.Scene, objects: SceneObject[]) {
  addFloor(scene, 0x111620);
  addWalls(scene, 0x182030);

  // Executive Mahogany Desk
  addBox(scene, 0, 0.78, -2, 3.8, 0.1, 1.9, 0x3b2416);
  for (const [ox, oz] of [[-1.6, -0.75], [1.6, -0.75], [-1.6, 0.75], [1.6, 0.75]] as [number, number][]) {
    addBox(scene, ox, 0.37, -2 + oz, 0.16, 0.74, 0.16, 0x2b1406);
  }

  // Laptop + Keyboard
  addBox(scene, 0, 0.85, -2.2, 0.5, 0.02, 0.35, 0x222222);
  const laptopScreen = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.35, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.3 })
  );
  laptopScreen.position.set(0, 1.02, -2.38);
  laptopScreen.rotation.x = -Math.PI / 12;
  scene.add(laptopScreen);

  // Executive Swivel Chair
  addBox(scene, 0, 0.65, -0.5, 0.75, 0.1, 0.75, 0x1b2333);
  addBox(scene, 0, 1.25, -0.5, 0.75, 0.95, 0.1, 0x1b2333);

  // Filing Cabinet
  const c2 = objects.find((o) => o.id === "cabinet2")?.isOpen ?? false;
  addBox(scene, -8, 0.9, -6, 0.9, 1.8, 1.3, 0x253042);
  if (!c2) {
    addBox(scene, -8, 0.9, -5.3, 0.85, 1.7, 0.05, 0x354052);
  }
  addBox(scene, -8, 0.9, -3.5, 0.9, 1.8, 1.3, 0x253042);

  // Glass Window Frame with Shards
  addBox(scene, 9.8, 2.5, -4, 0.1, 2.2, 3.2, 0x152538);

  const d3 = objects.find((o) => o.id === "door3")?.isOpen ?? false;
  addDoor(scene, -9.5, 0, d3, 0x354052);
}

function buildVault(scene: THREE.Scene, objects: SceneObject[]) {
  addFloor(scene, 0x0b0f16);
  addWalls(scene, 0x121a26);

  // Heavy Vault Door with Rotating Lock Wheel
  const vaultOpen = objects.find((o) => o.id === "vault_door")?.isOpen ?? false;
  const vaultGroup = new THREE.Group();
  vaultGroup.position.set(0, 2.1, -9.5);

  const vaultDoor = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 4.2, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x253548, metalness: 0.7, roughness: 0.3 })
  );
  vaultGroup.add(vaultDoor);

  const lockWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.06, 12, 24),
    new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.1 })
  );
  lockWheel.position.set(1.1, 0, 0.32);
  vaultGroup.add(lockWheel);

  vaultGroup.rotation.y = vaultOpen ? Math.PI / 2 : 0;
  scene.add(vaultGroup);

  // CCTV Cameras with FOV Cones
  const camPos: [number, number, number][] = [
    [-8, 4.5, -8], [8, 4.5, -8], [-8, 4.5, 8], [8, 4.5, 8],
  ];
  for (const [cx, cy, cz] of camPos) {
    addBox(scene, cx, cy, cz, 0.35, 0.22, 0.45, 0x111111);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(1.6, 3.2, 8, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x00ff66, transparent: true, opacity: 0.08, side: THREE.BackSide })
    );
    cone.position.set(cx, cy - 1.6, cz + 1.6);
    cone.rotation.x = Math.PI / 4;
    scene.add(cone);
  }

  // Laser Tripwires
  for (let z = -6; z <= 6; z += 3) {
    const pts = [new THREE.Vector3(-9.5, 1.1, z), new THREE.Vector3(9.5, 1.1, z)];
    const laserGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const laserMat = new THREE.LineBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.8 });
    scene.add(new THREE.Line(laserGeo, laserMat));
  }
}

function buildAlley(scene: THREE.Scene) {
  addFloor(scene, 0x0a0c12);

  const brickMat = new THREE.MeshStandardMaterial({ color: 0x2b1e16, roughness: 0.9 });
  for (const [x, z] of [[-9.5, 0], [9.5, 0]] as [number, number][]) {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 8, 24), brickMat);
    wall.position.set(x, 4, z);
    scene.add(wall);
  }

  // Detailed Car Body
  addBox(scene, 3, 0.55, 0, 4.2, 1.1, 2.1, 0x152538);
  addBox(scene, 3, 1.25, 0, 2.9, 0.75, 1.95, 0x152538);

  // Car Headlights
  for (const oz of [-0.7, 0.7]) {
    const light = new THREE.SpotLight(0xfffaed, 2.0, 15, Math.PI / 6);
    light.position.set(5.1, 0.6, oz);
    light.target.position.set(10, 0.6, oz);
    scene.add(light);
    scene.add(light.target);
  }

  // Streetlights
  for (const [x, z] of [[-7, -7], [-7, 7]] as [number, number][]) {
    addBox(scene, x, 4, z, 0.14, 8, 0.14, 0x333333);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffea88 })
    );
    lamp.position.set(x, 8.3, z);
    scene.add(lamp);

    const light = new THREE.PointLight(0xffea88, 1.5, 15);
    light.position.set(x, 8, z);
    scene.add(light);
  }

  // Dumpster
  addBox(scene, -6, 0.8, 5, 1.6, 1.6, 1.1, 0x1b2c1d);
  addBox(scene, -6, 0.8, -5, 1.6, 1.6, 1.1, 0x1b2c1d);
}

// ── Main Canvas Component ─────────────────────────────────────────────────────

export const Scene3DCanvas: React.FC<Scene3DCanvasProps> = ({
  model,
  cameraMode,
  sceneObjects,
  showTrajectory,
  shooterPos,
  impactPos,
  personAPos,
  personBPos,
  onWebGLError,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const [webglFailed, setWebglFailed] = useState(() => !isWebGLAvailable());

  // WebGL 3D Init
  const init3D = useCallback(() => {
    const mount = mountRef.current;
    if (!mount || webglFailed) return;

    if (!isWebGLAvailable()) {
      setWebglFailed(true);
      onWebGLError?.();
      return;
    }

    if (rendererRef.current) {
      cancelAnimationFrame(frameRef.current);
      try {
        rendererRef.current.dispose();
      } catch {}
      mount.innerHTML = "";
    }

    const W = mount.clientWidth || 800;
    const H = mount.clientHeight || 500;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        failIfMajorPerformanceCaveat: false,
      });
    } catch (err) {
      console.warn("WebGL creation error, switching to 2D Tactical Blueprint fallback:", err);
      setWebglFailed(true);
      onWebGLError?.();
      return;
    }

    const scene = new THREE.Scene();
    const bgColor = cameraMode === "nightvision" ? 0x000e00 : 0x070b12;
    scene.background = new THREE.Color(bgColor);
    scene.fog = new THREE.Fog(bgColor, 14, 32);

    setupLights(scene, cameraMode === "nightvision");

    try {
      if (model === "residence") buildResidence(scene, sceneObjects);
      else if (model === "office") buildOffice(scene, sceneObjects);
      else if (model === "vault") buildVault(scene, sceneObjects);
      else buildAlley(scene);

      addPerson(scene, personAPos.x, personAPos.y, personAPos.z, 0xf43f5e, "Suspect A");
      addPerson(scene, personBPos.x, personBPos.y, personBPos.z, 0x3b82f6, "Victim B");

      if (showTrajectory) {
        const t = calculateTrajectory(shooterPos, impactPos);
        addTrajectory(
          scene,
          new THREE.Vector3(t.shooterPosition.x, t.shooterPosition.y, t.shooterPosition.z),
          new THREE.Vector3(t.impactPosition.x, t.impactPosition.y, t.impactPosition.z)
        );
      }
    } catch (e) {
      console.error("Scene setup error:", e);
    }

    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    if (cameraMode === "topdown") {
      camera.position.set(0, 18, 0.01);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(8, 6.5, 12.5);
      camera.lookAt(0, 1.5, 0);
    }

    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    let isDragging = false;
    let prev = { x: 0, y: 0 };
    let theta = 0.6;
    let phi = 0.45;
    let radius = 16;

    const updateOrbit = () => {
      if (cameraMode !== "orbit") return;
      camera.position.set(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(phi) + 2,
        radius * Math.cos(theta) * Math.cos(phi)
      );
      camera.lookAt(0, 1.5, 0);
    };
    updateOrbit();

    const onDown = (e: MouseEvent) => { isDragging = true; prev = { x: e.clientX, y: e.clientY }; };
    const onUp = () => { isDragging = false; };
    const onMove = (e: MouseEvent) => {
      if (!isDragging || cameraMode !== "orbit") return;
      theta -= (e.clientX - prev.x) * 0.007;
      phi = Math.max(0.05, Math.min(Math.PI / 2.2, phi - (e.clientY - prev.y) * 0.006));
      prev = { x: e.clientX, y: e.clientY };
      updateOrbit();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      radius = Math.max(4, Math.min(28, radius + e.deltaY * 0.025));
      updateOrbit();
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvasEl.addEventListener("mousemove", onMove);
    canvasEl.addEventListener("wheel", onWheel, { passive: false });

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      try {
        renderer.render(scene, camera);
      } catch {
        setWebglFailed(true);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      canvasEl.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      canvasEl.removeEventListener("mousemove", onMove);
      canvasEl.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
      try {
        renderer.dispose();
      } catch {}
      scene.clear();
    };
  }, [model, cameraMode, sceneObjects, showTrajectory, shooterPos, impactPos, personAPos, personBPos, webglFailed, onWebGLError]);

  useEffect(() => {
    if (!webglFailed) {
      const cleanup = init3D();
      return () => { cleanup?.(); };
    }
  }, [init3D, webglFailed]);

  // 2D Tactical Canvas Blueprint Fallback Renderer
  useEffect(() => {
    if (!webglFailed) return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 800;
    const height = canvas.parentElement?.clientHeight || 500;
    canvas.width = width;
    canvas.height = height;

    const mapX = (x: number) => (x + 12) * (width / 24);
    const mapY = (z: number) => (z + 12) * (height / 24);

    ctx.fillStyle = cameraMode === "nightvision" ? "#021202" : "#070c14";
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = cameraMode === "nightvision" ? "#003a00" : "#1a2a3f";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += width / 24) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += height / 24) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    ctx.strokeStyle = cameraMode === "nightvision" ? "#00ff55" : "#3b82f6";
    ctx.lineWidth = 3;
    ctx.strokeRect(mapX(-10), mapY(-10), mapX(10) - mapX(-10), mapY(10) - mapY(-10));

    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;

    if (model === "residence") {
      ctx.fillRect(mapX(-4.5), mapY(-5.6), mapX(1.5) - mapX(-1.5), mapY(-4.4) - mapY(-5.6));
      ctx.strokeRect(mapX(-4.5), mapY(-5.6), mapX(1.5) - mapX(-1.5), mapY(-4.4) - mapY(-5.6));
      ctx.fillRect(mapX(-3.7), mapY(-3.85), mapX(-2.3) - mapX(-3.7), mapY(-3.15) - mapY(-3.85));
    } else if (model === "office") {
      ctx.fillRect(mapX(-1.75), mapY(-2.9), mapX(1.75) - mapX(-1.75), mapY(-1.1) - mapY(-2.9));
      ctx.strokeRect(mapX(-1.75), mapY(-2.9), mapX(1.75) - mapX(-1.75), mapY(-1.1) - mapY(-2.9));
    } else if (model === "vault") {
      ctx.fillStyle = "rgba(234,179,8,0.2)";
      ctx.fillRect(mapX(-9.5), mapY(-9.5), mapX(0) - mapX(-9.5), mapY(-9) - mapY(-9.5));
    }

    sceneObjects.forEach((obj) => {
      ctx.fillStyle = obj.isOpen ? "rgba(52,211,153,0.3)" : "rgba(239,68,68,0.3)";
      ctx.strokeStyle = obj.isOpen ? "#34d399" : "#ef4444";
      ctx.font = "10px monospace";

      let ox = 0, oy = 0;
      if (obj.id === "door1") { ox = -9.5; oy = -8; }
      else if (obj.id === "door2") { ox = 9.5; oy = 2; }
      else if (obj.id === "door3") { ox = -9.5; oy = 0; }
      else if (obj.id === "vault_door") { ox = 0; oy = -9.5; }
      else if (obj.id === "cabinet1") { ox = 5; oy = -8; }
      else if (obj.id === "cabinet2") { ox = -8; oy = -6; }

      ctx.beginPath();
      ctx.arc(mapX(ox), mapY(oy), 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${obj.label} (${obj.isOpen ? "OPEN" : "CLOSED"})`, mapX(ox) + 12, mapY(oy) + 3);
    });

    if (showTrajectory) {
      const sX = mapX(shooterPos.x);
      const sY = mapY(shooterPos.z);
      const iX = mapX(impactPos.x);
      const iY = mapY(impactPos.z);

      ctx.strokeStyle = "#ff3300";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(sX, sY);
      ctx.lineTo(iX, iY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#f97316";
      ctx.beginPath();
      ctx.arc(sX, sY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText("Shooter", sX + 8, sY - 8);

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(iX, iY, 9, 0, Math.PI * 2);
      ctx.moveTo(iX - 12, iY); ctx.lineTo(iX + 12, iY);
      ctx.moveTo(iX, iY - 12); ctx.lineTo(iX, iY + 12);
      ctx.stroke();
      ctx.fillStyle = "#ef4444";
      ctx.fillText("Impact Point", iX + 12, iY + 4);
    }

    const paX = mapX(personAPos.x);
    const paY = mapY(personAPos.z);
    ctx.fillStyle = "#f43f5e";
    ctx.beginPath();
    ctx.arc(paX, paY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.fillText("SUSPECT A", paX - 25, paY - 14);

    const pbX = mapX(personBPos.x);
    const pbY = mapY(personBPos.z);
    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.arc(pbX, pbY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px monospace";
    ctx.fillText("VICTIM B", pbX - 22, pbY - 14);

  }, [webglFailed, model, cameraMode, sceneObjects, showTrajectory, shooterPos, impactPos, personAPos, personBPos]);

  if (webglFailed) {
    return (
      <div className="w-full h-full relative bg-slate-950 flex flex-col items-center justify-center">
        <canvas ref={canvas2dRef} className="w-full h-full min-h-[480px]" />
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[480px] bg-slate-950 cursor-grab active:cursor-grabbing select-none"
      style={{ touchAction: "none" }}
    />
  );
};
