
import React, { useState, useEffect } from 'react';
import { SDSData, SDSSection } from '../types';

interface Props {
  sdsLibrary: SDSData[];
  deviceName: string;
  onPrintAll?: () => void;
}

const PICTROGRAM_MAP: Record<string, string> = {
  'Flame': '🔥',
  'Corrosive': '🧪',
  'Exclamation Mark': '⚠️',
  'Health Hazard': '👤',
  'Skull and Crossbones': '💀',
  'Gas Cylinder': '🧴',
  'Environment': '🐟',
  'Exploding Bomb': '💥',
  'None': '✅'
};

const SDSViewer: React.FC<Props> = ({ sdsLibrary, deviceName, onPrintAll }) => {
  const [viewMode, setViewMode] = useState<'INDIVIDUAL' | 'MASTER_SHEET'>('INDIVIDUAL');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [localSds, setLocalSds] = useState<SDSData[]>(sdsLibrary);

  useEffect(() => {
    setLocalSds(sdsLibrary);
    if (sdsLibrary.length > 0) setSelectedIdx(0);
  }, [sdsLibrary]);

  const activeSds = localSds[selectedIdx] || localSds[0];

  const downloadIndividualWord = (sds: SDSData) => {
    const html = `
      <html><head><style>
        body { font-family: sans-serif; padding: 40px; }
        h1 { color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #000; }
        .section { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; }
        .bold { font-weight: bold; }
      </style></head><body>
      <h1>Safety Data Sheet: ${sds.productName}</h1>
      <p><span class="bold">CAS:</span> ${sds.casNumber}</p>
      <p><span class="bold">Signal Word:</span> ${sds.signalWord}</p>
      ${sds.sections.map(s => `<div class="section"><p class="bold">SECTION ${s.id}: ${s.heading}</p><p>${s.content}</p></div>`).join('')}
      </body></html>
    `;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SDS_${sds.productName.replace(/\s+/g, '_')}.doc`;
    link.click();
  };

  if (!localSds || localSds.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200 uppercase text-[10px] font-black tracking-widest">
        No SDS Records Synthesized.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Safety Compliance Hub</h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{deviceName}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('INDIVIDUAL')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${viewMode === 'INDIVIDUAL' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Docs</button>
          <button onClick={() => setViewMode('MASTER_SHEET')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${viewMode === 'MASTER_SHEET' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>Sheet</button>
        </div>
      </div>

      {viewMode === 'MASTER_SHEET' ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-auto">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-slate-900 text-white font-black uppercase">
              <tr><th className="p-4">Material</th><th className="p-4">CAS</th><th className="p-4">Hazards</th></tr>
            </thead>
            <tbody>
              {localSds.map((s, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="p-4 font-black">{s.productName}</td>
                  <td className="p-4 font-mono">{s.casNumber}</td>
                  <td className="p-4 italic">{s.hazards}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {localSds.map((s, i) => (
              <button key={i} onClick={() => setSelectedIdx(i)} className={`p-3 rounded-xl border-2 text-[9px] font-black uppercase truncate ${selectedIdx === i ? 'border-cyan-500 bg-cyan-50 text-cyan-700' : 'border-slate-100'}`}>
                {s.productName}
              </button>
            ))}
          </div>
          {activeSds && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl relative min-h-[500px]">
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                <h1 className="text-2xl font-black uppercase tracking-tighter">Safety Data Sheet</h1>
                <div className="flex gap-2">
                  <button onClick={() => downloadIndividualWord(activeSds)} className="bg-blue-600 text-white px-3 py-1 rounded-[6px] text-[9px] font-black uppercase">Word</button>
                  <button 
                    onClick={() => onPrintAll ? onPrintAll() : window.print()} 
                    className="bg-slate-900 text-white px-3 py-1 rounded-[6px] text-[9px] font-black uppercase"
                  >
                    PDF
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Section 1. Identification</p>
                <p className="text-sm font-bold text-slate-900">{activeSds.productName}</p>
                <div className="space-y-6">
                  {activeSds.sections.map(sec => (
                    <div key={sec.id} className="border-t border-slate-100 pt-4">
                       <h3 className="text-[10px] font-black text-slate-900 uppercase mb-1">Section {sec.id}: {sec.heading}</h3>
                       <p className="text-[11px] text-slate-600 leading-relaxed">{sec.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SDSViewer;
