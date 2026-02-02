
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface Props {
  imageUrl: string;
}

const Image3DViewer: React.FC<Props> = ({ imageUrl }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadStatus, setLoadStatus] = useState<'LOADING' | 'READY' | 'ERROR'>('LOADING');

  useEffect(() => {
    if (!containerRef.current || !imageUrl) return;

    let cleanup = false;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e3a8a); // Professional deep blue (Blue-900)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    // Load Texture with safety checks
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, 
      (texture) => {
        if (cleanup) return;
        
        // Safety check for image dimensions to prevent NaN aspect ratios
        const img = texture.image;
        const imgWidth = img.width || 1920;
        const imgHeight = img.height || 1080;
        const aspect = imgWidth / imgHeight;
        
        const geometry = new THREE.PlaneGeometry(4 * aspect, 4);
        const material = new THREE.MeshBasicMaterial({ 
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

        // Add a stylistic glowing frame
        const wireframeGeo = new THREE.PlaneGeometry(4.02 * aspect, 4.02);
        const wireframeMat = new THREE.MeshBasicMaterial({ 
          color: 0x60a5fa, // Lighter blue for frame
          wireframe: true, 
          transparent: true, 
          opacity: 0.15 
        });
        const frame = new THREE.Mesh(wireframeGeo, wireframeMat);
        frame.position.z = -0.01;
        scene.add(frame);
        
        setLoadStatus('READY');
      },
      undefined,
      (err) => {
        console.error("Three.js Texture Load Error:", err);
        setLoadStatus('ERROR');
      }
    );

    const animate = () => {
      if (cleanup) return;
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || cleanup) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cleanup = true;
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full cursor-move bg-blue-900" />
      
      {loadStatus === 'ERROR' && (
        <div className="absolute inset-0 z-20 bg-blue-900 flex flex-col items-center justify-center p-8 text-center space-y-4">
           <div className="text-4xl text-blue-200">🖼️</div>
           <p className="text-blue-300 text-xs font-mono uppercase tracking-widest">Falling back to static image display...</p>
           <img src={imageUrl} alt="Fallback Render" className="max-w-full max-h-[70%] border border-blue-700 rounded-lg shadow-2xl" />
        </div>
      )}

      {loadStatus === 'READY' && (
        <div className="absolute bottom-4 left-4 pointer-events-none flex flex-col gap-1 z-10">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
             <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">3D Viewport Active</span>
          </div>
          <span className="text-[9px] text-white/30 font-mono uppercase">Drag to Tilt • Scroll to Zoom</span>
        </div>
      )}
    </div>
  );
};

export default Image3DViewer;
