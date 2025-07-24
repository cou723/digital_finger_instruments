export type NoteName =
	| "C4"
	| "D4"
	| "E4"
	| "F4"
	| "G4"
	| "A4"
	| "B4"
	| "C5"
	| "D5"
	| "E5"
	| "F5"
	| "G5"
	| "A5"
	| "B5"
	| "C6"
	| "D6";

export type KeyMapping = {
	[key: string]: NoteName;
};

export const NOTE_FREQUENCIES: Record<NoteName, number> = {
	C4: 261.63, // ド（中央のC）
	D4: 293.66, // レ
	E4: 329.63, // ミ
	F4: 349.23, // ファ
	G4: 392.0, // ソ
	A4: 440.0, // ラ（標準ピッチ）
	B4: 493.88, // シ
	C5: 523.25, // 高いド
	D5: 587.33, // レ
	E5: 659.25, // ミ
	F5: 698.46, // ファ
	G5: 783.99, // ソ
	A5: 880.0, // ラ
	B5: 987.77, // シ
	C6: 1046.5, // ド
	D6: 1174.66, // レ
} as const;

export const KEY_TO_NOTE: KeyMapping = {
	a: "C4", // ド
	s: "D4", // レ
	d: "E4", // ミ
	f: "F4", // ファ
	z: "G4", // ソ
	x: "A4", // ラ
	c: "B4", // シ
	v: "C5", // 高いド
} as const;

export const NOTE_NAMES: Record<NoteName, string> = {
	C4: "ド",
	D4: "レ",
	E4: "ミ",
	F4: "ファ",
	G4: "ソ",
	A4: "ラ",
	B4: "シ",
	C5: "ド",
	D5: "レ",
	E5: "ミ",
	F5: "ファ",
	G5: "ソ",
	A5: "ラ",
	B5: "シ",
	C6: "ド",
	D6: "レ",
} as const;

/**
 * 二進数値から音階への変換用配列 (0-15 → C4-D6)
 */
export const BINARY_TO_NOTE: readonly NoteName[] = [
	"C4",
	"D4",
	"E4",
	"F4",
	"G4",
	"A4",
	"B4",
	"C5",
	"D5",
	"E5",
	"F5",
	"G5",
	"A5",
	"B5",
	"C6",
	"D6",
] as const;
