import React from 'react';
import { X, BookOpen, Zap, Wind, Heart, BrainCircuit } from 'lucide-react';

interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = React.useState<'wisdom' | 'science'>('wisdom');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-neutral-900/90 border border-purple-500/30 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-purple-900/20 to-transparent gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-light tracking-widest text-purple-100 uppercase">Sonic Insights</h2>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 pointer-events-auto">
            <button 
              onClick={() => setActiveTab('wisdom')}
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${activeTab === 'wisdom' ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-300/40 hover:text-purple-300'}`}
            >
              Wisdom
            </button>
            <button 
              onClick={() => setActiveTab('science')}
              className={`px-4 py-1.5 rounded-lg text-[10px] uppercase tracking-widest transition-all ${activeTab === 'science' ? 'bg-purple-500 text-white shadow-lg' : 'text-purple-300/40 hover:text-purple-300'}`}
            >
              Science
            </button>
          </div>

          <button 
            onClick={onClose}
            className="hidden md:block p-2 hover:bg-white/10 rounded-full transition-colors text-purple-300 pointer-events-auto"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
          {activeTab === 'wisdom' ? (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Section: Solfeggio */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-purple-300">
                  <Zap className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide uppercase font-light">The Solfeggio Scale</h3>
                </div>
                <p className="text-purple-200/60 leading-relaxed font-light">
                  Ancient sound frequencies used in healing. These tones help reorganize the structure of the bio-field and facilitate cellular repair.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="text-purple-400 font-mono text-sm font-bold">174 Hz</div>
                    <p className="text-[10px] text-purple-200/50 uppercase tracking-wider font-light">Foundation & Security</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="text-purple-400 font-mono text-sm font-bold">528 Hz</div>
                    <p className="text-[10px] text-purple-200/50 uppercase tracking-wider font-light">Transformation & Love</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <div className="text-purple-400 font-mono text-sm font-bold">963 Hz</div>
                    <p className="text-[10px] text-purple-200/50 uppercase tracking-wider font-light">Divine Connection</p>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-purple-300">
                  <Heart className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide uppercase font-light">Spiritual Intent</h3>
                </div>
                <p className="text-purple-200/60 leading-relaxed font-light text-sm italic border-l border-purple-500/30 pl-4">
                  "Enter the vortex with intention. Allow the frequencies to wash away the noise of the external world, returning you to your primary geometric state."
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Section: Wilsonic Geometry */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 text-purple-300">
                  <Wind className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide uppercase font-light">Scalar Math & Wilsonic Geometry</h3>
                </div>
                <p className="text-purple-200/60 leading-relaxed font-light text-sm">
                  The vortex uses <strong>Erv Wilson's</strong> generalized keyboard mappings. Unlike 12-Tone Equal Temperament (12-TET), which uses irrational numbers causing dissonant harmonic beating, Wilson's systems use pure integer ratios (3:2, 5:4, 7:6).
                </p>
                <div className="bg-black/40 p-4 rounded-xl border border-white/10 space-y-2">
                   <h5 className="text-purple-300/80 text-[10px] uppercase font-bold tracking-widest">Technical Spec</h5>
                   <ul className="text-[11px] text-purple-200/40 space-y-1 font-mono">
                     <li>• Tone Generation: Additive Synthesis (Sine + Filtered Triangle)</li>
                     <li>• Scale Structure: Wilsonic Hexany & Eikosany</li>
                     <li>• Dynamic Ranging: 32-bit float internal depth with DynamicsCompression</li>
                   </ul>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-3 text-purple-300">
                  <BrainCircuit className="w-5 h-5" />
                  <h3 className="text-lg font-medium tracking-wide uppercase font-light">Binaural Phasing</h3>
                </div>
                <p className="text-purple-200/60 leading-relaxed font-light text-sm">
                  We employ two layers of binaural beats. A fixed carrier at 40Hz (Gamma) for focus, and an oscillating carrier to induce deep Theta-Alpha induction. This creates "brainwave entrainment" via frequency following response.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 flex justify-between items-center border-t border-white/5">
          <p className="text-[10px] text-purple-400/30 uppercase tracking-[0.3em]">Vortex Architecture v1.5 • Scalar Field</p>
          <button className="md:hidden text-[10px] uppercase tracking-widest text-purple-400 pointer-events-auto" onClick={onClose}>Close Window</button>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
