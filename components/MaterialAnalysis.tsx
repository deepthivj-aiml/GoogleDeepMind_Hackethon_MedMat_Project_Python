
import React from 'react';
import { MaterialMatch, GroundingSource } from '../types';
import { ToggleReq } from '../App';

interface Props {
  materials: MaterialMatch[];
  enabledRequirements?: ToggleReq[];
  groundingSources?: GroundingSource[];
}

const MaterialAnalysis: React.FC<Props> = ({ materials, enabledRequirements, groundingSources }) => {
  const isEnabled = (id: number) => {
    if (!enabledRequirements) return true;
    return enabledRequirements.find(r => r.id === id)?.enabled !== false;
  };

  const showCompliance = isEnabled(4);
  const showValidation = isEnabled(5);
  const showSupply = isEnabled(6);
  const showAssembly = isEnabled(7);

  return (
    <div className="space-y-6">
      {/* Grounding / Verification Sources */}
      {groundingSources && groundingSources.length > 0 && (
        <div className="bg-cyan-50 border border-cyan-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">LIVE VERIFICATION SOURCES</span>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {groundingSources.slice(0, 5).map((source, i) => (
              <a 
                key={i} 
                href={source.uri} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[8px] font-bold text-cyan-700 bg-white px-2 py-1 rounded border border-cyan-200 hover:bg-cyan-100 transition-colors uppercase truncate max-w-[200px]"
                title={source.title}
              >
                {source.title || 'Source Verification'} 🔗
              </a>
            ))}
          </div>
        </div>
      )}

      {materials.map((m, idx) => (
        <div key={idx} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-lg overflow-hidden flex flex-col">
          {/* Layer Header */}
          <div className="bg-slate-50/50 px-6 py-4 flex justify-between items-center border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-cyan-600 uppercase tracking-widest">LAYER {idx + 1}: {m.component}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
            </div>
            <div className="flex flex-col items-end">
              <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">{m.shore}</span>
              <span className="text-[8px] font-black text-slate-300 uppercase mt-1">SHORE HARDNESS</span>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase leading-none">{m.material}</h3>
            
            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-900 text-[8px] font-black px-1.5 py-0.5 rounded">A</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PROPERTY ALIGNMENT</span>
                </div>
                <p className="text-[10px] font-medium text-slate-600 leading-relaxed">{m.propertiesAlignment}</p>
              </div>

              {showCompliance && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black px-1.5 py-0.5 rounded">B</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">FDA / ISO 10993</span>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">{m.complianceFDA}</p>
                </div>
              )}

              {showValidation && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded">C</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">2025 TOXICITY STUDY</span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-500 italic">{m.toxicityStudies}</p>
                </div>
              )}
            </div>

            {/* Suppliers & Weld Analysis Footer */}
            {(showSupply || showAssembly) && (
              <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
                {showSupply && (
                  <div className="flex-grow space-y-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">CERTIFIED NA SUPPLIERS</span>
                    <div className="flex flex-wrap gap-2">
                      {m.suppliersCMOs.map((s, si) => (
                        <span key={si} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded text-[9px] font-black text-slate-600 uppercase">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {showAssembly && (
                  <div className="bg-[#0f172a] rounded-xl p-4 md:w-1/2 shadow-xl border border-slate-800">
                    <h4 className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-2">USABILITY & WELD ANALYSIS</h4>
                    <p className="text-[10px] text-slate-300 font-medium italic leading-relaxed">
                      {m.weldabilityAnalysis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {materials.length === 0 && (
        <div className="p-12 text-center text-slate-300 font-black uppercase text-sm tracking-widest animate-pulse">
           SYNTHESIZING BILL OF MATERIALS...
        </div>
      )}
    </div>
  );
};

export default MaterialAnalysis;
