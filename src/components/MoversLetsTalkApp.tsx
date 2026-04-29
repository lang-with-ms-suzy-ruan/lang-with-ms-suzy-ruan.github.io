import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Rocket, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoversLetsTalkAppProps {
  onBack: () => void;
}

export const MoversLetsTalkApp: React.FC<MoversLetsTalkAppProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = 8;

  // Assuming files are named 1.pdf to 8.pdf in /media/movers_talk/
  const files = Array.from({ length: totalImages }, (_, i) => `/media/movers_talk/${i + 1}.pdf`);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <div className="fixed inset-0 bg-brand-secondary/10 flex flex-col z-50 overflow-hidden font-sans">
      {/* Top Navigation */}
      <div className="bg-white border-b-4 border-ink p-4 flex items-center justify-between shadow-[0_4px_0_0_rgba(45,52,54,1)]">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="hover:bg-brand-primary/20 text-ink rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="bg-brand-primary p-2 rounded-xl border-2 border-ink">
            <Rocket className="w-5 h-5 text-ink" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none text-ink uppercase">MOVERS LET'S TALK!</h1>
            <p className="text-[10px] font-bold text-ink/30 uppercase tracking-widest leading-none mt-1">Admin Panel • Speaking Practice</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-ink/40 uppercase tracking-tighter">Page</span>
            <span className="text-xl font-black text-ink leading-none">{currentIndex + 1} / {totalImages}</span>
          </div>
          <Button 
            onClick={onBack}
            className="bg-ink text-white hover:bg-ink/90 font-black rounded-full px-6 shadow-lg"
          >
            <X className="w-4 h-4 mr-2" /> EXIT
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Navigation Buttons */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-8 z-10 pointer-events-none">
          <Button 
            onClick={prevImage}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-ink bg-white text-ink shadow-[4px_4px_0_0_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all pointer-events-auto"
          >
            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
          </Button>
          <Button 
            onClick={nextImage}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-ink bg-brand-primary text-ink shadow-[4px_4px_0_0_rgba(45,52,54,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all pointer-events-auto"
          >
            <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
          </Button>
        </div>

        {/* Image Container - Aspect Ratio A3 Landscape (approx 1.41) */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-6xl aspect-[1.414/1] bg-white border-4 border-ink rounded-[40px] shadow-[16px_16px_0_0_rgba(45,52,54,1)] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full h-full flex items-center justify-center bg-black/5"
              >
                <iframe 
                  src={`${files[currentIndex]}#toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-full border-none"
                  title={`Movers Let's Talk ${currentIndex + 1}`}
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Page Indicator Overlay */}
            <div className="absolute bottom-6 right-8 bg-ink/80 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-black tracking-widest border border-white/20 uppercase">
              Section {currentIndex + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails / Bottom Progress */}
      <div className="bg-white border-t-4 border-ink p-3 flex justify-center gap-2">
        {Array.from({ length: totalImages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-10 h-2 rounded-full transition-all border border-ink/20 ${
              currentIndex === i ? 'bg-brand-primary w-16' : 'bg-ink/10 hover:bg-ink/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
