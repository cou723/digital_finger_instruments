import { describe, expect, it } from "vitest";
import {
	KEY_TO_NOTE,
	NOTE_FREQUENCIES,
	NOTE_NAMES,
	type NoteName,
} from "../noteFrequencies";

describe("noteFrequencies", () => {
	describe("NOTE_FREQUENCIES", () => {
		it("正しい音階の周波数を定義している", () => {
			expect(NOTE_FREQUENCIES.C).toBe(261.63); // ド
			expect(NOTE_FREQUENCIES.D).toBe(293.66); // レ
			expect(NOTE_FREQUENCIES.E).toBe(329.63); // ミ
			expect(NOTE_FREQUENCIES.F).toBe(349.23); // ファ
			expect(NOTE_FREQUENCIES.G).toBe(392.0); // ソ
			expect(NOTE_FREQUENCIES.A).toBe(440.0); // ラ
			expect(NOTE_FREQUENCIES.B).toBe(493.88); // シ
			expect(NOTE_FREQUENCIES.C5).toBe(523.25); // 高いド
		});

		it("すべての音階が定義されている", () => {
			const expectedNotes: NoteName[] = ["C", "D", "E", "F", "G", "A", "B", "C5"];
			expectedNotes.forEach((note) => {
				expect(NOTE_FREQUENCIES[note]).toBeDefined();
				expect(typeof NOTE_FREQUENCIES[note]).toBe("number");
				expect(NOTE_FREQUENCIES[note]).toBeGreaterThan(0);
			});
		});
	});

	describe("KEY_TO_NOTE", () => {
		it("正しいキーマッピングを定義している", () => {
			expect(KEY_TO_NOTE.a).toBe("C");   // ド
			expect(KEY_TO_NOTE.s).toBe("D");   // レ
			expect(KEY_TO_NOTE.d).toBe("E");   // ミ
			expect(KEY_TO_NOTE.f).toBe("F");   // ファ
			expect(KEY_TO_NOTE.z).toBe("G");   // ソ
			expect(KEY_TO_NOTE.x).toBe("A");   // ラ
			expect(KEY_TO_NOTE.c).toBe("B");   // シ
			expect(KEY_TO_NOTE.v).toBe("C5");  // 高いド
		});

		it("8つのキーマッピングが定義されている", () => {
			const keys = Object.keys(KEY_TO_NOTE);
			expect(keys).toHaveLength(8);
		});
	});

	describe("NOTE_NAMES", () => {
		it("正しい日本語の音階名を定義している", () => {
			expect(NOTE_NAMES.C).toBe("ド");
			expect(NOTE_NAMES.D).toBe("レ");
			expect(NOTE_NAMES.E).toBe("ミ");
			expect(NOTE_NAMES.F).toBe("ファ");
			expect(NOTE_NAMES.G).toBe("ソ");
			expect(NOTE_NAMES.A).toBe("ラ");
			expect(NOTE_NAMES.B).toBe("シ");
			expect(NOTE_NAMES.C5).toBe("ド"); // 高いド
		});
	});
});
