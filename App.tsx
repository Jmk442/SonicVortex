import React, { useState, useCallback, useRef, useEffect } from 'react';
import SoundscapeEngine from './components/SoundscapeEngine';
import VortexVisualizer from './components/VortexVisualizer';
import ControlNodes from './components/ControlNodes';
import InfoPanel from './components/InfoPanel';
import Questionnaire from './components/Questionnaire';
import { OSCILLATING_BINAURAL_PERIOD_S, WILSONIC_SCALES, INHALE_DURATION, EXHALE_DURATION } from './constants';
import { SoundscapePhase } from './types'; 
import { Info, Timer, BrainCircuit, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isGraphicsOnly, setIsGraphicsOnly] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [oscillationValue, setOscillationValue] = useState(0);
  const [isInhale, setIsInhale] = useState(true);
  
  // Controls
  const [baseFrequency, setBaseFrequency] = useState(174);
  const [scaleName, setScaleName] = useState('hexany');
  const [harmonicMix, setHarmonicMix] = useState(0.1);
  const [spatialSpread, setSpatialSpread] = useState(0.7);

  // Journey state
  const [journeyDuration, setJourneyDuration] = useState(180);
  const [timeLeft, setTimeLeft] = useState(180);

  const audioContextRef = useRef<AudioContext | null>(null);
  const frameId = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
     // Check session storage for current session
     const sessionActive = sessionStorage.getItem('sonic_vortex_session');
     if (sessionActive) {
       setIsQuestionnaireOpen(false);
     }
  }, []);

  const handleStartJourney = (freq: number, scale: string, duration: number) => {
    setBaseFrequency(freq);
    setScaleName(scale);
    setJourneyDuration(duration);
    setTimeLeft(duration);
    setIsQuestionnaireOpen(false);
    setHasStarted(true);
    sessionStorage.setItem('sonic_vortex_session', 'active');
    
    // Save for Quick Start
    localStorage.setItem('sonic_vortex_last_journey', JSON.stringify({ freq, scale, duration }));
    
    // Auto start audio
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const context = audioContextRef.current;
    if (context.state === 'suspended') context.resume();
    setIsPlaying(true);
  };

  const togglePlay = useCallback(() => {
    if (audioContextRef.current === null) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const context = audioContextRef.current;
    if (context.state === 'suspended') context.resume();
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startTime.current = performance.now();
      const animate = (time: number) => {
        const elapsedTime = (time - (startTime.current ?? 0)) / 1000;
        
        // Oscillation logic
        const oscillationPhase = (elapsedTime % OSCILLATING_BINAURAL_PERIOD_S) / OSCILLATING_BINAURAL_PERIOD_S;
        const currentOscillationValue = 0.5 - 0.5 * Math.cos(2 * Math.PI * oscillationPhase);
        setOscillationValue(currentOscillationValue);
        
        // Breathing logic (4s inhale, 5s exhale)
        const cycleTotal = INHALE_DURATION + EXHALE_DURATION;
        const cyclePos = elapsedTime % cycleTotal;
        setIsInhale(cyclePos < INHALE_DURATION);

        // Journey countdown
        setTimeLeft(Math.max(0, journeyDuration - elapsedTime));
        
        // Auto-parameter adjustment (Golden Ratio / Fibonacci influence)
        const progress = Math.min(1, elapsedTime / journeyDuration);
        const fibFactor = 0.618;
        
        // Subtly shift values over the journey
        setSpatialSpread(0.4 + Math.sin(progress * Math.PI * fibFactor ) * 0.4);
        setHarmonicMix(0.1 + (progress * 0.2) * fibFactor);

        if (elapsedTime >= journeyDuration) {
            setIsPlaying(false);
        } else {
            frameId.current = requestAnimationFrame(animate);
        }
      };
      frameId.current = requestAnimationFrame(animate);
    } else {
      if (frameId.current) cancelAnimationFrame(frameId.current);
    }
    return () => { if (frameId.current) cancelAnimationFrame(frameId.current); };
  }, [isPlaying, journeyDuration]);

  const currentScale = WILSONIC_SCALES[scaleName];

  return (
    <div className="bg-black text-white min-h-screen font-sans relative overflow-hidden select-none">
      {/* Background Visualizer */}
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ease-in-out ${hasStarted ? 'scale-110 top-0' : 'scale-90 top-[14%]'}`}>
        <VortexVisualizer 
          isPlaying={isPlaying} 
          analyserNode={analyserNode}
          oscillationValue={oscillationValue}
          numTones={currentScale.ratios.length}
          isInhale={isInhale}
        />
        {!hasStarted && <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />}
      </div>

      {/* HUD Grid Overlay */}
      {!hasStarted && !isGraphicsOnly && (
        <div className="absolute inset-0 z-1 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf61a_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf61a_1px,transparent_1px)] bg-[size:40px_40px] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-transparent h-2/3" />
          <div className="absolute top-[20%] left-0 right-0 h-px bg-purple-500/20 animate-[scan_8s_linear_infinite]" />
          
          {/* Central Bloom Overlay */}
          <div className="absolute inset-x-0 bottom-0 top-1/2 flex items-center justify-center">
            <div className="w-[80vw] h-[60vw] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
          </div>
        </div>
      )}

      {/* Main UI Overlay */}
      {!isGraphicsOnly && (
        <div className="relative z-10 flex flex-col h-screen p-6 md:p-12 pointer-events-none text-center">
          
          {/* Top Section: Title and Subtitle */}
          <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-top-8 duration-1000">
            <h1 className="text-5xl md:text-8xl font-thin tracking-[0.15em] text-white uppercase leading-none" style={{textShadow: '0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.3)'}}>
              Sonic Vortex
            </h1>
            {!hasStarted && (
              <p className="mt-6 text-purple-100/90 text-sm md:text-xl font-light leading-relaxed tracking-[0.3em] uppercase max-w-[90vw] md:max-w-3xl mx-auto drop-shadow-2xl px-4">
                Deep Geometric Meditation <br/> <span className="text-purple-400/80">&</span> Scalar Frequency Re-Alignment
              </p>
            )}
          </div>

          {/* Spacer to keep middle clear for the sphere */}
          <div className="flex-1" />

          {/* Bottom Section: Controls and Info */}
          <div className="mb-4 md:mb-12 flex flex-col items-center">
            {!hasStarted && (
              <div className="space-y-6 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                {/* Supporting labels stacked vertically above button */}
                <div className="flex flex-col items-center gap-2 text-purple-200/40 text-[8px] md:text-[9px] uppercase tracking-[0.4em] font-medium px-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-purple-500/30" />
                    <span>Resonant Sculpting</span>
                    <span className="w-6 h-px bg-purple-500/30" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-purple-500/30" />
                    <span>Scalar Tuning</span>
                    <span className="w-6 h-px bg-purple-500/30" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-px bg-purple-500/30" />
                    <span>Biophilic Flux</span>
                    <span className="w-6 h-px bg-purple-500/30" />
                  </div>
                </div>

                <button 
                  onClick={() => setIsQuestionnaireOpen(true)}
                  className="group pointer-events-auto relative px-10 md:px-14 py-3 md:py-5 overflow-hidden rounded-full transition-all duration-500 border border-purple-500/30 bg-black/60 backdrop-blur-xl shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                >
                  <div className="absolute inset-0 bg-purple-600/10 group-hover:bg-purple-600/30 transition-colors" />
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
                  <span className="relative text-white uppercase tracking-[0.8em] text-[10px] md:text-[11px] font-semibold">
                    Begin Journey
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Floating Info Button Corner */}
          <div className="absolute bottom-6 right-6 md:bottom-10 md:right-10 flex items-center gap-4 pointer-events-auto">
            {isPlaying && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-white/5 text-purple-300/80 font-mono text-xs shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <Timer className="w-3.5 h-3.5 text-purple-400" />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toFixed(0).padStart(2, '0')}</span>
                </div>
            )}
            <button 
                onClick={() => setIsInfoOpen(true)}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-purple-500/20 text-purple-300/50 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-purple-300 transition-all group backdrop-blur-sm"
                title="Frequency Wisdom Guide"
            >
                <Info className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Graphics Only Toggle */}
      {hasStarted && (
        <button
          onClick={() => setIsGraphicsOnly(!isGraphicsOnly)}
          className="fixed top-8 right-8 z-[70] p-3 rounded-full bg-black/20 border border-white/5 text-purple-300/40 hover:text-purple-100 hover:bg-purple-500/20 transition-all pointer-events-auto backdrop-blur-sm"
          title={isGraphicsOnly ? "Show UI" : "Graphics Only Mode"}
        >
          <Activity className="w-5 h-5" />
        </button>
      )}
      
      {isQuestionnaireOpen && <Questionnaire onComplete={handleStartJourney} onClose={() => setIsQuestionnaireOpen(false)} />}

      <InfoPanel isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
      
      {hasStarted && !isGraphicsOnly && (
        <ControlNodes
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          baseFrequency={baseFrequency}
          setBaseFrequency={setBaseFrequency}
          scaleName={scaleName}
          setScaleName={setScaleName}
          harmonicMix={harmonicMix}
          setHarmonicMix={setHarmonicMix}
          spatialSpread={spatialSpread}
          setSpatialSpread={setSpatialSpread}
        />
      )}
      
      {audioContextRef.current && (
        <SoundscapeEngine 
          audioContext={audioContextRef.current} 
          isPlaying={isPlaying} 
          onAnalyserReady={setAnalyserNode}
          baseFrequency={baseFrequency}
          scaleRatios={currentScale.ratios}
          harmonicMix={harmonicMix}
          spatialSpread={spatialSpread}
        />
      )}
    </div>
  );
};

export default App;
