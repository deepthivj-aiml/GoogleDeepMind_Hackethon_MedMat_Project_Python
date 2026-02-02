
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GeometricSpecs, MaterialMatch, DeviceType } from '../types';

interface Props {
  specs: GeometricSpecs;
  type: DeviceType;
  materials?: MaterialMatch[];
  isXRay?: boolean;
  showLabels?: boolean;
}

interface Callout {
  id: string;
  label: string;
  pos: THREE.Vector3;
}

const Device3D: React.FC<Props> = ({ specs, type, materials, isXRay = false, showLabels = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [callouts, setCallouts] = useState<Callout[]>([]);
  const { od_mm, bellowsCount, wallThickness, tendonChannelsCount } = specs;

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); 

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(45, 25, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = !showLabels; // Rotate only if labels are off for readability
    controls.autoRotateSpeed = 0.8;

    // Advanced Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    
    const blueSpot = new THREE.SpotLight(0x0ea5e9, 80);
    blueSpot.position.set(20, 40, 20);
    scene.add(blueSpot);

    const backLight = new THREE.PointLight(0xffffff, 30);
    backLight.position.set(-20, -10, -10);
    scene.add(backLight);

    const group = new THREE.Group();
    const newCallouts: Callout[] = [];

    const isMetallic = (matName: string) => {
      const lower = matName.toLowerCase();
      return lower.includes('steel') || lower.includes('titanium') || lower.includes('nitinol') || lower.includes('cobalt');
    };

    const radius = od_mm / 2 || 2;
    const length = 50;

    if (type === 'STENT') {
      const ringCount = 12;
      const ringHeight = length / ringCount;
      const stentMat = materials?.find(m => m.component.toLowerCase().includes('stent') || m.component.toLowerCase().includes('frame')) || materials?.[0];
      
      const meshMaterial = new THREE.MeshPhysicalMaterial({
        color: isMetallic(stentMat?.material || '') ? 0xd1d5db : 0x0ea5e9,
        metalness: isMetallic(stentMat?.material || '') ? 0.9 : 0.0,
        roughness: 0.2,
        transparent: true,
        opacity: isXRay ? 0.4 : 1.0,
        side: THREE.DoubleSide,
      });

      for (let r = 0; r < ringCount; r++) {
        const y = r * ringHeight - length / 2;
        const ringGeo = new THREE.TorusGeometry(radius, 0.2, 12, 48);
        const ring = new THREE.Mesh(ringGeo, meshMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = y;
        group.add(ring);
      }

      if (stentMat) {
        newCallouts.push({
          id: 'stent-main',
          label: `${stentMat.material} (Frame)`,
          pos: new THREE.Vector3(radius + 5, 0, 0)
        });
      }
    } else if (type === 'BONE_PLATE') {
      const plateMat = materials?.find(m => m.component.toLowerCase().includes('plate')) || materials?.[0];
      const screwMat = materials?.find(m => m.component.toLowerCase().includes('screw')) || materials?.[1];

      const meshMaterial = new THREE.MeshPhysicalMaterial({
        color: isMetallic(plateMat?.material || '') ? 0xd1d5db : 0x94a3b8,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: isXRay ? 0.4 : 1.0,
      });

      const plateGeo = new THREE.BoxGeometry(radius * 3, length, wallThickness || 1.5);
      const plate = new THREE.Mesh(plateGeo, meshMaterial);
      group.add(plate);

      if (plateMat) {
        newCallouts.push({ id: 'plate', label: plateMat.material, pos: new THREE.Vector3(0, length / 4, 2) });
      }
      if (screwMat) {
        newCallouts.push({ id: 'screws', label: screwMat.material, pos: new THREE.Vector3(radius * 1.5, -length / 4, 2) });
      }
    } else {
      // Catheter / General Cylindrical Architecture
      const shaftMat = materials?.find(m => m.component.toLowerCase().includes('shaft') || m.component.toLowerCase().includes('outer')) || materials?.[0];
      const tipMat = materials?.find(m => m.component.toLowerCase().includes('tip') || m.component.toLowerCase().includes('distal')) || materials?.[1];
      const linerMat = materials?.find(m => m.component.toLowerCase().includes('liner') || m.component.toLowerCase().includes('inner')) || materials?.[2];

      const points: THREE.Vector2[] = [];
      const segments = 100;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = t * length - length / 2;
        let y = radius;
        if (bellowsCount > 0 && t > 0.4 && t < 0.6) {
          y += Math.sin(((t - 0.4) / 0.2) * Math.PI * bellowsCount * 2) * (radius * 0.15);
        }
        points.push(new THREE.Vector2(y, x));
      }
      const geometry = new THREE.LatheGeometry(points, 32);
      const meshMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        transmission: isXRay ? 0.8 : 0.2,
        thickness: wallThickness,
        transparent: true,
        opacity: isXRay ? 0.3 : 0.9,
      });
      const mesh = new THREE.Mesh(geometry, meshMaterial);
      group.add(mesh);

      if (shaftMat) newCallouts.push({ id: 'shaft', label: shaftMat.material, pos: new THREE.Vector3(radius + 2, 0, 0) });
      if (tipMat) newCallouts.push({ id: 'tip', label: tipMat.material, pos: new THREE.Vector3(radius + 1, length / 2, 0) });
      if (linerMat) newCallouts.push({ id: 'liner', label: linerMat.material, pos: new THREE.Vector3(0, -length / 4, 0) });
    }

    scene.add(group);
    setCallouts(newCallouts);

    const animate = () => {
      const frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);

      // Update Label Positions
      if (showLabels && containerRef.current) {
        const labels = containerRef.current.querySelectorAll('.callout-label');
        newCallouts.forEach((c, i) => {
          const vector = c.pos.clone();
          vector.project(camera);
          const x = (vector.x * 0.5 + 0.5) * width;
          const y = (vector.y * -0.5 + 0.5) * height;
          const el = labels[i] as HTMLElement;
          if (el) {
            el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            el.style.opacity = vector.z < 1 ? '1' : '0';
          }
        });
      }
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [specs, type, materials, isXRay, showLabels]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden group">
      {/* 3D Content is rendered here */}

      {/* HTML Overlay for Labels */}
      {showLabels && callouts.map((c, i) => (
        <div 
          key={c.id} 
          className="callout-label absolute pointer-events-none z-30 transition-opacity duration-300"
          style={{ left: 0, top: 0 }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-cyan-500/50 shadow-2xl backdrop-blur-md">
               <p className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{c.label}</p>
            </div>
            <div className="w-px h-8 bg-cyan-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
          </div>
        </div>
      ))}

      <div className="absolute top-6 left-6 pointer-events-none space-y-2 z-10">
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Material-Annotated Model</span>
         </div>
         <p className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Digital Twin Protocol V4.1</p>
      </div>
    </div>
  );
};

export default Device3D;
