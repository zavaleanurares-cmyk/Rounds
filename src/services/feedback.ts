import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Sound and haptics, as one call.
 *
 * Every moment in the app that deserves feedback calls `feedback('log')`, not
 * `Haptics.impactAsync(...)` and separately `playSound(...)`. Keeping the pair
 * in one table is what stops the two drifting apart — a haptic with no sound,
 * or a sound firing on a screen that has no haptic, is the usual way this kind
 * of thing rots.
 *
 * Both channels are individually switchable in Settings and both default to
 * something defensible: haptics on, sound OFF. This is an app people open in a
 * bar, a taxi and a bedroom; it does not get to make noise until asked.
 *
 * Audio is loaded lazily on first use and the players are kept, because
 * creating a player per tap adds tens of milliseconds and the tap sound would
 * land after the tap.
 */

export type Cue =
  | 'tap'      // a selection changed
  | 'log'      // one drink recorded
  | 'round'    // a round recorded
  | 'start'    // a night started
  | 'end'      // a night ended
  | 'unlock'   // an achievement
  | 'levelup'
  | 'streak'
  | 'nudge'    // the app checking in on you — deliberately not an alarm
  | 'error';

type Haptic = 'selection' | 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'failure' | null;

/**
 * The pairing table. A cue is a MEANING, not a sound file — screens name what
 * happened and this decides how it feels.
 */
const CUES: Record<Cue, { haptic: Haptic; sound: boolean }> = {
  tap: { haptic: 'selection', sound: true },
  log: { haptic: 'light', sound: true },
  round: { haptic: 'medium', sound: true },
  start: { haptic: 'success', sound: true },
  end: { haptic: 'medium', sound: true },
  unlock: { haptic: 'success', sound: true },
  levelup: { haptic: 'success', sound: true },
  streak: { haptic: 'light', sound: true },
  // Safety never buzzes hard and never plays over a locked phone's ringer
  // profile; it is a nudge, not a siren.
  nudge: { haptic: 'warning', sound: true },
  error: { haptic: 'failure', sound: true },
};

/**
 * `require` calls have to be literal for Metro to see them, so the sound files
 * are listed rather than looked up by name.
 */
const FILES: Record<Cue, number> = {
  tap: require('../../assets/sound/tap.m4a'),
  log: require('../../assets/sound/log.m4a'),
  round: require('../../assets/sound/round.m4a'),
  start: require('../../assets/sound/start.m4a'),
  end: require('../../assets/sound/end.m4a'),
  unlock: require('../../assets/sound/unlock.m4a'),
  levelup: require('../../assets/sound/levelup.m4a'),
  streak: require('../../assets/sound/streak.m4a'),
  nudge: require('../../assets/sound/nudge.m4a'),
  error: require('../../assets/sound/error.m4a'),
};

let enabled = { sound: false, haptics: true };

/** Called by the store whenever settings change. */
export function configureFeedback(next: { sound: boolean; haptics: boolean }) {
  enabled = next;
  if (next.sound) void warm();
}

/* --------------------------------------------------------------- audio */

type Player = { play: () => void; seekTo: (s: number) => Promise<void>; volume: number; remove: () => void };

const players = new Map<Cue, Player>();
let audioReady: Promise<void> | null = null;
let audio: typeof import('expo-audio') | null = null;

/**
 * A static require, not a dynamic import: Metro resolves requires at build
 * time, and a bundle that cannot find `expo-audio` should fail loudly here in
 * one place rather than at the first tap.
 */
async function initAudio() {
  if (audio) return;
  try {
    audio = require('expo-audio') as typeof import('expo-audio');
    await audio.setAudioModeAsync({
      // Sound effects must never interrupt whatever is playing — this app is
      // used while music is on, by definition.
      interruptionMode: 'mixWithOthers',
      // If the phone is on silent, it stays silent. Overriding that is a
      // hostile thing for an app to do at 2am.
      playsInSilentMode: false,
      shouldPlayInBackground: false,
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
  } catch {
    audio = null;
  }
}

/** Pre-creates the players so the first cue is not late. */
export async function warm(): Promise<void> {
  if (audioReady) return audioReady;
  audioReady = (async () => {
    await initAudio();
    if (!audio) return;
    for (const cue of Object.keys(FILES) as Cue[]) {
      try {
        const p = audio.createAudioPlayer(FILES[cue]) as unknown as Player;
        p.volume = cue === 'tap' ? 0.45 : 0.8;
        players.set(cue, p);
      } catch {
        /* one missing sound must not take the rest down */
      }
    }
  })();
  return audioReady;
}

async function playCue(cue: Cue) {
  await warm();
  const p = players.get(cue);
  if (!p) return;
  try {
    // Restart rather than overlap: two taps in quick succession should sound
    // like two taps, not like a chord.
    await p.seekTo(0);
    p.play();
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------- haptics */

function playHaptic(kind: Haptic) {
  if (!kind || Platform.OS === 'web') return;
  try {
    switch (kind) {
      case 'selection':
        void Haptics.selectionAsync();
        break;
      case 'light':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'warning':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'failure':
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  } catch {
    /* a device with no taptic engine is not an error */
  }
}

/* ---------------------------------------------------------------- api */

/** Fire a cue. Safe to call from anywhere, never throws, never awaits. */
export function feedback(cue: Cue) {
  const spec = CUES[cue];
  if (!spec) return;
  if (enabled.haptics) playHaptic(spec.haptic);
  if (enabled.sound && spec.sound) void playCue(cue);
}

/** Plays a cue's sound regardless of the setting — used by the preview button. */
export function previewCue(cue: Cue) {
  playHaptic(CUES[cue].haptic);
  void playCue(cue);
}

/** Frees the players. Called when sound is switched off. */
export function releaseFeedback() {
  players.forEach((p) => {
    try {
      p.remove();
    } catch {
      /* ignore */
    }
  });
  players.clear();
  audioReady = null;
}
