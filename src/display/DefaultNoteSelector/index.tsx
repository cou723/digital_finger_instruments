import {
	AVAILABLE_BASE_NOTES,
	getDisplayName,
} from "../../shared/frequencySystem";

interface DefaultNoteSelectorProps {
	baseNote: string;
	onBaseNoteChange: (baseNote: string) => void;
}

export const DefaultNoteSelector: React.FC<DefaultNoteSelectorProps> = ({
	baseNote,
	onBaseNoteChange,
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
				0000時の基準音設定
			</div>
			<div
				style={{
					fontSize: "14px",
					color: "#333",
					marginBottom: "12px",
				}}
			>
				二進数キーを何も押さない（0000）時に鳴る基準音を選択してください：
			</div>
			<select
				value={baseNote}
				onChange={(e) => onBaseNoteChange(e.target.value)}
				style={{
					padding: "8px 12px",
					fontSize: "14px",
					borderRadius: "4px",
					border: "1px solid #ddd",
					backgroundColor: "white",
					color: "#333",
					cursor: "pointer",
					minWidth: "120px",
				}}
			>
				{AVAILABLE_BASE_NOTES.map((note) => (
					<option key={note} value={note}>
						{getDisplayName(note)} ({note})
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
				現在の設定: {getDisplayName(baseNote)} ({baseNote})
			</div>
			<div
				style={{
					marginTop: "8px",
					fontSize: "12px",
					color: "#666",
					fontStyle: "italic",
				}}
			>
				※ 基準音を変更すると、0-15の全ての音階が相対的にシフトされます
			</div>
		</div>
	);
};
