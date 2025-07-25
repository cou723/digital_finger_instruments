import { describe, expect, it } from "vitest";
import {
	calculateBinaryFrequency,
	createEmptyAudioState,
	createEmptyKeyboardState,
	determineOutputScale,
	isSameFrequency,
	type KeyboardState,
	type ScaleDecisionConfig,
	updateKeyboardState,
} from "../scaleDecision";

const mockConfig: ScaleDecisionConfig = {
	voiceKeys: ["j"],
	priorityStrategy: "last-pressed",
};

const mockConfigWithBaseNote: ScaleDecisionConfig = {
	voiceKeys: ["j"],
	priorityStrategy: "last-pressed",
	baseNote: "E4", // テスト用にE4を設定
};

describe("scaleDecision", () => {
	describe("calculateBinaryFrequency", () => {
		describe("基準音なし（デフォルトC4）", () => {
			it("二進数0000 (全てoff) → C4", () => {
				const pressedKeys = new Set<string>();
				const result = calculateBinaryFrequency(pressedKeys);
				expect(result.baseNote).toBe("C4");
				expect(result.semitoneOffset).toBe(0);
				expect(result.noteName).toBe("C4");
				expect(result.displayName).toBe("ド");
			});

			it("二進数0001 (fのみon) → G#4", () => {
				const pressedKeys = new Set(["f"]);
				const result = calculateBinaryFrequency(pressedKeys);
				expect(result.baseNote).toBe("C4");
				expect(result.semitoneOffset).toBe(8);
				expect(result.noteName).toBe("G#4");
			});

			it("二進数1001 (a,fがon) → A4", () => {
				const pressedKeys = new Set(["a", "f"]);
				const result = calculateBinaryFrequency(pressedKeys);
				expect(result.baseNote).toBe("C4");
				expect(result.semitoneOffset).toBe(9);
				expect(result.noteName).toBe("A4");
			});
		});

		describe("基準音指定（E4）", () => {
			it("基準E4: 二進数0000 → E4", () => {
				const pressedKeys = new Set<string>();
				const result = calculateBinaryFrequency(pressedKeys, "E4");
				expect(result.baseNote).toBe("E4");
				expect(result.semitoneOffset).toBe(0);
				expect(result.noteName).toBe("E4");
				expect(result.displayName).toBe("ミ");
			});

			it("基準E4: 二進数1000 → F4", () => {
				const pressedKeys = new Set(["a"]);
				const result = calculateBinaryFrequency(pressedKeys, "E4");
				expect(result.baseNote).toBe("E4");
				expect(result.semitoneOffset).toBe(1);
				expect(result.noteName).toBe("F4");
				expect(result.displayName).toBe("ファ");
			});

			it("基準E4: 二進数0100 → G4", () => {
				const pressedKeys = new Set(["s"]);
				const result = calculateBinaryFrequency(pressedKeys, "E4");
				expect(result.baseNote).toBe("E4");
				expect(result.semitoneOffset).toBe(2);
				expect(result.noteName).toBe("F#4");
			});
		});
	});

	describe("determineOutputScale", () => {
		describe("発声キーが押されていない場合", () => {
			it("二進数キーが押されていても音は鳴らない", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["a", "s"]),
					keyPressOrder: ["a", "s"],
					lastScaleKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfig,
				);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingFrequency).toBeUndefined();
				expect(result.reason).toContain("発声キー未押下");
			});
		});

		describe("発声キーが押されている場合", () => {
			it("二進数キーなしの場合、C4を再生（0000として扱う）", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j"]),
					keyPressOrder: ["j"],
					lastVoiceKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfig,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.frequencyToPlay?.noteName).toBe("C4");
				expect(result.newAudioState.currentlyPlayingFrequency?.noteName).toBe(
					"C4",
				);
				expect(result.reason).toContain("0000として");
			});

			it("二進数0001 (j+f) → G#4を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "f"]),
					keyPressOrder: ["j", "f"],
					lastVoiceKeyPressTime: 1000,
					lastScaleKeyPressTime: 1001,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfig,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.frequencyToPlay?.noteName).toBe("G#4");
				expect(result.newAudioState.currentlyPlayingFrequency?.noteName).toBe(
					"G#4",
				);
				expect(result.reason).toContain("0001");
			});

			it("カスタム基準音: 二進数キーなしでE4を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j"]),
					keyPressOrder: ["j"],
					lastVoiceKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfigWithBaseNote,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.frequencyToPlay?.noteName).toBe("E4");
				expect(result.newAudioState.currentlyPlayingFrequency?.noteName).toBe(
					"E4",
				);
				expect(result.reason).toContain("0000として");
			});

			it("カスタム基準音: 二進数1000(a) → F4を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "a"]),
					keyPressOrder: ["j", "a"],
					lastVoiceKeyPressTime: 1000,
					lastScaleKeyPressTime: 1001,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfigWithBaseNote,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.frequencyToPlay?.noteName).toBe("F4");
				expect(result.newAudioState.currentlyPlayingFrequency?.noteName).toBe(
					"F4",
				);
				expect(result.reason).toContain("E4+1半音");
			});
		});
	});

	describe("updateKeyboardState", () => {
		it("二進数キー押下時にタイムスタンプを記録", () => {
			const currentState = createEmptyKeyboardState();
			const timestamp = 1000;

			const newState = updateKeyboardState(
				currentState,
				"a",
				"press",
				timestamp,
				mockConfig,
			);

			expect(newState.pressedKeys.has("a")).toBe(true);
			expect(newState.keyPressOrder).toEqual(["a"]);
			expect(newState.lastScaleKeyPressTime).toBe(timestamp);
		});

		it("発声キー押下時にタイムスタンプを記録", () => {
			const currentState = createEmptyKeyboardState();
			const timestamp = 1000;

			const newState = updateKeyboardState(
				currentState,
				"j",
				"press",
				timestamp,
				mockConfig,
			);

			expect(newState.pressedKeys.has("j")).toBe(true);
			expect(newState.keyPressOrder).toEqual(["j"]);
			expect(newState.lastVoiceKeyPressTime).toBe(timestamp);
		});
	});

	describe("isSameFrequency", () => {
		it("同じ周波数の音階を正しく判定する", () => {
			const freq1 = calculateBinaryFrequency(new Set(["a"]), "C4");
			const freq2 = calculateBinaryFrequency(new Set(["a"]), "C4");

			expect(isSameFrequency(freq1, freq2)).toBe(true);
		});

		it("異なる周波数の音階を正しく判定する", () => {
			const freq1 = calculateBinaryFrequency(new Set(["a"]), "C4");
			const freq2 = calculateBinaryFrequency(new Set(["s"]), "C4");

			expect(isSameFrequency(freq1, freq2)).toBe(false);
		});

		it("undefinedとnullを正しく処理する", () => {
			const freq = calculateBinaryFrequency(new Set(["a"]), "C4");

			expect(isSameFrequency(undefined, undefined)).toBe(true);
			expect(isSameFrequency(freq, undefined)).toBe(false);
			expect(isSameFrequency(undefined, freq)).toBe(false);
		});
	});

	describe("ヘルパー関数", () => {
		it("createEmptyKeyboardState は空の状態を作成", () => {
			const state = createEmptyKeyboardState();

			expect(state.pressedKeys.size).toBe(0);
			expect(state.keyPressOrder).toEqual([]);
			expect(state.lastVoiceKeyPressTime).toBeUndefined();
			expect(state.lastScaleKeyPressTime).toBeUndefined();
		});

		it("createEmptyAudioState は空の状態を作成", () => {
			const state = createEmptyAudioState();

			expect(state.currentlyPlayingFrequency).toBeUndefined();
		});
	});
});
