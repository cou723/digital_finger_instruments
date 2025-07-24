import {
	KEY_TO_NOTE,
	NOTE_NAMES,
	type NoteName,
} from "../../shared/noteFrequencies";

interface KeyboardProps {
	currentNote?: NoteName | null;
}

export const Keyboard: React.FC<KeyboardProps> = ({ currentNote }) => {
	const keyStyle = (_key: string, note: NoteName) => ({
		display: "inline-flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		width: "80px",
		height: "80px",
		margin: "4px",
		padding: "8px",
		backgroundColor: currentNote === note ? "#4CAF50" : "#ffffff",
		border: "2px solid #ddd",
		borderRadius: "8px",
		fontSize: "14px",
		fontWeight: "bold",
		cursor: "pointer",
		transition: "all 0.1s ease",
		boxShadow:
			currentNote === note
				? "0 4px 8px rgba(0,0,0,0.2)"
				: "0 2px 4px rgba(0,0,0,0.1)",
		transform: currentNote === note ? "translateY(2px)" : "none",
		color: currentNote === note ? "white" : "#333",
	});

	return (
		<div
			style={{
				textAlign: "center",
				padding: "20px",
				backgroundColor: "#f5f5f5",
				borderRadius: "12px",
				margin: "20px 0",
			}}
		>
			<h2
				style={{
					marginBottom: "20px",
					color: "#333",
					fontSize: "24px",
				}}
			>
				キーボード
			</h2>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					flexWrap: "wrap",
					gap: "4px",
				}}
			>
				{Object.entries(KEY_TO_NOTE).map(([key, note]) => (
					<div key={key} style={keyStyle(key, note)}>
						<div style={{ fontSize: "18px", fontWeight: "bold" }}>
							{key.toUpperCase()}
						</div>
						<div style={{ fontSize: "12px", marginTop: "4px" }}>
							{NOTE_NAMES[note]}
						</div>
						<div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
							({note})
						</div>
					</div>
				))}
			</div>
			<div
				style={{
					marginTop: "20px",
					fontSize: "14px",
					color: "#666",
					maxWidth: "500px",
					margin: "20px auto 0",
				}}
			>
				キーボードの対応するキーを押すと音が鳴ります
				{currentNote && (
					<div
						style={{
							marginTop: "10px",
							fontSize: "16px",
							color: "#4CAF50",
							fontWeight: "bold",
						}}
					>
						再生中: {NOTE_NAMES[currentNote]} ({currentNote})
					</div>
				)}
			</div>
		</div>
	);
};
