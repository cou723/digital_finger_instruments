export type NoteName = "C" | "D" | "E" | "F" | "G" | "A" | "B";

export type KeyMapping = {
	[key: string]: NoteName;
};

export const NOTE_FREQUENCIES: Record<NoteName, number> = {
	C: 261.63, // ド
	D: 293.66, // レ
	E: 329.63, // ミ
	F: 349.23, // ファ
	G: 392.0, // ソ
	A: 440.0, // ラ
	B: 493.88, // シ
} as const;

export const KEY_TO_NOTE: KeyMapping = {
	a: "C",
	s: "D",
	d: "E",
	f: "F",
	g: "G",
	h: "A",
	j: "B",
} as const;

export const NOTE_NAMES: Record<NoteName, string> = {
	C: "ド",
	D: "レ",
	E: "ミ",
	F: "ファ",
	G: "ソ",
	A: "ラ",
	B: "シ",
} as const;
