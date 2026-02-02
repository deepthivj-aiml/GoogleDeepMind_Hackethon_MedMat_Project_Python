
import React from 'react';
import { DeviceDesign } from '../types';

interface Props {
  design: DeviceDesign;
}

const SummaryReport: React.FC<Props> = ({ design }) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="p-12 bg-white font-sans text-slate-900 max-w-4xl mx-auto shadow-sm">
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900">{design.deviceName}</h1>
          <p className="text-sm font-black text-cyan-600 uppercase tracking-widest mt-2">EXECUTIVE SUMMARY • MEDMAT 3D PRO</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">DATE OF SYNTHESIS</p>
          <p className="text-lg font-bold">{date}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="col-span-2 space-y-8">
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">CRITICAL PERFORMANCE SNAPSHOT</h3>
            <div className="grid grid-cols-2 gap-4">
              {design.simulation.metrics.slice(0, 4).map((m, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-xl font-black text-slate-900">{m.value} <span className="text-[10px] text-slate-500 uppercase">{m.unit}</span></p>
                  <div className={`text-[8px] font-black uppercase mt-2 px-1.5 py-0.5 inline-block rounded ${m.status === 'OPTIMAL' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {m.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">DESIGN RATIONALE</h3>
            <p className="text-sm leading-relaxed text-slate-700 italic border-l-4 border-cyan-500 pl-4 py-1">
              {design.simulation.engineeringSummary}
            </p>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white p-6 rounded-3xl text-center shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SYSTEM SAFETY FACTOR</p>
              <p className="text-6xl font-black text-emerald-400">{design.simulation.safetyFactor}x</p>
              <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">VALIDATED ISO-13485</p>
           </div>

           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">CORE SPECS</h3>
              <div className="space-y-3">
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Outer Dia:</span>
                    <span className="font-black">{design.specs.od_mm}mm</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Wall Thk:</span>
                    <span className="font-black">{design.specs.wallThickness}mm</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500">Channels:</span>
                    <span className="font-black">{design.specs.tendonChannelsCount}x</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="mb-12">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">PRIMARY BILL OF MATERIALS</h3>
        <div className="bg-white border-2 border-slate-100 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-4">Component</th>
                <th className="p-4">Validated Material</th>
                <th className="p-4">Shore</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {design.materials.map((m, i) => (
                <tr key={i} className="text-xs font-bold text-slate-700">
                  <td className="p-4 uppercase">{m.component}</td>
                  <td className="p-4">{m.material}</td>
                  <td className="p-4">{m.shore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t-2 border-slate-100 pt-8 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
        <span>GEN: MD-PRO-ALPHA</span>
        <span>ISO 10993 COMPLIANT ARCHITECTURE</span>
        <span>INTERNAL USE ONLY</span>
      </div>
    </div>
  );
};

export default SummaryReport;
