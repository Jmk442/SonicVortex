import React from 'react';
import { FEELING_MAPPINGS, JOURNEY_DURATIONS } from '../constants';
import { Sparkles, ArrowRight, ShieldAlert, Timer, X } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (baseFreq: number, scale: string, duration: number) => void;
  onClose: () => void;
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete, onClose }) => {
  const [step, setStep] = React.useState(1);
  const [userText, setUserText] = React.useState('');
  const [selection, setSelection] = React.useState({ feeling: 'creative', duration: 180 });
  const [lastJourney, setLastJourney] = React.useState<{freq: number, scale: string, duration: number} | null >(null);

  React.useEffect(() => {
    const saved = localStorage.getItem('sonic_vortex_last_journey');
    if (saved) {
      try {
        setLastJourney(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse last journey", e);
      }
    }
  }, []);

  const analyzeFeeling = () => {
    if (!userText.trim()) return;
    
    const text = userText.toLowerCase();
    let bestMatch = 'creative'; // Default

    const keywords: Record<string, string[]> = {
      anxious: ['anxious', 'anxiety', 'worried', 'panic', 'nervous'],
      tired: ['tired', 'sleepy', 'exhausted', 'low energy', 'fatigue'],
      disconnected: ['disconnected', 'lonely', 'lost', 'empty'],
      stressed: ['stressed', 'stress', 'pressure', 'busy', 'overwhelmed'],
      restless: ['restless', 'can\'t sleep', 'active', 'fidgety'],
      creative: ['creative', 'art', 'work', 'focus', 'flow']
    };

    for (const [key, words] of Object.entries(keywords)) {
      if (words.some(w => text.includes(w))) {
        bestMatch = key;
        break;
      }
    }

    setSelection(prev => ({ ...prev, feeling: bestMatch }));
    setStep(2);
  };

  const handleQuickStart = () => {
    if (lastJourney) {
      onComplete(lastJourney.freq, lastJourney.scale, lastJourney.duration);
    }
  };

  const finishSelection = () => {
    const mapping = FEELING_MAPPINGS[selection.feeling];
    onComplete(mapping.baseFreq, mapping.scale, selection.duration);
  };

  const currentMapping = FEELING_MAPPINGS[selection.feeling];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050505]/95 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-700 py-12">
        <div className="text-center space-y-8">
          <div className="flex justify-between items-start">
            <div className="flex-1" />
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div className="flex-1 text-right">
              <button 
                onClick={onClose}
                className="p-2 text-purple-300/40 hover:text-purple-300 transition-colors"
                title="Exit"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-light tracking-widest text-purple-100 uppercase">How are you feeling?</h2>
              
              {lastJourney && (
                 <button
                    onClick={handleQuickStart}
                    className="w-full mb-8 p-6 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-100 font-light tracking-widest uppercase hover:bg-purple-500/20 hover:border-purple-500/40 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <Timer className="w-5 h-5 text-purple-400" />
                   Quick Start
                 </button>
              )}

              <div className="space-y-4">
                <textarea
                  value={userText}
                  onChange={(e) => setUserText(e.target.value)}
                  placeholder="Tell the vortex..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-purple-100 placeholder:text-purple-300/20 focus:outline-none focus:border-purple-500/50 transition-colors font-light tracking-wide resize-none"
                />
                <button
                  onClick={analyzeFeeling}
                  disabled={!userText.trim()}
                  className="w-full py-5 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-100 uppercase tracking-[0.3em] font-light hover:bg-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Enter
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
               <div className="space-y-4">
                  <h2 className="text-3xl font-light tracking-widest text-purple-100 uppercase">I hear what you're saying.</h2>
                  <p className="text-purple-300/40 text-sm italic font-light">"The vortex will align with your state: {currentMapping.label}"</p>
               </div>

               <div className="p-8 rounded-3xl bg-purple-500/5 border border-purple-500/10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-purple-400/60 mb-1">Base Resonance</div>
                        <div className="text-xl font-mono text-purple-200">{currentMapping.baseFreq}Hz</div>
                    </div>
                    <div className="p-4 rounded-xl bg-black/40 border border-white/5">
                        <div className="text-[10px] uppercase tracking-widest text-purple-400/60 mb-1">Scale Geometry</div>
                        <div className="text-xl font-light text-purple-200 uppercase tracking-wider">{currentMapping.scale}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest text-purple-400/60 block text-left px-1">Journey Duration</label>
                    <div className="grid grid-cols-3 gap-2">
                      {JOURNEY_DURATIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setSelection(prev => ({ ...prev, duration: d.value }))}
                          className={`py-3 rounded-lg text-xs transition-all border ${selection.duration === d.value ? 'bg-purple-500/30 border-purple-400 text-white shadow-lg' : 'bg-white/5 border-transparent text-purple-300/40 hover:text-purple-300'}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
               </div>

               <button
                  onClick={finishSelection}
                  className="w-full py-6 rounded-2xl bg-purple-500 border border-purple-400 text-white uppercase tracking-[0.5em] font-medium shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
               >
                  Begin Journey
               </button>

               <button 
                onClick={() => setStep(1)} 
                className="text-[10px] uppercase tracking-widest text-purple-400/50 hover:text-purple-400 transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          <div className="pt-12 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-500/60 uppercase tracking-[0.2em] text-[9px]">
               <ShieldAlert className="w-3 h-3" />
               <span>Wellness Guidance</span>
            </div>
            <p className="text-[10px] text-white/20 italic leading-relaxed max-w-sm mx-auto">
              This application is intended for relaxation support and mindfulness practice. 
              It is not a medical device. For medical treatment, please consult your general practitioner or medical practitioner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
