import { useEffect } from "react";
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

	useEffect(() => {
		if (!isSupported()) {
			return;
		}

		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			const note = KEY_TO_NOTE[key];

			if (note && !event.repeat) {
				console.log(`KeyDown: ${key} -> ${note}, currentNote: ${currentNote}`);
				playNote(note);
				onNotePlay?.(note);
			}
		};

		const handleKeyUp = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			const note = KEY_TO_NOTE[key];

			// 現在再生中の音階に対応するキーが離された場合のみ停止
			if (note && currentNote === note) {
				console.log(`KeyUp: ${key} -> ${note}, stopping currentNote: ${currentNote}`);
				stopNote();
				onNoteStop?.(note);
			} else if (note) {
				console.log(`KeyUp: ${key} -> ${note}, ignored (currentNote: ${currentNote})`);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [playNote, stopNote, isSupported, onNotePlay, onNoteStop, currentNote]);

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
