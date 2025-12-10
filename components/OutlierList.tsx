import React, { useState } from 'react';
import { Competitor, Discipline } from '../types';
import { AlertCircle, Bot, Loader2, GripVertical, Phone } from 'lucide-react';
import { analyzeOutliers } from '../services/geminiService';

interface OutlierListProps {
  outliers: Competitor[];
  onMoveCompetitor: (competitorId: string, targetBracketId: string | null) => void;
  setDraggedCompetitor: (c: Competitor | null) => void;
  onSelectCompetitor: (competitorId: string) => void;
}

export const OutlierList: React.FC<OutlierListProps> = ({ 
    outliers, 
    onMoveCompetitor,
    setDraggedCompetitor,
    onSelectCompetitor
}) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeOutliers(outliers);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error running AI analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, competitor: Competitor) => {
    setDraggedCompetitor(competitor);
    e.dataTransfer.setData("text/plain", competitor.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
      setDraggedCompetitor(null);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const competitorId = e.dataTransfer.getData("text/plain");
      if (competitorId) {
          onMoveCompetitor(competitorId, 'outliers'); // Special ID for outlier list
      }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* AI Analysis Section - Compact */}
      <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1">
                <Bot size={16} /> AI Assistant
            </h3>
          </div>
          
          {!analysis && (
            <button
              onClick={handleAnalyze}
              disabled={loading || outliers.length === 0}
              className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2 px-3 rounded flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Suggest Matches"}
            </button>
          )}

          {analysis && (
            <div className="bg-white rounded p-3 border border-indigo-100 text-xs text-slate-700 whitespace-pre-wrap overflow-y-auto max-h-[200px] shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">Suggestions:</span>
                    <button onClick={() => setAnalysis(null)} className="text-indigo-500 hover:text-indigo-700">Close</button>
                </div>
              {analysis}
            </div>
          )}
      </div>

      {/* Draggable List */}
      <div 
        className={`flex-1 overflow-y-auto min-h-[200px] rounded-lg border-2 border-dashed transition-all ${
            isDragOver ? 'border-red-400 bg-red-50' : 'border-transparent'
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {outliers.length === 0 ? (
           <div className="text-center p-8 text-slate-400 text-sm italic">
               No outliers left! Great job.
           </div>
        ) : (
            <div className="space-y-2">
                {outliers.map((c) => {
                  const isGi = c.discipline === Discipline.GI;
                  return (
                  <div 
                    key={c.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, c)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCompetitor(c.id);
                    }}
                    className="bg-white p-3 rounded shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors group relative"
                  >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-medium text-sm text-slate-900">{c.name}</div>
                            <div className="text-xs text-slate-500 truncate max-w-[150px]">{c.academy}</div>
                        </div>
                        <GripVertical size={16} className="text-slate-300 group-hover:text-slate-500" />
                    </div>
                    <div className="mt-2 flex gap-2 flex-wrap items-center">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            isGi ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-white'
                        }`}>
                            {isGi ? 'GI' : 'NO GI'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{c.belt}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{c.gender}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{c.weight} lbs</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{c.age} yo</span>
                    </div>
                    {c.phone && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-400">
                            <Phone size={10} /> {c.phone}
                        </div>
                    )}
                  </div>
                )})}
            </div>
        )}
      </div>
    </div>
  );
};