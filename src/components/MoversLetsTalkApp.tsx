import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Rocket, X, Maximize2, Minimize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MoversLetsTalkAppProps {
  onBack: () => void;
}

export const MoversLetsTalkApp: React.FC<MoversLetsTalkAppProps> = ({ onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalImages = 8;

  // Assuming files are named 1.pdf to 8.pdf in /media/movers_talk/
  const files = Array.from({ length: totalImages }, (_, i) => `/media/movers_talk/${i + 1}.pdf`);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));

  const exitFullScreen = () => {
    setIsFullScreen(false);
    setZoom(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") {
        if (isFullScreen) exitFullScreen();
      }
      if (isFullScreen) {
        if (e.key === "+" || e.key === "=") zoomIn();
        if (e.key === "-") zoomOut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen, zoom]);

  return (
    <div className={`fixed inset-0 bg-brand-secondary/10 flex flex-col z-50 overflow-hidden font-sans transition-all duration-500 ${isFullScreen ? 'bg-black' : ''}`}>
      {/* Top Navigation - Hidden in Full Screen */}
      <AnimatePresence>
        {!isFullScreen && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-white border-b-4 border-ink p-4 flex items-center justify-between shadow-[0_4px_0_0_rgba(45,52,54,1)] z-20"
          >
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

            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-black text-ink/40 uppercase tracking-tighter">Page</span>
                <span className="text-xl font-black text-ink leading-none">{currentIndex + 1} / {totalImages}</span>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsFullScreen(true)}
                className="rounded-xl border-2 border-ink bg-white font-black shadow-[2px_2px_0_0_rgba(45,52,54,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
              >
                <Maximize2 className="w-4 h-4 mr-2" /> FULLSCREEN
              </Button>

              <Button
                onClick={onBack}
                className="bg-ink text-white hover:bg-ink/90 font-black rounded-full px-6 shadow-lg ml-2"
              >
                <X className="w-4 h-4 mr-2" /> EXIT
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controls for Full Screen */}
      {isFullScreen && (
        <div className="fixed top-6 right-6 z-50 flex gap-3 items-center">
          <Button
            onClick={zoomOut}
            disabled={zoom <= 0.5}
            className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-brand-primary hover:text-ink transition-all disabled:opacity-30"
          >
            <ZoomOut className="w-6 h-6" />
          </Button>
          <span className="text-white font-black text-sm bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 min-w-[56px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            onClick={zoomIn}
            disabled={zoom >= 3}
            className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-brand-primary hover:text-ink transition-all disabled:opacity-30"
          >
            <ZoomIn className="w-6 h-6" />
          </Button>
          <Button
            onClick={exitFullScreen}
            className="w-12 h-12 rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-brand-accent transition-all"
          >
            <Minimize2 className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div
        ref={containerRef}
        className={`flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-500 ${isFullScreen ? 'p-0 bg-black' : 'p-4 md:p-8'}`}
      >
        {/* PDF Container */}
        <div className="w-full h-full flex items-center justify-center relative">
          <div
            className={`relative transition-all duration-500 ${isFullScreen
                ? 'w-screen h-screen rounded-0 border-0 shadow-none'
                : 'w-full max-w-6xl aspect-[1.414/1] bg-white border-4 border-ink rounded-[40px] shadow-[16px_16px_0_0_rgba(45,52,54,1)] overflow-hidden'
              }`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex items-center justify-center bg-black/5"
                style={isFullScreen ? { transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease' } : {}}
              >
                <iframe
                  src={`${files[currentIndex]}#view=Fit&toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-full border-none pointer-events-auto"
                  title={`Movers Let's Talk ${currentIndex + 1}`}
                />
              </motion.div>
            </AnimatePresence>

            {/* Page Indicator Overlay - Only show if not in full screen or hover */}
            {!isFullScreen && (
              <div className="absolute bottom-6 right-8 bg-ink/80 backdrop-blur-sm text-white px-4 py-1 rounded-full text-xs font-black tracking-widest border border-white/20 uppercase">
                Section {currentIndex + 1}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Thumbnails / Bottom Progress - Hidden in Full Screen */}
      <AnimatePresence>
        {!isFullScreen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="bg-white border-t-4 border-ink p-3 flex justify-center gap-2 z-20"
          >
            {Array.from({ length: totalImages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-2 rounded-full transition-all border border-ink/20 ${currentIndex === i ? 'bg-brand-primary w-16' : 'bg-ink/10 hover:bg-ink/20'
                  }`}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};