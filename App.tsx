import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { BracketDisplay } from './components/BracketDisplay';
import { OutlierList } from './components/OutlierList';
import { SingleBracketView } from './components/SingleBracketView';
import { CompetitorDetailView } from './components/CompetitorDetailView';
import { HelpModal } from './components/HelpModal';
import { AppSettings, Competitor, ProcessingResult, Gender, Belt } from './types';
import { processCompetitors, recalculateBracketStats } from './utils/logic';
import { parseCSV } from './utils/csvParser';
import { Users, Layers, AlertCircle, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  // Track who is currently being dragged for validation
  const [draggedCompetitor, setDraggedCompetitor] = useState<Competitor | null>(null);

  // Navigation State
  const [selectedBracketId, setSelectedBracketId] = useState<string | null>(null);
  const [viewingCompetitorId, setViewingCompetitorId] = useState<string | null>(null);

  // Mobile & Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'brackets' | 'outliers'>('brackets');
  
  // Help Modal State
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Updated defaults based on user feedback (10% spread preferred)
  const [settings, setSettings] = useState<AppSettings>({
    targetBracketSize: 5, // Default 5
    // Kids Rules
    kidsMaxWeightDiffPercent: 10,
    // Adults Rules
    adultsMaxWeightDiffPercent: 10,
    adultsIgnoreAgeGap: true,
    // New Weight Rules
    maxWeightDiffLbs: 13,
    ultraHeavyIgnore: true
  });
  
  const [results, setResults] = useState<ProcessingResult>({ validBrackets: [], outliers: [] });

  // Auto-process when data or settings change
  useEffect(() => {
    if (competitors.length > 0) {
      const res = processCompetitors(competitors, settings);
      setResults(res);
      // Reset selections if they disappear
      if (selectedBracketId && !res.validBrackets.find(b => b.id === selectedBracketId)) {
        setSelectedBracketId(null);
      }
    } else {
      setResults({ validBrackets: [], outliers: [] });
    }
  }, [competitors, settings]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCompetitors(parsed);
      setSelectedBracketId(null);
      setViewingCompetitorId(null);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    // Helper to escape CSV fields
    const escapeCsv = (str: string | number | undefined) => {
        if (str === undefined || str === null) return '';
        const stringValue = String(str);
        // If contains quotes, commas, or newlines, wrap in quotes and escape internal quotes
        if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('\r')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const headers = ["Bracket Name", "Competitor Name", "Academy", "Gender", "Age", "Weight", "Belt", "Phone", "Email", "Notes"];
    let csvRows = [headers.join(',')];

    results.validBrackets.forEach(b => {
      b.competitors.forEach(c => {
        const row = [
            b.name,
            c.name,
            c.academy,
            c.gender,
            c.age,
            c.weight,
            c.belt,
            c.phone,
            c.email,
            c.notes
        ].map(escapeCsv);
        csvRows.push(row.join(','));
      });
    });

    results.outliers.forEach(c => {
        const row = [
            "OUTLIER",
            c.name,
            c.academy,
            c.gender,
            c.age,
            c.weight,
            c.belt,
            c.phone,
            c.email,
            c.notes
        ].map(escapeCsv);
        csvRows.push(row.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "madison_brackets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCloneCompetitor = (originalId: string) => {
      const comp = competitors.find(c => c.id === originalId);
      if (!comp) return;

      const newId = `${comp.id}-clone-${Date.now()}`;
      const clone: Competitor = { ...comp, id: newId, name: `${comp.name} (Copy)` };
      
      const newCompetitors = [...competitors, clone];
      setCompetitors(newCompetitors); // This triggers reprocessing, clone goes to outliers usually
      setViewingCompetitorId(newId); // View the new copy
  };

  const handleMoveCompetitor = (competitorId: string, targetBracketId: string | null) => {
    const newResults = { ...results };
    let competitor: Competitor | undefined;
    
    // 1. Find and Remove source
    const outlierIndex = newResults.outliers.findIndex(c => c.id === competitorId);
    if (outlierIndex !== -1) {
      competitor = newResults.outliers[outlierIndex];
      newResults.outliers.splice(outlierIndex, 1);
    } else {
      for (const bracket of newResults.validBrackets) {
        const compIndex = bracket.competitors.findIndex(c => c.id === competitorId);
        if (compIndex !== -1) {
          competitor = bracket.competitors[compIndex];
          bracket.competitors.splice(compIndex, 1);
          Object.assign(bracket, recalculateBracketStats(bracket));
          break; 
        }
      }
    }

    if (!competitor) return; 
    setDraggedCompetitor(null);

    // 2. Add to Target
    if (targetBracketId === 'outliers' || targetBracketId === null) {
      newResults.outliers.push(competitor);
    } else if (targetBracketId === 'new-bracket') {
        // Create a new bracket
        const newBracketId = `manual-bracket-${Date.now()}`;
        newResults.validBrackets.push({
            id: newBracketId,
            name: `Manual Bracket (New)`,
            discipline: competitor.discipline,
            division: 'Custom',
            competitors: [competitor],
            avgWeight: competitor.weight,
            maxWeightDiffPerc: 0,
            maxAgeGap: 0
        });
    } else {
      const targetBracket = newResults.validBrackets.find(b => b.id === targetBracketId);
      if (targetBracket) {
        // Bump Logic: If size is 5, we must remove one to add one
        if (targetBracket.competitors.length >= 5) {
            const candidates = [...targetBracket.competitors, competitor].sort((a,b) => a.weight - b.weight);
            // We have 6 candidates. We need to keep 5.
            // Heuristic: remove either lightest or heaviest to minimize spread
            const removeLightest = candidates.slice(1, 6);
            const removeHeaviest = candidates.slice(0, 5);
            
            const spreadL = removeLightest[4].weight - removeLightest[0].weight;
            const spreadH = removeHeaviest[4].weight - removeHeaviest[0].weight;
            
            let kept: Competitor[], bumped: Competitor;
            if (spreadL < spreadH) {
                kept = removeLightest;
                bumped = candidates[0]; // Lightest kicked out
            } else {
                kept = removeHeaviest;
                bumped = candidates[5]; // Heaviest kicked out
            }
            
            targetBracket.competitors = kept;
            newResults.outliers.push(bumped);
        } else {
            targetBracket.competitors.push(competitor);
        }
        Object.assign(targetBracket, recalculateBracketStats(targetBracket));
      } else {
        newResults.outliers.push(competitor);
      }
    }

    setResults(newResults);
  };

  const handleRenameBracket = (id: string, newName: string) => {
    setResults(prev => ({
        ...prev,
        validBrackets: prev.validBrackets.map(b => 
            b.id === id ? { ...b, name: newName } : b
        )
    }));
  };

  const handleUpdateCompetitor = (id: string, updates: Partial<Competitor>) => {
      const newCompetitors = competitors.map(c => c.id === id ? { ...c, ...updates } : c);
      setCompetitors(newCompetitors);
  };

  const selectedBracket = results.validBrackets.find(b => b.id === selectedBracketId);
  const viewingCompetitor = viewingCompetitorId 
    ? (results.validBrackets.flatMap(b => b.competitors).find(c => c.id === viewingCompetitorId) || results.outliers.find(c => c.id === viewingCompetitorId))
    : null;

  const getBracketForCompetitor = (compId: string) => results.validBrackets.find(b => b.competitors.some(c => c.id === compId));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        onUpload={handleUpload}
        onExport={handleExport}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <main className="flex-1 flex flex-col h-full relative w-full">
        {/* Top Bar Stats */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 flex justify-between items-center shadow-sm z-10 shrink-0 gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">Dashboard</h2>
              <p className="text-xs md:text-sm text-slate-500 hidden md:block truncate">
                Drag and drop competitors to adjust brackets manually.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar py-1 pl-1">
             <div className="flex items-center gap-2 md:gap-3 bg-blue-50 px-3 py-1.5 md:py-2 rounded-lg border border-blue-100 shrink-0">
               <div className="p-1.5 md:p-2 bg-blue-100 rounded-full text-blue-600">
                 <Users size={14} className="md:w-[18px] md:h-[18px]" />
               </div>
               <div>
                 <p className="text-[10px] md:text-xs text-blue-600 font-semibold uppercase hidden sm:block">Total</p>
                 <p className="text-sm md:text-lg font-bold text-blue-900 leading-none">{competitors.length}</p>
               </div>
             </div>
             
             <div className="flex items-center gap-2 md:gap-3 bg-green-50 px-3 py-1.5 md:py-2 rounded-lg border border-green-100 shrink-0">
               <div className="p-1.5 md:p-2 bg-green-100 rounded-full text-green-600">
                 <Layers size={14} className="md:w-[18px] md:h-[18px]" />
               </div>
               <div>
                 <p className="text-[10px] md:text-xs text-green-600 font-semibold uppercase hidden sm:block">Brackets</p>
                 <p className="text-sm md:text-lg font-bold text-green-900 leading-none">{results.validBrackets.length}</p>
               </div>
             </div>

             <div className="flex items-center gap-2 md:gap-3 bg-red-50 px-3 py-1.5 md:py-2 rounded-lg border border-red-100 shrink-0">
               <div className="p-1.5 md:p-2 bg-red-100 rounded-full text-red-600">
                 <AlertCircle size={14} className="md:w-[18px] md:h-[18px]" />
               </div>
               <div>
                 <p className="text-[10px] md:text-xs text-red-600 font-semibold uppercase hidden sm:block">Outliers</p>
                 <p className="text-sm md:text-lg font-bold text-red-900 leading-none">{results.outliers.length}</p>
               </div>
             </div>
          </div>
        </header>

        {/* Mobile Tabs */}
        {!selectedBracket && !viewingCompetitor && (
          <div className="md:hidden flex border-b border-slate-200 bg-white">
            <button 
              onClick={() => setMobileTab('brackets')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mobileTab === 'brackets' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'
              }`}
            >
              <Layers size={16} /> Brackets
            </button>
            <button 
              onClick={() => setMobileTab('outliers')}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mobileTab === 'outliers' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500'
              }`}
            >
              <AlertCircle size={16} /> Outliers
            </button>
          </div>
        )}

        {/* Split View Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
            
            {/* Center: Brackets or Single View (Scrollable) */}
            <div className={`
                flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/50 relative
                ${!selectedBracket && !viewingCompetitor && mobileTab === 'outliers' ? 'hidden md:block' : 'block'}
            `}>
                {viewingCompetitor ? (
                    <CompetitorDetailView 
                        competitor={viewingCompetitor}
                        currentBracket={getBracketForCompetitor(viewingCompetitor.id)}
                        onBack={() => setViewingCompetitorId(null)}
                        onSave={handleUpdateCompetitor}
                        onClone={handleCloneCompetitor}
                    />
                ) : selectedBracket ? (
                    <SingleBracketView 
                      bracket={selectedBracket}
                      onBack={() => setSelectedBracketId(null)}
                      onMoveCompetitor={handleMoveCompetitor}
                      onRenameBracket={handleRenameBracket}
                      draggedCompetitor={draggedCompetitor}
                      setDraggedCompetitor={setDraggedCompetitor}
                      onSelectCompetitor={setViewingCompetitorId}
                    />
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Layers size={20} />
                            Active Brackets
                        </h3>
                        <div className="text-xs text-slate-400">
                            {results.validBrackets.length === 0 && competitors.length > 0 && "No brackets generated."}
                        </div>
                    </div>
                    <BracketDisplay 
                        brackets={results.validBrackets} 
                        onMoveCompetitor={handleMoveCompetitor}
                        onSelectBracket={setSelectedBracketId}
                        draggedCompetitor={draggedCompetitor}
                        setDraggedCompetitor={setDraggedCompetitor}
                        onSelectCompetitor={setViewingCompetitorId}
                    />
                  </>
                )}
            </div>

            {/* Right: Outliers (Sidebar on Desktop, Tab on Mobile) */}
            <div className={`
                w-full md:w-80 border-l border-slate-200 bg-white flex flex-col shadow-xl z-20 absolute md:static inset-0
                ${!selectedBracket && !viewingCompetitor && mobileTab === 'outliers' ? 'block' : 'hidden md:flex'}
            `}>
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
                        onSelectCompetitor={setViewingCompetitorId}
                    />
                </div>
            </div>

        </div>
      </main>
    </div>
  );
};

export default App;