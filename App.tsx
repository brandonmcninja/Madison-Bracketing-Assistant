import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BracketDisplay } from './components/BracketDisplay';
import { OutlierList } from './components/OutlierList';
import { SingleBracketView } from './components/SingleBracketView';
import { AppSettings, Competitor, ProcessingResult, Gender, Belt } from './types';
import { generateDummyData } from './utils/generator';
import { processCompetitors, recalculateBracketStats } from './utils/logic';
import { Users, Layers, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  // Track who is currently being dragged for validation
  const [draggedCompetitor, setDraggedCompetitor] = useState<Competitor | null>(null);

  // Navigation State
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);

  // Updated defaults with split logic
  const [settings, setSettings] = useState<AppSettings>({
    targetBracketSize: 4,
    // Kids: Strict defaults
    kidsMaxWeightDiffPercent: 15,
    kidsMaxAgeGap: 3,
    // Adults: Loose defaults
    adultsMaxWeightDiffPercent: 20,
    adultsIgnoreAgeGap: true,
    adultsCombineBrownBlack: true,
    adultsCombineWhiteBlue: false,
  });
  
  const [results, setResults] = useState<ProcessingResult>({ validBrackets: [], outliers: [] });

  // Auto-process when data or settings change
  useEffect(() => {
    // Only auto-process if we haven't manually modified brackets (simple check: if brackets exist, maybe don't overwrite?)
    // For this specific app flow request, let's keep it simple: sliders regenerate everything.
    // Moving manual changes means subsequent slider moves MIGHT reset. This is standard for simple tools.
    if (competitors.length > 0) {
      const res = processCompetitors(competitors, settings);
      setResults(res);
      // If the selected bracket disappears (e.g. regeneration), clear selection
      if (selectedBracketId && !res.validBrackets.find(b => b.id === selectedBracketId)) {
        setSelectedBracketId(null);
      }
    } else {
      setResults({ validBrackets: [], outliers: [] });
    }
  }, [competitors, settings]);

  const handleGenerate = () => {
    const data = generateDummyData(100);
    setCompetitors(data);
    setSelectedBracketId(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const parsed: Competitor[] = [];
      
      // Simple CSV parser assuming specific order or headers
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Naive split by comma
        const cols = line.split(',');
        if (cols.length >= 6) {
           // Mapping: Name, Academy, Gender, Age, Weight, Belt
           parsed.push({
             id: `upload-${i}`,
             name: cols[0].trim(),
             academy: cols[1].trim(),
             gender: cols[2].trim() as Gender,
             age: parseInt(cols[3].trim()) || 25,
             weight: parseFloat(cols[4].trim()) || 70,
             belt: cols[5].trim() as Belt
           });
        }
      }
      setCompetitors(parsed);
      setSelectedBracketId(null);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Bracket Name,Competitor Name,Academy,Gender,Age,Weight,Belt\n";

    results.validBrackets.forEach(b => {
      b.competitors.forEach(c => {
        csvContent += `${b.name},${c.name},${c.academy},${c.gender},${c.age},${c.weight},${c.belt}\n`;
      });
    });

    results.outliers.forEach(c => {
      csvContent += `OUTLIER,${c.name},${c.academy},${c.gender},${c.age},${c.weight},${c.belt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "madison_brackets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Drag and Drop Handler
  const handleMoveCompetitor = (competitorId: string, targetBracketId: string | null) => {
    const newResults = { ...results };
    let competitor: Competitor | undefined;
    
    // 1. Find and Remove Competitor from Source
    
    // Check in Outliers
    const outlierIndex = newResults.outliers.findIndex(c => c.id === competitorId);
    if (outlierIndex !== -1) {
      competitor = newResults.outliers[outlierIndex];
      newResults.outliers.splice(outlierIndex, 1);
    } else {
      // Check in Brackets
      for (const bracket of newResults.validBrackets) {
        const compIndex = bracket.competitors.findIndex(c => c.id === competitorId);
        if (compIndex !== -1) {
          competitor = bracket.competitors[compIndex];
          bracket.competitors.splice(compIndex, 1);
          // Recalculate stats for source bracket
          Object.assign(bracket, recalculateBracketStats(bracket));
          break; 
        }
      }
    }

    if (!competitor) return; // Should not happen
    
    // Reset dragged state
    setDraggedCompetitor(null);

    // 2. Add to Target
    if (targetBracketId === 'outliers' || targetBracketId === null) {
      newResults.outliers.push(competitor);
    } else {
      const targetBracket = newResults.validBrackets.find(b => b.id === targetBracketId);
      if (targetBracket) {
        targetBracket.competitors.push(competitor);
        // Recalculate stats for target bracket
        Object.assign(targetBracket, recalculateBracketStats(targetBracket));
      } else {
        // Fallback if bracket not found
        newResults.outliers.push(competitor);
      }
    }

    setResults(newResults);
  };

  const handleRenameBracket = (id: string, newName: string) => {
    const newResults = { ...results };
    const bracket = newResults.validBrackets.find(b => b.id === id);
    if (bracket) {
      bracket.name = newName;
      setResults(newResults);
    }
  };

  const selectedBracket = results.validBrackets.find(b => b.id === selectedBracketId);

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        onUpload={handleUpload}
        onGenerate={handleGenerate}
        onExport={handleExport}
      />
      
      <main className="flex-1 flex flex-col h-full relative">
        {/* Top Bar Stats */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Tournament Dashboard</h2>
            <p className="text-sm text-slate-500 hidden md:block">
              Drag and drop competitors to adjust brackets manually.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
               <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                 <Users size={18} />
               </div>
               <div className="hidden sm:block">
                 <p className="text-xs text-blue-600 font-semibold uppercase">Total</p>
                 <p className="text-lg font-bold text-blue-900">{competitors.length}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-100">
               <div className="p-2 bg-green-100 rounded-full text-green-600">
                 <Layers size={18} />
               </div>
               <div className="hidden sm:block">
                 <p className="text-xs text-green-600 font-semibold uppercase">Brackets</p>
                 <p className="text-lg font-bold text-green-900">{results.validBrackets.length}</p>
               </div>
             </div>

             <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
               <div className="p-2 bg-red-100 rounded-full text-red-600">
                 <AlertCircle size={18} />
               </div>
               <div className="hidden sm:block">
                 <p className="text-xs text-red-600 font-semibold uppercase">Outliers</p>
                 <p className="text-lg font-bold text-red-900">{results.outliers.length}</p>
               </div>
             </div>
          </div>
        </header>

        {/* Split View Content Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Center: Brackets or Single View (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-100/50 relative">
                {selectedBracket ? (
                    <SingleBracketView 
                      bracket={selectedBracket}
                      onBack={() => setSelectedBracketId(null)}
                      onMoveCompetitor={handleMoveCompetitor}
                      onRenameBracket={handleRenameBracket}
                      draggedCompetitor={draggedCompetitor}
                      setDraggedCompetitor={setDraggedCompetitor}
                    />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Layers size={20} />
                            Active Brackets
                        </h3>
                        <div className="text-xs text-slate-400">
                            {results.validBrackets.length === 0 && competitors.length > 0 && "No valid brackets. Check settings or outliers."}
                        </div>
                    </div>
                    <BracketDisplay 
                        brackets={results.validBrackets} 
                        onMoveCompetitor={handleMoveCompetitor}
                        onSelectBracket={setSelectedBracketId}
                        draggedCompetitor={draggedCompetitor}
                        setDraggedCompetitor={setDraggedCompetitor}
                    />
                  </>
                )}
            </div>

            {/* Right: Outliers (Fixed Width) */}
            <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-xl z-20">
                <div className="p-4 border-b border-slate-100 bg-red-50/50">
                   <h3 className="font-bold text-red-800 flex items-center gap-2">
                        <AlertCircle size={20} />
                        Outliers
                    </h3>
                    <p className="text-xs text-red-600 mt-1">
                        Unmatched athletes. Drag to a bracket or use AI.
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <OutlierList 
                        outliers={results.outliers} 
                        onMoveCompetitor={handleMoveCompetitor}
                        setDraggedCompetitor={setDraggedCompetitor}
                    />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;
