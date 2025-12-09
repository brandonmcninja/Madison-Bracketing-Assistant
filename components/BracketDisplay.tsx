import React, { useState } from 'react';
import { Bracket, Competitor, Gender } from '../types';
import { User, Weight, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';
import { ADULT_AGE_THRESHOLD } from '../utils/logic';

interface BracketDisplayProps {
  brackets: Bracket[];
  onMoveCompetitor: (competitorId: string, targetBracketId: string) => void;
  onSelectBracket: (bracketId: string) => void;
  draggedCompetitor: Competitor | null;
  setDraggedCompetitor: (c: Competitor | null) => void;
}

export const BracketDisplay: React.FC<BracketDisplayProps> = ({ 
  brackets, 
  onMoveCompetitor,
  onSelectBracket,
  draggedCompetitor,
  setDraggedCompetitor
}) => {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Validation logic to check if drag drop is allowed
  const isDropValid = (bracket: Bracket, competitor: Competitor): boolean => {
    // 1. Determine Bracket Type
    let bracketGender: Gender;
    let isBracketAdult: boolean;

    if (bracket.competitors.length > 0) {
        bracketGender = bracket.competitors[0].gender;
        isBracketAdult = bracket.competitors[0].age >= ADULT_AGE_THRESHOLD;
    } else {
        // Fallback parsing if bracket is empty
        bracketGender = bracket.name.includes('Female') ? Gender.FEMALE : Gender.MALE;
        isBracketAdult = bracket.name.includes('(Adult)');
    }

    const isCompetitorAdult = competitor.age >= ADULT_AGE_THRESHOLD;

    // Check Gender
    if (competitor.gender !== bracketGender) return false;

    // Check Age Category (Kid vs Adult)
    if (competitor.age < ADULT_AGE_THRESHOLD && isBracketAdult) return false;
    if (competitor.age >= ADULT_AGE_THRESHOLD && !isBracketAdult) return false;

    return true;
  };

  const handleDragOver = (e: React.DragEvent, bracket: Bracket) => {
    // If we know who is dragging, check validity
    if (draggedCompetitor && !isDropValid(bracket, draggedCompetitor)) {
        // Do NOT call preventDefault(), effectively disabling the drop
        return; 
    }

    e.preventDefault(); // Allows dropping
    setDragOverId(bracket.id);
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
    e.stopPropagation(); // Stop click from firing on card
    setDraggedCompetitor(competitor);
    e.dataTransfer.setData("text/plain", competitor.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
      setDraggedCompetitor(null);
      setDragOverId(null);
  };

  if (brackets.length === 0) {
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
        // Validation Warnings
        const isWeightWarning = bracket.maxWeightDiffPerc > 20; // Hardcoded visual warning threshold
        const isAgeWarning = bracket.maxAgeGap > 10;
        
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
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors">
              <h3 className="font-semibold text-slate-700 text-sm truncate max-w-[70%]" title={bracket.name}>{bracket.name}</h3>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                {bracket.competitors.length} Fighters
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
                      className="group/row cursor-grab active:cursor-grabbing hover:bg-slate-50 transition-colors relative"
                    >
                      <td className="py-2 pr-2">
                        <div className="font-medium text-slate-800">{c.name}</div>
                        <div className="text-xs text-slate-500 truncate">{c.academy} - {c.belt}</div>
                      </td>
                      <td className="py-2 text-right text-slate-600">{c.age}</td>
                      <td className="py-2 text-right font-mono text-slate-700">{c.weight}</td>
                    </tr>
                  ))}
                  {bracket.competitors.length === 0 && (
                     <tr>
                         <td colSpan={3} className="py-8 text-center text-xs text-slate-400 italic dashed border-2 border-slate-100 rounded m-2">
                             Drag competitors here
                         </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-between text-xs text-slate-500 rounded-b-xl group-hover:bg-blue-50/30 transition-colors">
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
    </div>
  );
};
