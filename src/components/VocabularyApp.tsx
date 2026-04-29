import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, 
  Menu, 
  X, 
  Volume2, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Rocket,
  Type, 
  Layers, 
  Quote,
  Sparkles
} from "lucide-react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface VocabularyWord {
  no: string;
  word: string;
  partsOfSpeech: string;
  ipa: string;
  vietnamese: string;
  example: string;
  image: string;
}

interface VocabularyAppProps {
  onBack: () => void;
  isTrial?: boolean;
  appId: string; // e.g. "movers", "ielts"
  title: string; // e.g. "MOVERS VOCABULARY", "IELTS VOCABULARY"
}

export const VocabularyApp: React.FC<VocabularyAppProps> = ({ onBack, isTrial = false, appId, title }) => {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});

  // Use the appId and trial status to determine the base path
  const folderName = isTrial ? `${appId}_trial` : appId;
  const basePath = `/media/${folderName}`;

  useEffect(() => {
    const fetchWords = async () => {
      try {
        console.log(`Fetching words from ${basePath}/words.csv`);
        const response = await fetch(`${basePath}/words.csv`);
        if (!response.ok) {
          throw new Error(`Failed to fetch words.csv: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedWords: VocabularyWord[] = results.data.map((row: any) => {
              const word = row["Word"] || "";
              // Sanitize word for image filename
              const sanitizedWord = word.trim().replace(/\n/g, " ").replace(/\s+/g, " ");
              
              return {
                no: row["No"],
                word: word,
                partsOfSpeech: row["Parts of Speech"] || "",
                ipa: row["IPA"] || "",
                vietnamese: row["Vietnamese"] || "",
                example: row["Example"] || "",
                image: `${basePath}/imgs/${sanitizedWord}.png`
              };
            });
            
            console.log(`Parsed ${parsedWords.length} words for ${appId}`);
            setWords(parsedWords);
            if (parsedWords.length > 0) {
              setSelectedWord(parsedWords[0]);
            }
          },
          error: (error: any) => {
            console.error("PapaParse error:", error);
          }
        });
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
      }
    };

    fetchWords();
  }, [basePath, appId]);

  const toggleReveal = (id: string) => {
    setRevealedFields(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getExampleParts = (example: string) => {
    const lines = example.split("\n").map(l => l.trim());
    const eng = lines.find(l => !l.startsWith("(")) || "";
    const vi = lines.find(l => l.startsWith("("))?.replace(/[()]/g, "") || "";
    return { eng, vi };
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    // Prefer male US voice (e.g. David, Mark, etc.)
    const maleVoice = voices.find(v => (v.name.includes("Male") || v.name.includes("David") || v.name.includes("Mark") || v.name.includes("Guy")) && v.lang.includes("en-US"));
    const usVoice = voices.find(v => v.lang.includes("en-US") || v.name.includes("Google US English"));
    
    if (maleVoice) utterance.voice = maleVoice;
    else if (usVoice) utterance.voice = usVoice;
    
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  if (words.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-secondary/5">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-black text-xs text-ink/30 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  const exampleParts = selectedWord ? getExampleParts(selectedWord.example) : { eng: "", vi: "" };

  return (
    <div className="h-screen bg-white text-ink flex flex-col overflow-hidden font-sans">
      {/* Compact Header */}
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
            <h1 className="font-black text-lg tracking-tight leading-none text-ink uppercase">{title}</h1>
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest leading-none mt-1">English with Ms. Suzy</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-ink/5 p-1 rounded-xl border border-ink/5">
            <Button
              variant={!isInteractive ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider ${!isInteractive ? 'bg-white shadow-sm' : 'text-ink/40'}`}
              onClick={() => setIsInteractive(false)}
            >
              Learn
            </Button>
            <Button
              variant={isInteractive ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-3 rounded-lg font-black text-[10px] uppercase tracking-wider ${isInteractive ? 'bg-brand-primary text-ink shadow-sm' : 'text-ink/40'}`}
              onClick={() => setIsInteractive(true)}
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
        {/* Word List Popover */}
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
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                className="absolute left-4 top-4 bottom-4 w-72 bg-white rounded-3xl border-4 border-ink shadow-2xl z-40 overflow-hidden flex flex-col"
              >
                <div className="p-4 border-b-2 border-ink/5 bg-ink/5 shrink-0 flex items-center justify-between">
                  <span className="font-black text-xs uppercase tracking-widest text-ink/40">Word Index</span>
                  <Badge variant="outline" className="border-ink/20 font-black text-[10px]">{words.length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {words.map((w) => (
                    <button
                      key={w.no}
                      onClick={() => {
                        setSelectedWord(w);
                        setRevealedFields({});
                        setIsListOpen(false);
                      }}
                      className={`w-full p-3 rounded-xl transition-all text-left flex items-center gap-3 ${
                        selectedWord?.no === w.no 
                        ? 'bg-brand-primary font-black shadow-sm' 
                        : 'hover:bg-brand-secondary/10 font-bold text-ink/60'
                      }`}
                    >
                      <span className="text-[10px] opacity-30 text-center w-4">{w.no}</span>
                      <span className="capitalize text-sm">{w.word}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Interface: Responsive Content Area */}
        <main className="flex-1 overflow-y-auto lg:overflow-hidden p-4 md:p-6 flex flex-col items-center">
          <AnimatePresence mode="wait">
            {selectedWord && (
              <motion.div
                key={selectedWord.no}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-5xl lg:h-full flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch"
              >
                {/* Visual Card */}
                <div className="flex-shrink-0 lg:flex-1 h-[300px] lg:h-full flex flex-col gap-3">
                  <div className="flex-1 bg-white border-4 border-ink rounded-[32px] overflow-hidden p-4 relative flex items-center justify-center bg-brand-secondary/5 group">
                    <div className="absolute top-3 left-3 flex gap-2">
                      <Badge className="bg-ink text-white font-black text-[10px]">NO. {selectedWord.no}</Badge>
                      <Badge className="bg-brand-primary text-ink border-2 border-ink font-black text-[10px] uppercase">{appId}</Badge>
                    </div>
                    <img 
                      src={selectedWord.image} 
                      alt={selectedWord.word}
                      className="max-h-full max-w-full object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://placehold.co/400x400/FFCC00/2D3436?text=" + selectedWord.word;
                      }}
                    />
                  </div>
                </div>

                {/* Content Card */}
                <div className="flex-1 lg:flex-[1.2] flex flex-col gap-4">
                  <div className="flex-1 bg-white border-4 border-ink rounded-[40px] p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden shadow-sm min-h-[350px]">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="relative z-10 space-y-4 lg:space-y-6">
                      {/* Word Title and IPA */}
                      <div className="space-y-1">
                        <div 
                          className="cursor-pointer group/title"
                          onClick={() => speak(selectedWord.word)}
                        >
                          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter capitalize text-ink group-hover/title:text-brand-primary transition-colors">
                            {selectedWord.word}
                          </h2>
                        </div>
                        
                        <div className="flex items-center flex-wrap gap-2">
                          <div 
                            className={`inline-flex items-center gap-3 transition-all ${
                              isInteractive && !revealedFields['ipa']
                              ? 'bg-ink text-white px-3 py-1 rounded-lg cursor-pointer hover:bg-brand-primary hover:text-ink'
                              : 'text-ink/30 italic text-lg lg:text-xl'
                            }`}
                            onClick={() => isInteractive && toggleReveal('ipa')}
                          >
                            {isInteractive && !revealedFields['ipa'] ? (
                              <span className="text-xs uppercase font-black tracking-widest flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> IPA Hidden
                              </span>
                            ) : (
                              <div 
                                className="flex items-center gap-2 cursor-pointer hover:text-brand-primary transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speak(selectedWord.word);
                                }}
                              >
                                <span>{selectedWord.ipa}</span>
                                <Volume2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex gap-1 ml-2">
                            {selectedWord.partsOfSpeech.split(',').map(pos => (
                              <Badge key={pos} variant="outline" className="text-[9px] font-black uppercase text-ink/40 border-ink/10 rounded-lg px-2 py-0 border-2">
                                {pos.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Meaning Block */}
                      <div 
                        className={`p-4 lg:p-5 rounded-2xl lg:rounded-3xl border-4 transition-all ${
                          isInteractive && !revealedFields['vi']
                          ? 'bg-ink text-white cursor-pointer hover:bg-brand-accent hover:text-ink border-ink'
                          : 'bg-brand-accent/10 border-brand-accent/20'
                        }`}
                        onClick={() => isInteractive && toggleReveal('vi')}
                      >
                        <h3 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-2 opacity-40">Definition</h3>
                        <div className="text-2xl lg:text-3xl font-black">
                          {isInteractive && !revealedFields['vi'] ? (
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 animate-pulse text-brand-primary" />
                              <span className="text-sm lg:text-2xl">Reveal Vietnamese</span>
                            </div>
                          ) : (
                            selectedWord.vietnamese
                          )}
                        </div>
                      </div>

                      {/* Example Block */}
                      <div className="space-y-3 lg:space-y-4">
                        <div>
                          <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-2 opacity-40">Usage Example</h4>
                          <p className="text-base lg:text-xl font-bold leading-tight text-ink/70 bg-ink/5 p-4 rounded-2xl border-l-4 border-brand-primary italic">
                            "{exampleParts.eng}"
                          </p>
                        </div>

                        <div 
                          className={`p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all group ${
                            isInteractive && !revealedFields['ex_vi']
                            ? 'bg-ink/5 border-dashed border-ink/20 cursor-pointer hover:bg-ink hover:text-white hover:border-solid hover:border-ink'
                            : 'bg-white border-ink/5 text-ink/40'
                          }`}
                          onClick={() => isInteractive && toggleReveal('ex_vi')}
                        >
                          {isInteractive && !revealedFields['ex_vi'] ? (
                            <div className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest">
                              <Eye className="w-3 h-3 lg:w-4 lg:h-4" />
                              <span>Show Translation</span>
                            </div>
                          ) : (
                            <p className="text-xs lg:text-sm font-medium italic">
                              {exampleParts.vi}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer Stats/Controls */}
                  <div className="flex items-center justify-between px-2 py-2 shrink-0">
                    <div className="flex items-center gap-4">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full hover:bg-brand-primary"
                        onClick={() => {
                          const idx = words.findIndex(w => w.no === selectedWord.no);
                          if (idx > 0) {
                            setSelectedWord(words[idx - 1]);
                            setRevealedFields({});
                          }
                        }}
                        disabled={words[0]?.no === selectedWord.no}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <span className="font-black text-xs text-ink/20">
                        {words.findIndex(w => w.no === selectedWord.no) + 1} / {words.length}
                      </span>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="rounded-full hover:bg-brand-primary"
                        onClick={() => {
                          const idx = words.findIndex(w => w.no === selectedWord.no);
                          if (idx < words.length - 1) {
                            setSelectedWord(words[idx + 1]);
                            setRevealedFields({});
                          }
                        }}
                        disabled={words[words.length - 1]?.no === selectedWord.no}
                      >
                        <ChevronLeft className="w-5 h-5 rotate-180" />
                      </Button>
                    </div>
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
