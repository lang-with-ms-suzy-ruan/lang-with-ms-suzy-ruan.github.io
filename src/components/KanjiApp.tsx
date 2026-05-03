import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, X, EyeOff, Eye, Search, Rocket, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VocabItem {
  word: string;
  reading: string;
  meaning: string;
  meaningVi?: string;
}

interface KanjiEntry {
  char: string;
  related: string[];
  phrases: VocabItem[];
  vocabulary: VocabItem[];
}

interface KanjiAppProps {
  onBack: () => void;
}

const VocabCard: React.FC<{
  item: VocabItem;
  id: string;
  interactive: boolean;
  revealed: Record<string, boolean>;
  onToggle: (key: string) => void;
}> = ({ item, id, interactive, revealed, onToggle }) => {
  const rKey = `${id}-r`;
  const mKey = `${id}-m`;
  const showR = !interactive || !!revealed[rKey];
  const showM = !interactive || !!revealed[mKey];
  const displayMeaning = item.meaningVi || item.meaning;

  return (
    <div className="bg-ink/[0.02] border-2 border-ink/10 rounded-2xl p-4 flex flex-col items-center gap-1.5">
      {/* Furigana — click to reveal in interactive mode */}
      <div
        className={`h-5 w-full text-center ${interactive && !showR && item.reading ? 'cursor-pointer' : ''}`}
        onClick={() => interactive && item.reading && onToggle(rKey)}
      >
        {showR && item.reading ? (
          <span className="text-[10px] font-medium text-ink/40 tracking-wide">{item.reading}</span>
        ) : interactive && item.reading && !showR ? (
          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest text-brand-primary">
            <EyeOff className="w-2.5 h-2.5" /> reading
          </span>
        ) : null}
      </div>

      {/* Word — always visible */}
      <div className="text-2xl lg:text-3xl font-black text-ink text-center leading-none" style={{ fontFamily: 'serif' }}>
        {item.word}
      </div>

      {/* Meaning — click to reveal in interactive mode */}
      <div
        className={`w-full mt-1 px-2 py-1 text-[11px] font-medium text-center rounded-lg transition-all ${
          interactive && !showM
            ? 'cursor-pointer border border-dashed border-ink/20 text-ink/30 hover:bg-brand-primary hover:text-ink hover:border-solid hover:border-brand-primary'
            : 'text-ink/50'
        }`}
        onClick={() => interactive && onToggle(mKey)}
      >
        {showM ? (
          displayMeaning || <span className="text-ink/20 italic">—</span>
        ) : (
          <span className="inline-flex items-center justify-center gap-1">
            <Eye className="w-2.5 h-2.5" /> nghĩa
          </span>
        )}
      </div>
    </div>
  );
};

