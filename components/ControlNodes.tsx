import React, { useState } from 'react';
import { Play, Pause, Flame } from 'lucide-react';
import { WILSONIC_SCALES, FREQUENCY_CATEGORIES } from '../constants';
import { Target, Sparkles, Activity, Brain } from 'lucide-react';

interface ControlNodesProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  baseFrequency: number;
  setBaseFrequency: (value: number) => void;
  scaleName: string;
  setScaleName: (name: string) => void;
  harmonicMix: number;
  setHarmonicMix: (value: number) => void;
  spatialSpread: number;
  setSpatialSpread: (value: number) => void;
}

const ControlNodes: React.FC<ControlNodesProps> = (props) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const getIconForCategory = (catId: string) => {
        switch(catId) {
            case 'solfeggio': return <Sparkles className="w-3 h-3" />;
            case 'meditation': return <Brain className="w-3 h-3" />;
            case 'manifestation': return <Target className="w-3 h-3" />;
            case 'wellness': return <Activity className="w-3 h-3" />;
            default: return null;
        }
    };

  return (
    <div className="absolute bottom-8 left-8 z-30 flex items-end gap-6 pointer-events-auto">
      <button
        onClick={props.onTogglePlay}
        className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/50 text-purple-200 flex items-center justify-center transition-all duration-500 ease-out hover:bg-purple-500/20 hover:scale-110 hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50 flex-shrink-0 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
        aria-label={props.isPlaying ? 'Pause' : 'Play'}
      >
        {props.isPlaying ? <Pause className="w-10 h-10 fill-purple-300/20" /> : <Play className="w-10 h-10 fill-purple-300/20 ml-1" />}
      </button>

      <div className={`bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl md:p-6 p-4 transition-all duration-700 ease-in-out fixed md:relative bottom-32 md:bottom-0 left-4 right-4 md:left-0 md:right-0 ${isExpanded ? 'max-h-[60vh] opacity-100 scale-100 translate-y-0' : 'max-h-0 opacity-0 scale-95 translate-y-4 overflow-hidden'}`}>
        <div className="space-y-6 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
            {/* Healing Presets */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-[0.2em] text-purple-200/50 uppercase">Therapeutic Resonances</label>
                <div className="grid grid-cols-1 gap-4">
                    {Object.entries(FREQUENCY_CATEGORIES).map(([catId, category]) => (
                        <div key={catId} className="space-y-2">
                            <div className="flex items-center gap-2 px-1">
                                {getIconForCategory(catId)}
                                <span className="text-[10px] text-purple-300/40 uppercase tracking-widest font-semibold">{category.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {category.presets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => props.setBaseFrequency(preset.frequency)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10px] transition-all border ${
                                            Math.abs(props.baseFrequency - preset.frequency) < 0.1
                                            ? 'bg-purple-500/40 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-white/5 border-white/5 text-purple-200/60 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="font-mono mb-0.5">{preset.name}</div>
                                        {/* Hide description on mobile to save space unless explicitly needed, but keep it accessible */}
                                        <div className="text-[8px] opacity-40 hidden md:block max-w-[80px] truncate">{preset.description}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* Scalar Node */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-purple-200/50 uppercase">Manual Scalar (Hz)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            value={props.baseFrequency}
                            onChange={e => props.setBaseFrequency(Number(e.target.value))}
                            className="bg-purple-900/40 border border-purple-500/30 text-[10px] font-mono text-purple-200 w-16 px-1 py-0.5 rounded outline-none focus:border-purple-400"
                        />
                        <span className="text-[10px] font-mono text-purple-400/80">Hz</span>
                    </div>
                </div>
                <input 
                    type="range" 
                    min="55" 
                    max="963" 
                    step="0.1" 
                    value={props.baseFrequency} 
                    onChange={e => props.setBaseFrequency(Number(e.target.value))} 
                    className="w-full h-1 bg-purple-900/30 rounded-full appearance-none cursor-pointer accent-purple-500" 
                />
            </div>

            {/* Dimensional Node */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-[0.2em] text-purple-200/50 uppercase">Wilsonic Geometry</label>
                <div className="relative">
                    <select 
                        value={props.scaleName} 
                        onChange={e => props.setScaleName(e.target.value)} 
                        className="w-full bg-purple-900/20 border border-purple-500/30 text-purple-100 text-xs rounded-lg py-2.5 px-3 outline-none focus:border-purple-400/50 appearance-none transition-colors"
                    >
                        {Object.entries(WILSONIC_SCALES).map(([key, value]) => (
                            <option key={key} value={key} className="bg-[#0a0a0a]">{value.name}</option>
                        ))}
                    </select>
                </div>
            </div>

             {/* Harmonic Node */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-purple-200/50 uppercase">Harmonic Matrix</label>
                    <span className="text-[10px] font-mono text-purple-400/80">{Math.round(props.harmonicMix * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={props.harmonicMix} 
                    onChange={e => props.setHarmonicMix(Number(e.target.value))} 
                    className="w-full h-1 bg-purple-900/30 rounded-full appearance-none cursor-pointer accent-purple-500" 
                />
            </div>

             {/* Spatial Node */}
             <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-[0.2em] text-purple-200/50 uppercase">Spatial Field</label>
                    <span className="text-[10px] font-mono text-purple-400/80">{Math.round(props.spatialSpread * 100)}%</span>
                </div>
                <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={props.spatialSpread} 
                    onChange={e => props.setSpatialSpread(Number(e.target.value))} 
                    className="w-full h-1 bg-purple-900/30 rounded-full appearance-none cursor-pointer accent-purple-500" 
                />
            </div>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(p => !p)} 
        className="w-12 h-12 rounded-full bg-black/40 border border-purple-500/30 text-purple-300 flex items-center justify-center hover:bg-purple-900/40 hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]"
      >
        <Flame className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180 scale-110' : ''}`} />
      </button>
    </div>
  );
};

export default ControlNodes;
