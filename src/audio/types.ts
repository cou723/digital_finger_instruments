export type AudioError =
	| { type: "WEB_AUDIO_API_NOT_SUPPORTED"; message: string }
	| { type: "AUDIO_CONTEXT_CREATION_FAILED"; message: string; cause?: unknown }
	| {
			type: "NOTE_PLAYBACK_FAILED";
			message: string;
			noteName: string;
			cause?: unknown;
	  }
	| { type: "NOTE_STOP_FAILED"; message: string; cause?: unknown };

export interface AudioContextState {
	context: AudioContext | null;
	oscillator: OscillatorNode | null;
	gainNode: GainNode | null;
	isPlaying: boolean;
	error: AudioError | null;
}

export interface AudioContextResult {
	playNote: (note: string) => void;
	stopNote: () => void;
	isPlaying: () => boolean;
	isSupported: () => boolean;
	error: AudioError | null;
}
