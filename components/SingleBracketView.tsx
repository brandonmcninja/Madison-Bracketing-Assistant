import React, { useState } from 'react';
import { Bracket, Competitor, Gender } from '../types';
import { ArrowLeft, User, Weight, Calendar, AlertTriangle, Edit2, Check, X } from 'lucide-react';
import { ADULT_AGE_THRESHOLD } from '../utils/logic';

interface SingleBracketViewProps {
  bracket: Bracket;
  onBack: () => void;
  onMoveCompetitor: (competitorId: string, targetBracketId: string) => void;
  onRenameBracket: (id: string, newName: string) => void;
  draggedCompetitor: Competitor | null;
  setDraggedCompetitor: (c: Competitor | null) => void;
}

export const SingleBracketView: React.FC<SingleBracketViewProps> = ({
  bracket,
  onBack,
  onMoveCompetitor,
  onRenameBracket,
  draggedCompetitor,
  setDraggedCompetitor
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(bracket.name);
  const [isDragOver, setIsDragOver] = useState(false);

  // Validation Logic (Duplicated from BracketDisplay for consistency)
  const isDropValid = (competitor: Competitor): boolean => {
    let bracketGender: Gender;
    let isBracketAdult: boolean;

    if (bracket.competitors.length > 0) {
        bracketGender = bracket.competitors[0].gender;
        isBracketAdult = bracket.competitors[0].age >= ADULT_AGE_THRESHOLD;
    } else {
        bracketGender = bracket.name.includes('Female') ? Gender.FEMALE : Gender.MALE;
        isBracketAdult = bracket.name.includes('(Adult)');
    }

    const isCompetitorAdult = competitor.age >= ADULT_AGE_THRESHOLD;

    if (competitor.gender !== bracketGender) return false;
    if (competitor.age < ADULT_AGE_THRESHOLD && isBracketAdult) return false;
    if (competitor.age >= ADULT_AGE_THRESHOLD && !isBracketAdult) return false;

    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (draggedCompetitor && !isDropValid(draggedCompetitor)) return;
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const competitorId = e.dataTransfer.getData("text/plain");
    if (competitorId) {
      onMoveCompetitor(competitorId, bracket.id);
    }
  };

  const handleDragStart = (e: React.DragEvent, competitor: Competitor) => {
    setDraggedCompetitor(competitor);
    e.dataTransfer.setData("text/plain", competitor.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const saveName = () => {
    onRenameBracket(bracket.id, tempName);
    setIsEditingName(false);
  };

  const isWeightWarning = bracket.maxWeightDiffPerc > 20;
  const isAgeWarning = bracket.maxAgeGap > 10;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-4 text-sm font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-xl font-bold text-slate-800"
                  autoFocus
                />
                <button onClick={saveName} className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"><Check size={18} /></button>
                <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200"><X size={18} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group">
                <h2 className="text-2xl font-bold text-slate-800">{bracket.name}</h2>
                <button 
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <div className={`flex flex-col items-end ${isWeightWarning ? 'text-orange-600' : 'text-slate-600'}`}>
               <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Weight Spread</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold">
                 {isWeightWarning && <AlertTriangle size={16} />}
                 {bracket.maxWeightDiffPerc.toFixed(1)}%
               </div>
            </div>
            <div className={`flex flex-col items-end ${isAgeWarning ? 'text-orange-600' : 'text-slate-600'}`}>
               <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Age Gap</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold">
                 {isAgeWarning && <AlertTriangle size={16} />}
                 {bracket.maxAgeGap}y
               </div>
            </div>
            <div className="flex flex-col items-end text-blue-600">
               <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Fighters</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold">
                 <User size={18} />
                 {bracket.competitors.length}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drop Zone Area */}
      <div 
        className={`flex-1 overflow-y-auto p-6 transition-colors ${isDragOver ? 'bg-blue-50 ring-inset ring-4 ring-blue-200' : 'bg-white'}`}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <table className="w-full">
            <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                <tr>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seed</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Academy</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {bracket.competitors.map((c, index) => (
                    <tr 
                        key={c.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, c)}
                        onDragEnd={() => setDraggedCompetitor(null)}
                        className="hover:bg-slate-50 cursor-grab active:cursor-grabbing group transition-colors"
                    >
                        <td className="py-4 px-4 text-slate-400 font-mono text-sm">#{index + 1}</td>
                        <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800">{c.name}</div>
                            <div className="text-xs text-slate-500 md:hidden">{c.academy}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-600 hidden md:table-cell">{c.academy}</td>
                        <td className="py-4 px-4 text-right text-slate-700 font-mono">{c.age}</td>
                        <td className="py-4 px-4 text-right text-slate-800 font-mono font-medium">{c.weight} lbs</td>
                    </tr>
                ))}
                {bracket.competitors.length === 0 && (
                    <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center gap-2">
                                <User size={32} className="opacity-20" />
                                <p>This bracket is empty.</p>
                                <p className="text-xs">Drag competitors from the Outliers list to add them.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
