import React, { useState, useEffect } from 'react';
import { Competitor, Bracket, Discipline } from '../types';
import { ArrowLeft, Mail, Phone, Save, MapPin, User, FileText, Scale, Calendar, Award, Shield, Copy } from 'lucide-react';

interface CompetitorDetailViewProps {
  competitor: Competitor;
  currentBracket?: Bracket; // Optional: show which bracket they are in
  onBack: () => void;
  onSave: (id: string, updates: Partial<Competitor>) => void;
  onClone: (id: string) => void;
}

export const CompetitorDetailView: React.FC<CompetitorDetailViewProps> = ({
  competitor,
  currentBracket,
  onBack,
  onSave,
  onClone
}) => {
  const [notes, setNotes] = useState(competitor.notes || '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(competitor.notes || '');
    setIsDirty(false);
  }, [competitor]);

  const handleSave = () => {
    onSave(competitor.id, { notes });
    setIsDirty(false);
  };

  const isGi = competitor.discipline === Discipline.GI;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-3 mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                    isGi ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-white border-slate-900'
                }`}>
                    {competitor.discipline}
                </span>
             </div>
             <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{competitor.name}</h2>
             <div className="flex items-center gap-2 text-slate-600 mt-1">
                <MapPin size={16} />
                <span className="font-medium">{competitor.academy}</span>
             </div>
          </div>
          
          <div className="flex gap-2">
              <button 
                onClick={() => onClone(competitor.id)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors text-sm font-medium"
                title="Create a duplicate of this competitor to place in another bracket"
              >
                  <Copy size={16} />
                  Duplicate
              </button>
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                <div className={`w-3 h-3 rounded-full ${currentBracket ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-slate-700">
                {currentBracket ? 'Placed' : 'Outlier'}
                </span>
              </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Vitals Card */}
          <div className="space-y-6">
             <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User size={16} /> Athlete Profile
                </h3>
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Belt Rank</label>
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                           <Award className="text-slate-400" size={20} />
                           {competitor.belt}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Gender</label>
                        <div className="text-lg font-semibold text-slate-800">{competitor.gender}</div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Weight</label>
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                           <Scale className="text-slate-400" size={20} />
                           {competitor.weight} <span className="text-sm font-normal text-slate-500">lbs</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Age</label>
                        <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                           <Calendar className="text-slate-400" size={20} />
                           {competitor.age} <span className="text-sm font-normal text-slate-500">years</span>
                        </div>
                    </div>
                </div>
             </section>

             <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Mail size={16} /> Contact Info
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Email Address</label>
                        <div className="flex items-center gap-2 text-slate-800 font-medium break-all">
                             <Mail size={16} className="text-slate-400 shrink-0" />
                             {competitor.email || <span className="text-slate-400 italic">Not provided</span>}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Phone Number</label>
                         <div className="flex items-center gap-2 text-slate-800 font-medium">
                             <Phone size={16} className="text-slate-400 shrink-0" />
                             {competitor.phone || <span className="text-slate-400 italic">Not provided</span>}
                        </div>
                    </div>
                </div>
             </section>
          </div>

          {/* Placement & Notes */}
          <div className="space-y-6">
             {currentBracket && (
                 <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">Current Placement</h3>
                    <div className="text-lg font-bold text-slate-800 mb-1">{currentBracket.name}</div>
                    <p className="text-sm text-slate-600">
                        Competing against {currentBracket.competitors.length - 1} other athletes.
                    </p>
                 </section>
             )}

             <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText size={16} /> Internal Notes
                </h3>
                <textarea 
                    className="flex-1 w-full border border-slate-200 rounded-lg p-3 text-sm bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[150px]"
                    placeholder="Add medical notes, schedule requests, or other details here..."
                    value={notes}
                    onChange={(e) => {
                        setNotes(e.target.value);
                        setIsDirty(true);
                    }}
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                            ${isDirty 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <Save size={18} />
                        Save Notes
                    </button>
                </div>
             </section>
          </div>

        </div>
      </div>
    </div>
  );
};