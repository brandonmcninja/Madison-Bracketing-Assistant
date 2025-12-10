import React from 'react';
import { Upload, Download, Baby, User, X, HelpCircle } from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  onUpload,
  onExport,
  isOpen,
  onClose,
  onOpenHelp
}) => {
  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:shadow-none md:h-full md:flex md:flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-blue-600 text-white p-1 rounded">MA</span> Automator
            </h1>
            <p className="text-slate-500 text-sm mt-1">Madison Bracketing System</p>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 px-6 space-y-8 pb-8 overflow-y-auto">
          {/* Input Section */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Data Source</h3>
            <div className="space-y-3">
              <div className="relative group">
                <input
                  type="file"
                  accept=".csv"
                  onChange={onUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 group-hover:border-blue-400 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-all border border-slate-300 border-dashed">
                  <Upload size={18} />
                  Upload CSV
                </button>
              </div>
            </div>
          </section>

          {/* Global Settings */}
          <section>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Global Preference</h3>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700">Target Bracket Size</label>
                <span className="text-sm font-bold text-blue-600">{settings.targetBracketSize}</span>
              </div>
              <div className="flex gap-2">
                {[3, 4, 5].map(size => (
                  <button
                    key={size}
                    onClick={() => setSettings({ ...settings, targetBracketSize: size })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md border transition-colors ${
                      settings.targetBracketSize === size
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                Max 5. Prioritizes full brackets.
              </p>
            </div>
          </section>

          {/* Advanced Weight Rules */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-200">
             <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-3">Advanced Weight Rules</h3>
             <div className="space-y-4">
               <div>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-slate-700">Max Weight Cap (Lbs)</label>
                    <span className="text-xs font-bold text-slate-900">{settings.maxWeightDiffLbs} lbs</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={settings.maxWeightDiffLbs}
                    onChange={(e) => setSettings({ ...settings, maxWeightDiffLbs: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-slate-600"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Hard limit. Overrides % if exceeded (e.g. 10% allowed, but max {settings.maxWeightDiffLbs}lbs).
                  </p>
               </div>
               
               <div className="flex items-start gap-2 pt-2 border-t border-slate-200">
                  <input 
                    type="checkbox"
                    id="ultraHeavy"
                    checked={settings.ultraHeavyIgnore}
                    onChange={(e) => setSettings({...settings, ultraHeavyIgnore: e.target.checked})}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="ultraHeavy" className="text-xs text-slate-700 leading-tight">
                    Ultra Heavy (225+) Open
                    <span className="block text-[10px] text-slate-400 font-normal">Ignore weight cap for 225+ lbs</span>
                  </label>
                </div>
             </div>
          </section>

          {/* Kids Settings */}
          <section className="bg-orange-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3 text-orange-800">
               <Baby size={18} />
               <h3 className="text-sm font-bold uppercase tracking-wide">Kids Rules (&lt;16)</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Max Weight Diff (%)</label>
                  <span className="text-xs font-bold text-orange-600">{settings.kidsMaxWeightDiffPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={settings.kidsMaxWeightDiffPercent}
                  onChange={(e) => setSettings({ ...settings, kidsMaxWeightDiffPercent: Number(e.target.value) })}
                  className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                  Strictly bucketed into <strong>8U</strong> (Coed), <strong>9-12</strong> (Coed), and <strong>13-15</strong> (Gender Separated).
              </p>
            </div>
          </section>

          {/* Adult Settings */}
          <section className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
            <div className="flex items-center gap-2 mb-3 text-indigo-800">
               <User size={18} />
               <h3 className="text-sm font-bold uppercase tracking-wide">Adult Rules (16+)</h3>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Max Weight Diff (%)</label>
                  <span className="text-xs font-bold text-indigo-600">{settings.adultsMaxWeightDiffPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.adultsMaxWeightDiffPercent}
                  onChange={(e) => setSettings({ ...settings, adultsMaxWeightDiffPercent: Number(e.target.value) })}
                  className="w-full h-1.5 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="flex items-start gap-2">
                <input 
                  type="checkbox"
                  id="ignoreAge"
                  checked={settings.adultsIgnoreAgeGap}
                  onChange={(e) => setSettings({...settings, adultsIgnoreAgeGap: e.target.checked})}
                  className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="ignoreAge" className="text-xs text-slate-700 leading-tight">
                  Ignore Age Gap (Allow any 16+ mix)
                </label>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                <strong>13-15</strong> year olds can be manually bumped up to Adult.
              </p>
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
           <button
              onClick={onOpenHelp}
              className="w-full flex items-center justify-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-colors shadow-sm text-sm"
            >
              <HelpCircle size={18} />
              How to Use
            </button>
           <button
              onClick={onExport}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
            >
              <Download size={18} />
              Export Results
            </button>
        </div>
      </div>
    </>
  );
};