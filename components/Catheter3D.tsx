
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GeometricSpecs, MaterialMatch } from '../types';

interface Props {
  specs: GeometricSpecs;
  materials?: MaterialMatch[];
  isXRay?: boolean;
}

const Catheter3D: React.FC<Props> = ({ specs, materials, isXRay = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { od_mm, bellowsCount, wallThickness, tendonChannelsCount } = specs;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Match dashboard slate

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting for Engineering View
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 7.5);
    scene.add(mainLight);

    const fillLight = new THREE.PointLight(0x0ea5e9, 10);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // Floor Grid
    const grid = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
    grid.position.y = -10;
    scene.add(grid);

    // Axis Helper
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.position.set(-15, -8, 0);
    scene.add(axesHelper);

    // Geometry Generation
    const group = new THREE.Group();
    
    // 1. Main Shaft (Procedural Lathe)
    const points: THREE.Vector2[] = [];
    const radius = od_mm / 2;
    const segments = 200;
    const totalLength = 50;
    const bellowsAmplitude = radius * 0.25;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * totalLength - totalLength / 2;
      let y = radius;
      
      // Add bellows in the middle section
      if (bellowsCount > 0 && t > 0.3 && t < 0.7) {
        const waveT = (t - 0.3) / 0.4;
        const wave = Math.sin(waveT * Math.PI * bellowsCount * 2);
        y += wave * bellowsAmplitude;
      }
      points.push(new THREE.Vector2(y, x));
    }

    const geometry = new THREE.LatheGeometry(points, 64);
    
    // Determine material appearance from BOM
    const primaryMaterial = materials?.find(m => m.component.toLowerCase().includes('shaft')) || materials?.[0];
    const isMetallic = primaryMaterial?.material.toLowerCase().includes('steel') || primaryMaterial?.material.toLowerCase().includes('metal');
    
    const material = new THREE.MeshPhysicalMaterial({
      color: isMetallic ? 0x94a3b8 : 0x0ea5e9,
      metalness: isMetallic ? 0.9 : 0.1,
      roughness: isMetallic ? 0.2 : 0.1,
      transmission: isXRay ? 0.8 : (isMetallic ? 0 : 0.4),
      thickness: wallThickness || 0.5,
      opacity: isXRay ? 0.3 : 0.9,
      transparent: true,
      side: THREE.DoubleSide,
      clearcoat: 1.0
    });

    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);

    // 2. Tendon Channels / Lumens
    const lumenCount = tendonChannelsCount || 0;
    const lumenMat = new THREE.MeshStandardMaterial({ 
      color: 0x22d3ee, 
      emissive: 0x22d3ee, 
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: isXRay ? 1 : 0.2
    });

    for (let i = 0; i < lumenCount; i++) {
      const angle = (i / lumenCount) * Math.PI * 2;
      const dist = radius * 0.65;
      const lGeo = new THREE.CylinderGeometry(radius * 0.1, radius * 0.1, totalLength, 12);
      const lMesh = new THREE.Mesh(lGeo, lumenMat);
      lMesh.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist);
      group.add(lMesh);
    }

    scene.add(group);
    camera.position.set(40, 20, 40);
    controls.update();

    const animate = () => {
      requestAnimationFrame(animate);
      group.rotation.y += 0.002;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [specs, materials, isXRay]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden">
      <div className="absolute top-4 left-4 pointer-events-none space-y-1">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE DIGITAL TWIN</span>
         </div>
         <p className="text-[8px] text-slate-500 font-mono uppercase">Scale: 1:1 • Unit: mm</p>
      </div>
    </div>
  );
};

export default Catheter3D;
