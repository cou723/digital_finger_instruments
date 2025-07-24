import { useEffect, useState } from "react";
import { KEY_TO_NOTE, type NoteName } from "../../shared/noteFrequencies";
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
	const [isJKeyPressed, setIsJKeyPressed] = useState(false);
	const [queuedNote, setQueuedNote] = useState<NoteName | null>(null);

	useEffect(() => {
		if (!isSupported()) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			
			// jキー処理
			if (key === 'j' && !event.repeat) {
				setIsJKeyPressed(true);
				// キューされた音階があれば再生、なければ現在の音階を継続
				const noteToPlay = queuedNote || currentNote;
				if (noteToPlay) {
					playNote(noteToPlay);
					onNotePlay?.(noteToPlay);
				}
				return;
			}
			
			const note = KEY_TO_NOTE[key];
			if (note && !event.repeat) {
				if (isJKeyPressed) {
					// jキーが押されている場合は即座に音階変更
					playNote(note);
					onNotePlay?.(note);
					setQueuedNote(null); // キューをクリア
				} else {
					// jキーが押されていない場合はキューに保存
					setQueuedNote(note);
				}
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			
			// jキー処理
			if (key === 'j') {
				setIsJKeyPressed(false);
				stopNote();
				onNoteStop?.();
				return;
			}
			
			const note = KEY_TO_NOTE[key];
			if (note) {
				// 音階キーが離された場合はキューから削除
				if (queuedNote === note) {
					setQueuedNote(null);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [playNote, stopNote, isSupported, onNotePlay, onNoteStop, currentNote, isJKeyPressed, queuedNote]);

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
