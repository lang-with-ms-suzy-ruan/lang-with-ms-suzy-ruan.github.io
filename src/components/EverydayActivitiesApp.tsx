import React, { useState, useEffect, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const PDF_PATH = "/media/everyday/english-for-everyday-activities-pdf-free.pdf";
const AUDIO_DIR =
  "/media/everyday/english_for_everyday_activities_a_picture_process_dictionary_cd";

interface Chapter {
  num: number;
  title: string;
  section: string;
  pages: number[];
}

const CHAPTERS: Chapter[] = [
  // Section 1 – Starting the Day
  { num: 1,  title: "First Thing in the Morning",           section: "Starting the Day",        pages: [4, 5] },
  { num: 2,  title: "Brushing Your Teeth / Flossing",       section: "Starting the Day",        pages: [6] },
  { num: 3,  title: "Taking a Shower",                      section: "Starting the Day",        pages: [7] },
  { num: 4,  title: "Getting Dressed – A Man",              section: "Starting the Day",        pages: [8, 9] },
  { num: 5,  title: "Getting Dressed – A Woman",            section: "Starting the Day",        pages: [10, 11] },
  { num: 6,  title: "Making a Bed",                         section: "Starting the Day",        pages: [12] },
  { num: 7,  title: "Making Coffee / Making Tea",           section: "Starting the Day",        pages: [13] },
  { num: 8,  title: "Preparing Cold Cereal / Making Toast", section: "Starting the Day",        pages: [14] },
  { num: 9,  title: "Frying an Egg",                        section: "Starting the Day",        pages: [15] },
  { num: 10, title: "Eating Breakfast",                     section: "Starting the Day",        pages: [16] },
  { num: 11, title: "Leaving the House",                    section: "Starting the Day",        pages: [17] },
  // Section 2 – Getting Around
  { num: 12, title: "Taking a Bus",                         section: "Getting Around",          pages: [18, 19] },
  { num: 13, title: "Starting Out",                         section: "Getting Around",          pages: [20] },
  { num: 14, title: "Operating a Car",                      section: "Getting Around",          pages: [21] },
  { num: 15, title: "Driving Along",                        section: "Getting Around",          pages: [22, 23] },
  { num: 16, title: "Taking a Train",                       section: "Getting Around",          pages: [24] },
  { num: 17, title: "Taking a Taxi",                        section: "Getting Around",          pages: [25] },
  { num: 18, title: "Walking Somewhere",                    section: "Getting Around",          pages: [26] },
  { num: 19, title: "Riding a Bicycle",                     section: "Getting Around",          pages: [27] },
  // Section 3 – At Home in the Evening
  { num: 20, title: "Returning Home",                       section: "At Home in the Evening",  pages: [28, 29] },
  { num: 21, title: "Making a Salad",                       section: "At Home in the Evening",  pages: [30] },
  { num: 22, title: "Preparing Vegetables",                 section: "At Home in the Evening",  pages: [31] },
  { num: 23, title: "Making Spaghetti",                     section: "At Home in the Evening",  pages: [32, 33] },
  { num: 24, title: "Cooking Rice",                         section: "At Home in the Evening",  pages: [34] },
  { num: 25, title: "Eating Dinner",                        section: "At Home in the Evening",  pages: [35] },
  { num: 26, title: "Clearing the Table",                   section: "At Home in the Evening",  pages: [36] },
  { num: 27, title: "Doing Dishes",                         section: "At Home in the Evening",  pages: [37] },
  { num: 28, title: "Playing a CD",                         section: "At Home in the Evening",  pages: [38] },
  { num: 29, title: "Using a Personal Cassette Player",     section: "At Home in the Evening",  pages: [39] },
  { num: 30, title: "Reading",                              section: "At Home in the Evening",  pages: [40] },
  { num: 31, title: "Watching Television",                  section: "At Home in the Evening",  pages: [41] },
  { num: 32, title: "Watching a Video",                     section: "At Home in the Evening",  pages: [42] },
  { num: 33, title: "Babysitting",                          section: "At Home in the Evening",  pages: [43] },
  { num: 34, title: "Going to Bed",                         section: "At Home in the Evening",  pages: [44, 45] },
  // Section 4 – Managing a Household
  { num: 35, title: "Doing Laundry",                        section: "Managing a Household",    pages: [46, 47] },
  { num: 36, title: "Cleaning the House",                   section: "Managing a Household",    pages: [48, 49] },
  { num: 37, title: "Taking Care of a Cat",                 section: "Managing a Household",    pages: [50] },
  { num: 38, title: "Taking Care of a Dog",                 section: "Managing a Household",    pages: [51] },
  { num: 39, title: "Taking Care of a Lawn",                section: "Managing a Household",    pages: [52] },
  { num: 40, title: "Gardening",                            section: "Managing a Household",    pages: [53] },
  { num: 41, title: "Cleaning a Car",                       section: "Managing a Household",    pages: [54] },
  { num: 42, title: "Taking a Car to a Garage for Repairs", section: "Managing a Household",    pages: [55] },
  { num: 43, title: "Changing a Flat Tire",                 section: "Managing a Household",    pages: [56] },
  { num: 44, title: "Dealing with a Power Failure",         section: "Managing a Household",    pages: [57] },
  { num: 45, title: "Working with Wood",                    section: "Managing a Household",    pages: [58] },
  { num: 46, title: "Joining Things with Bolts / Screws",   section: "Managing a Household",    pages: [59] },
  { num: 47, title: "Shopping for Groceries",               section: "Managing a Household",    pages: [60, 61] },
  { num: 48, title: "Paying for Things",                    section: "Managing a Household",    pages: [62, 63] },
  { num: 49, title: "Going to a Bank",                      section: "Managing a Household",    pages: [64] },
  { num: 50, title: "Using an ATM",                         section: "Managing a Household",    pages: [65] },
  // Section 5 – Keeping in Touch
  { num: 51, title: "Making a Phone Call",                  section: "Keeping in Touch",        pages: [66] },
  { num: 52, title: "Answering a Telephone",                section: "Keeping in Touch",        pages: [67] },
  { num: 53, title: "Leaving a Message",                    section: "Keeping in Touch",        pages: [68] },
  { num: 54, title: "Taking a Message",                     section: "Keeping in Touch",        pages: [69] },
  { num: 55, title: "Using an Answering Machine",           section: "Keeping in Touch",        pages: [70] },
  { num: 56, title: "Writing a Personal Letter",            section: "Keeping in Touch",        pages: [71] },
  { num: 57, title: "Mailing a Letter",                     section: "Keeping in Touch",        pages: [72, 73] },
  // Section 6 – Having Fun with Friends
  { num: 58, title: "Going to a Birthday Party",            section: "Having Fun with Friends", pages: [74] },
  { num: 59, title: "Going to a Dinner Party",              section: "Having Fun with Friends", pages: [75] },
  { num: 60, title: "Going to a Movie",                     section: "Having Fun with Friends", pages: [76] },
  { num: 61, title: "Eating at a Fast Food Restaurant",     section: "Having Fun with Friends", pages: [77] },
];

const SECTIONS = [...new Set(CHAPTERS.map(c => c.section))];

function pdfUrl(page: number) {
  return `${PDF_PATH}#page=${page}&toolbar=0&navpanes=0&scrollbar=0`;
}

function audioUrl(num: number) {
  const n = String(num).padStart(2, "0");
  return `${AUDIO_DIR}/English%20for%20Everyday%20Activities%20${n}.mp3`;
}

interface Props {
  onBack: () => void;
}

export const EverydayActivitiesApp: React.FC<Props> = ({ onBack }) => {
  const [idx, setIdx] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chapterRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const chapter = CHAPTERS[idx];

  const goTo = useCallback((i: number) => {
    setIdx(i);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const prev = useCallback(() => { if (idx > 0) goTo(idx - 1); }, [idx, goTo]);
  const next = useCallback(() => { if (idx < CHAPTERS.length - 1) goTo(idx + 1); }, [idx, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  useEffect(() => {
    chapterRefs.current[idx]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [idx]);

  useEffect(() => {
    audioRef.current?.load();
  }, [idx]);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 bg-white border-b-2 border-ink/10 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-primary rounded-lg border-2 border-ink flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4 text-ink" />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-sm tracking-tight leading-none uppercase">Everyday Activities</h1>
            <p className="text-[10px] font-bold text-ink/40 leading-none mt-0.5 truncate">
              {chapter.num}. {chapter.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-bold text-ink/30">{idx + 1} / {CHAPTERS.length}</span>
          <Button
            variant="ghost" size="sm"
            className="font-black text-ink/40 hover:text-ink text-xs uppercase"
            onClick={onBack}
          >
            <X className="mr-1 w-4 h-4" /> Close
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r-2 border-ink/10 overflow-y-auto bg-ink/[0.015]">
          {SECTIONS.map(section => (
            <div key={section}>
              <p className="px-3 pt-4 pb-1 text-[9px] font-black uppercase tracking-widest text-ink/30">
                {section}
              </p>
              {CHAPTERS.filter(c => c.section === section).map(c => {
                const i = c.num - 1;
                const active = i === idx;
                return (
                  <button
                    key={c.num}
                    ref={el => { chapterRefs.current[i] = el; }}
                    onClick={() => goTo(i)}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
                      active
                        ? "bg-brand-primary border-r-4 border-ink"
                        : "hover:bg-ink/5"
                    }`}
                  >
                    <span className={`text-[10px] font-black shrink-0 w-5 text-right mt-px ${active ? "text-ink" : "text-ink/30"}`}>
                      {c.num}
                    </span>
                    <span className={`text-[11px] font-bold leading-tight ${active ? "text-ink" : "text-ink/60"}`}>
                      {c.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* PDF pages */}
          <div className="flex-1 flex gap-2 p-3 min-h-0">
            {chapter.pages.map(page => (
              <iframe
                key={`${chapter.num}-${page}`}
                src={pdfUrl(page)}
                className="flex-1 h-full border-2 border-ink/10 rounded-2xl bg-white"
                title={`Chapter ${chapter.num} page ${page}`}
              />
            ))}
          </div>

          {/* Audio + nav */}
          <div className="shrink-0 border-t-2 border-ink/10 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost" size="icon"
              className="w-9 h-9 rounded-full border-2 border-ink/10 hover:border-ink transition-all disabled:opacity-30"
              onClick={prev}
              disabled={idx === 0}
              title="Previous (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <audio
              ref={audioRef}
              controls
              className="flex-1 h-9"
              src={audioUrl(chapter.num)}
            />

            <Button
              variant="ghost" size="icon"
              className="w-9 h-9 rounded-full border-2 border-ink/10 hover:border-ink transition-all disabled:opacity-30"
              onClick={next}
              disabled={idx === CHAPTERS.length - 1}
              title="Next (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};
