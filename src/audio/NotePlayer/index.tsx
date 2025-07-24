import { useEffect, useState } from "react";
import { NOTE_NAMES, type NoteName } from "../../shared/noteFrequencies";
import { getVoiceKeys, getScaleKeys } from "../../shared/keyTypes";
import { KEY_TO_NOTE } from "../../shared/noteFrequencies";
import { 
	determineOutputScale,
	updateKeyboardState,
	createEmptyKeyboardState,
	createEmptyAudioState,
	type KeyboardState,
	type AudioState,
	type ScaleDecisionConfig
} from "../../shared/scaleDecision";
import { useAudioContext } from "../useAudioContext";

interface NotePlayerProps {
	currentNote?: NoteName | null;
	onNotePlay?: (note: NoteName) => void;
	onNoteStop?: (note?: NoteName) => void;
}

export const NotePlayer: React.FC<NotePlayerProps> = ({
	currentNote,
	onNotePlay,
	onNoteStop,
}) => {
	const { playNote, stopNote, isSupported, error } = useAudioContext();
	
	// 純粋関数で使用する状態管理
	const [keyboardState, setKeyboardState] = useState<KeyboardState>(createEmptyKeyboardState);
	const [audioState, setAudioState] = useState<AudioState>(createEmptyAudioState);
	
	// 音階決定の設定
	const config: ScaleDecisionConfig = {
		voiceKeys: getVoiceKeys(),
		scaleKeyMapping: KEY_TO_NOTE,
		priorityStrategy: 'last-pressed'
	};

	// 音階決定と再生処理を行う関数
	const processScaleDecision = (newKeyboardState: KeyboardState, newAudioState: AudioState) => {
		const decision = determineOutputScale(newKeyboardState, newAudioState, config);
		
		// デバッグログ
		console.log(`🎵 音階決定: ${decision.reason}`);
		
		// 音の再生・停止処理
		if (decision.shouldPlay && decision.noteToPlay) {
			playNote(decision.noteToPlay);
			onNotePlay?.(decision.noteToPlay);
		} else {
			// 現在再生中で、新しい決定で再生すべきでない場合は停止
			if (newAudioState.currentlyPlayingNote && !decision.shouldPlay) {
				stopNote();
				onNoteStop?.();
			}
		}
		
		// 状態を更新
		setKeyboardState(newKeyboardState);
		setAudioState(decision.newAudioState);
	};

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
				'press', 
				Date.now(),
				config
			);

			// 現在のオーディオ状態を同期
			const currentAudioState: AudioState = {
				currentlyPlayingNote: currentNote || undefined
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
				'release',
				Date.now(),
				config
			);

			// 現在のオーディオ状態を同期
			const currentAudioState: AudioState = {
				currentlyPlayingNote: currentNote || undefined
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
	}, [playNote, stopNote, isSupported, onNotePlay, onNoteStop, currentNote, keyboardState, audioState, config]);

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