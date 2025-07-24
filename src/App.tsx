import { useState } from "react";
import { NotePlayer } from "./audio/NotePlayer";
import { Keyboard } from "./display/Keyboard";
import { DefaultNoteSelector } from "./display/DefaultNoteSelector";
import type { NoteName } from "./shared/noteFrequencies";
import { NOTE_NAMES } from "./shared/noteFrequencies";
import "./App.css";

function App() {
	const [currentNote, setCurrentNote] = useState<NoteName | null>(null);
	const [defaultNote, setDefaultNote] = useState<NoteName>("C4");

	const handleNotePlay = (note: NoteName) => {
		// 常に新しい音に即座に切り替え（useAudioContextで自動的に前の音は停止される）
		console.log(`🎵 音階再生: ${NOTE_NAMES[note]} (${note})`);
		setCurrentNote(note);
	};

	const handleNoteStop = (stoppedNote?: NoteName) => {
		// 特定の音階の停止が指定された場合、現在の音階と一致する場合のみ停止
		if (stoppedNote && currentNote !== stoppedNote) {
			return;
		}
		console.log("🔇 音階停止");
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
					Jキーを押しながら音階キーを押して演奏しましょう
				</p>

				<Keyboard currentNote={currentNote} />

				<DefaultNoteSelector
					defaultNote={defaultNote}
					onDefaultNoteChange={setDefaultNote}
				/>

				<NotePlayer
					currentNote={currentNote}
					onNotePlay={handleNotePlay}
					onNoteStop={handleNoteStop}
					defaultNote={defaultNote}
				/>
			</div>
		</div>
	);
}

export default App;
