import { describe, expect, it } from "vitest";
import {
	type AudioState,
	BINARY_KEYS,
	calculateBinaryScale,
	createEmptyAudioState,
	createEmptyKeyboardState,
	determineOutputScale,
	type KeyboardState,
	type ScaleDecisionConfig,
	updateKeyboardState,
} from "../scaleDecision";

const mockConfig: ScaleDecisionConfig = {
	voiceKeys: ["j"],
	priorityStrategy: "last-pressed",
};

const mockConfigWithDefaultNote: ScaleDecisionConfig = {
	voiceKeys: ["j"],
	priorityStrategy: "last-pressed",
	defaultNote: "E4", // テスト用にE4を設定
};

describe("scaleDecision", () => {
	describe("calculateBinaryScale", () => {
		describe("基準音階なし（従来の固定マッピング）", () => {
			it("二進数0000 (全てoff) → C4", () => {
				const pressedKeys = new Set<string>();
				const result = calculateBinaryScale(pressedKeys);
				expect(result).toBe("C4");
			});

			it("二進数0001 (fのみon) → D5", () => {
				const pressedKeys = new Set(["f"]);
				const result = calculateBinaryScale(pressedKeys);
				expect(result).toBe("D5"); // 左から0001 → f=1<<3 → 8 → D5
			});

			it("二進数1001 (a,fがon) → E5", () => {
				const pressedKeys = new Set(["a", "f"]);
				const result = calculateBinaryScale(pressedKeys);
				expect(result).toBe("E5"); // 左から1001 → a=1<<0, f=1<<3 → 1+8=9 → E5
			});
		});

		describe("基準音階あり（オフセット計算）", () => {
			it("基準E4: 二進数0000 → E4", () => {
				const pressedKeys = new Set<string>();
				const result = calculateBinaryScale(pressedKeys, "E4");
				expect(result).toBe("E4"); // E4 + 0 = E4
			});

			it("基準E4: 二進数0001 → F5", () => {
				const pressedKeys = new Set(["f"]);
				const result = calculateBinaryScale(pressedKeys, "E4");
				expect(result).toBe("F5"); // E4(index=2) + 8 = index=10 → F5
			});

			it("基準E4: 二進数1000 → F4", () => {
				const pressedKeys = new Set(["a"]);
				const result = calculateBinaryScale(pressedKeys, "E4");
				expect(result).toBe("F4"); // E4(index=2) + 1 = index=3 → F4
			});

			it("基準A4: 二進数0100 → C5", () => {
				const pressedKeys = new Set(["s"]);
				const result = calculateBinaryScale(pressedKeys, "A4");
				expect(result).toBe("C5"); // A4(index=5) + 2 = index=7 → C5
			});

			it("範囲外の場合はクランプ", () => {
				const pressedKeys = new Set(["a", "s", "d", "f"]); // 1111 = 15
				const result = calculateBinaryScale(pressedKeys, "C6");
				expect(result).toBe("D6"); // C6(index=14) + 15 = 29 → クランプして15 → D6
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
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
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
				expect(result.noteToPlay).toBe("C4");
				expect(result.newAudioState.currentlyPlayingNote).toBe("C4");
				expect(result.reason).toContain("0000として C4");
			});

			it("二進数0001 (j+f) → D5を再生", () => {
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
				expect(result.noteToPlay).toBe("D5"); // 左から0001 → f=1<<3 → 8 → D5
				expect(result.newAudioState.currentlyPlayingNote).toBe("D5");
				expect(result.reason).toContain("二進数0001(8)から D5");
			});

			it("二進数1001 (j+a+f) → E5を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "a", "f"]),
					keyPressOrder: ["j", "a", "f"],
					lastVoiceKeyPressTime: 1000,
					lastScaleKeyPressTime: 1002,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfig,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("E5"); // 左から1001 → 1+8=9 → E5
				expect(result.reason).toContain("二進数1001(9)から E5");
			});

			it("二進数1111 (j+a+s+d+f) → D6を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "a", "s", "d", "f"]),
					keyPressOrder: ["j", "a", "s", "d", "f"],
					lastVoiceKeyPressTime: 999,
					lastScaleKeyPressTime: 1003,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfig,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("D6");
				expect(result.newAudioState.currentlyPlayingNote).toBe("D6");
				expect(result.reason).toContain("二進数1111(15)から D6");
			});

			it("カスタムデフォルト音階: 二進数キーなしでE4を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j"]),
					keyPressOrder: ["j"],
					lastVoiceKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(
					keyboardState,
					audioState,
					mockConfigWithDefaultNote,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("E4"); // カスタムデフォルト音階
				expect(result.newAudioState.currentlyPlayingNote).toBe("E4");
				expect(result.reason).toContain("0000として E4");
			});

			it("カスタムデフォルト音階: 二進数1000(a) → F4を再生", () => {
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
					mockConfigWithDefaultNote,
				);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("F4"); // E4 + 1 = F4
				expect(result.newAudioState.currentlyPlayingNote).toBe("F4");
				expect(result.reason).toContain("二進数1000(1)から F4");
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

		it("キー解放時に押下キーから削除", () => {
			const currentState: KeyboardState = {
				pressedKeys: new Set(["a", "j"]),
				keyPressOrder: ["a", "j"],
				lastVoiceKeyPressTime: 1000,
				lastScaleKeyPressTime: 999,
			};

			const newState = updateKeyboardState(
				currentState,
				"a",
				"release",
				1001,
				mockConfig,
			);

			expect(newState.pressedKeys.has("a")).toBe(false);
			expect(newState.pressedKeys.has("j")).toBe(true);
			expect(newState.keyPressOrder).toEqual(["a", "j"]); // 順序は保持
		});
	});

	describe("複雑なシナリオテスト", () => {
		it("リアルタイム音階変更: j押下中にadsfの組み合わせを変更", () => {
			let keyboardState = createEmptyKeyboardState();
			let audioState = createEmptyAudioState();

			// J押下 (0000 → C4)
			keyboardState = updateKeyboardState(
				keyboardState,
				"j",
				"press",
				1000,
				mockConfig,
			);
			let result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("C4");
			audioState = result.newAudioState;

			// A押下 (1000 → C4)
			keyboardState = updateKeyboardState(
				keyboardState,
				"a",
				"press",
				1001,
				mockConfig,
			);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("D4"); // 左から1000 → a=1<<0 → 1 → D4
			audioState = result.newAudioState;

			// F押下 (1001 → E5)
			keyboardState = updateKeyboardState(
				keyboardState,
				"f",
				"press",
				1002,
				mockConfig,
			);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("E5"); // 左から1001 → a=1<<0, f=1<<3 → 1+8=9 → E5
			audioState = result.newAudioState;

			// A解放 (0001 → D5)
			keyboardState = updateKeyboardState(
				keyboardState,
				"a",
				"release",
				1003,
				mockConfig,
			);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("D5"); // 左から0001 → f=1<<3 → 8 → D5
			audioState = result.newAudioState;

			// J解放 (音停止)
			keyboardState = updateKeyboardState(
				keyboardState,
				"j",
				"release",
				1004,
				mockConfig,
			);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
		});

		it("実際の例: a=on, s=off, d=on, f=off → 1010 → A4", () => {
			let keyboardState = createEmptyKeyboardState();
			const audioState = createEmptyAudioState();

			// J + A + D押下 (1010 → A4)
			keyboardState = updateKeyboardState(
				keyboardState,
				"j",
				"press",
				1000,
				mockConfig,
			);
			keyboardState = updateKeyboardState(
				keyboardState,
				"a",
				"press",
				1001,
				mockConfig,
			);
			keyboardState = updateKeyboardState(
				keyboardState,
				"d",
				"press",
				1002,
				mockConfig,
			);

			const result = determineOutputScale(
				keyboardState,
				audioState,
				mockConfig,
			);

			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("A4"); // 左から1010 → a=1<<0, d=1<<2 → 1+4=5 → A4
			expect(result.reason).toContain("二進数1010(5)から A4");
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

			expect(state.currentlyPlayingNote).toBeUndefined();
		});
	});
});
