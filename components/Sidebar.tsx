import React from 'react';
import { Upload, Users, Download, Info, Baby, User } from 'lucide-react';
import { AppSettings } from '../types';

interface SidebarProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  onExport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  settings,
  setSettings,
  onUpload,
  onGenerate,
  onExport
}) => {
  return (
    <div className="w-full md:w-80 bg-white border-r border-slate-200 h-full flex flex-col overflow-y-auto shadow-xl z-20">
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-blue-600 text-white p-1 rounded">MA</span> Automator
        </h1>
        <p className="text-slate-500 text-sm mt-1">Madison Bracketing System</p>
      </div>

      <div className="flex-1 px-6 space-y-8 pb-8">
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
            <button
              onClick={onGenerate}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              <Users size={18} />
              Generate Dummy Data
            </button>
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
              System optimizes for this size but adapts to minimize outliers.
            </p>
          </div>
        </section>

        {/* Kids Settings */}
        <section className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-3 text-orange-800">
             <Baby size={18} />
             <h3 className="text-sm font-bold uppercase tracking-wide">Kids Rules (&lt;18)</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Max Weight Diff</label>
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

            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Max Age Gap</label>
                <span className="text-xs font-bold text-orange-600">{settings.kidsMaxAgeGap} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={settings.kidsMaxAgeGap}
                onChange={(e) => setSettings({ ...settings, kidsMaxAgeGap: Number(e.target.value) })}
                className="w-full h-1.5 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Strict age matching for safety.</p>
            </div>
          </div>
        </section>

        {/* Adult Settings */}
        <section className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
          <div className="flex items-center gap-2 mb-3 text-indigo-800">
             <User size={18} />
             <h3 className="text-sm font-bold uppercase tracking-wide">Adult Rules (18+)</h3>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Max Weight Diff</label>
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
                Ignore Age Gap (Allow any 18+ mix)
              </label>
            </div>

            <div className="pt-2 border-t border-indigo-200">
              <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2">Belt Merging</p>
              
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox"
                    id="mergeBrownBlack"
                    checked={settings.adultsCombineBrownBlack}
                    onChange={(e) => setSettings({...settings, adultsCombineBrownBlack: e.target.checked})}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="mergeBrownBlack" className="text-xs text-slate-700 leading-tight">
                    Combine <span className="font-bold text-slate-800">Brown & Black</span>
                  </label>
                </div>
                <div className="flex items-start gap-2">
                  <input 
                    type="checkbox"
                    id="mergeWhiteBlue"
                    checked={settings.adultsCombineWhiteBlue}
                    onChange={(e) => setSettings({...settings, adultsCombineWhiteBlue: e.target.checked})}
                    className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="mergeWhiteBlue" className="text-xs text-slate-700 leading-tight">
                    Combine <span className="font-bold text-slate-800">White & Blue</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>

      <div className="p-6 border-t border-slate-200 bg-slate-50">
         <button
            onClick={onExport}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Download size={18} />
            Export Results
          </button>
      </div>
    </div>
  );
};