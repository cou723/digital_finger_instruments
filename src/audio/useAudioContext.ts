import { useCallback, useEffect, useRef, useState } from "react";
import { NOTE_FREQUENCIES, type NoteName } from "../shared/noteFrequencies";
import {
	createEnvelopeController,
	DEFAULT_ENVELOPE,
	type EnvelopeConfig,
	type EnvelopeController,
} from "./envelopeSystem";
import type { AudioContextResult, AudioError } from "./types";

export const useAudioContext = (): AudioContextResult => {
	const audioContextRef = useRef<AudioContext | null>(null);
	const oscillatorRef = useRef<OscillatorNode | null>(null);
	const gainNodeRef = useRef<GainNode | null>(null);
	const envelopeControllerRef = useRef<EnvelopeController | null>(null);
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
		// エンベロープ制御で即座に停止
		if (envelopeControllerRef.current) {
			envelopeControllerRef.current.stop();
		}

		// 従来の停止処理も実行（フォールバック）
		if (
			oscillatorRef.current &&
			gainNodeRef.current &&
			audioContextRef.current
		) {
			try {
				const currentOscillator = oscillatorRef.current;

				// 少し遅延させて停止
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
			}
		}

		// リソースクリア
		oscillatorRef.current = null;
		gainNodeRef.current = null;
		if (envelopeControllerRef.current) {
			envelopeControllerRef.current.dispose();
			envelopeControllerRef.current = null;
		}
	}, []);

	const playFrequency = useCallback(
		(
			frequency: number,
			debugInfo?: string,
			envelopeConfig: EnvelopeConfig = DEFAULT_ENVELOPE,
			autoReleaseTime = 1.0, // 1秒後に自動リリース開始
			onEnvelopeComplete?: () => void, // エンベロープ完了時のコールバック
		) => {
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

				// ノードを接続
				oscillator.connect(gainNode);
				gainNode.connect(audioContext.destination);

				// エンベロープ制御を作成
				const envelopeController = createEnvelopeController(
					audioContext,
					gainNode,
				);

				// エンベロープ完了時のコールバック設定
				envelopeController.onReleaseComplete = () => {
					try {
						oscillator.stop();
					} catch (error) {
						console.warn("Oscillator stop warning:", error);
					}
					// リソースクリア
					oscillatorRef.current = null;
					gainNodeRef.current = null;
					if (envelopeControllerRef.current === envelopeController) {
						envelopeControllerRef.current = null;
					}
					envelopeController.dispose();

					// UI状態更新のコールバック実行
					onEnvelopeComplete?.();
				};

				// 再生開始
				oscillator.start();

				// エンベロープ開始（自動リリース付き）
				envelopeController.start(envelopeConfig, autoReleaseTime);

				// 参照を保存
				oscillatorRef.current = oscillator;
				gainNodeRef.current = gainNode;
				envelopeControllerRef.current = envelopeController;
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
		(
			note: NoteName,
			envelopeConfig?: EnvelopeConfig,
			autoReleaseTime?: number,
			onEnvelopeComplete?: () => void,
		) => {
			const frequency = NOTE_FREQUENCIES[note];
			playFrequency(
				frequency,
				note,
				envelopeConfig,
				autoReleaseTime,
				onEnvelopeComplete,
			);
		},
		[playFrequency],
	);

	const isPlaying = useCallback(() => {
		return oscillatorRef.current !== null && gainNodeRef.current !== null;
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
