import { useState } from "react";
import { NotePlayer } from "./audio/NotePlayer";
import { DefaultNoteSelector } from "./display/DefaultNoteSelector";
import { Keyboard } from "./display/Keyboard";
import type { FrequencyNote } from "./shared/frequencySystem";
import { DEFAULT_BASE_NOTE } from "./shared/frequencySystem";
import "./App.css";

function App() {
	const [currentFrequency, setCurrentFrequency] =
		useState<FrequencyNote | null>(null);
	const [baseNote, setBaseNote] = useState<string>(DEFAULT_BASE_NOTE);

	const handleFrequencyPlay = (frequency: FrequencyNote) => {
		// 常に新しい音に即座に切り替え（useAudioContextで自動的に前の音は停止される）
		console.log(
			`🎵 音階再生: ${frequency.displayName} (${frequency.noteName}) ${frequency.frequency.toFixed(2)}Hz`,
		);
		setCurrentFrequency(frequency);
	};

	const handleFrequencyStop = () => {
		console.log("🔇 音階停止");
		setCurrentFrequency(null);
	};

	return (
		<div
			style={{
				minHeight: "100vh",
				backgroundColor: "#f0f2f5",
				padding: "20px",
				width: "full",
			}}
		>
			<div
				style={{
					// maxWidth: "800px",
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

				<Keyboard currentFrequency={currentFrequency} baseNote={baseNote} />

				<DefaultNoteSelector
					baseNote={baseNote}
					onBaseNoteChange={setBaseNote}
				/>

				<NotePlayer
					currentFrequency={currentFrequency}
					onFrequencyPlay={handleFrequencyPlay}
					onFrequencyStop={handleFrequencyStop}
					baseNote={baseNote}
				/>
			</div>
		</div>
	);
}

export default App;
