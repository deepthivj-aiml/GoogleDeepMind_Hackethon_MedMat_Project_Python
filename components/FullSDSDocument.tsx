
import React from 'react';
import { DeviceDesign, SDSData } from '../types';

interface Props {
  design: DeviceDesign;
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

const FullSDSDocument: React.FC<Props> = ({ design }) => {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white font-sans text-slate-900 p-0 md:p-12 print:p-0">
      <section className="h-[297mm] flex flex-col justify-center items-center text-center p-20 border-8 border-slate-100 mb-10 page-break-after-always">
        <div className="space-y-6">
          <div className="bg-slate-900 text-white inline-block px-6 py-2 text-xs font-black uppercase tracking-[0.4em]">
            Safety Compliance Annex
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-tight">
            COMPREHENSIVE<br />SDS DOSSIER
          </h1>
          <div className="w-24 h-1 bg-cyan-500 mx-auto"></div>
          <p className="text-xl font-bold text-slate-500 uppercase tracking-widest pt-4">
            {design.deviceName}
          </p>
        </div>
        
        <div className="mt-32 space-y-4 max-w-md">
           <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Records</p>
              <p className="text-2xl font-black">{design.sdsLibrary.length} Active Materials</p>
           </div>
           <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">
             This document contains the full Safety Data Sheets for all material components identified in the technical file for the specified medical device.
           </p>
        </div>

        <div className="mt-auto pt-10 border-t border-slate-100 w-full flex justify-between items-end">
           <div className="text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase">Compiled On</p>
              <p className="text-sm font-bold">{date}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase">Protocol</p>
              <p className="text-sm font-bold">GHS / OSHA 1910.1200</p>
           </div>
        </div>
      </section>

      {design.sdsLibrary.map((sds, idx) => (
        <section key={idx} className="min-h-[297mm] p-8 md:p-16 border-b border-slate-100 mb-10 page-break-before-always">
          {/* Header */}
          <div className="flex justify-between items-start mb-10 border-b-4 border-slate-900 pb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Safety Data Sheet</h2>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Product: {sds.productName}</p>
            </div>
            <div className="text-right text-[10px] font-black text-slate-400 uppercase">
               Revision Date: {sds.revisionDate}<br/>
               ID: {sds.validationHash}
            </div>
          </div>

          {/* Identification Section */}
          <div className="space-y-6 mb-10">
            <div className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">1. IDENTIFICATION</div>
            <div className="grid grid-cols-2 gap-8 text-[11px]">
              <div>
                <p className="font-black mb-1">Product Identifier</p>
                <p className="text-slate-600 mb-4">{sds.productName}</p>
                <p className="font-black mb-1">Other Means of Identification</p>
                <p className="text-slate-600 mb-4">{sds.otherIdentifiers || sds.casNumber}</p>
                <p className="font-black mb-1">Recommended Use</p>
                <p className="text-slate-600">{sds.recommendedUse || "Clinical mechanical medical device component."}</p>
              </div>
              <div className="border-l border-slate-100 pl-8">
                <p className="font-black mb-1">Supplier Details</p>
                <p className="text-slate-600 whitespace-pre-line mb-4">{sds.supplierInfo || "Refer to Bill of Materials for OEM details."}</p>
                <p className="font-black mb-1">Emergency Numbers</p>
                <p className="text-slate-600 whitespace-pre-line">{sds.emergencyContacts || "CHEMTREC: 1-800-424-9300"}</p>
              </div>
            </div>
          </div>

          {/* Hazard Identification */}
          <div className="space-y-6 mb-10">
            <div className="bg-slate-900 text-white px-4 py-1 text-[10px] font-black uppercase">2. HAZARDS IDENTIFICATION</div>
            <div className="border border-slate-900">
               <div className="bg-slate-100 px-4 py-2 border-b border-slate-900 font-black text-[10px] uppercase">Classification</div>
               <table className="w-full text-left text-[11px]">
                 <tbody className="divide-y divide-slate-200">
                   {sds.classification.map((c, ci) => (
                     <tr key={ci}>
                       <td className="p-3 font-bold">{c.category}</td>
                       <td className="p-3">{c.class}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-4">
                    <span className={`text-sm font-black uppercase px-4 py-1 rounded ${sds.signalWord === 'Danger' ? 'bg-rose-600 text-white' : 'bg-amber-400 text-slate-900'}`}>{sds.signalWord}</span>
                    <div className="flex gap-2">
                       {sds.pictograms.map((p, pi) => <span key={pi} className="text-2xl" title={p}>{PICTROGRAM_MAP[p] || '⚠️'}</span>)}
                    </div>
                 </div>
                 <p className="text-[11px] font-bold text-slate-900 leading-tight">Hazard Statements: {sds.hazards}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Precautionary Statements</h4>
                <div className="space-y-2 text-[10px]">
                  {sds.precautionaryStatements.prevention.length > 0 && <p><span className="font-black">Prevention: </span>{sds.precautionaryStatements.prevention.join(". ")}</p>}
                  {sds.precautionaryStatements.response.length > 0 && <p><span className="font-black">Response: </span>{sds.precautionaryStatements.response.join(". ")}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* 16 Sections Grid */}
          <div className="space-y-px border-2 border-slate-900">
            {sds.sections.map((section) => (
              <div key={section.id} className="border-t-2 first:border-t-0 border-slate-900 bg-white">
                <div className="bg-slate-50 px-4 py-2 flex items-center gap-4 border-b border-slate-900">
                  <span className="text-[10px] font-black text-slate-900">SECTION {section.id}.</span>
                  <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{section.heading}</h3>
                </div>
                <div className="p-6 text-[11px] text-slate-800 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">
            -- End of SDS Dossier --
          </div>
        </section>
      ))}

      <style>{`
        @media print {
          .page-break-after-always { page-break-after: always; }
          .page-break-before-always { page-break-before: always; }
          section { border: none !important; margin-bottom: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default FullSDSDocument;
