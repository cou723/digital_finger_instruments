import { describe, expect, it } from "vitest";
import {
	BINARY_TO_NOTE,
	NOTE_FREQUENCIES,
	NOTE_NAMES,
	type NoteName,
} from "../noteFrequencies";

describe("noteFrequencies", () => {
	describe("NOTE_FREQUENCIES", () => {
		it("正しい音階の周波数を定義している", () => {
			expect(NOTE_FREQUENCIES.C4).toBe(261.63); // ド（中央のC）
			expect(NOTE_FREQUENCIES.D4).toBe(293.66); // レ
			expect(NOTE_FREQUENCIES.E4).toBe(329.63); // ミ
			expect(NOTE_FREQUENCIES.F4).toBe(349.23); // ファ
			expect(NOTE_FREQUENCIES.G4).toBe(392.0); // ソ
			expect(NOTE_FREQUENCIES.A4).toBe(440.0); // ラ（標準ピッチ）
			expect(NOTE_FREQUENCIES.B4).toBe(493.88); // シ
			expect(NOTE_FREQUENCIES.C5).toBe(523.25); // 高いド
			expect(NOTE_FREQUENCIES.D5).toBe(587.33); // レ
			expect(NOTE_FREQUENCIES.E5).toBe(659.25); // ミ
			expect(NOTE_FREQUENCIES.F5).toBe(698.46); // ファ
			expect(NOTE_FREQUENCIES.G5).toBe(783.99); // ソ
			expect(NOTE_FREQUENCIES.A5).toBe(880.0); // ラ
			expect(NOTE_FREQUENCIES.B5).toBe(987.77); // シ
			expect(NOTE_FREQUENCIES.C6).toBe(1046.5); // ド
			expect(NOTE_FREQUENCIES.D6).toBe(1174.66); // レ
		});

		it("すべての音階が定義されている（16音階）", () => {
			const expectedNotes: NoteName[] = [
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
			];
			expectedNotes.forEach((note) => {
				expect(NOTE_FREQUENCIES[note]).toBeDefined();
				expect(typeof NOTE_FREQUENCIES[note]).toBe("number");
				expect(NOTE_FREQUENCIES[note]).toBeGreaterThan(0);
			});
		});
	});

	describe("BINARY_TO_NOTE", () => {
		it("二進数値から音階への正しいマッピングを定義している", () => {
			expect(BINARY_TO_NOTE[0]).toBe("C4"); // 0000 → ド
			expect(BINARY_TO_NOTE[1]).toBe("D4"); // 0001 → レ
			expect(BINARY_TO_NOTE[2]).toBe("E4"); // 0010 → ミ
			expect(BINARY_TO_NOTE[3]).toBe("F4"); // 0011 → ファ
			expect(BINARY_TO_NOTE[4]).toBe("G4"); // 0100 → ソ
			expect(BINARY_TO_NOTE[5]).toBe("A4"); // 0101 → ラ
			expect(BINARY_TO_NOTE[6]).toBe("B4"); // 0110 → シ
			expect(BINARY_TO_NOTE[7]).toBe("C5"); // 0111 → 高いド
			expect(BINARY_TO_NOTE[8]).toBe("D5"); // 1000 → レ
			expect(BINARY_TO_NOTE[9]).toBe("E5"); // 1001 → ミ
			expect(BINARY_TO_NOTE[10]).toBe("F5"); // 1010 → ファ
			expect(BINARY_TO_NOTE[11]).toBe("G5"); // 1011 → ソ
			expect(BINARY_TO_NOTE[12]).toBe("A5"); // 1100 → ラ
			expect(BINARY_TO_NOTE[13]).toBe("B5"); // 1101 → シ
			expect(BINARY_TO_NOTE[14]).toBe("C6"); // 1110 → ド
			expect(BINARY_TO_NOTE[15]).toBe("D6"); // 1111 → レ
		});

		it("16の音階マッピングが定義されている", () => {
			expect(BINARY_TO_NOTE).toHaveLength(16);
		});
	});

	describe("NOTE_NAMES", () => {
		it("正しい日本語の音階名を定義している（16音階）", () => {
			expect(NOTE_NAMES.C4).toBe("ド");
			expect(NOTE_NAMES.D4).toBe("レ");
			expect(NOTE_NAMES.E4).toBe("ミ");
			expect(NOTE_NAMES.F4).toBe("ファ");
			expect(NOTE_NAMES.G4).toBe("ソ");
			expect(NOTE_NAMES.A4).toBe("ラ");
			expect(NOTE_NAMES.B4).toBe("シ");
			expect(NOTE_NAMES.C5).toBe("ド");
			expect(NOTE_NAMES.D5).toBe("レ");
			expect(NOTE_NAMES.E5).toBe("ミ");
			expect(NOTE_NAMES.F5).toBe("ファ");
			expect(NOTE_NAMES.G5).toBe("ソ");
			expect(NOTE_NAMES.A5).toBe("ラ");
			expect(NOTE_NAMES.B5).toBe("シ");
			expect(NOTE_NAMES.C6).toBe("ド");
			expect(NOTE_NAMES.D6).toBe("レ");
		});
	});
});
