import { useCallback, useEffect, useRef, useState } from "react";
import { NOTE_FREQUENCIES, type NoteName } from "../shared/noteFrequencies";
import type { AudioContextResult, AudioError } from "./types";

export const useAudioContext = (): AudioContextResult => {
	const audioContextRef = useRef<AudioContext | null>(null);
	const oscillatorRef = useRef<OscillatorNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const [error, setError] = useState<AudioError | null>(null);

	const isSupported = useCallback(
		() =>
			!!(
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext
			),
		[],
	);

	const initializeAudioContext = useCallback(() => {
		if (!audioContextRef.current) {
			if (!isSupported()) {
				const audioError: AudioError = {
					type: "WEB_AUDIO_API_NOT_SUPPORTED",
					message: "お使いのブラウザはWeb Audio APIをサポートしていません。",
				};
				setError(audioError);
				return false;
			}

			try {
				const AudioContextClass =
					window.AudioContext ||
					(window as unknown as { webkitAudioContext: typeof AudioContext })
						.webkitAudioContext;
				audioContextRef.current = new AudioContextClass();
				setError(null);
			} catch (cause) {
				const audioError: AudioError = {
					type: "AUDIO_CONTEXT_CREATION_FAILED",
					message: "Audio Contextの作成に失敗しました。",
					cause,
				};
				setError(audioError);
				return false;
			}
		}
		return true;
	}, [isSupported]);

	const stopNote = useCallback(() => {
		if (
			oscillatorRef.current &&
			gainNodeRef.current &&
			audioContextRef.current
		) {
			try {
				const audioContext = audioContextRef.current;
				const currentTime = audioContext.currentTime;
				const currentOscillator = oscillatorRef.current;
				const currentGainNode = gainNodeRef.current;

				// refを即座にクリア（新しい音の再生を妨げないため）
				oscillatorRef.current = null;
				gainNodeRef.current = null;

				// フェードアウト効果
				currentGainNode.gain.setValueAtTime(
					currentGainNode.gain.value,
					currentTime,
				);
				currentGainNode.gain.linearRampToValueAtTime(0, currentTime + 0.01);

				// 少し遅延させて停止（但しローカル変数を使用）
				setTimeout(() => {
					try {
						currentOscillator.stop();
					} catch (error) {
						// オシレーターが既に停止している場合は無視
						console.warn("Oscillator stop warning:", error);
					}
				}, 20);
			} catch (cause) {
				const audioError: AudioError = {
					type: "NOTE_STOP_FAILED",
					message: "音の停止に失敗しました。",
					cause,
				};
				setError(audioError);
				oscillatorRef.current = null;
				gainNodeRef.current = null;
			}
		}
	}, []);

	const playFrequency = useCallback(
		(frequency: number, debugInfo?: string) => {
			if (!initializeAudioContext()) return;

			// 既存の音を停止
			stopNote();

			if (!audioContextRef.current) return;
			const audioContext = audioContextRef.current;

			try {
				// オシレーターとゲインノードを作成
				const oscillator = audioContext.createOscillator();
				const gainNode = audioContext.createGain();

				oscillator.type = "sine";
				oscillator.frequency.setValueAtTime(
					frequency,
					audioContext.currentTime,
				);

				// フェードイン効果
				gainNode.gain.setValueAtTime(0, audioContext.currentTime);
				gainNode.gain.linearRampToValueAtTime(
					0.3,
					audioContext.currentTime + 0.01,
				);

				// ノードを接続
				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				// 再生開始
				oscillator.start();

				// 参照を保存
				oscillatorRef.current = oscillator;
				gainNodeRef.current = gainNode;
			} catch (cause) {
				const audioError: AudioError = {
					type: "NOTE_PLAYBACK_FAILED",
					message: `周波数 ${frequency}Hz${debugInfo ? ` (${debugInfo})` : ""} の再生に失敗しました。`,
					cause,
				};
				setError(audioError);
			}
		},
		[initializeAudioContext, stopNote],
	);

	const playNote = useCallback(
		(note: NoteName) => {
			const frequency = NOTE_FREQUENCIES[note];
			playFrequency(frequency, note);
		},
		[playFrequency],
	);

	const isPlaying = useCallback(() => {
		return oscillatorRef.current !== null;
	}, []);

	// クリーンアップ
	useEffect(() => {
		return () => {
			stopNote();
			if (audioContextRef.current) {
				audioContextRef.current.close();
			}
		};
	}, [stopNote]);

	return {
		playNote,
		playFrequency,
		stopNote,
		isPlaying,
		isSupported,
		error,
	};
};
