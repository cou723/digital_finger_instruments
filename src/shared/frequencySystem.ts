/**
 * 周波数ベース音階決定システム
 * 基準音からの半音オフセットで音階を決定し、周波数と音階名の両方を提供
 */

/**
 * 周波数ベースの音階情報を表すインターフェース
 */
export interface FrequencyNote {
	/** 基準音（例: "C4", "E4"） */
	baseNote: string;
	/** 基準音からの半音オフセット（0-15） */
	semitoneOffset: number;
	/** 計算された周波数 (Hz) */
	frequency: number;
	/** 計算された音階名（例: "F4", "A5"） */
	noteName: string;
	/** 日本語音階名（例: "ファ", "ラ"） */
	displayName: string;
}

/**
 * 基準音の周波数マッピング
 * よく使用される音階の基準周波数を定義
 */
export const BASE_NOTE_FREQUENCIES: Record<string, number> = {
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

/**
 * 音階名のマッピング（オクターブ内の位置）
 */
const NOTE_NAMES_IN_OCTAVE = ["C", "D", "E", "F", "G", "A", "B"] as const;

/**
 * 日本語音階名のマッピング
 */
const JAPANESE_NOTE_NAMES: Record<string, string> = {
	C: "ド",
	D: "レ",
	E: "ミ",
	F: "ファ",
	G: "ソ",
	A: "ラ",
	B: "シ",
} as const;

/**
 * 基準周波数から半音上下の周波数を計算
 * 12音律: frequency * 2^(semitones/12)
 *
 * @param baseFrequency 基準周波数 (Hz)
 * @param semitones 半音の数（正の値で上行、負の値で下行）
 * @returns 計算された周波数 (Hz)
 */
export function calculateFrequencyFromSemitones(
	baseFrequency: number,
	semitones: number,
): number {
	return baseFrequency * 2 ** (semitones / 12);
}

/**
 * 基準音から相対的なオフセットで音階名を計算
 *
 * @param baseNote 基準音階名（例: "C4", "E4"）
 * @param semitoneOffset 半音オフセット（0-15の二進数値）
 * @returns 計算された音階名（例: "F4", "A5"）
 */
export function calculateNoteName(
	baseNote: string,
	semitoneOffset: number,
): string {
	// 基準音から音階とオクターブを抽出
	const noteMatch = baseNote.match(/^([A-G])(\d+)$/);
	if (!noteMatch) {
		throw new Error(`Invalid base note format: ${baseNote}`);
	}

	const [, baseNoteName, octaveStr] = noteMatch;
	const baseOctave = parseInt(octaveStr, 10);

	// 基準音のオクターブ内位置を取得（C=0, D=1, ..., B=6）
	const baseNoteIndex = NOTE_NAMES_IN_OCTAVE.indexOf(
		baseNoteName as (typeof NOTE_NAMES_IN_OCTAVE)[number],
	);
	if (baseNoteIndex === -1) {
		throw new Error(`Invalid note name: ${baseNoteName}`);
	}

	// 基準音を半音単位でのインデックスに変換
	// C=0, D=2, E=4, F=5, G=7, A=9, B=11
	const semitonesFromC = [0, 2, 4, 5, 7, 9, 11][baseNoteIndex];
	const totalSemitonesFromC = baseOctave * 12 + semitonesFromC;

	// オフセットを加算
	const targetSemitonesFromC = totalSemitonesFromC + semitoneOffset;
	const targetOctave = Math.floor(targetSemitonesFromC / 12);
	const targetSemitoneInOctave = targetSemitonesFromC % 12;

	// 半音インデックスから音階名に変換
	const semitoneToNote = [
		"C",
		"C#",
		"D",
		"D#",
		"E",
		"F",
		"F#",
		"G",
		"G#",
		"A",
		"A#",
		"B",
	];
	const targetNoteName = semitoneToNote[targetSemitoneInOctave];

	return `${targetNoteName}${targetOctave}`;
}

/**
 * 音階名から日本語表示名を取得
 *
 * @param noteName 音階名（例: "F4", "C#5"）
 * @returns 日本語表示名（例: "ファ", "ド#"）
 */
export function getDisplayName(noteName: string): string {
	const noteMatch = noteName.match(/^([A-G]#?)(\d+)$/);
	if (!noteMatch) {
		return noteName; // フォールバック
	}

	const [, baseNote] = noteMatch;
	const baseNoteName = baseNote.replace("#", "");
	const sharp = baseNote.includes("#") ? "#" : "";

	return `${JAPANESE_NOTE_NAMES[baseNoteName] || baseNote}${sharp}`;
}

/**
 * 基準音からFrequencyNoteを生成
 *
 * @param baseNote 基準音階名
 * @param semitoneOffset 半音オフセット
 * @returns FrequencyNote型のオブジェクト
 */
export function createFrequencyNote(
	baseNote: string,
	semitoneOffset: number,
): FrequencyNote {
	const baseFrequency = BASE_NOTE_FREQUENCIES[baseNote];
	if (baseFrequency === undefined) {
		throw new Error(`Unknown base note: ${baseNote}`);
	}

	const frequency = calculateFrequencyFromSemitones(
		baseFrequency,
		semitoneOffset,
	);
	const noteName = calculateNoteName(baseNote, semitoneOffset);
	const displayName = getDisplayName(noteName);

	return {
		baseNote,
		semitoneOffset,
		frequency,
		noteName,
		displayName,
	};
}

/**
 * 利用可能な基準音のリスト
 */
export const AVAILABLE_BASE_NOTES = Object.keys(BASE_NOTE_FREQUENCIES);

/**
 * デフォルトの基準音
 */
export const DEFAULT_BASE_NOTE = "C4";
