import {
	BINARY_TO_NOTE,
	NOTE_NAMES,
	type NoteName,
} from "../../shared/noteFrequencies";
import { BINARY_KEYS } from "../../shared/scaleDecision";

interface KeyboardProps {
	currentNote?: NoteName | null;
}

export const Keyboard: React.FC<KeyboardProps> = ({ currentNote }) => {
	const keyStyle = (_key: string, _bitPosition: number) => ({
		display: "inline-flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		width: "80px",
		height: "80px",
		margin: "4px",
		padding: "8px",
		backgroundColor: "#ffffff",
		border: "2px solid #ddd",
		borderRadius: "8px",
		fontSize: "14px",
		fontWeight: "bold",
		cursor: "pointer",
		transition: "all 0.1s ease",
		boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
		color: "#333",
	});

	const noteDisplayStyle = (note: NoteName) => ({
		display: "inline-flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		width: "60px",
		height: "60px",
		margin: "2px",
		padding: "4px",
		backgroundColor: currentNote === note ? "#4CAF50" : "#f5f5f5",
		border: "1px solid #ddd",
		borderRadius: "6px",
		fontSize: "10px",
		fontWeight: "bold",
		color: currentNote === note ? "white" : "#333",
		transition: "all 0.1s ease",
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
			{/* 二進数キーの表示 */}
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					gap: "8px",
					marginBottom: "20px",
				}}
			>
				{BINARY_KEYS.map((key, index) => (
					<div key={key} style={keyStyle(key, index)}>
						<div style={{ fontSize: "18px", fontWeight: "bold" }}>
							{key.toUpperCase()}
						</div>
						<div style={{ fontSize: "12px", marginTop: "4px" }}>
							bit {3 - index}
						</div>
						<div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
							{3 - index === 3
								? "8"
								: 3 - index === 2
									? "4"
									: 3 - index === 1
										? "2"
										: "1"}
						</div>
					</div>
				))}
			</div>

			{/* 全音階の表示 */}
			<div
				style={{
					textAlign: "center",
					marginBottom: "10px",
					fontSize: "16px",
					fontWeight: "bold",
					color: "#333",
				}}
			>
				音階一覧 (0-15 → C4-D6)
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					flexWrap: "wrap",
					gap: "2px",
					maxWidth: "600px",
					margin: "0 auto",
				}}
			>
				{BINARY_TO_NOTE.map((note, index) => {
					// 左から読む形式で二進数を表示（ビットを反転）
					const binaryString = index.toString(2).padStart(4, "0");
					const leftToRightBinary = binaryString.split("").reverse().join("");
					
					return (
						<div key={`${note}-${index}`} style={noteDisplayStyle(note)}>
							<div style={{ fontSize: "8px", opacity: 0.8 }}>
								{leftToRightBinary}
							</div>
							<div style={{ fontSize: "10px", fontWeight: "bold" }}>
								{NOTE_NAMES[note]}
							</div>
							<div style={{ fontSize: "8px", opacity: 0.8 }}>{note}</div>
						</div>
					);
				})}
			</div>

			{/* jキー発音制御の表示 */}
			<div
				style={{
					marginTop: "20px",
					padding: "16px",
					backgroundColor: "#e3f2fd",
					borderRadius: "8px",
					border: "2px solid #2196f3",
				}}
			>
				<div
					style={{
						fontSize: "16px",
						fontWeight: "bold",
						color: "#1976d2",
						marginBottom: "8px",
					}}
				>
					J キー：発音制御
				</div>
				<div
					style={{
						fontSize: "14px",
						color: "#333",
						lineHeight: "1.5",
					}}
				>
					Jキーを押している間のみ音が鳴ります。
					<br />
					Jキー + A,S,D,Fキーの組み合わせで音階を決定します（二進数）。
				</div>
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
				A,S,D,Fキーを二進数として組み合わせて音階を指定します（Jキー +
				二進数キーで発音）
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
