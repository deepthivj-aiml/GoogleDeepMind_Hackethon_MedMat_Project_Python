
import React, { useState } from 'react';
import { GeometricSpecs, MaterialMatch, DeviceType } from '../types';
import Image3DViewer from './Image3DViewer';
import Device3D from './Device3D';

interface Props {
  specs: GeometricSpecs;
  deviceType: DeviceType;
  deviceName: string;
  cadImageUrl?: string;
  isVizLoading: boolean;
  materials?: MaterialMatch[];
}

const EngineeringDrawing: React.FC<Props> = ({ specs, deviceType, cadImageUrl, materials, deviceName }) => {
  const [viewMode, setViewMode] = useState<'RENDER' | 'CAD'>('RENDER');
  const [isXRay, setIsXRay] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const { od_mm, wallThickness, bellowsCount } = specs;

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden relative min-h-[750px]">
      {/* Viewport Header */}
      <div className="bg-[#0f172a] px-8 py-6 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-8">
          <div className="flex flex-col">
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">ENGINEERING VIEWPORT</h2>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{deviceName}</p>
          </div>
          
          <div className="bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-700/50">
            <button 
              onClick={() => setViewMode('RENDER')} 
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'RENDER' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              RENDER
            </button>
            <button 
              onClick={() => setViewMode('CAD')} 
              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'CAD' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              3D CAD
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
           {viewMode === 'CAD' && (
             <>
               <button 
                 onClick={() => setIsXRay(!isXRay)} 
                 className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${isXRay ? 'bg-cyan-500 text-white border-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
               >
                 X-RAY
               </button>
               <button 
                 onClick={() => setShowLabels(!showLabels)} 
                 className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${showLabels ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-white'}`}
               >
                 {showLabels ? 'LABELS: ON' : 'LABELS: OFF'}
               </button>
             </>
           )}
           <div className="h-8 w-px bg-slate-800"></div>
           <span className="text-[9px] font-black bg-cyan-950 text-cyan-400 border border-cyan-900 px-4 py-2 rounded-lg uppercase tracking-widest">{deviceType}</span>
        </div>
      </div>

      <div className="relative flex-grow flex min-h-[600px] bg-[#0f172a]">
        {/* Main Display Area */}
        <div className="flex-grow relative overflow-hidden">
          {viewMode === 'RENDER' ? (
            cadImageUrl ? (
              <div className="relative w-full h-full">
                <Image3DViewer imageUrl={cadImageUrl} />
                {/* Visual indicator for static render limitations */}
                <div className="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-xl border border-white/5 pointer-events-none">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Render Annotation Protocol</p>
                  <p className="text-[7px] text-slate-600 uppercase font-bold italic">Switch to '3D CAD' for precise material mapping labels.</p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-slate-900/50">
                <div className="w-14 h-14 border-4 border-t-transparent border-cyan-400 rounded-full animate-spin"></div>
                <div className="text-center space-y-2">
                   <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Synthesizing Orthographic PBR...</p>
                   <p className="text-slate-600 text-[8px] font-bold uppercase tracking-widest">Ray-tracing Device Geometry</p>
                </div>
              </div>
            )
          ) : (
            <Device3D 
              specs={specs} 
              type={deviceType} 
              materials={materials} 
              isXRay={isXRay} 
              showLabels={showLabels} 
            />
          )}

          {/* Floated Telemetry Box */}
          <div className="absolute top-10 left-10 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 min-w-[240px] z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">REAL-TIME TELEMETRY</span>
              <span className="text-[7px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase">LINK_OK</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Outer Diameter</span>
                <span className="text-[12px] font-black text-white">{od_mm}mm</span>
              </div>
              <div className="flex justify-between items-center group">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Wall Strength</span>
                <span className="text-[12px] font-black text-white">{wallThickness}mm</span>
              </div>
              {deviceType === 'CATHETER' && (
                <div className="flex justify-between items-center group">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight group-hover:text-cyan-400 transition-colors">Bellows Expansion</span>
                  <span className="text-[12px] font-black text-white">{bellowsCount}x</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Material BOM */}
        <div className="w-56 bg-[#0f172a] border-l border-white/5 flex flex-col p-8 space-y-10 shadow-2xl z-20">
          <div className="space-y-2">
            <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">COMPONENTS</h3>
            <div className="h-0.5 w-10 bg-cyan-500/50"></div>
          </div>
          
          <div className="space-y-10 flex-grow overflow-y-auto no-scrollbar pb-10">
            {materials?.map((m, i) => (
              <div key={i} className="space-y-3 group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/40 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#22d3ee] transition-all"></div>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">{m.component}</span>
                </div>
                <div className="text-[10px] font-black text-white leading-tight uppercase group-hover:text-cyan-300 transition-colors">
                  {m.material}
                </div>
                <div className="inline-block px-2 py-0.5 rounded bg-slate-800/80 text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                  SHORE {m.shore}
                </div>
              </div>
            ))}
            {(!materials || materials.length === 0) && (
              <div className="text-[10px] font-black text-slate-800 italic animate-pulse uppercase tracking-widest">Awaiting synthesis...</div>
            )}
          </div>
          
          <div className="pt-6 border-t border-white/5">
             <div className="text-[8px] font-black text-slate-700 uppercase tracking-[0.3em]">CAD_RENDER_CORE_V4</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngineeringDrawing;
