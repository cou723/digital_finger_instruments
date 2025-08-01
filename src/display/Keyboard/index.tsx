import type { FrequencyNote } from "../../shared/frequencySystem";
import {
	BINARY_KEYS,
	calculateBinaryFrequency,
	isSameFrequency,
} from "../../shared/scaleDecision";

interface KeyboardProps {
	currentFrequency?: FrequencyNote | null;
	baseNote?: string;
}

export const Keyboard: React.FC<KeyboardProps> = ({
	currentFrequency,
	baseNote = "C4",
}) => {
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

	const noteDisplayStyle = (frequency: FrequencyNote) => ({
		display: "inline-flex",
		flexDirection: "column" as const,
		alignItems: "center",
		justifyContent: "center",
		width: "60px",
		height: "60px",
		margin: "2px",
		padding: "4px",
		backgroundColor: isSameFrequency(currentFrequency || undefined, frequency)
			? "#4CAF50"
			: "#f5f5f5",
		border: "1px solid #ddd",
		borderRadius: "6px",
		fontSize: "10px",
		fontWeight: "bold",
		color: isSameFrequency(currentFrequency || undefined, frequency)
			? "white"
			: "#333",
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
							bit {index}
						</div>
						<div style={{ fontSize: "10px", marginTop: "2px", opacity: 0.8 }}>
							{1 << index}
						</div>
					</div>
				))}
			</div>

			{/* メジャースケール音階の表示 */}
			<div
				style={{
					textAlign: "center",
					marginBottom: "10px",
					fontSize: "16px",
					fontWeight: "bold",
					color: "#333",
				}}
			>
				メジャースケール音階一覧 ({baseNote}基準 - 2オクターブ分)
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					flexWrap: "wrap",
					gap: "2px",
					maxWidth: "900px",
					margin: "0 auto",
				}}
			>
				{Array.from({ length: 16 }, (_, index) => {
					// 各二進数値に対して、設定された基準音階からの周波数計算
					const binaryKeys = new Set<string>();

					// indexから対応するキーの組み合わせを逆算
					BINARY_KEYS.forEach((key, keyIndex) => {
						if (index & (1 << keyIndex)) {
							binaryKeys.add(key);
						}
					});

					// 周波数音階を計算
					const frequencyNote = calculateBinaryFrequency(binaryKeys, baseNote);

					// 左から読む形式で二進数を表示（ビットを反転）
					const binaryString = index.toString(2).padStart(4, "0");
					const leftToRightBinary = binaryString.split("").reverse().join("");

					// メジャースケール情報
					const scalePosition = index % 7;
					const octave = Math.floor(index / 7) + 1;
					const scaleNames = ["ド", "レ", "ミ", "ファ", "ソ", "ラ", "シ"];
					const scaleName = scaleNames[scalePosition];

					return (
						<div
							key={`note-${frequencyNote.noteName}-${index}`}
							style={noteDisplayStyle(frequencyNote)}
						>
							<div style={{ fontSize: "7px", opacity: 0.6 }}>
								{leftToRightBinary}
							</div>
							<div
								style={{
									fontSize: "10px",
									fontWeight: "bold",
									color: "#4CAF50",
								}}
							>
								{scaleName}
							</div>
							<div style={{ fontSize: "8px", fontWeight: "bold" }}>
								{frequencyNote.noteName}
							</div>
							<div style={{ fontSize: "6px", opacity: 0.6 }}>
								{octave}オクターブ目
							</div>
							<div style={{ fontSize: "6px", opacity: 0.6 }}>
								{frequencyNote.frequency.toFixed(1)}Hz
							</div>
						</div>
					);
				})}
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
				A,S,D,Fキー +
				スペースキーを組み合わせてメジャースケール音階を指定します（Jキーで発音）
				<br />
				<strong>スペースキー</strong>: 半音上（#音）、A,S,D,Fキー:
				二進数音階選択
				<br />
				0-6: 1オクターブ目（ド、レ、ミ、ファ、ソ、ラ、シ）、7-13:
				2オクターブ目、14-15: 3オクターブ目
				{currentFrequency && (
					<div
						style={{
							marginTop: "10px",
							fontSize: "16px",
							color: "#4CAF50",
							fontWeight: "bold",
						}}
					>
						再生中: {currentFrequency.displayName} ({currentFrequency.noteName}){" "}
						{currentFrequency.frequency.toFixed(2)}Hz
					</div>
				)}
			</div>
		</div>
	);
};
