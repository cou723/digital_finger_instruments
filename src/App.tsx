import { useState } from "react";
import { NotePlayer } from "./audio/NotePlayer";
import { Keyboard } from "./display/Keyboard";
import type { NoteName } from "./shared/noteFrequencies";
import "./App.css";

function App() {
	const [currentNote, setCurrentNote] = useState<NoteName | null>(null);

	const handleNotePlay = (note: NoteName) => {
		console.log(`App.handleNotePlay: ${note} (prev: ${currentNote})`);
		// 常に新しい音に即座に切り替え（useAudioContextで自動的に前の音は停止される）
		setCurrentNote(note);
	};

	const handleNoteStop = (stoppedNote?: NoteName) => {
		console.log(`App.handleNoteStop: ${stoppedNote} (current: ${currentNote})`);
		// 特定の音階の停止が指定された場合、現在の音階と一致する場合のみ停止
		if (stoppedNote && currentNote !== stoppedNote) {
			console.log(`App.handleNoteStop: ignored (${stoppedNote} !== ${currentNote})`);
			return;
		}
		setCurrentNote(null);
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#f0f2f5",
				padding: "20px",
			}}
		>
			<div
				style={{
					maxWidth: "800px",
					margin: "0 auto",
					textAlign: "center",
				}}
			>
				<h1
					style={{
						color: "#333",
						fontSize: "32px",
						marginBottom: "10px",
					}}
				>
					デジタル楽器
				</h1>
				<p
					style={{
						color: "#666",
						fontSize: "16px",
						marginBottom: "30px",
					}}
				>
					キーボードを押して音を奏でましょう
				</p>

				<Keyboard currentNote={currentNote} />

				<NotePlayer
					currentNote={currentNote}
					onNotePlay={handleNotePlay}
					onNoteStop={handleNoteStop}
				/>
			</div>
		</div>
	);
}

export default App;
