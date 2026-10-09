import React, { useState } from 'react';
import { NoiseIncident } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { ComplaintPdfService } from '../../services/complaintPdfService';
import { FileText, Download, CheckCircle, ShieldAlert, Award } from 'lucide-react';

interface EvidenceViewProps {
  incidents: NoiseIncident[];
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ incidents }) => {
  const [selectedIncident, setSelectedIncident] = useState<NoiseIncident | null>(
    incidents[0] || null
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const activeIncidents = incidents.filter((i) => i.status === 'active');

  const handleDownloadDossier = async (inc: NoiseIncident) => {
    try {
      setIsGenerating(true);
      const pdfBytes = await ComplaintPdfService.generateComplaintPdf(inc, 'Residential Zone', 55.0);
      ComplaintPdfService.downloadPdf(
        pdfBytes,
        `CPCB_Noise_Violation_${inc.grid_id}.pdf`
      );
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error compiling PDF dossier.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Evidence Hub Header */}
      <div className="p-4 bg-surface/90 border border-white/10 rounded-xl font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wider">
              CIVIC ACTION & STATUTORY EVIDENCE HUB
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
              CPCB 2000 RULES
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transforming crowdsourced decibel samples into legally defensible municipal complaints
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-emerald-400 px-3 py-1.5 rounded bg-slate-900 border border-slate-800">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>STATUTORY READY</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Incidents selector list */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-slate-400 uppercase tracking-wider text-[11px] block">
            SELECT ACTIVE VIOLATION INCIDENT:
          </span>

          <div className="space-y-2">
            {activeIncidents.map((inc) => {
              const isSelected = selectedIncident?.id === inc.id;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-950/60 border-rose-500/50 shadow-glow-crimson/20'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{inc.location_name}</span>
                    <span className="text-rose-400 font-bold">{inc.avg_db} dB</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px] mt-1">
                    <span>Sector {inc.grid_id}</span>
                    <span>{inc.evidence_score.toFixed(0)}% Conf.</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident Evidence Dossier Preview */}
        <div className="md:col-span-2">
          {selectedIncident ? (
            <VectorCard
              label="EVIDENCE DOSSIER PREVIEW"
              tag="PDF-LIB VECTOR COMPILATION"
              variant="crimson"
              className="space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedIncident.location_name}
                  </h3>
                  <p className="text-xs font-mono text-cyan-300">
                    Grid Sector: {selectedIncident.grid_id} · {selectedIncident.duration_min}m Duration
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-950 border border-white/10 text-right font-mono text-xs">
                  <span className="text-[10px] text-slate-500 block">CONFIDENCE</span>
                  <span className="text-rose-400 font-bold text-sm">
                    {selectedIncident.evidence_score.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-3 bg-slate-950 border border-white/10 rounded-lg font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Recorded Leq Level:</span>
                  <span className="text-rose-400 font-bold">{selectedIncident.avg_db} dB(A)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Peak Shock Impulse:</span>
                  <span className="text-rose-400 font-bold">{selectedIncident.peak_db} dB(A)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">CPCB Permissible Limit:</span>
                  <span className="text-slate-200">55.0 dB(A) (Daytime Residential)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Exceedance Margin:</span>
                  <span className="text-rose-400 font-bold">
                    +{(selectedIncident.avg_db - 55).toFixed(1)} dB(A) Exceeded
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-1">
                  <span className="text-slate-400">Citizen Contributors:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedIncident.unique_users} Devices ({selectedIncident.reading_count} samples)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statutory Citation:</span>
                  <span className="text-amber-300">Rule 5 & 7, Noise Pollution Rules 2000</span>
                </div>
              </div>

              {/* Statutory Guarantee note */}
              <div className="p-3 bg-slate-900/60 border border-white/5 rounded-lg font-mono text-xs text-slate-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>
                  This vector PDF report generates directly in your browser with tamper-evident reference IDs and decibel time curves, structured for immediate filing with Municipal Ward officers or state pollution control portals.
                </span>
              </div>

              {downloadSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-lg font-mono text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>CPCB complaint PDF downloaded successfully!</span>
                </div>
              )}

              {/* Download CTA */}
              <TactileButton
                variant="crimson"
                size="lg"
                className="w-full font-mono"
                disabled={isGenerating}
                icon={isGenerating ? <FileText className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                onClick={() => handleDownloadDossier(selectedIncident)}
              >
                {isGenerating ? 'COMPILING VECTOR DOSSIER...' : 'DOWNLOAD CPCB EVIDENCE DOSSIER (PDF)'}
              </TactileButton>
            </VectorCard>
          ) : (
            <div className="p-12 text-center font-mono text-slate-400">
              Select an incident from the left to view evidence preview.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
