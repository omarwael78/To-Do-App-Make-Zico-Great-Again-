import { useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MUTE_KEY = 'taskflow-sound-muted';

/**
 * Tiny synthesized sound effects via WebAudio — no audio files needed.
 * The AudioContext is created lazily on the first playback (browsers require
 * a user gesture, which is always the case here since sounds play on clicks).
 */
export function useSounds() {
  const [muted, setMuted] = useLocalStorage<boolean>(MUTE_KEY, false);
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return null;
        ctxRef.current = new Ctor();
      }
      if (ctxRef.current.state === 'suspended') void ctxRef.current.resume();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  /** Schedule a single tone. `start` is an offset in seconds. */
  const tone = useCallback(
    (
      freq: number,
      start: number,
      dur: number,
      type: OscillatorType = 'sine',
      vol = 0.18
    ) => {
      if (muted) return;
      const ac = getContext();
      if (!ac) return;
      try {
        const t0 = ac.currentTime + start;
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(t0);
        osc.stop(t0 + dur + 0.05);
      } catch {
        /* audio unavailable */
      }
    },
    [muted, getContext]
  );

  /** Task completed — bright double blip. */
  const playComplete = useCallback(() => {
    tone(660, 0, 0.11, 'triangle', 0.16);
    tone(990, 0.06, 0.16, 'triangle', 0.16);
  }, [tone]);

  /** Coin earned — sparkly high ding. */
  const playCoin = useCallback(() => {
    tone(1318, 0, 0.16, 'sine', 0.2);
    tone(1760, 0.06, 0.28, 'sine', 0.12);
  }, [tone]);

  /** Streak level-up — rising fanfare. */
  const playLevelUp = useCallback(() => {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2, 'triangle', 0.2));
  }, [tone]);

  /** Perfect day — happy arpeggio. */
  const playPerfect = useCallback(() => {
    [784, 1047, 1319, 1568].forEach((f, i) => tone(f, i * 0.07, 0.22, 'sine', 0.2));
  }, [tone]);

  /** Purchase — two quick chimes. */
  const playBuy = useCallback(() => {
    tone(880, 0, 0.1, 'sine', 0.18);
    tone(1320, 0.08, 0.18, 'sine', 0.18);
  }, [tone]);

  /** Locked / cannot afford — friendly low buzz. */
  const playLocked = useCallback(() => {
    tone(220, 0, 0.14, 'square', 0.06);
    tone(175, 0.1, 0.2, 'square', 0.06);
  }, [tone]);

  /** Equip / unequip — soft click. */
  const playToggle = useCallback(() => {
    tone(520, 0, 0.06, 'triangle', 0.12);
  }, [tone]);

  /** Daily chest — treasure fanfare. */
  const playChest = useCallback(() => {
    [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.2, 'triangle', 0.2));
  }, [tone]);

  return {
    muted,
    setMuted,
    playComplete,
    playCoin,
    playLevelUp,
    playPerfect,
    playBuy,
    playLocked,
    playToggle,
    playChest,
  };
}
