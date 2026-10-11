import React, { useState } from 'react';
import { NoiseIncident } from '../../types';
import { VectorCard } from '../common/VectorCard';
import { TactileButton } from '../common/TactileButton';
import { ComplaintPdfService } from '../../services/complaintPdfService';
import { FileText, Download, CheckCircle, ShieldAlert, X, Copy } from 'lucide-react';

interface ComplaintGeneratorModalProps {
  incident: NoiseIncident;
  onClose: () => void;
}

export const ComplaintGeneratorModal: React.FC<ComplaintGeneratorModalProps> = ({
  incident,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  const refCode = `CPCB-NM-2026-${incident.id.slice(-6).toUpperCase()}`;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      const pdfBytes = await ComplaintPdfService.generateComplaintPdf(
        incident,
        'Residential Zone',
        55.0
      );
      ComplaintPdfService.downloadPdf(
        pdfBytes,
        `CPCB_Noise_Complaint_${refCode}.pdf`
      );
      setDownloadSuccess(true);
    } catch (err) {
      console.error("Failed to compile PDF:", err);
      alert("Error generating PDF dossier. Please retry.");
    } finally {
      setIsGenerating(false);
    }
  };

  const complaintSummaryText = `To: The Municipal Ward Officer / Member Secretary, State Pollution Control Board
Subject: Statutory Noise Pollution Complaint under Rule 5 & 7 of Noise Pollution Rules, 2000
Reference ID: ${refCode}

Incident Location: Sector Grid ${incident.grid_id} (${incident.location_name})
Recorded Noise Level: Average ${incident.avg_db} dB(A), Peak ${incident.peak_db} dB(A)
CPCB Statutory Limit: 55 dB(A) (Daytime) / 45 dB(A) (Nighttime)
Exceedance: +${(incident.avg_db - 55).toFixed(1)} dB(A) above prescribed limits
Duration: ${incident.duration_min} minutes
Crowdsourced Verification: Corroborated by ${incident.unique_users} independent citizen sensors (Evidence Confidence: ${incident.evidence_score.toFixed(0)}%)
Dominant Source: ${incident.dominant_source}

Please register this complaint and initiate acoustic verification as mandated by the Environment (Protection) Act, 1986.`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(complaintSummaryText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-graphite-950/65 dark:bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-xl my-auto max-h-[92vh] max-h-[92dvh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <VectorCard
          label="CPCB STATUTORY DOSSIER GENERATOR"
          tag="READY TO EXPORT"
          variant="terracotta"
          className="flex flex-col max-h-[92vh] max-h-[92dvh] overflow-y-auto p-4 sm:p-5 space-y-5 shadow-xl"
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-stone-500 hover:text-graphite-900 dark:hover:text-night-text p-1.5 rounded-md hover:bg-paper-200 dark:hover:bg-night-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Dossier Header Info */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold font-serif text-graphite-900 dark:text-night-text">
                Statutory Noise Complaint Dossier
              </h2>
              <p className="text-xs font-mono text-forest-700 dark:text-lime-300 mt-0.5">
                REF: {refCode} · CPCB Noise Rules, 2000
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-terracotta-50 dark:bg-night-900 border border-terracotta-300 dark:border-terracotta-700 text-right font-mono text-xs text-terracotta-700 dark:text-terracotta-300 font-bold">
              {incident.evidence_score.toFixed(0)}% CONFIDENCE
            </div>
          </div>

          {/* Dossier Preview Grid */}
          <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs space-y-2">
            <div className="flex justify-between text-stone-600 dark:text-night-muted">
              <span>LOCATION SECTOR:</span>
              <span className="text-graphite-900 dark:text-night-text font-semibold">{incident.grid_id} (~100m Grid)</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-night-muted">
              <span>MEASURED NOISE:</span>
              <span className="text-terracotta-700 dark:text-terracotta-400 font-bold font-serif">
                {incident.avg_db} dB(A) (Peak: {incident.peak_db} dB)
              </span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-night-muted">
              <span>STATUTORY BREACH:</span>
              <span className="text-terracotta-700 dark:text-terracotta-400 font-bold">
                +{(incident.avg_db - 55).toFixed(1)} dB(A) Exceedance
              </span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-night-muted">
              <span>CORROBORATION:</span>
              <span className="text-forest-800 dark:text-lime-300 font-semibold">
                {incident.unique_users} independent citizen nodes ({incident.reading_count} samples)
              </span>
            </div>
          </div>

          {/* Legal Teeth Notice */}
          <div className="p-3 bg-paper-100 dark:bg-night-900 border border-paper-border dark:border-night-border rounded-lg font-mono text-xs text-graphite-700 dark:text-night-muted space-y-1">
            <div className="flex items-center gap-1.5 text-terracotta-700 dark:text-terracotta-400 font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>LEGAL STATUTORY CLAUSES EMBEDDED:</span>
            </div>
            <p className="text-[11px] text-stone-600 dark:text-night-muted">
              • Formally cites <strong>Rule 5 & 7</strong> of the <em>Noise Pollution (Regulation and Control) Rules, 2000</em>.
            </p>
            <p className="text-[11px] text-stone-600 dark:text-night-muted">
              • Automatically ready for filing at Municipal Ward offices, police stations, or online grievance portals (e.g. CPGRAMS / SPCB).
            </p>
          </div>

          {/* Download Success Banner */}
          {downloadSuccess && (
            <div className="p-3 bg-forest-50 dark:bg-night-900 border border-forest-400 dark:border-forest-700 rounded-lg font-mono text-xs text-forest-800 dark:text-forest-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-forest-600 dark:text-lime-400 flex-shrink-0" />
              <span>PDF Dossier compiled and downloaded successfully!</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 font-mono">
            <TactileButton
              variant="ghost"
              size="md"
              icon={<Copy className="w-4 h-4 text-forest-700 dark:text-lime-400" />}
              onClick={handleCopyText}
            >
              {copiedText ? 'COPIED TO CLIPBOARD' : 'COPY TEXT'}
            </TactileButton>

            <TactileButton
              variant="terracotta"
              size="md"
              className="flex-1 py-3"
              disabled={isGenerating}
              icon={isGenerating ? <FileText className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-paper-50" />}
              onClick={handleDownload}
            >
              {isGenerating ? 'COMPILING VECTOR PDF...' : 'DOWNLOAD CPCB DOSSIER PDF'}
            </TactileButton>
          </div>
        </VectorCard>
      </div>
    </div>
  );
};
