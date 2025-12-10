import React, { useState } from 'react';
import { Bracket, Competitor, Gender, Discipline } from '../types';
import { User, Weight, Calendar, AlertTriangle, ChevronRight, PlusCircle } from 'lucide-react';
import { ADULT_AGE_THRESHOLD } from '../utils/logic';

interface BracketDisplayProps {
  brackets: Bracket[];
  onMoveCompetitor: (competitorId: string, targetBracketId: string) => void;
  onSelectBracket: (bracketId: string) => void;
  draggedCompetitor: Competitor | null;
  setDraggedCompetitor: (c: Competitor | null) => void;
  onSelectCompetitor: (competitorId: string) => void;
}

export const BracketDisplay: React.FC<BracketDisplayProps> = ({ 
  brackets, 
  onMoveCompetitor,
  onSelectBracket,
  draggedCompetitor,
  setDraggedCompetitor,
  onSelectCompetitor
}) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const isDropValid = (bracket: Bracket, competitor: Competitor): boolean => {
    if (competitor.discipline !== bracket.discipline) return false;
    
    // Logic update: Allow 13+ to bump up to Adult brackets
    const isAdultBracket = bracket.division.includes('Adult') || bracket.division.includes('Masters');
    
    if (isAdultBracket) {
        // Prevent very young kids (under 13) from fighting adults, but allow 13+
        if (competitor.age < 13) return false;
    } 
    
    // Gender strictness
    if (bracket.division.includes('Male') || bracket.division.includes('Female')) {
        const bracketGender = bracket.division.includes('Female') ? Gender.FEMALE : Gender.MALE;
        if (competitor.gender !== bracketGender) return false;
    }
    return true;
  };

  const handleDragOver = (e: React.DragEvent, bracket: Bracket) => {
    if (draggedCompetitor && !isDropValid(bracket, draggedCompetitor)) {
        return; 
    }
    e.preventDefault();
    setDragOverId(bracket.id);
  };

  const handleDragOverNew = (e: React.DragEvent) => {
      e.preventDefault();
      setDragOverId('new-bracket');
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, bracketId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const competitorId = e.dataTransfer.getData("text/plain");
    if (competitorId) {
      onMoveCompetitor(competitorId, bracketId);
    }
  };

  const handleDragStart = (e: React.DragEvent, competitor: Competitor) => {
    e.stopPropagation();
    setDraggedCompetitor(competitor);
    e.dataTransfer.setData("text/plain", competitor.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
      setDraggedCompetitor(null);
      setDragOverId(null);
  };

  // If no brackets and no dragging, show empty state
  if (brackets.length === 0 && !draggedCompetitor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <User size={48} className="mb-4 opacity-50" />
        <p>No valid brackets generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6 pb-20">
      {brackets.map((bracket) => {
        const isWeightWarning = bracket.maxWeightDiffPerc > 20;
        const isAgeWarning = bracket.maxAgeGap > 10;
        const isGi = bracket.discipline === Discipline.GI;
        
        return (
          <div 
            key={bracket.id} 
            onClick={() => onSelectBracket(bracket.id)}
            onDragOver={(e) => handleDragOver(e, bracket)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, bracket.id)}
            className={`bg-white rounded-xl shadow-sm border transition-all duration-200 flex flex-col cursor-pointer group hover:shadow-md ${
              dragOverId === bracket.id 
                ? 'border-blue-500 ring-2 ring-blue-200 scale-[1.02]' 
                : 'border-slate-200'
            }`}
          >
            <div className={`px-4 py-3 border-b flex justify-between items-center transition-colors ${
                isGi ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-100 border-slate-200'
            }`}>
              <div className="flex items-center gap-2 overflow-hidden">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      isGi ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-white border-slate-800'
                  }`}>
                      {isGi ? 'GI' : 'NO GI'}
                  </span>
                  <h3 className="font-semibold text-slate-800 text-sm truncate" title={bracket.name}>{bracket.name}</h3>
              </div>
              <span className="text-xs bg-white/50 text-slate-600 px-2 py-1 rounded-full font-medium border border-slate-200/50">
                {bracket.competitors.length}
              </span>
            </div>
            
            <div className="p-4 flex-1 min-h-[100px]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
                    <th className="pb-2 font-medium">Competitor</th>
                    <th className="pb-2 font-medium text-right">Age</th>
                    <th className="pb-2 font-medium text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bracket.competitors.map((c) => (
                    <tr 
                      key={c.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, c)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => {
                          e.stopPropagation();
                          onSelectCompetitor(c.id);
                      }}
                      className="group/row cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors relative"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500 truncate">{c.academy}</div>
                      </td>
                      <td className="py-2 text-right text-slate-600">{c.age}</td>
                      <td className="py-2 text-right font-mono text-slate-700">{c.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between text-xs text-slate-500 rounded-b-xl">
              <div className="flex gap-4">
                  <div className={`flex items-center gap-1 ${isWeightWarning ? 'text-orange-600 font-bold' : ''}`}>
                    {isWeightWarning ? <AlertTriangle size={12} /> : <Weight size={12} />}
                    <span>Spread: {bracket.maxWeightDiffPerc.toFixed(1)}%</span>
                  </div>
                  <div className={`flex items-center gap-1 ${isAgeWarning ? 'text-orange-600 font-bold' : ''}`}>
                    {isAgeWarning ? <AlertTriangle size={12} /> : <Calendar size={12} />}
                    <span>Gap: {bracket.maxAgeGap}y</span>
                  </div>
              </div>
              <div className="text-blue-500 font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ChevronRight size={14} />
              </div>
            </div>
          </div>
        );
      })}

      {/* Create New Bracket Zone */}
      <div 
        onDragOver={handleDragOverNew}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, 'new-bracket')}
        className={`min-h-[200px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
            dragOverId === 'new-bracket'
                ? 'border-blue-500 bg-blue-50 text-blue-600 scale-[1.02]'
                : 'border-slate-300 text-slate-400 hover:border-slate-400 hover:bg-slate-50'
        }`}
      >
          <PlusCircle size={32} className="mb-2 opacity-50" />
          <h3 className="font-bold text-sm">Create New Bracket</h3>
          <p className="text-xs mt-1 opacity-70">Drag an athlete here to start a new group</p>
      </div>
    </div>
  );
};