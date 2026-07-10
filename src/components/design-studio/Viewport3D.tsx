"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { MeshData } from "@/features/design-engine/core/types";

type Viewport3DProps = {
  mesh: MeshData | null;
  loading?: boolean;
  className?: string;
};

type SceneContext = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  meshObj: THREE.Mesh | null;
};

export function Viewport3D({ mesh, loading, className = "" }: Viewport3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneContext | null>(null);
  const [sceneReady, setSceneReady] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let frameId = 0;
    let disposed = false;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      5000,
    );
    camera.position.set(120, 80, 120);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    const dir = new THREE.DirectionalLight(0xffffff, 0.85);
    dir.position.set(80, 120, 60);
    scene.add(ambient, dir);

    const grid = new THREE.GridHelper(300, 20, 0xcbd5e1, 0xe2e8f0);
    scene.add(grid);

    sceneRef.current = {
      renderer,
      scene,
      camera,
      controls,
      meshObj: null,
    };
    setSceneReady((v) => v + 1);

    const animate = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (disposed || !mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);
    const observer = new ResizeObserver(onResize);
    observer.observe(mount);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", onResize);
      observer.disconnect();

      const ctx = sceneRef.current;
      if (ctx?.meshObj) {
        ctx.meshObj.geometry.dispose();
        (ctx.meshObj.material as THREE.Material).dispose();
      }

      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
      sceneRef.current = null;
      setSceneReady((v) => v + 1);
    };
  }, []);

  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    if (ctx.meshObj) {
      ctx.scene.remove(ctx.meshObj);
      ctx.meshObj.geometry.dispose();
      (ctx.meshObj.material as THREE.Material).dispose();
      ctx.meshObj = null;
    }

    if (!mesh) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(mesh.positions, 3),
    );
    geometry.setAttribute(
      "normal",
      new THREE.BufferAttribute(mesh.normals, 3),
    );
    geometry.setIndex(new THREE.BufferAttribute(mesh.indices, 1));
    geometry.computeBoundingSphere();
    geometry.computeBoundingBox();

    const material = new THREE.MeshStandardMaterial({
      color: 0x2a2f38,
      metalness: 0.15,
      roughness: 0.55,
    });
    const meshObj = new THREE.Mesh(geometry, material);
    ctx.scene.add(meshObj);
    ctx.meshObj = meshObj;

    const box = geometry.boundingBox;
    if (box) {
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      box.getCenter(center);
      box.getSize(size);
      const radius = Math.max(size.x, size.y, size.z) * 0.55 || 50;
      ctx.controls.target.copy(center);
      ctx.camera.position.set(
        center.x + radius * 2.2,
        center.y + radius * 1.6,
        center.z + radius * 2.2,
      );
      ctx.camera.near = Math.max(0.1, radius / 200);
      ctx.camera.far = Math.max(5000, radius * 40);
      ctx.camera.updateProjectionMatrix();
      ctx.controls.update();
    }
  }, [mesh, sceneReady]);

  return (
    <div className={`relative min-h-0 flex-1 ${className}`} ref={mountRef}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 font-mono text-xs uppercase tracking-widest text-navy-800">
          3D…
        </div>
      )}
    </div>
  );
}
