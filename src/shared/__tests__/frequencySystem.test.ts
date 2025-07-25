import { describe, expect, it } from "vitest";
import {
	BASE_NOTE_FREQUENCIES,
	calculateFrequencyFromSemitones,
	calculateNoteName,
	createFrequencyNote,
	getDisplayName,
} from "../frequencySystem";

describe("frequencySystem", () => {
	describe("calculateFrequencyFromSemitones", () => {
		it("基準周波数から正確な半音計算を行う", () => {
			const baseFreq = 440; // A4

			// 1オクターブ上 (12半音)
			expect(calculateFrequencyFromSemitones(baseFreq, 12)).toBeCloseTo(880, 1);

			// 1オクターブ下 (-12半音)
			expect(calculateFrequencyFromSemitones(baseFreq, -12)).toBeCloseTo(
				220,
				1,
			);

			// 5度上 (7半音) - A4からE5
			expect(calculateFrequencyFromSemitones(baseFreq, 7)).toBeCloseTo(
				659.25,
				1,
			);
		});

		it("0半音の場合は基準周波数をそのまま返す", () => {
			expect(calculateFrequencyFromSemitones(440, 0)).toBe(440);
		});
	});

	describe("calculateNoteName", () => {
		it("C4から正確な音階名を計算する", () => {
			expect(calculateNoteName("C4", 0)).toBe("C4");
			expect(calculateNoteName("C4", 1)).toBe("C#4");
			expect(calculateNoteName("C4", 2)).toBe("D4");
			expect(calculateNoteName("C4", 5)).toBe("F4");
			expect(calculateNoteName("C4", 12)).toBe("C5"); // 1オクターブ上
		});

		it("E4から正確な音階名を計算する", () => {
			expect(calculateNoteName("E4", 0)).toBe("E4");
			expect(calculateNoteName("E4", 1)).toBe("F4");
			expect(calculateNoteName("E4", 3)).toBe("G4");
			expect(calculateNoteName("E4", 8)).toBe("C5");
		});

		it("オクターブ境界を正しく処理する", () => {
			expect(calculateNoteName("B4", 1)).toBe("C5");
			expect(calculateNoteName("C5", -1)).toBe("B4");
		});

		it("大きなオフセットを正しく処理する", () => {
			expect(calculateNoteName("C4", 24)).toBe("C6"); // 2オクターブ上
			expect(calculateNoteName("C4", 15)).toBe("D#5");
		});

		it("無効な基準音でエラーを投げる", () => {
			expect(() => calculateNoteName("X4", 0)).toThrow(
				"Invalid base note format",
			);
			expect(() => calculateNoteName("C", 0)).toThrow(
				"Invalid base note format",
			);
		});
	});

	describe("getDisplayName", () => {
		it("基本音階の日本語名を返す", () => {
			expect(getDisplayName("C4")).toBe("ド");
			expect(getDisplayName("D4")).toBe("レ");
			expect(getDisplayName("E4")).toBe("ミ");
			expect(getDisplayName("F4")).toBe("ファ");
			expect(getDisplayName("G4")).toBe("ソ");
			expect(getDisplayName("A4")).toBe("ラ");
			expect(getDisplayName("B4")).toBe("シ");
		});

		it("シャープ音階の日本語名を返す", () => {
			expect(getDisplayName("C#4")).toBe("ド#");
			expect(getDisplayName("F#5")).toBe("ファ#");
			expect(getDisplayName("A#3")).toBe("ラ#");
		});

		it("無効な音階名でフォールバックする", () => {
			expect(getDisplayName("X4")).toBe("X4");
		});
	});

	describe("createFrequencyNote", () => {
		it("C4から正確なFrequencyNoteを作成する", () => {
			const result = createFrequencyNote("C4", 5);

			expect(result.baseNote).toBe("C4");
			expect(result.semitoneOffset).toBe(5);
			expect(result.frequency).toBeCloseTo(349.23, 1); // F4の周波数
			expect(result.noteName).toBe("F4");
			expect(result.displayName).toBe("ファ");
		});

		it("A4から正確なFrequencyNoteを作成する", () => {
			const result = createFrequencyNote("A4", 3);

			expect(result.baseNote).toBe("A4");
			expect(result.semitoneOffset).toBe(3);
			expect(result.frequency).toBeCloseTo(523.25, 1); // C5の周波数
			expect(result.noteName).toBe("C5");
			expect(result.displayName).toBe("ド");
		});

		it("オフセット0で基準音そのものを返す", () => {
			const result = createFrequencyNote("G4", 0);

			expect(result.baseNote).toBe("G4");
			expect(result.semitoneOffset).toBe(0);
			expect(result.frequency).toBe(BASE_NOTE_FREQUENCIES.G4);
			expect(result.noteName).toBe("G4");
			expect(result.displayName).toBe("ソ");
		});

		it("シャープ音階も正しく処理する", () => {
			const result = createFrequencyNote("C4", 1);

			expect(result.noteName).toBe("C#4");
			expect(result.displayName).toBe("ド#");
		});

		it("未知の基準音でエラーを投げる", () => {
			expect(() => createFrequencyNote("X4", 0)).toThrow("Unknown base note");
		});
	});

	describe("統合テスト", () => {
		it("二進数0-15の範囲で正確な音階変換を行う", () => {
			const testCases = [
				{ offset: 0, expectedNote: "C4", expectedDisplay: "ド" },
				{ offset: 1, expectedNote: "C#4", expectedDisplay: "ド#" },
				{ offset: 2, expectedNote: "D4", expectedDisplay: "レ" },
				{ offset: 5, expectedNote: "F4", expectedDisplay: "ファ" },
				{ offset: 9, expectedNote: "A4", expectedDisplay: "ラ" },
				{ offset: 12, expectedNote: "C5", expectedDisplay: "ド" },
				{ offset: 15, expectedNote: "D#5", expectedDisplay: "レ#" },
			];

			testCases.forEach(({ offset, expectedNote, expectedDisplay }) => {
				const result = createFrequencyNote("C4", offset);
				expect(result.noteName).toBe(expectedNote);
				expect(result.displayName).toBe(expectedDisplay);
			});
		});

		it("異なる基準音から同じ最終音階を計算できる", () => {
			// F4を異なる基準音から計算
			const fromC4 = createFrequencyNote("C4", 5);
			const fromD4 = createFrequencyNote("D4", 3);
			const fromE4 = createFrequencyNote("E4", 1);

			expect(fromC4.noteName).toBe("F4");
			expect(fromD4.noteName).toBe("F4");
			expect(fromE4.noteName).toBe("F4");

			// 周波数もほぼ同じであることを確認
			expect(Math.abs(fromC4.frequency - fromD4.frequency)).toBeLessThan(0.1);
			expect(Math.abs(fromD4.frequency - fromE4.frequency)).toBeLessThan(0.1);
		});
	});
});
