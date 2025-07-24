import { BINARY_TO_NOTE, NOTE_NAMES, type NoteName } from "../../shared/noteFrequencies";

interface DefaultNoteSelectorProps {
	defaultNote: NoteName;
	onDefaultNoteChange: (note: NoteName) => void;
}

export const DefaultNoteSelector: React.FC<DefaultNoteSelectorProps> = ({
	defaultNote,
	onDefaultNoteChange,
}) => {
	return (
		<div
			style={{
				marginTop: "20px",
				padding: "16px",
				backgroundColor: "#fff3e0",
				borderRadius: "8px",
				border: "2px solid #ff9800",
			}}
		>
			<div
				style={{
					fontSize: "16px",
					fontWeight: "bold",
					color: "#e65100",
					marginBottom: "12px",
				}}
			>
				0000時の音階設定
			</div>
			<div
				style={{
					fontSize: "14px",
					color: "#333",
					marginBottom: "12px",
				}}
			>
				二進数キーを何も押さない（0000）時に鳴る音階を選択してください：
			</div>
			<select
				value={defaultNote}
				onChange={(e) => onDefaultNoteChange(e.target.value as NoteName)}
				style={{
					padding: "8px 12px",
					fontSize: "14px",
					borderRadius: "4px",
					border: "1px solid #ddd",
					backgroundColor: "white",
					cursor: "pointer",
					minWidth: "120px",
				}}
			>
				{BINARY_TO_NOTE.map((note) => (
					<option key={note} value={note}>
						{NOTE_NAMES[note]} ({note})
					</option>
				))}
			</select>
			<div
				style={{
					marginTop: "8px",
					fontSize: "12px",
					color: "#666",
				}}
			>
				現在の設定: {NOTE_NAMES[defaultNote]} ({defaultNote})
			</div>
		</div>
	);
};