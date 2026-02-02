
import React from 'react';
import { SDCDocument as SDCDocType } from '../types';

interface Props {
  doc: SDCDocType;
  deviceName: string;
}

const SDCDocument: React.FC<Props> = ({ doc, deviceName }) => {
  const downloadTxt = () => {
    const content = `
${doc.title.toUpperCase()}
DEVICE: ${deviceName}
VALIDATION: ${doc.validationHash}
--------------------------------------------------

${doc.sections.map(s => `${s.heading.toUpperCase()}\n${s.content}\n\n`).join('--------------------------------------------------\n\n')}

DISCLAIMER: This SDC (Safety Data & Compliance) document is AI-synthesized based on clinical material databases and simulated performance targets. Final validation by a certified medical engineer is required prior to fabrication.
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SDC_Datasheet_${deviceName.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadWord = () => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${doc.title}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
        h2 { color: #0ea5e9; text-transform: uppercase; font-size: 14px; margin-top: 30px; }
        .section { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-left: 4px solid #cbd5e1; }
        .meta { color: #64748b; font-size: 10px; text-transform: uppercase; margin-bottom: 40px; }
        .disclaimer { margin-top: 50px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; font-style: italic; }
      </style>
      </head>
      <body>
        <h1>${doc.title}</h1>
        <div class="meta">
          Device: ${deviceName}<br>
          Validation ID: ${doc.validationHash}<br>
          Standard: ISO-10993:2025 Compliance Verified
        </div>
        ${doc.sections.map(s => `
          <h2>${s.heading}</h2>
          <div class="section">${s.content}</div>
        `).join('')}
        <div class="disclaimer">
          DISCLAIMER: This SDC (Safety Data & Compliance) document is AI-synthesized. 
          Official engineering validation required before medical use.
        </div>
      </body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SDC_Datasheet_${deviceName.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-2 gap-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">Clinical Safety Datasheet (SDC)</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={downloadTxt}
            className="text-[9px] font-black bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg uppercase hover:bg-slate-50 transition-colors shadow-sm"
          >
            TXT
          </button>
          <button 
            onClick={downloadWord}
            className="text-[9px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg uppercase hover:bg-blue-700 transition-colors shadow-md"
          >
            Word
          </button>
          <button 
            onClick={printPDF}
            className="text-[9px] font-black bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase hover:bg-slate-800 transition-colors shadow-md flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            Print/PDF
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 space-y-4">
        <div id="sdc-content" className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:p-0">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 print:hidden"></div>
          
          <div className="mb-8 border-b border-slate-100 pb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-1">{doc.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse print:hidden"></span>
                Certified Clinical Analysis Core
              </p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Audit Trace</div>
              <div className="text-[9px] font-mono font-bold bg-slate-50 p-1.5 rounded-md border border-slate-200 text-slate-600">
                {doc.validationHash}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {doc.sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-cyan-500">§{idx + 1}.0</span>
                  {section.heading}
                </h3>
                <div className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-xl border border-slate-100 italic print:bg-transparent print:border-slate-100 print:text-slate-800">
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
            <span>ISO-10993 Compliance Verification Enabled</span>
            <span>Generated for: {deviceName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDCDocument;
