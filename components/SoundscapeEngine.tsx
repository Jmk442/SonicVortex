import React, { useEffect, useRef } from 'react';
import * as C from '../constants';

interface SoundscapeEngineProps {
  audioContext: AudioContext;
  isPlaying: boolean;
  onAnalyserReady?: (analyser: AnalyserNode) => void;
  baseFrequency: number;
  scaleRatios: number[];
  harmonicMix: number; // 0 for sine, 1 for sawtooth
  spatialSpread: number; // 0 for mono, 1 for wide stereo
}

type HeldTone = {
  osc1: OscillatorNode; // Sine
  osc2: OscillatorNode; // Triangle (soft synth)
  gain1: GainNode;
  gain2: GainNode;
  filter: BiquadFilterNode;
  panner: StereoPannerNode;
  masterGain: GainNode;
};

const SoundscapeEngine: React.FC<SoundscapeEngineProps> = ({ 
  audioContext, 
  isPlaying, 
  onAnalyserReady,
  baseFrequency,
  scaleRatios,
  harmonicMix,
  spatialSpread,
}) => {
    const masterGainRef = useRef<GainNode | null>(null);
    const limiterRef = useRef<DynamicsCompressorNode | null>(null);
    const staticNodesRef = useRef<AudioNode[]>([]);
    const heldTonesRef = useRef<HeldTone[]>([]);
    const startedRef = useRef(false);

    // Setup effect, runs once to create persistent nodes
    useEffect(() => {
        const limiter = audioContext.createDynamicsCompressor();
        limiter.threshold.value = -3;
        limiter.knee.value = 40;
        limiter.ratio.value = 12;
        limiter.attack.value = 0;
        limiter.release.value = 0.25;

        const masterGain = audioContext.createGain();
        masterGain.gain.value = 0;
        
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;

        masterGain.connect(limiter).connect(analyser).connect(audioContext.destination);
        if (onAnalyserReady) onAnalyserReady(analyser);
        
        masterGainRef.current = masterGain;
        limiterRef.current = limiter;
        const staticNodes: AudioNode[] = [masterGain, limiter, analyser];

        const createBinaural = (base: number, diff: number, gain: number) => {
            const oscL = audioContext.createOscillator();
            oscL.type = 'sine';
            oscL.frequency.value = base;
            const pannerL = audioContext.createStereoPanner();
            pannerL.pan.value = -1;
            const gainL = audioContext.createGain();
            gainL.gain.value = gain;
            oscL.connect(pannerL).connect(gainL).connect(masterGain);

            const oscR = audioContext.createOscillator();
            oscR.type = 'sine';
            oscR.frequency.value = base + diff;
            const pannerR = audioContext.createStereoPanner();
            pannerR.pan.value = 1;
            const gainR = audioContext.createGain();
            gainR.gain.value = gain;
            oscR.connect(pannerR).connect(gainR).connect(masterGain);
            
            staticNodes.push(oscL, pannerL, gainL, oscR, pannerR, gainR);
        };
        
        // Sub Bass (Softer)
        const subOsc = audioContext.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.value = C.SUB_BASS_FREQ;
        const subGain = audioContext.createGain();
        subGain.gain.value = 0.2;
        subOsc.connect(subGain).connect(masterGain);
        staticNodes.push(subOsc, subGain);

        // Focus Binaural (Theta range for meditation)
        createBinaural(C.FOCUS_BINAURAL_BASE, 6.0, 0.1); 

        // Oscillating Binaural
        const oscBinL = audioContext.createOscillator(); oscBinL.type = 'sine';
        oscBinL.frequency.value = C.OSCILLATING_BINAURAL_BASE;
        const pannerL = audioContext.createStereoPanner(); pannerL.pan.value = -1;
        const gainL = audioContext.createGain(); gainL.gain.value = 0.08;
        oscBinL.connect(pannerL).connect(gainL).connect(masterGain);

        const oscBinR = audioContext.createOscillator(); oscBinR.type = 'sine';
        const diffMid = (C.OSCILLATING_BINAURAL_DIFF_END + C.OSCILLATING_BINAURAL_DIFF_START) / 2;
        oscBinR.frequency.value = C.OSCILLATING_BINAURAL_BASE + diffMid;
        const pannerR = audioContext.createStereoPanner(); pannerR.pan.value = 1;
        const gainR = audioContext.createGain(); gainR.gain.value = 0.08;
        oscBinR.connect(pannerR).connect(gainR).connect(masterGain);

        const lfo = audioContext.createOscillator(); lfo.type = 'sine';
        lfo.frequency.value = 1 / C.OSCILLATING_BINAURAL_PERIOD_S;
        const lfoGain = audioContext.createGain();
        const diffRange = (C.OSCILLATING_BINAURAL_DIFF_END - C.OSCILLATING_BINAURAL_DIFF_START) / 2;
        lfoGain.gain.value = diffRange;
        lfo.connect(lfoGain).connect(oscBinR.frequency);
        
        staticNodes.push(oscBinL, pannerL, gainL, oscBinR, pannerR, gainR, lfo, lfoGain);
        staticNodesRef.current = staticNodes;
        
        return () => {
            staticNodes.forEach(node => node.disconnect());
            heldTonesRef.current.forEach(tone => tone.masterGain.disconnect());
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioContext]);

    // Effect for play/pause master gain
    useEffect(() => {
        const masterGain = masterGainRef.current;
        if (!masterGain || !audioContext) return;
        const now = audioContext.currentTime;
        if (isPlaying) {
            if (!startedRef.current) {
                const allNodes = [...staticNodesRef.current, ...heldTonesRef.current.flatMap(t => [t.osc1, t.osc2])];
                allNodes.forEach(node => {
                    if (node instanceof OscillatorNode) node.start(now);
                });
                startedRef.current = true;
            }
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.linearRampToValueAtTime(0.4, now + 5.0); // Slow fade in
        } else {
            masterGain.gain.cancelScheduledValues(now);
            masterGain.gain.linearRampToValueAtTime(0.0, now + 5.0); // Slow fade out
        }
    }, [isPlaying, audioContext]);
    
    // Effect for managing dynamic held tones based on controls
    useEffect(() => {
        const now = audioContext.currentTime;
        const rampTime = now + 2.0;

        // Clean up old tones
        heldTonesRef.current.forEach(tone => {
            tone.masterGain.gain.cancelScheduledValues(now);
            tone.masterGain.gain.linearRampToValueAtTime(0, rampTime);
            setTimeout(() => {
                tone.osc1.disconnect();
                tone.osc2.disconnect();
                tone.filter.disconnect();
                tone.masterGain.disconnect();
            }, 2500);
        });

        const newTones: HeldTone[] = scaleRatios.map((ratio, i) => {
            const masterGain = audioContext.createGain();
            masterGain.gain.value = 0;
            const panner = audioContext.createStereoPanner();
            const filter = audioContext.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800; // Muffled soft tone
            filter.Q.value = 1;

            masterGain.connect(filter).connect(panner).connect(masterGainRef.current!);

            const osc1 = audioContext.createOscillator(); osc1.type = 'sine';
            const gain1 = audioContext.createGain();
            osc1.connect(gain1).connect(masterGain);
            
            const osc2 = audioContext.createOscillator(); osc2.type = 'triangle'; // triangle is softer
            const gain2 = audioContext.createGain();
            osc2.connect(gain2).connect(masterGain);
            
            if (startedRef.current) {
              osc1.start(now);
              osc2.start(now);
            }

            return { osc1, osc2, gain1, gain2, filter, panner, masterGain };
        });

        heldTonesRef.current = newTones;

    }, [scaleRatios, audioContext]);

    // Effect for updating tone parameters
    useEffect(() => {
        const now = audioContext.currentTime;
        const rampTime = now + 0.5;
        const totalTones = heldTonesRef.current.length;
        const toneGain = 0.4 / totalTones; 

        heldTonesRef.current.forEach((tone, i) => {
            const ratio = scaleRatios[i];
            tone.osc1.frequency.exponentialRampToValueAtTime(baseFrequency * ratio, rampTime);
            tone.osc2.frequency.exponentialRampToValueAtTime(baseFrequency * ratio, rampTime);
            
            tone.gain1.gain.linearRampToValueAtTime(1.0 - harmonicMix, rampTime); 
            tone.gain2.gain.linearRampToValueAtTime(harmonicMix * 0.3, rampTime); 

            // Filter opens with harmonic mix
            tone.filter.frequency.linearRampToValueAtTime(400 + harmonicMix * 2000, rampTime);

            const pan = totalTones > 1 ? -1 + (2 * i / (totalTones - 1)) : 0;
            tone.panner.pan.linearRampToValueAtTime(pan * spatialSpread, rampTime);

            if (isPlaying) {
                tone.masterGain.gain.linearRampToValueAtTime(toneGain, rampTime);
            }
        });

    }, [baseFrequency, scaleRatios, harmonicMix, spatialSpread, isPlaying, audioContext]);


    return null;
};

export default SoundscapeEngine;