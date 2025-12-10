import React, { useState, useEffect } from 'react';
import { Bracket, Competitor, Gender, Discipline } from '../types';
import { ArrowLeft, User, Weight, Calendar, AlertTriangle, Edit2, Check, X, Shield, GripVertical, Eye } from 'lucide-react';
import { ADULT_AGE_THRESHOLD } from '../utils/logic';

interface SingleBracketViewProps {
  bracket: Bracket;
  onBack: () => void;
  onMoveCompetitor: (competitorId: string, targetBracketId: string) => void;
  onRenameBracket: (id: string, newName: string) => void;
  draggedCompetitor: Competitor | null;
  setDraggedCompetitor: (c: Competitor | null) => void;
  onSelectCompetitor: (competitorId: string) => void;
}

export const SingleBracketView: React.FC<SingleBracketViewProps> = ({
  bracket,
  onBack,
  onMoveCompetitor,
  onRenameBracket,
  draggedCompetitor,
  setDraggedCompetitor,
  onSelectCompetitor
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(bracket.name);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync temp name if bracket changes externally
  useEffect(() => {
    setTempName(bracket.name);
  }, [bracket.name]);

  const isDropValid = (competitor: Competitor): boolean => {
    // Discipline Check
    if (competitor.discipline !== bracket.discipline) return false;

    // Gender/Age checks based on division name logic derived from new logic.ts
    const isAdultDivision = bracket.division.includes('Adult') || bracket.division.includes('Masters');
    
    // Logic Update: Allow 13+ to bump up to Adult
    if (isAdultDivision) {
        if (competitor.age < 13) return false; 
    }
    
    // Gender check
    if (bracket.division.includes('Male') || bracket.division.includes('Female')) {
        const bracketGender = bracket.division.includes('Female') ? Gender.FEMALE : Gender.MALE;
        if (competitor.gender !== bracketGender) return false;
    }

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
    if (tempName.trim()) {
        onRenameBracket(bracket.id, tempName);
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        saveName();
    } else if (e.key === 'Escape') {
        setTempName(bracket.name);
        setIsEditingName(false);
    }
  };

  const isWeightWarning = bracket.maxWeightDiffPerc > 20;
  const isAgeWarning = bracket.maxAgeGap > 10;
  const isGi = bracket.discipline === Discipline.GI;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
            <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium"
            >
            <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <span className={`text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                isGi ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-900 text-white border-slate-900'
            }`}>
                {bracket.discipline}
            </span>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3 min-h-[40px]">
            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1 animate-in fade-in duration-200">
                <input 
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-3 py-1 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-xl md:text-2xl font-bold text-slate-800 bg-white"
                  autoFocus
                />
                <button onClick={saveName} className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 shrink-0" title="Save">
                    <Check size={20} />
                </button>
                <button 
                    onClick={() => {
                        setTempName(bracket.name);
                        setIsEditingName(false);
                    }} 
                    className="p-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 shrink-0" 
                    title="Cancel"
                >
                    <X size={20} />
                </button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-3 group flex-1 cursor-pointer"
                onClick={() => setIsEditingName(true)}
                title="Click to rename bracket"
              >
                <h2 className="text-xl md:text-2xl font-bold text-slate-800 break-words leading-tight hover:text-blue-600 transition-colors border border-transparent px-1 -ml-1 rounded">
                    {bracket.name}
                </h2>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 md:gap-8 pt-2">
            <div className={`flex flex-col ${isWeightWarning ? 'text-orange-600' : 'text-slate-600'}`}>
               <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider opacity-70">Spread</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold leading-none">
                 {isWeightWarning && <AlertTriangle size={14} />}
                 {bracket.maxWeightDiffPerc.toFixed(1)}%
               </div>
            </div>
            <div className={`flex flex-col ${isAgeWarning ? 'text-orange-600' : 'text-slate-600'}`}>
               <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider opacity-70">Age Gap</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold leading-none">
                 {isAgeWarning && <AlertTriangle size={14} />}
                 {bracket.maxAgeGap}y
               </div>
            </div>
            <div className="flex flex-col text-blue-600">
               <span className="text-[10px] md:text-xs font-semibold uppercase tracking-wider opacity-70">Fighters</span>
               <div className="flex items-center gap-1 font-mono text-lg font-bold leading-none">
                 <User size={16} />
                 {bracket.competitors.length}
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drop Zone Area - Horizontal Scroll for Mobile */}
      <div 
        className={`flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 transition-colors ${isDragOver ? 'bg-blue-50 ring-inset ring-4 ring-blue-200' : 'bg-white'}`}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <table className="w-full min-w-[600px]">
            <thead className="bg-slate-50 sticky top-0 shadow-sm z-10">
                <tr>
                    <th className="w-10 py-3 px-2 text-center"></th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seed</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Competitor</th>
                    <th className="py-3 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Academy</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Age</th>
                    <th className="py-3 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Weight</th>
                    <th className="w-16 py-3 px-2"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {bracket.competitors.map((c, index) => (
                    <tr 
                        key={c.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, c)}
                        onDragEnd={() => setDraggedCompetitor(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCompetitor(c.id);
                        }}
                        className="hover:bg-blue-50/30 cursor-pointer group transition-colors"
                        title="Click to view details, Drag to move"
                    >
                        <td className="py-4 px-2 text-center text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500" onClick={(e) => e.stopPropagation()}>
                            <GripVertical size={16} className="mx-auto" />
                        </td>
                        <td className="py-4 px-4 text-slate-400 font-mono text-sm">#{index + 1}</td>
                        <td className="py-4 px-4">
                            <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{c.name}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{c.academy}</td>
                        <td className="py-4 px-4 text-right text-slate-700 font-mono">{c.age}</td>
                        <td className="py-4 px-4 text-right text-slate-800 font-mono font-medium">{c.weight} lbs</td>
                        <td className="py-4 px-2 text-center">
                            <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="bg-white p-1.5 rounded-full border border-slate-200 text-blue-500 shadow-sm hover:bg-blue-50">
                                    <Eye size={16} />
                                </span>
                            </div>
                        </td>
                    </tr>
                ))}
                {bracket.competitors.length === 0 && (
                    <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
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