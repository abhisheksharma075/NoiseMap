import React, { useState } from 'react';
import { NoiseIncident, NoiseReading } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { ComplaintPdfService } from '../../services/complaintPdfService';
import { soundFeedback } from '../../services/soundFeedbackService';
import { FileText, Download, CheckCircle, ShieldAlert, Award, AlertCircle } from 'lucide-react';

interface EvidenceViewProps {
  incidents: NoiseIncident[];
  readings?: NoiseReading[];
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({ incidents, readings = [] }) => {
  const activeIncidents = React.useMemo(() => {
    return incidents.filter((i) => i.status === 'active');
  }, [incidents]);

  const [selectedIncident, setSelectedIncident] = useState<NoiseIncident | null>(() => {
    return activeIncidents[0] || incidents[0] || null;
  });

  // Keep selectedIncident synchronized when incidents update
  React.useEffect(() => {
    if (!selectedIncident && (activeIncidents.length > 0 || incidents.length > 0)) {
      setSelectedIncident(activeIncidents[0] || incidents[0]);
    } else if (selectedIncident) {
      const match = incidents.find((i) => i.id === selectedIncident.id);
      if (match) setSelectedIncident(match);
      else if (activeIncidents.length > 0) setSelectedIncident(activeIncidents[0]);
    }
  }, [incidents, activeIncidents, selectedIncident]);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

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
      <div className="p-4 bg-paper-50/95 dark:bg-night-850/95 border border-paper-border dark:border-night-border rounded-xl font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-graphite-900 dark:text-night-text tracking-wider">
              CIVIC ACTION & STATUTORY EVIDENCE HUB
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-100 dark:bg-forest-950/60 border border-forest-300 dark:border-forest-700 text-forest-800 dark:text-lime-300 font-bold">
              CPCB 2000 RULES
            </span>
          </div>
          <p className="text-xs text-stone-600 dark:text-night-muted mt-1">
            Transforming crowdsourced decibel samples into legally defensible municipal complaints
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-forest-800 dark:text-lime-300 px-3 py-1.5 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border font-semibold">
          <Award className="w-4 h-4 text-forest-700 dark:text-lime-400" />
          <span>STATUTORY READY</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Incidents selector list */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-stone-600 dark:text-night-muted uppercase tracking-wider text-[11px] block font-semibold">
            SELECT ACTIVE VIOLATION INCIDENT:
          </span>

          <div
            role="radiogroup"
            aria-label="Active violation incident selection"
            className="space-y-2"
          >
            {activeIncidents.length > 0 ? (
              activeIncidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    role="radio"
                    aria-checked={isSelected}
                    type="button"
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-3 min-h-[56px] rounded-xl border transition-all duration-150 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-signal ${
                      isSelected
                        ? 'bg-forest text-paper dark:bg-lime-signal dark:text-forest-deep border-2 border-forest dark:border-lime-signal shadow-sm'
                        : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-800 dark:text-night-text hover:border-forest/60 dark:hover:border-lime-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${
                            isSelected
                              ? 'bg-lime-signal text-forest-deep dark:bg-forest dark:text-lime-signal font-bold'
                              : 'border border-paper-border dark:border-night-border text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                        <span className="font-bold truncate">{inc.location_name}</span>
                      </div>
                      <span className={`font-bold font-mono ${isSelected ? 'text-lime-signal dark:text-forest-deep' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                        {inc.avg_db} dB
                      </span>
                    </div>
                    <div className={`flex justify-between text-[11px] mt-1.5 pl-5.5 ${isSelected ? 'text-paper-100/90 dark:text-forest-deep/80' : 'text-stone-500 dark:text-night-muted'}`}>
                      <span>Sector {inc.grid_id}</span>
                      <span>{inc.evidence_score.toFixed(0)}% Conf.</span>
                    </div>
                  </button>
                );
              })
            ) : incidents.length > 0 ? (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc)}
                    className={`w-full text-left p-3 min-h-[52px] rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-forest-900 text-paper-50 dark:bg-lime-400 dark:text-forest-950 border-forest-900 dark:border-lime-400 shadow-sm'
                        : 'bg-paper-50 dark:bg-night-800 border-paper-border dark:border-night-border text-graphite-800 dark:text-night-text hover:border-forest-600 dark:hover:border-lime-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate">{inc.location_name}</span>
                      <span className={`font-bold font-serif ${isSelected ? 'text-paper-50 dark:text-forest-950' : 'text-olive-700 dark:text-olive-300'}`}>{inc.avg_db} dB</span>
                    </div>
                    <div className={`flex justify-between text-[11px] mt-1 ${isSelected ? 'text-paper-200 dark:text-forest-800' : 'text-stone-500 dark:text-night-muted'}`}>
                      <span>Sector {inc.grid_id}</span>
                      <span className="capitalize">{inc.status}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 rounded-lg bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border text-stone-600 dark:text-night-muted text-[11px] leading-relaxed shadow-sm">
                No peer-corroborated incidents logged yet. When 3+ citizen readings in a ~100m sector exceed statutory limits, a verified incident dossier is automatically formed.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Incident Evidence Dossier Preview */}
        <div className="md:col-span-2">
          {selectedIncident ? (
            <VectorCard
              label="EVIDENCE DOSSIER PREVIEW"
              tag="PDF-LIB VECTOR COMPILATION"
              variant="terracotta"
              className="space-y-5 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-graphite-900 dark:text-night-text">
                    {selectedIncident.location_name}
                  </h3>
                  <p className="text-xs font-mono text-forest-700 dark:text-lime-300 font-medium">
                    Grid Sector: {selectedIncident.grid_id} · {selectedIncident.duration_min}m Duration
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-terracotta-50 dark:bg-night-900 border border-terracotta-300 dark:border-terracotta-700 text-right font-mono text-xs">
                  <span className="text-[10px] text-stone-500 dark:text-night-muted block uppercase font-semibold">CONFIDENCE</span>
                  <span className="text-terracotta-700 dark:text-terracotta-300 font-bold text-sm">
                    {selectedIncident.evidence_score.toFixed(0)}%
                  </span>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs space-y-2">
                <div className="flex justify-between border-b border-paper-border dark:border-night-border pb-1.5">
                  <span className="text-stone-600 dark:text-night-muted">Estimated Leq Level (Grid):</span>
                  <span className="text-terracotta-700 dark:text-terracotta-400 font-bold font-serif">{selectedIncident.avg_db} dB(A)</span>
                </div>
                <div className="flex justify-between border-b border-paper-border dark:border-night-border pb-1.5">
                  <span className="text-stone-600 dark:text-night-muted">Peak Shock Impulse:</span>
                  <span className="text-terracotta-700 dark:text-terracotta-400 font-bold font-serif">{selectedIncident.peak_db} dB(A)</span>
                </div>
                <div className="flex justify-between border-b border-paper-border dark:border-night-border pb-1.5">
                  <span className="text-stone-600 dark:text-night-muted">CPCB Permissible Limit:</span>
                  <span className="text-graphite-800 dark:text-night-text font-medium">55.0 dB(A) (Daytime Residential)</span>
                </div>
                <div className="flex justify-between border-b border-paper-border dark:border-night-border pb-1.5">
                  <span className="text-stone-600 dark:text-night-muted">Exceedance Margin:</span>
                  <span className="text-terracotta-700 dark:text-terracotta-400 font-bold">
                    +{(selectedIncident.avg_db - 55 > 0 ? (selectedIncident.avg_db - 55).toFixed(1) : '0.0')} dB(A) Exceeded
                  </span>
                </div>
                <div className="flex justify-between border-b border-paper-border dark:border-night-border pb-1.5">
                  <span className="text-stone-600 dark:text-night-muted">Citizen Contributors:</span>
                  <span className="text-forest-800 dark:text-lime-300 font-bold">
                    {selectedIncident.unique_users} Devices ({selectedIncident.reading_count} samples)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600 dark:text-night-muted">Statutory Citation:</span>
                  <span className="text-olive-800 dark:text-olive-300 font-semibold">Rule 5 & 7, Noise Pollution Rules 2000</span>
                </div>
              </div>

              {/* Statutory Guarantee note */}
              <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs text-graphite-700 dark:text-night-muted flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-terracotta-600 dark:text-terracotta-400 flex-shrink-0 mt-0.5" />
                <span>
                  This vector PDF report compiles directly in your browser with tamper-evident reference IDs and decibel time curves, structured for immediate filing with Municipal Ward officers or state pollution control portals.
                </span>
              </div>

              {downloadSuccess && (
                <div className="p-3 bg-forest-50 dark:bg-night-900 border border-forest-400 dark:border-forest-700 rounded-lg font-mono text-xs text-forest-800 dark:text-forest-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-forest-600 dark:text-lime-400" />
                  <span>CPCB complaint PDF downloaded successfully!</span>
                </div>
              )}

              {/* Download CTA */}
              <TactileButton
                variant="terracotta"
                size="lg"
                className="w-full font-mono py-3"
                disabled={isGenerating}
                icon={isGenerating ? <FileText className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 text-paper-50" />}
                onClick={() => handleDownloadDossier(selectedIncident)}
              >
                {isGenerating ? 'COMPILING VECTOR DOSSIER...' : 'DOWNLOAD CPCB EVIDENCE DOSSIER (PDF)'}
              </TactileButton>
            </VectorCard>
          ) : readings.length > 0 ? (
            <VectorCard
              label="CITIZEN NOISE LOG DOSSIER"
              tag="RAW CROWDSOURCED SAMPLES"
              variant="forest"
              className="space-y-4 font-mono text-xs shadow-md"
            >
              <div className="flex items-center gap-2 text-forest-800 dark:text-lime-300">
                <AlertCircle className="w-5 h-5 text-forest-700 dark:text-lime-400" />
                <span className="font-bold text-sm">Individual Readings Awaiting Multi-User Consensus</span>
              </div>
              <p className="text-stone-600 dark:text-night-muted text-xs leading-relaxed">
                You have {readings.length} recorded samples in local storage. Statutory CPCB dossiers require consensus from 3+ independent devices within a 15-minute window in the same ~100m sector.
              </p>
              <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg space-y-2">
                <div className="text-graphite-900 dark:text-night-text font-semibold">Latest Submitted Sample:</div>
                <div className="flex justify-between text-stone-600 dark:text-night-muted">
                  <span>Average Decibel Level:</span>
                  <span className="text-forest-800 dark:text-lime-300 font-bold font-serif">{readings[0].db_avg.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-night-muted">
                  <span>Peak Level:</span>
                  <span className="text-terracotta-600 dark:text-terracotta-400 font-bold font-serif">{readings[0].db_peak.toFixed(1)} dB</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-night-muted">
                  <span>Sector Grid ID:</span>
                  <span className="text-graphite-900 dark:text-night-text">{readings[0].grid_id}</span>
                </div>
                <div className="flex justify-between text-stone-600 dark:text-night-muted">
                  <span>Noise Source Tag:</span>
                  <span className="text-graphite-900 dark:text-night-text capitalize">{readings[0].source_type}</span>
                </div>
              </div>

              {/* Instant PDF Download for this Sample */}
              <TactileButton
                variant="forest"
                size="md"
                className="w-full font-mono py-2.5 shadow-field"
                disabled={isGenerating}
                icon={isGenerating ? <FileText className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-paper-50" />}
                onClick={async () => {
                  try {
                    setIsGenerating(true);
                    soundFeedback.playTap();
                    const pdfBytes = await ComplaintPdfService.generateReadingComplaintPdf(readings[0]);
                    ComplaintPdfService.downloadPdf(pdfBytes, `CPCB_Sample_Dossier_${readings[0].grid_id}.pdf`);
                    soundFeedback.playSuccess();
                    setDownloadSuccess(true);
                    setTimeout(() => setDownloadSuccess(false), 4000);
                  } catch (err) {
                    console.error("PDF generation failed:", err);
                    alert("Error downloading sample PDF dossier.");
                  } finally {
                    setIsGenerating(false);
                  }
                }}
              >
                {isGenerating ? 'COMPILING VECTOR DOSSIER...' : 'DOWNLOAD SAMPLE REPORT (PDF)'}
              </TactileButton>
            </VectorCard>
          ) : (
            <div className="p-12 text-center font-mono text-stone-500 dark:text-night-muted">
              No samples or incidents available to compile. Record a reading in the Measure tab to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
