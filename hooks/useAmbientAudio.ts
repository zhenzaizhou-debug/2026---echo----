'use client';

import { useEffect, useRef } from 'react';

type AudioWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

function noiseBuffer(context: AudioContext, seconds: number) {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    last = last * 0.96 + white * 0.04;
    data[i] = last * 3.2;
  }
  return buffer;
}

function sandStepBuffer(context: AudioContext) {
  const seconds = 0.32;
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  const data = buffer.getChannelData(0);
  let grit = 0;
  let scrape = 0;
  for (let i = 0; i < data.length; i += 1) {
    const progress = i / data.length;
    const attack = Math.min(1, progress / 0.035);
    const decay = Math.pow(1 - progress, 2.35);
    const white = Math.random() * 2 - 1;
    if (Math.random() < 0.016) grit += (Math.random() * 2 - 1) * 1.4;
    grit *= 0.9;
    scrape = scrape * 0.72 + white * 0.28;
    data[i] = (scrape * 0.21 + grit * 0.58 + white * 0.08) * attack * decay;
  }
  return buffer;
}

export function useAmbientAudio(active: boolean, walking: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!active) {
      masterRef.current?.gain.setTargetAtTime(0, contextRef.current?.currentTime ?? 0, 0.4);
      return;
    }

    if (!contextRef.current) {
      const Context = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
      if (!Context) return;
      const context = new Context();
      const master = context.createGain();
      master.gain.value = 0;
      master.connect(context.destination);

      const sea = context.createBufferSource();
      sea.buffer = noiseBuffer(context, 6);
      sea.loop = true;
      const seaFilter = context.createBiquadFilter();
      seaFilter.type = 'lowpass';
      seaFilter.frequency.value = 820;
      const seaGain = context.createGain();
      seaGain.gain.value = 0.17;
      const tide = context.createOscillator();
      tide.frequency.value = 0.105;
      const tideDepth = context.createGain();
      tideDepth.gain.value = 0.08;
      tide.connect(tideDepth).connect(seaGain.gain);
      sea.connect(seaFilter).connect(seaGain).connect(master);

      const wind = context.createBufferSource();
      wind.buffer = noiseBuffer(context, 5);
      wind.loop = true;
      const windFilter = context.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 520;
      windFilter.Q.value = 0.45;
      const windGain = context.createGain();
      windGain.gain.value = 0.035;
      wind.connect(windFilter).connect(windGain).connect(master);

      sea.start();
      wind.start();
      tide.start();
      contextRef.current = context;
      masterRef.current = master;
    }

    void contextRef.current.resume();
    masterRef.current?.gain.setTargetAtTime(0.78, contextRef.current.currentTime, 0.8);
  }, [active]);

  useEffect(() => {
    if (!active || !walking || !contextRef.current || !masterRef.current) return;
    const context = contextRef.current;
    const master = masterRef.current;
    let foot = 0;
    const step = () => {
      const source = context.createBufferSource();
      source.buffer = sandStepBuffer(context);
      source.playbackRate.value = 0.92 + Math.random() * 0.15;

      const textureFilter = context.createBiquadFilter();
      textureFilter.type = 'bandpass';
      textureFilter.frequency.value = 1050 + Math.random() * 360;
      textureFilter.Q.value = 0.62;
      const textureGain = context.createGain();
      textureGain.gain.setValueAtTime(0.18, context.currentTime);
      textureGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

      const weightFilter = context.createBiquadFilter();
      weightFilter.type = 'lowpass';
      weightFilter.frequency.value = 430 + Math.random() * 90;
      const weightGain = context.createGain();
      weightGain.gain.setValueAtTime(0.075, context.currentTime);
      weightGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

      const stepBus = context.createGain();
      const panner = context.createStereoPanner();
      panner.pan.value = foot % 2 === 0 ? -0.12 : 0.12;
      foot += 1;

      source.connect(textureFilter).connect(textureGain).connect(stepBus);
      source.connect(weightFilter).connect(weightGain).connect(stepBus);
      stepBus.connect(panner).connect(master);
      source.start(context.currentTime);
    };
    step();
    const timer = window.setInterval(step, 570);
    return () => window.clearInterval(timer);
  }, [active, walking]);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
      masterRef.current = null;
    };
  }, []);
}
