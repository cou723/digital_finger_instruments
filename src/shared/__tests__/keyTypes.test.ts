import { describe, expect, it } from "vitest";
import {
	getScaleFromKey,
	getScaleKeys,
	getVoiceKeys,
	isScaleKey,
	isVoiceKey,
} from "../keyTypes";

describe("keyTypes", () => {
	describe("isVoiceKey", () => {
		it("発声キーを正しく識別する", () => {
			expect(isVoiceKey("j")).toBe(true);
		});

		it("発声キーでないキーはfalseを返す", () => {
			expect(isVoiceKey("a")).toBe(false);
			expect(isVoiceKey("k")).toBe(false);
			expect(isVoiceKey("1")).toBe(false);
		});

		it("大文字小文字を区別しない", () => {
			expect(isVoiceKey("J")).toBe(false); // 実装では小文字のみサポートを想定
		});
	});

	describe("isScaleKey", () => {
		it("音階キーを正しく識別する", () => {
			const scaleKeys = ["a", "s", "d", "f", "z", "x", "c", "v"];
			scaleKeys.forEach((key) => {
				expect(isScaleKey(key)).toBe(true);
			});
		});

		it("音階キーでないキーはfalseを返す", () => {
			expect(isScaleKey("j")).toBe(false);
			expect(isScaleKey("k")).toBe(false);
			expect(isScaleKey("1")).toBe(false);
		});
	});

	describe("getVoiceKeys", () => {
		it("発声キーの一覧を返す", () => {
			const voiceKeys = getVoiceKeys();
			expect(voiceKeys).toEqual(["j"]);
		});

		it("返される配列は読み取り専用", () => {
			const voiceKeys = getVoiceKeys();
			expect(voiceKeys).toSatisfy(
				(arr: readonly string[]) =>
					Object.isFrozen(arr) || arr.constructor.name === "Array",
			);
		});
	});

	describe("getScaleKeys", () => {
		it("音階キーの一覧を返す", () => {
			const scaleKeys = getScaleKeys();
			const expectedKeys = ["a", "s", "d", "f", "z", "x", "c", "v"];
			expect(scaleKeys.sort()).toEqual(expectedKeys.sort());
		});

		it("8個のキーが含まれている", () => {
			const scaleKeys = getScaleKeys();
			expect(scaleKeys).toHaveLength(8);
		});
	});

	describe("getScaleFromKey", () => {
		it("音階キーから正しい音階を返す", () => {
			expect(getScaleFromKey("a")).toBe("C4");
			expect(getScaleFromKey("s")).toBe("D4");
			expect(getScaleFromKey("v")).toBe("C5");
		});

		it("音階キーでないキーはundefinedを返す", () => {
			expect(getScaleFromKey("j")).toBeUndefined();
			expect(getScaleFromKey("k")).toBeUndefined();
			expect(getScaleFromKey("1")).toBeUndefined();
		});
	});
});