export const KanjiApp: React.FC<KanjiAppProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<KanjiEntry[]>([]);
  const [selected, setSelected] = useState<KanjiEntry | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [componentFilter, setComponentFilter] = useState<string | null>(null);
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch('/media/kanji/KanjiData.json')
      .then(r => r.json())
      .then((data: KanjiEntry[]) => {
        setEntries(data);
        setSelected(data[0] ?? null);
      })
      .catch(console.error);
  }, []);

  const toggleReveal = (key: string) => {
    setRevealedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredEntries = entries.filter(e => {
    const matchesComponent = !componentFilter || e.related.includes(componentFilter);
    const q = search.trim();
    const matchesSearch = !q ||
      e.char.includes(q) ||
      e.vocabulary.some(v => v.word.includes(q) || v.meaning.toLowerCase().includes(q.toLowerCase()) || (v.meaningVi ?? '').toLowerCase().includes(q.toLowerCase())) ||
      e.phrases.some(v => v.word.includes(q));
    return matchesComponent && matchesSearch;
  });

  const selectEntry = (e: KanjiEntry) => {
    setSelected(e);
    setRevealedFields({});
    setIsListOpen(false);
  };

  const handleComponentClick = (component: string) => {
    const next = componentFilter === component ? null : component;
    setComponentFilter(next);
    setIsListOpen(true);
  };

  const clearFilter = () => {
    setComponentFilter(null);
    setSearch('');
  };

  const currentIdx = entries.findIndex(e => e.char === selected?.char);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-black text-xs text-ink/30 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white text-ink flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b-2 border-ink/10 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={`w-10 h-10 rounded-xl border-2 transition-all ${isListOpen ? 'bg-brand-primary border-ink' : 'border-ink/10'}`}
            onClick={() => setIsListOpen(!isListOpen)}
          >
            <Rocket className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none text-ink uppercase">Kanji Study</h1>
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest leading-none mt-1">
              {selected?.char} — {currentIdx + 1} / {entries.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {componentFilter && (
            <button
              onClick={clearFilter}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary border-2 border-ink rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-brand-accent transition-colors"
            >
              <Filter className="w-3 h-3" />
              {componentFilter}
              <X className="w-3 h-3 ml-0.5" />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 bg-ink/5 p-1 rounded-xl border border-ink/5">
            <Button
              variant={!isInteractive ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider ${!isInteractive ? 'bg-white shadow-sm' : 'text-ink/40'}`}
              onClick={() => { setIsInteractive(false); setRevealedFields({}); }}
            >
              Learn
            </Button>
            <Button
              variant={isInteractive ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider ${isInteractive ? 'bg-brand-primary text-ink shadow-sm' : 'text-ink/40'}`}
              onClick={() => { setIsInteractive(true); setRevealedFields({}); }}
            >
              Interactive
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-black text-ink/40 hover:text-ink text-xs uppercase"
            onClick={onBack}
          >
            <X className="mr-1 w-4 h-4" />
            Close
          </Button>
        </div>
      </header>

      <div className="flex-1 relative flex overflow-hidden">
        {/* Kanji List Popover */}
        <AnimatePresence>
          {isListOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm z-30"
                onClick={() => setIsListOpen(false)}
              />
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                className="absolute left-4 top-4 bottom-4 w-72 bg-white rounded-3xl border-4 border-ink shadow-2xl z-40 overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b-2 border-ink/5 shrink-0 space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
                    <input
                      type="text"
                      placeholder="Search kanji or meaning..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full h-10 pl-9 pr-3 bg-ink/5 border-2 border-ink/10 rounded-xl text-sm font-bold outline-none focus:border-brand-primary transition-colors"
                    />
                  </div>

                  {/* Active component filter indicator */}
                  {componentFilter && (
                    <div className="flex items-center justify-between bg-brand-primary/20 border-2 border-brand-primary/40 rounded-xl px-3 py-1.5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-ink/60 flex items-center gap-1.5">
                        <Filter className="w-3 h-3" />
                        Component: <span className="text-xl font-black" style={{ fontFamily: 'serif' }}>{componentFilter}</span>
                      </span>
                      <button
                        onClick={clearFilter}
                        className="text-ink/40 hover:text-ink transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-ink/30">
                    <span>Kanji Index</span>
                    <Badge variant="outline" className="border-ink/20 font-black text-[10px]">{filteredEntries.length}</Badge>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                  {filteredEntries.map(e => (
                    <button
                      key={e.char}
                      onClick={() => selectEntry(e)}
                      className={`w-full px-3 py-2 rounded-xl transition-all text-left flex items-center gap-3 ${
                        selected?.char === e.char
                          ? 'bg-brand-primary font-black shadow-sm'
                          : 'hover:bg-brand-secondary/10 font-bold text-ink/60'
                      }`}
                    >
                      <span className="text-2xl font-black w-9 text-center shrink-0" style={{ fontFamily: 'serif' }}>{e.char}</span>
                      <span className="text-xs truncate opacity-70">
                        {[...e.phrases, ...e.vocabulary].slice(0, 3).map(v => v.word).join('　')}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 md:p-6 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.char}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-5xl lg:h-full flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch"
              >
                {/* Kanji display card */}
                <div className="flex-shrink-0 lg:w-64 flex flex-col gap-3">
                  <div className="flex-1 bg-brand-secondary/5 border-4 border-ink rounded-[32px] p-6 relative flex flex-col items-center justify-center min-h-[220px] lg:min-h-0">
                    <Badge className="absolute top-3 left-3 bg-ink text-white font-black text-[10px]">
                      {currentIdx + 1}
                    </Badge>
                    <div
                      className="font-black leading-none text-ink select-none"
                      style={{ fontFamily: 'serif', fontSize: 'clamp(80px, 15vw, 150px)' }}
                    >
                      {selected.char}
                    </div>

                    {/* Clickable component chips */}
                    {selected.related.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center mt-4">
                        <span className="text-[9px] font-black uppercase tracking-widest text-ink/30 w-full text-center">Components</span>
                        {selected.related.map(r => (
                          <button
                            key={r}
                            onClick={() => handleComponentClick(r)}
                            title={`Show all kanji with component ${r}`}
                            className={`text-lg font-black border-2 px-2 py-0.5 rounded-lg transition-all hover:scale-110 active:scale-95 ${
                              componentFilter === r
                                ? 'bg-brand-primary border-ink shadow-md'
                                : 'border-ink/20 hover:border-brand-primary hover:bg-brand-primary/10'
                            }`}
                            style={{ fontFamily: 'serif' }}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between px-2 py-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-brand-primary"
                      disabled={currentIdx <= 0}
                      onClick={() => currentIdx > 0 && selectEntry(entries[currentIdx - 1])}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <span className="font-black text-xs text-ink/20">{currentIdx + 1} / {entries.length}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full hover:bg-brand-primary"
                      disabled={currentIdx >= entries.length - 1}
                      onClick={() => currentIdx < entries.length - 1 && selectEntry(entries[currentIdx + 1])}
                    >
                      <ChevronLeft className="w-5 h-5 rotate-180" />
                    </Button>
                  </div>
                </div>

                {/* Vocabulary card */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 bg-white border-4 border-ink rounded-[40px] p-6 lg:p-8 overflow-y-auto">
                    {selected.phrases.length === 0 && selected.vocabulary.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-ink/20 font-black text-sm">
                        No vocabulary for this kanji.
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {isInteractive && (
                          <p className="text-[10px] font-black uppercase tracking-widest text-ink/30 text-center">
                            Tap reading or meaning to reveal
                          </p>
                        )}

                        {selected.phrases.length > 0 && (
                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/30 mb-3">Usage</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {selected.phrases.map((item, i) => (
                                <VocabCard
                                  key={`${selected.char}-p${i}`}
                                  item={item}
                                  id={`${selected.char}-p${i}`}
                                  interactive={isInteractive}
                                  revealed={revealedFields}
                                  onToggle={toggleReveal}
                                />
                              ))}
                            </div>
                          </section>
                        )}

                        {selected.vocabulary.length > 0 && (
                          <section>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ink/30 mb-3">Vocabulary</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {selected.vocabulary.map((item, i) => (
                                <VocabCard
                                  key={`${selected.char}-v${i}`}
                                  item={item}
                                  id={`${selected.char}-v${i}`}
                                  interactive={isInteractive}
                                  revealed={revealedFields}
                                  onToggle={toggleReveal}
                                />
                              ))}
                            </div>
                          </section>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
