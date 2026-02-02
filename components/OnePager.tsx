
import React from 'react';

const TeamMember = ({ name, role, bio }: { name: string; role: string; bio: string }) => (
  <div className="border-l-2 border-slate-900 pl-6 py-2 space-y-2">
    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter">{name}</h4>
    <p className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">{role}</p>
    <p className="text-[11px] text-slate-500 leading-relaxed italic">{bio}</p>
  </div>
);

const OnePager: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto bg-[#fdfdfd] shadow-2xl rounded-[1.5rem] overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Proprietary Header */}
      <div className="bg-slate-900 p-12 text-white flex justify-between items-start">
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
            CONCEPT &<br />STRATEGY
          </h1>
          <div className="inline-block px-3 py-1 bg-cyan-500 text-[10px] font-black uppercase tracking-widest">
            Project: MedMat 3D Pro
          </div>
        </div>
        <div className="text-right space-y-2 opacity-50">
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">INTERNAL DOSSIER V.1.02</p>
          <p className="text-[9px] font-mono">HASH: 0x82BB...A91C</p>
        </div>
      </div>

      <div className="p-16 space-y-20">
        {/* Executive Summary */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-100 pb-4">VISION</h2>
          </div>
          <div className="md:col-span-8 space-y-6">
            <p className="text-xl font-serif text-slate-800 leading-relaxed italic">
              "To accelerate the lifecycle of life-saving medical devices through the precise intersection of Generative AI and clinical-grade mechanical engineering."
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              MedMat 3D Pro solves the critical bottleneck in medical manufacturing: the transition from clinical intent to regulatory-ready technical files. By leveraging <strong>Gemini 3 Pro</strong>, we automate the synthesis of complex geometries, material biocompatibility screening (ISO 10993), and full technical dossier generation in seconds, not months.
            </p>
          </div>
        </section>

        {/* The Solution Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-50 p-8 rounded-2xl space-y-4">
            <div className="text-2xl">⚡</div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Rapid Synthesis</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Instant generation of 3D-printable architectures based on specific clinical performance targets like burst pressure and deflection.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl space-y-4">
            <div className="text-2xl">🛡️</div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Purity Guardrails</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Automated screening against global safety databases to ensure every material selection is FDA/ISO compliant for human contact.</p>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl space-y-4">
            <div className="text-2xl">📋</div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Regulatory Dossier</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">Live creation of Technical Files, including full Safety Data Sheets (SDS) and Bill of Materials (BOM) formatted for MDR 2017/745.</p>
          </div>
        </section>

        {/* The Team */}
        <section className="space-y-12">
          <div className="flex justify-between items-end border-b border-slate-100 pb-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">CORE TEAM</h2>
            <span className="text-[10px] font-black text-slate-300 uppercase">Engineering Leadership Group</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <TeamMember 
              name="Dr. Aris Thorne" 
              role="Principal Biomedical Architect" 
              bio="Former director of implantable systems at MedTech Global. Specialist in vascular stent architecture and nitinol behavior."
            />
            <TeamMember 
              name="Sarah Jenkins" 
              role="AI Systems Lead" 
              bio="MIT CS graduate with deep expertise in LLM reasoning chains for structural engineering and material science."
            />
            <TeamMember 
              name="Michael Chen" 
              role="Regulatory Compliance Director" 
              bio="20+ years navigating FDA Class III approvals. Ensuring our AI outputs match the rigor of ISO 13485 standards."
            />
            <TeamMember 
              name="Elena Rodriguez" 
              role="Clinical Operations Head" 
              bio="Bridging the gap between surgical requirements and digital design. Expert in user-centric surgical tool ergonomics."
            />
          </div>
        </section>

        {/* Footer Stamp */}
        <div className="pt-20 flex justify-between items-center opacity-30">
          <div className="text-[8px] font-black uppercase tracking-widest">
            © 2025 MEDMAT 3D PRO SYSTEMS • ALL RIGHTS RESERVED
          </div>
          <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] font-black text-slate-900 rotate-12">
            CERTIFIED
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePager;
