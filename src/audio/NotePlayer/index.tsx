import { useCallback, useEffect, useMemo, useState } from "react";
import type { FrequencyNote } from "../../shared/frequencySystem";
import { getVoiceKeys } from "../../shared/keyTypes";
import {
	type AudioState,
	createEmptyAudioState,
	createEmptyKeyboardState,
	determineOutputScale,
	type KeyboardState,
	type ScaleDecisionConfig,
	updateKeyboardState,
} from "../../shared/scaleDecision";
import { useAudioContext } from "../useAudioContext";

interface NotePlayerProps {
	currentFrequency?: FrequencyNote | null;
	onFrequencyPlay?: (frequency: FrequencyNote) => void;
	onFrequencyStop?: () => void;
	baseNote?: string;
}

export const NotePlayer: React.FC<NotePlayerProps> = ({
	currentFrequency,
	onFrequencyPlay,
	onFrequencyStop,
	baseNote,
}) => {
	const { playFrequency, stopNote, isSupported, error } = useAudioContext();

	// 純粋関数で使用する状態管理
	const [keyboardState, setKeyboardState] = useState<KeyboardState>(
		createEmptyKeyboardState,
	);
	const [_audioState, setAudioState] = useState<AudioState>(
		createEmptyAudioState,
	);

	// 音階決定の設定
	const config: ScaleDecisionConfig = useMemo(
		() => ({
			voiceKeys: getVoiceKeys(),
			priorityStrategy: "last-pressed",
			baseNote: baseNote,
		}),
		[baseNote],
	);

	// 音階決定と再生処理を行う関数
	const processScaleDecision = useCallback(
		(newKeyboardState: KeyboardState, newAudioState: AudioState) => {
			const decision = determineOutputScale(
				newKeyboardState,
				newAudioState,
				config,
			);

			// デバッグログ
			console.log(`🎵 音階決定: ${decision.reason}`);

			// 音の再生・停止処理
			if (decision.shouldPlay && decision.frequencyToPlay) {
				// 周波数ベースで直接再生
				playFrequency(
					decision.frequencyToPlay.frequency,
					`${decision.frequencyToPlay.noteName} (${decision.frequencyToPlay.displayName})`,
				);
				onFrequencyPlay?.(decision.frequencyToPlay);
			} else {
				// 現在再生中で、新しい決定で再生すべきでない場合は停止
				if (newAudioState.currentlyPlayingFrequency && !decision.shouldPlay) {
					stopNote();
					onFrequencyStop?.();
				}
			}

			// 状態を更新
			setKeyboardState(newKeyboardState);
			setAudioState(decision.newAudioState);
		},
		[config, playFrequency, stopNote, onFrequencyPlay, onFrequencyStop],
	);

	useEffect(() => {
		if (!isSupported()) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();

			if (event.repeat) return; // リピートイベントは無視

			// キーボード状態を更新
			const newKeyboardState = updateKeyboardState(
				keyboardState,
				key,
				"press",
				Date.now(),
				config,
			);

			// 現在のオーディオ状態を同期
			const currentAudioState: AudioState = {
				currentlyPlayingFrequency: currentFrequency || undefined,
			};

			// 音階決定と処理実行
			processScaleDecision(newKeyboardState, currentAudioState);
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();

			// キーボード状態を更新
			const newKeyboardState = updateKeyboardState(
				keyboardState,
				key,
				"release",
				Date.now(),
				config,
			);

			// 現在のオーディオ状態を同期
			const currentAudioState: AudioState = {
				currentlyPlayingFrequency: currentFrequency || undefined,
			};

			// 音階決定と処理実行
			processScaleDecision(newKeyboardState, currentAudioState);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [
		isSupported,
		currentFrequency,
		keyboardState,
		config, // 音階決定と処理実行
		processScaleDecision,
	]);

	if (!isSupported() || error?.type === "WEB_AUDIO_API_NOT_SUPPORTED") {
		return (
			<div
				style={{
					padding: "20px",
					backgroundColor: "#ff6b6b",
					color: "white",
					borderRadius: "8px",
					textAlign: "center",
				}}
			>
				{error?.message ||
					"お使いのブラウザはWeb Audio APIをサポートしていません。"}
			</div>
		);
	}

	if (error) {
		return (
			<div
				style={{
					padding: "20px",
					backgroundColor: "#ffa726",
					color: "white",
					borderRadius: "8px",
					textAlign: "center",
				}}
			>
				<strong>エラーが発生しました:</strong>
				<br />
				{error.message}
			</div>
		);
	}

	return null;
};
