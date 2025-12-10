import React, { useState, useEffect } from 'react';
import { Competitor, Bracket, Discipline, Belt, Gender } from '../types';
import { ArrowLeft, Mail, Phone, Save, MapPin, User, FileText, Scale, Calendar, Award, Shield, Copy, RefreshCw } from 'lucide-react';

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
  const [weight, setWeight] = useState(competitor.weight.toString());
  const [age, setAge] = useState(competitor.age.toString());
  const [belt, setBelt] = useState<Belt>(competitor.belt);
  const [gender, setGender] = useState<Gender>(competitor.gender);
  
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setNotes(competitor.notes || '');
    setWeight(competitor.weight.toString());
    setAge(competitor.age.toString());
    setBelt(competitor.belt);
    setGender(competitor.gender);
    setIsDirty(false);
  }, [competitor]);

  const handleSave = () => {
    const w = parseFloat(weight);
    const a = parseInt(age);
    
    onSave(competitor.id, { 
        notes, 
        weight: isNaN(w) ? 0 : w,
        age: isNaN(a) ? 0 : a,
        belt,
        gender
    });
    setIsDirty(false);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNotes(e.target.value);
      setIsDirty(true);
  };

  const handleStatChange = (
      setter: React.Dispatch<React.SetStateAction<any>>, 
      value: any
  ) => {
      setter(value);
      setIsDirty(true);
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
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <User size={16} /> Athlete Profile
                    </h3>
                    {isDirty && (
                        <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-full animate-pulse">
                            Unsaved Changes
                        </span>
                    )}
                </div>
                
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Belt Rank</label>
                        <div className="relative">
                            <Award className="absolute left-2 top-2.5 text-slate-400" size={16} />
                            <select 
                                value={belt}
                                onChange={(e) => handleStatChange(setBelt, e.target.value as Belt)}
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                {Object.values(Belt).map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Gender</label>
                        <div className="relative">
                            <select 
                                value={gender}
                                onChange={(e) => handleStatChange(setGender, e.target.value as Gender)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                            >
                                {Object.values(Gender).map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Weight (lbs)</label>
                        <div className="relative">
                            <Scale className="absolute left-2 top-2.5 text-slate-400" size={16} />
                            <input 
                                type="number" 
                                value={weight}
                                onChange={(e) => handleStatChange(setWeight, e.target.value)}
                                className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                                    parseFloat(weight) === 0 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Age</label>
                        <div className="relative">
                            <Calendar className="absolute left-2 top-2.5 text-slate-400" size={16} />
                            <input 
                                type="number" 
                                value={age}
                                onChange={(e) => handleStatChange(setAge, e.target.value)}
                                className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none ${
                                    parseInt(age) === 0 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-800'
                                }`}
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 leading-tight">
                        Updating these values will trigger a re-calculation of brackets. Fix "0" values to resolve missing data outliers.
                    </p>
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
                             {competitor.phone ? (
                                <a href={`tel:${competitor.phone.replace(/[^0-9+]/g, '')}`} className="text-blue-600 hover:underline">
                                    {competitor.phone}
                                </a>
                             ) : <span className="text-slate-400 italic">Not provided</span>}
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
                    onChange={handleNoteChange}
                />
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                            ${isDirty 
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm transform hover:-translate-y-0.5' 
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                        `}
                    >
                        <Save size={18} />
                        {isDirty ? 'Save Changes' : 'Saved'}
                    </button>
                </div>
             </section>
          </div>

        </div>
      </div>
    </div>
  );
};