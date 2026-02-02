
import React, { useState, useEffect, useRef } from 'react';
import { DeviceDesign } from './types';
import { 
  DEFAULT_DEVICE_NAME, 
  DEFAULT_ARCHITECTURE, 
  DEFAULT_SIMULATION_TARGETS, 
  DEFAULT_CLINICAL_MATRIX 
} from './constants';
import { generateDesign, generateCadVisualization, validateDeviceInput, getDeviceDefaults } from './services/api';
import MaterialAnalysis from './components/MaterialAnalysis';
import EngineeringDrawing from './components/EngineeringDrawing';
import SDSViewer from './components/SDSViewer';
import TechnicalFile from './components/TechnicalFile';
import SummaryReport from './components/SummaryReport';
import FullSDSDocument from './components/FullSDSDocument';
import * as THREE from 'three';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

export interface ToggleReq {
  id: number;
  label: string;
  description: string;
  enabled: boolean;
}

const Switch = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-cyan-500' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const InteractiveBioCore = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(250, 250);
    containerRef.current.appendChild(renderer.domElement);
    
    const geometry = new THREE.IcosahedronGeometry(1.2, 1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x0ea5e9, 
      wireframe: true,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const lattice = new THREE.Mesh(geometry, material);
    scene.add(lattice);
    
    const pointsGeometry = new THREE.IcosahedronGeometry(1.2, 1);
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.1,
      transparent: true,
      opacity: 1
    });
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(points);
    
    const light = new THREE.PointLight(0xffffff, 60);
    light.position.set(5, 5, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    camera.position.z = 3.5;
    
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      lattice.rotation.x += 0.003;
      lattice.rotation.y += 0.003;
      points.rotation.x += 0.003;
      points.rotation.y += 0.003;
      
      lattice.rotation.x += mouseY * 0.02;
      lattice.rotation.y += mouseX * 0.02;
      
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);
  return (
    <div ref={containerRef} className="w-[250px] h-[250px] relative cursor-pointer group">
      <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
    </div>
  );
};

