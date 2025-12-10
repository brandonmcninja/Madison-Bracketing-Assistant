import React from 'react';
import { X, Upload, Sliders, Layers, AlertCircle, FileText, CheckCircle2, Copy, Minimize2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded-md text-sm">MA</span>
            How to Use
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Step 1 */}
          <section className="flex gap-4 md:gap-6">
            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
              1
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload size={20} className="text-blue-500" />
                Upload Your Data
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Export your competitor list from Smoothcomp as a CSV file. The system expects standard columns like 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Firstname</code>, 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Lastname</code>, 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Team</code>, 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Belt</code>, 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Birth</code> (or Age), and 
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-xs font-mono mx-1">Weighin weight</code>.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>If a weight or age is missing (0), the competitor will appear in the Outliers list for manual review.</span>
              </div>
            </div>
          </section>

          {/* Step 2 */}
          <section className="flex gap-4 md:gap-6">
            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg">
              2
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sliders size={20} className="text-orange-500" />
                Adjust Rules
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Use the sidebar to tune the Madison grouping logic. 
              </p>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span><strong>Max Lbs Cap:</strong> Limits the absolute weight difference (default 13 lbs), regardless of percentage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span><strong>Kids (&lt;16):</strong> Strict divisions (8U, 9-12 Coed, 13-15 Separated) and 10% weight spread.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                  <span><strong>Adults (16+):</strong> Age gaps can be ignored. Teens (13-15) can bump up. Ultra Heavy (225+) toggle ignores weight limits.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Step 3 */}
          <section className="flex gap-4 md:gap-6">
            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
              3
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers size={20} className="text-green-500" />
                Manage Brackets
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1"><Minimize2 size={14}/> Auto-Bump</h4>
                    <p className="text-xs text-slate-600">
                        If you drag an athlete into a full bracket (5 people), the system automatically <strong>ejects the worst-fitting competitor</strong> (lightest or heaviest) back to Outliers to maintain the size limit.
                    </p>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-xs uppercase mb-2 flex items-center gap-1"><Copy size={14}/> Duplicate</h4>
                    <p className="text-xs text-slate-600">
                        Click on an athlete to view details, then click <strong>Duplicate</strong> to create a copy of them. Useful for "Best of 3" scenarios against multiple opponents.
                    </p>
                 </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="flex gap-4 md:gap-6">
            <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg">
              4
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-indigo-500" />
                Export
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Once satisfied, click <strong>Export Results</strong> to download a CSV containing your final bracket assignments and any remaining outliers.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};