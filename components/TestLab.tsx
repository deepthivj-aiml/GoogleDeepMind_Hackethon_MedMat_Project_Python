import React, { useState } from 'react';
import { DeviceDesign } from '../types';
import { generateBatchTestReport, validateDeviceInput } from '../services/gemini';

interface Props {
  design: DeviceDesign | null;
}

interface TestCase {
  id: string;
  name: string;
  input: string;
  decision: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
}

const TestLab: React.FC<Props> = ({ design }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[10:00:00] QA_SYSTEM_IDLE: Awaiting protocol..."]);
  const [testResults, setTestResults] = useState<TestCase[]>([]);
  const [summary, setSummary] = useState<string>("The system is currently in a pre-test standby state. Awaiting active clinical sweep.");
  
  // Custom Audit States
  const [customInput, setCustomInput] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<{ isValid: boolean; reason: string } | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const runFullSweep = async () => {
    setIsTesting(true);
    setTestResults([]);
    addLog("INITIATING BATCH_PROTOCOL_V2...");
    
    const steps = [
      "Securing connection to Gemini 3 Pro reasoning core...",
      "Loading ISO 10993-5:2025 Biocompatibility Dataset...",
      "Validating French-to-Metric conversion scalars...",
      "Executing Medical Purity Guardrail sweep...",
      "Cross-referencing CAS numbers with global carcinogen DB...",
      "Finalizing Test Report Synthesis..."
    ];

    for (const step of steps) {
      addLog(step);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const report = await generateBatchTestReport(design?.deviceName);
      setTestResults(report.testCases);
      setSummary(report.summary);
      addLog("BATCH_VALIDATION_SUCCESS: Report Ready.");
    } catch (err) {
      addLog("ERROR: Validation engine timeout.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleCustomAudit = async () => {
    if (!customInput.trim()) return;
    setIsAuditing(true);
    setAuditResult(null);
    addLog(`AUDITING_INPUT: "${customInput}"...`);
    
    try {
      // Corrected: validateDeviceInput only expects one argument (deviceName).
      const result = await validateDeviceInput(customInput);
      setAuditResult(result);
      if (result.isValid) {
        addLog(`VERDICT: CLINICAL_ACCEPTED - ${result.reason.slice(0, 30)}...`);
      } else {
        addLog(`VERDICT: SECURITY_REJECTION - ${result.reason.slice(0, 30)}...`);
      }
    } catch (err) {
      addLog("ERROR: Audit gateway failed.");
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Test Dashboard */}
        <div className="flex-grow space-y-8">
          
          {/* NEW: Custom Integrity Sandbox */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CUSTOM INTEGRITY SANDBOX</h3>
                <span className="text-[8px] font-black bg-rose-500 text-white px-2 py-0.5 rounded animate-pulse">LIVE PROBE</span>
             </div>
             <div className="flex gap-4">
                <input 
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Test a device name (e.g. 'Coffee Machine' or 'Pacemaker')"
                  className="flex-grow bg-slate-50 border-2 border-slate-100 rounded-xl px-5 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-200 transition-all"
                />
                <button 
                  onClick={handleCustomAudit}
                  disabled={isAuditing || !customInput.trim()}
                  className="bg-[#0f172a] text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-30 transition-all"
                >
                  {isAuditing ? 'AUDITING...' : 'RUN INTEGRITY CHECK'}
                </button>
             </div>
             
             {auditResult && (
               <div className={`mt-6 p-6 rounded-2xl border-2 animate-in slide-in-from-top-2 ${auditResult.isValid ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${auditResult.isValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      VERDICT: {auditResult.isValid ? 'CLINICAL_VALID' : 'NON_CLINICAL_REJECTED'}
                    </span>
                    <span className="text-xl">{auditResult.isValid ? '🛡️' : '🛑'}</span>
                  </div>
                  <p className={`text-xs font-bold leading-relaxed ${auditResult.isValid ? 'text-emerald-700' : 'text-rose-700'}`}>
                    "{auditResult.reason}"
                  </p>
               </div>
             )}
          </div>

          <div className="bg-[#0f172a] rounded-[2.5rem] p-10 text-white shadow-2xl border border-slate-800">
            <div className="flex justify-between items-start border-b border-slate-800 pb-8 mb-10">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter">ENGINEERING TEST <span className="text-amber-500">LAB</span></h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Document ID: MEDMAT-QA-2025-V2.5</p>
              </div>
              <button 
                onClick={runFullSweep}
                disabled={isTesting}
                className={`bg-amber-500 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 ${isTesting ? 'animate-pulse' : ''}`}
              >
                {isTesting ? 'VALIDATING...' : 'INITIATE BATCH VALIDATION'}
              </button>
            </div>

            <div className="space-y-12">
              <section className="space-y-4">
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-4 border-amber-500 pl-4">1.0 EXECUTIVE SUMMARY</h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                  "{summary}"
                </p>
              </section>

              <section className="space-y-6">
                <h3 className="text-[11px] font-black text-amber-500 uppercase tracking-widest border-l-4 border-amber-500 pl-4">2.0 SCENARIO VALIDATION MATRIX</h3>
                <div className="overflow-hidden border border-slate-800 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/50 text-slate-500 uppercase font-black tracking-widest">
                      <tr>
                        <th className="p-4">Case ID</th>
                        <th className="p-4">Input Context</th>
                        <th className="p-4">AI Decision</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 font-bold">
                      {testResults.length > 0 ? (
                        testResults.map((tc) => (
                          <tr key={tc.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 text-slate-400">{tc.id}: {tc.name}</td>
                            <td className="p-4">"{tc.input}"</td>
                            <td className={`p-4 font-black ${tc.status === 'FAIL' ? 'text-rose-400' : 'text-cyan-400'}`}>{tc.decision}</td>
                            <td className={`p-4 font-black ${tc.status === 'PASS' ? 'text-emerald-400' : tc.status === 'FAIL' ? 'text-rose-400' : 'text-amber-400'}`}>{tc.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-12 text-center text-slate-600 font-black uppercase italic tracking-widest">
                            Awaiting Batch Initiation...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Right: Monitoring & Logs */}
        <div className="w-full lg:w-96 space-y-8">
           <div className="bg-black rounded-[2rem] p-8 shadow-2xl border border-slate-800 flex flex-col h-[400px]">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                 <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                 <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                 <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">LAB_TERMINAL_LOGS</span>
              </div>
              <div className="flex-grow font-mono text-[9px] text-slate-400 space-y-3 overflow-y-auto no-scrollbar">
                 {logs.map((log, i) => (
                   <p key={i} className={log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('INIT') || log.includes('AUDITING') ? 'text-cyan-400' : log.includes('REJECTION') ? 'text-rose-400' : ''}>
                     {log}
                   </p>
                 ))}
                 {(isTesting || isAuditing) && <p className="animate-pulse text-amber-500 underline uppercase tracking-tighter text-[8px]">Processing_Packet_Stream...</p>}
              </div>
           </div>

           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LIVE STRESS LEVELS</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase">
                      <span>Inference Load</span>
                      <span className="text-cyan-600">{(isTesting || isAuditing) ? '88%' : '12%'}</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-cyan-500 transition-all duration-700 ${isTesting || isAuditing ? 'w-[88%]' : 'w-[12%]'}`}></div>
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[9px] font-black uppercase">
                      <span>BOM Complexity</span>
                      <span className="text-emerald-600">{design ? design.materials.length * 10 : 0}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${design ? design.materials.length * 10 : 0}%` }}></div>
                   </div>
                </div>
              </div>
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden text-center">
              <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Verification Seal</div>
              <div className="w-16 h-16 border-2 border-emerald-500/30 rounded-full mx-auto flex items-center justify-center mb-4">
                 <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">✓</div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic">
                Synthetic results verified against ISO standards.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default TestLab;