const App: React.FC = () => {
  const [deviceName, setDeviceName] = useState(DEFAULT_DEVICE_NAME);
  const [architecture, setArchitecture] = useState(DEFAULT_ARCHITECTURE);
  const [simulation, setSimulation] = useState(DEFAULT_SIMULATION_TARGETS);
  const [clinicalMatrix, setClinicalMatrix] = useState(DEFAULT_CLINICAL_MATRIX);
  
  const [requirements, setRequirements] = useState<ToggleReq[]>([
    { id: 4, label: 'FDA COMPLIANCE', description: 'ASTM approved for use in medical applications by the FDA.', enabled: true },
    { id: 5, label: 'TOXICITY', description: 'Material specification along with the latest toxicity studies.', enabled: true },
    { id: 6, label: 'AVAILABILITY', description: 'Material availability in North America (NA).', enabled: true },
    { id: 7, label: 'SUPPLIERS', description: 'Current suppliers and Contract manufacturer (CMO) list.', enabled: true },
    { id: 8, label: 'USEABILITY', description: 'Analysis of weld/paste compatibility with other components.', enabled: true },
  ]);

  const [design, setDesign] = useState<DeviceDesign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInvalidDevice, setIsInvalidDevice] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Synthesizing...");
  const [isVizLoading, setIsVizLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean | null>(null);
  const [resultsSubTab, setResultsSubTab] = useState<'MATRIX' | 'SDS'>('MATRIX');
  const [showFlash, setShowFlash] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printType, setPrintType] = useState<'FULL' | 'SUMMARY' | 'SDS_REPORT'>('FULL');

  const matrixRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (matrixRef.current) {
      matrixRef.current.style.height = 'auto';
      matrixRef.current.style.height = `${Math.max(160, matrixRef.current.scrollHeight)}px`;
    }
  }, [clinicalMatrix]);

  useEffect(() => {
    if (!deviceName.trim() || deviceName === DEFAULT_DEVICE_NAME) return;
    const timer = setTimeout(() => {
      if (deviceName.trim().length > 2) handleSyncDefaults();
    }, 1200); 
    return () => clearTimeout(timer);
  }, [deviceName]);

  const handleToggle = (id: number) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const handleReset = () => {
    setDeviceName("");
    setArchitecture("");
    setSimulation("");
    setClinicalMatrix("");
    setDesign(null);
    setError(null);
    setIsInvalidDevice(false);
  };

  const handleSyncDefaults = async () => {
    setIsSyncing(true);
    setError(null);
    setIsInvalidDevice(false);

    try {
      const validation = await validateDeviceInput(deviceName);
      if (!validation.isValid) {
        setIsInvalidDevice(true);
        setError(`REJECTION: ${validation.reason}`);
        setArchitecture("DISABLED: NON-MEDICAL ENTRY");
        setSimulation("DISABLED: NON-MEDICAL ENTRY");
        setClinicalMatrix("DISABLED: NON-MEDICAL ENTRY");
        return;
      }

      setArchitecture("FETCHING ARCHITECTURE...");
      setSimulation("CALCULATING TARGETS...");
      setClinicalMatrix("MAPPING MATERIALS...");

      const defaults = await getDeviceDefaults(deviceName);
      setArchitecture(defaults.architecture);
      setSimulation(defaults.simulation);
      setClinicalMatrix(defaults.clinicalMatrix);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 800);
    } catch (err) {
      setError("AI Sync failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleGenerate = async () => {
    if (isInvalidDevice || !deviceName) return;
    setIsLoading(true);
    setError(null);
    try {
      setLoadingStep("Processing Clinical BOM...");
      const fullPrompt = `DEVICE: ${deviceName}\nARCH: ${architecture}\nSIM: ${simulation}\nMAT: ${clinicalMatrix}`;
      const result = await generateDesign(fullPrompt);
      setDesign(result);
      setIsVizLoading(true);
      try {
        const imageUrl = await generateCadVisualization(result);
        setDesign(prev => prev ? { ...prev, cadImageUrl: imageUrl } : null);
      } catch (vizErr) {
        console.warn("CAD Viz Error", vizErr);
      } finally {
        setIsVizLoading(false);
      }
    } catch (err) {
      setError("Synthesis failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportFile = (type: 'FULL' | 'SUMMARY' | 'SDS_REPORT') => {
    setPrintType(type);
    setIsPrintMode(true);
    setTimeout(() => { window.print(); setIsPrintMode(false); }, 500);
  };

  useEffect(() => {
    const init = async () => {
      if (window.aistudio) setIsKeySelected(await window.aistudio.hasSelectedApiKey());
      else setIsKeySelected(true);
    };
    init();
  }, []);

  if (isKeySelected === false) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center space-y-8 border border-slate-100">
          <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-4xl">🔑</div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 uppercase">GCP API Key Required</h2>
            <p className="text-sm text-slate-500 font-medium">Please select a valid API key to access MedMat 3D Pro.</p>
          </div>
          <button onClick={() => window.aistudio?.openSelectKey().then(() => setIsKeySelected(true))} className="w-full py-4 bg-slate-900 text-white font-black rounded-xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">Select Key</button>
        </div>
      </div>
    );
  }

  const renderPrintView = () => {
    if (!design) return null;
    switch(printType) {
      case 'FULL': return <TechnicalFile design={design} />;
      case 'SUMMARY': return <SummaryReport design={design} />;
      case 'SDS_REPORT': return <FullSDSDocument design={design} />;
      default: return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 md:px-8 ${isPrintMode ? 'print:p-0' : ''}`}>
      {isPrintMode && design && (
        <div className="fixed inset-0 z-[200] bg-white overflow-auto print:relative print:z-auto">
           {renderPrintView()}
        </div>
      )}

      <div className="w-full max-w-[1500px] mb-20 flex flex-col lg:flex-row items-center justify-between gap-16 print:hidden animate-in fade-in duration-1000">
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-white/50 backdrop-blur-md rounded-full shadow-sm border border-slate-200">
            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Next-Gen Clinical Synthesis Engine (Python Powered)</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl lg:text-8xl font-black tracking-tighter text-[#0f172a] leading-none">
              MEDMAT<br/><span className="text-[#0ea5e9]">3D PRO</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              The industry-definitive AI workspace for <span className="text-slate-900 font-bold">mechanical medical hardware</span>. Synthesize biocompatible architectures, execute real-time performance simulations, and generate regulatory-compliant technical dossiers with clinical-grade precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 pt-6 justify-center lg:justify-start">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-emerald-500 font-black">✓</span>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">ISO 10993</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-emerald-500 font-black">✓</span>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">FDA GRADE</span>
            </div>
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white border border-slate-100 shadow-sm">
              <span className="text-emerald-500 font-black">✓</span>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">MDR 2025 READY</span>
            </div>
          </div>
        </div>

        <div className="lg:w-1/3 flex items-center justify-center">
          <InteractiveBioCore />
        </div>
      </div>

      <div className="w-full max-w-[1500px] space-y-8 print:hidden">
        {error && (
          <div className={`border-2 p-4 rounded-2xl flex items-center justify-between ${isInvalidDevice ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`${isInvalidDevice ? 'text-rose-600' : 'text-slate-600'} font-black text-[10px] uppercase tracking-widest`}>{error}</p>
            <button onClick={() => setError(null)} className="text-slate-400">✕</button>
          </div>
        )}

        <section className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08)] p-10 border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_48px_80px_-24px_rgba(15,23,42,0.12)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0f172a] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded">ID</span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEVICE IDENTITY</h3>
                  {isSyncing && <span className="ml-auto text-[8px] font-black text-cyan-600 animate-pulse">VALIDATING...</span>}
                </div>
                <input 
                  value={deviceName} 
                  onChange={(e) => { setDeviceName(e.target.value); setIsInvalidDevice(false); setError(null); }} 
                  placeholder="Vascular Stent, Balloon Catheter, etc." 
                  className={`w-full bg-[#f8fafc] border-2 rounded-xl p-4 text-sm font-bold outline-none transition-all ${isInvalidDevice ? 'border-rose-300 text-rose-700 bg-rose-50' : 'border-slate-50 focus:border-cyan-200 text-slate-700'}`} 
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0f172a] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded">1</span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ARCHITECTURE</h3>
                </div>
                <textarea 
                  value={architecture} 
                  onChange={(e) => setArchitecture(e.target.value)} 
                  className={`w-full bg-[#f8fafc] border-2 rounded-xl p-4 text-sm font-bold h-32 resize-none outline-none transition-all ${isInvalidDevice ? 'border-rose-100 opacity-50' : showFlash ? 'border-cyan-400 bg-cyan-50' : 'border-slate-50'}`} 
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-[#0f172a] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded">2</span>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SIMULATION TARGETS</h3>
                </div>
                <textarea 
                  value={simulation} 
                  onChange={(e) => setSimulation(e.target.value)} 
                  className={`w-full bg-[#f8fafc] border-2 rounded-xl p-4 text-sm font-bold h-32 resize-none outline-none transition-all ${isInvalidDevice ? 'border-rose-100 opacity-50' : showFlash ? 'border-cyan-400 bg-cyan-50' : 'border-slate-50'}`} 
                />
              </div>
            </div>

            <div className="lg:col-span-8 flex flex-col space-y-4">
              <div className="flex items-center gap-3 border-b-2 border-slate-50 pb-2">
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">MATERIAL SELECTION PROTOCOL</h2>
                 <div className="h-0.5 flex-grow bg-slate-50"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0f172a] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded">3</span>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FEATURES & REQUIREMENTS</h3>
                  </div>
                  <textarea 
                    ref={matrixRef}
                    value={clinicalMatrix} 
                    onChange={(e) => setClinicalMatrix(e.target.value)} 
                    className={`w-full bg-[#f8fafc] border-2 rounded-xl p-6 text-sm font-bold resize-none overflow-hidden outline-none transition-all ${isInvalidDevice ? 'border-rose-100 opacity-50' : showFlash ? 'border-cyan-400 bg-cyan-50' : 'border-slate-50'}`} 
                    style={{ minHeight: '160px' }}
                  />
                </div>

                <div className="space-y-4 flex flex-col h-full">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0f172a] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded">4</span>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">COMPLIANCE FILTERS</h3>
                  </div>
                  <div className="space-y-2 flex-grow">
                    {requirements.map((req) => (
                      <div key={req.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <h4 className="text-[10px] font-black text-slate-900 uppercase">{req.label}</h4>
                           <Switch enabled={req.enabled} onChange={() => handleToggle(req.id)} />
                        </div>
                        <p className="text-[9px] font-medium text-slate-500 leading-tight">{req.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 flex items-center justify-between border-t border-slate-50 mt-auto">
                    <button onClick={handleReset} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">CLEAR</button>
                    <button 
                      onClick={handleGenerate} 
                      disabled={isSyncing || !deviceName || isInvalidDevice}
                      className={`bg-[#0f172a] text-white px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isSyncing || isInvalidDevice || !deviceName ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-slate-800 active:scale-95 shadow-xl'}`}
                    >
                      {isInvalidDevice ? 'INTEGRITY LOCK' : 'RUN SYNTHESIS →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {design && !isInvalidDevice && (
          <section className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-3xl font-black text-[#0f172a] uppercase tracking-tighter">SYNTHESIS <span className="text-[#0ea5e9]">REPORT</span></h2>
              <div className="flex items-center gap-2">
                 <button onClick={() => handleExportFile('SUMMARY')} className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">SUMMARY</button>
                 <button onClick={() => handleExportFile('SDS_REPORT')} className="bg-rose-100 text-rose-700 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">SDS BUNDLE</button>
                 <button onClick={() => handleExportFile('FULL')} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">TECHNICAL FILE</button>
              </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-5 space-y-6">
                <div className="bg-[#0f172a] rounded-[1.5rem] p-6 text-white shadow-2xl">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {design.simulation.metrics.map((m, i) => (
                      <div key={i} className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl relative">
                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-widest">{m.label}</div>
                        <div className="flex items-baseline gap-1"><span className="text-xl font-black">{m.value}</span><span className="text-[9px] font-bold text-slate-500 uppercase">{m.unit}</span></div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed italic font-medium">"{design.simulation.engineeringSummary}"</p>
                </div>
                
                <div className="flex justify-center -mb-px relative z-10">
                   <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 backdrop-blur-sm">
                      <button onClick={() => setResultsSubTab('MATRIX')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${resultsSubTab === 'MATRIX' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>BOM</button>
                      <button onClick={() => setResultsSubTab('SDS')} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${resultsSubTab === 'SDS' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400'}`}>SDS</button>
                   </div>
                </div>
                
                <div className="flex-grow pt-2">
                  {resultsSubTab === 'MATRIX' ? <MaterialAnalysis materials={design.materials} enabledRequirements={requirements} /> : <div className="bg-white rounded-[1.5rem] shadow-xl border border-slate-100 p-6 min-h-[600px]"><SDSViewer sdsLibrary={design.sdsLibrary} deviceName={design.deviceName} onPrintAll={() => handleExportFile('SDS_REPORT')} /></div>}
                </div>
              </div>
              <div className="xl:col-span-7 h-full sticky top-4">
                <EngineeringDrawing 
                  specs={design.specs} 
                  deviceType={design.deviceType}
                  deviceName={design.deviceName} 
                  cadImageUrl={design.cadImageUrl} 
                  isVizLoading={isVizLoading} 
                  materials={design.materials} 
                />
              </div>
            </div>
          </section>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 shadow-2xl text-center space-y-6 max-w-sm w-full">
             <div className="w-12 h-12 border-4 border-t-cyan-500 rounded-full animate-spin mx-auto"></div>
             <p className="font-black text-slate-900 uppercase tracking-widest text-xs">{loadingStep}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
