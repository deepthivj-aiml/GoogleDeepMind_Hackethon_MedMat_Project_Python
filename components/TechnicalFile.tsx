
import React from 'react';
import { DeviceDesign } from '../types';

interface Props {
  design: DeviceDesign;
}

const TechnicalFile: React.FC<Props> = ({ design }) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-0 sm:p-12 md:p-20 bg-white font-serif text-slate-900 print:p-0">
      
      {/* 1. COVER PAGE */}
      <section className="h-[297mm] flex flex-col justify-between border-8 border-slate-900 p-12 mb-20 page-break-after-always">
        <div className="space-y-4">
          <div className="bg-slate-900 text-white inline-block px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em]">
            MEDMAT 3D PRO • CLINICAL CORE
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none border-b-4 border-slate-900 pb-8 pt-4">
            TECHNICAL<br />DOSSIER
          </h1>
          <div className="pt-8">
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">PROJECT IDENTITY</h2>
            <p className="text-3xl font-black uppercase tracking-tight">{design.deviceName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 pt-20">
          <div className="space-y-6">
            <div>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">VALIDATION STATUS</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-sm font-bold uppercase">ISO 13485 COMPLIANT ARCHITECTURE</span>
              </div>
            </div>
            <div>
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">DOCUMENT ID</h3>
              <p className="text-xs font-mono font-bold bg-slate-100 p-2 rounded tracking-tight break-all">
                {design.sdsLibrary[0]?.validationHash || 'MM-V2025-ALPHA-99'}
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-end text-right">
             <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">GENERATION DATE</h3>
             <p className="text-sm font-bold">{date}</p>
             <p className="text-[8px] font-medium text-slate-400 mt-4 uppercase italic">
               CONFIDENTIAL MEDICAL ENGINEERING DATA
             </p>
          </div>
        </div>
      </section>

      {/* 2. DESIGN ARCHITECTURE */}
      <section className="min-h-[297mm] py-12 border-t-2 border-slate-100 mb-20 page-break-after-always">
        <h2 className="text-xs font-black text-cyan-600 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
          <span className="bg-cyan-600 text-white px-2 py-1">SECTION 1.0</span> 
          GEOMETRIC & STRUCTURAL ARCHITECTURE
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
           <div className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">CRITICAL TOLERANCES</h3>
                <div className="space-y-4">
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500">Outer Diameter</span>
                      <span className="text-xs font-black">{design.specs.od_mm} mm</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500">Wall Thickness</span>
                      <span className="text-xs font-black">{design.specs.wallThickness} mm</span>
                   </div>
                   <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-bold text-slate-500">Tolerance Class</span>
                      <span className="text-xs font-black">{design.specs.tolerance}</span>
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">DESIGN RATIONALE</h3>
                <p className="text-sm leading-relaxed text-slate-600 italic">
                  "The proposed architecture incorporates a dual-lumen system with asymmetric expansion properties, specifically tuned for medical-grade clinical intervention. Variable wall thickness facilitates precise structural integrity under peak inflation pressures."
                </p>
              </div>
           </div>
           
           <div className="bg-slate-900 p-2 rounded-xl shadow-2xl">
              {design.cadImageUrl ? (
                <img src={design.cadImageUrl} alt="Engineering Render" className="w-full rounded-lg" />
              ) : (
                <div className="h-64 bg-slate-800 flex items-center justify-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  Visualization Pending
                </div>
              )}
              <div className="p-4 text-center">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">ORTHOGRAPHIC ENGINEERING VIEW (FINAL)</p>
              </div>
           </div>
        </div>
      </section>

      {/* 3. PERFORMANCE SIMULATION */}
      <section className="min-h-[297mm] py-12 border-t-2 border-slate-100 mb-20 page-break-after-always">
        <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
          <span className="bg-emerald-600 text-white px-2 py-1">SECTION 2.0</span> 
          COMPUTATIONAL PHYSICS & PERFORMANCE
        </h2>

        <div className="bg-slate-900 text-white p-10 rounded-[2rem] shadow-2xl mb-12">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {design.simulation.metrics.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{m.label}</div>
                  <div className="text-2xl font-black">{m.value}<span className="text-[10px] text-slate-500 ml-1">{m.unit}</span></div>
                  <div className={`text-[7px] font-black uppercase px-1.5 py-0.5 inline-block rounded ${m.status === 'OPTIMAL' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-amber-900/50 text-amber-400'}`}>
                    {m.status}
                  </div>
                </div>
              ))}
           </div>
           <div className="border-t border-slate-800 pt-8 flex justify-between items-center">
              <div className="max-w-xl">
                 <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">SOLVER SUMMARY</h3>
                 <p className="text-xs text-slate-400 leading-relaxed font-medium">
                   {design.simulation.engineeringSummary}
                 </p>
              </div>
              <div className="text-right">
                 <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SAFETY FACTOR</div>
                 <div className="text-5xl font-black text-emerald-400">{design.simulation.safetyFactor}x</div>
              </div>
           </div>
        </div>
      </section>

      {/* 4. BILL OF MATERIALS (BOM) */}
      <section className="min-h-[297mm] py-12 border-t-2 border-slate-100 mb-20 page-break-after-always">
        <h2 className="text-xs font-black text-rose-600 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
          <span className="bg-rose-600 text-white px-2 py-1">SECTION 3.0</span> 
          VALIDATED BILL OF MATERIALS (BOM)
        </h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
              <th className="p-4 text-left">Component</th>
              <th className="p-4 text-left">Material Identity</th>
              <th className="p-4 text-left">Shore</th>
              <th className="p-4 text-left">Compliance</th>
              <th className="p-4 text-left">NA Availability</th>
            </tr>
          </thead>
          <tbody>
            {design.materials.map((m, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-[10px] font-black uppercase">{m.component}</td>
                <td className="p-4 text-xs font-bold text-slate-700">{m.material}</td>
                <td className="p-4 text-xs font-bold text-slate-500">{m.shore}</td>
                <td className="p-4 text-[9px] font-black text-emerald-600 uppercase">{m.complianceFDA}</td>
                <td className="p-4 text-[9px] font-black text-slate-400 uppercase">{m.availabilityNA}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 p-8 bg-slate-50 border-2 border-slate-100 rounded-2xl italic">
           <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-4">ASSEMBLY NOTES</h3>
           <div className="space-y-4">
             {design.materials.map((m, i) => (
               <p key={i} className="text-[11px] leading-relaxed text-slate-600">
                 <span className="font-black uppercase text-slate-900">{m.component}:</span> {m.weldabilityAnalysis}
               </p>
             ))}
           </div>
        </div>
      </section>

      {/* 5. SDS ANNEX */}
      <section className="min-h-[297mm] py-12 border-t-2 border-slate-100 mb-20 page-break-after-always">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
          <span className="bg-slate-900 text-white px-2 py-1">ANNEX A</span> 
          SAFETY DATA SHEETS (SDS)
        </h2>

        {design.sdsLibrary.map((sds, i) => (
          <div key={i} className="mb-20 p-8 border-2 border-slate-900 rounded-3xl page-break-inside-avoid">
             <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                   <h3 className="text-xl font-black uppercase tracking-tight">{sds.productName}</h3>
                   <p className="text-[10px] font-mono font-bold text-slate-400">CAS: {sds.casNumber}</p>
                </div>
                <div className="bg-rose-100 text-rose-700 px-3 py-1 rounded text-[10px] font-black uppercase">
                  {sds.signalWord}
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mb-8">
                {sds.sections.slice(0, 4).map((sec, j) => (
                  <div key={j} className="space-y-1">
                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Section {sec.id}</h4>
                    <p className="text-[10px] font-medium leading-relaxed">{sec.content}</p>
                  </div>
                ))}
             </div>
             <p className="text-[8px] text-center text-slate-400 italic">Full SDS available in electronic dossier index</p>
          </div>
        ))}
      </section>

      {/* 6. REGULATORY DECLARATION */}
      <section className="py-20 border-t-4 border-slate-900 text-center space-y-8">
         <div className="bg-slate-900 text-white inline-block px-4 py-2 text-xs font-black uppercase tracking-[0.5em]">
           VERIFICATION SEAL
         </div>
         <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-xl font-black uppercase tracking-tighter">TECHNICAL DECLARATION OF COMPLIANCE</h2>
            <p className="text-sm leading-relaxed text-slate-500 italic">
              "We hereby declare that the technical documentation described in this file has been synthesized according to ISO 13485:2025 and MDR 2017/745 standards for mechanical medical devices. All material selections adhere to ISO 10993-5 biocompatibility guidelines as simulated."
            </p>
         </div>
         <div className="pt-20 flex justify-center gap-20">
            <div className="border-t-2 border-slate-900 pt-4 w-48">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CHIEF ENGINEER</p>
               <p className="text-xs font-bold mt-2 font-serif italic text-slate-300">MedMat 3D Pro System Signature</p>
            </div>
            <div className="border-t-2 border-slate-900 pt-4 w-48">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">REGULATORY AFFAIRS</p>
               <p className="text-xs font-bold mt-2 font-serif italic text-slate-300">MedMat 3D Pro System Signature</p>
            </div>
         </div>
      </section>

      <style>{`
        @media print {
          .page-break-after-always { page-break-after: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default TechnicalFile;
