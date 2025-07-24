import { describe, expect, it } from "vitest";
import {
	determineOutputScale,
	updateKeyboardState,
	createEmptyKeyboardState,
	createEmptyAudioState,
	type KeyboardState,
	type AudioState,
	type ScaleDecisionConfig,
} from "../scaleDecision";

const mockConfig: ScaleDecisionConfig = {
	voiceKeys: ["j"],
	scaleKeyMapping: {
		a: "C4",
		s: "D4",
		d: "E4",
		f: "F4",
		z: "G4",
		x: "A4",
		c: "B4",
		v: "C5",
	},
	priorityStrategy: "last-pressed",
};

describe("scaleDecision", () => {
	describe("determineOutputScale", () => {
		describe("発声キーが押されていない場合", () => {
			it("音階キーのみ押下時は音は鳴らない", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["a"]),
					keyPressOrder: ["a"],
					lastScaleKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
				expect(result.reason).toContain("発声キー未押下");
			});

			it("任意の音階キーが押されていても発声キーがなければ音は鳴らない", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["s"]),
					keyPressOrder: ["s"],
					lastScaleKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
				expect(result.reason).toContain("発声キー未押下");
			});

			it("音階キーが押されていない場合、音は鳴らない", () => {
				const keyboardState = createEmptyKeyboardState();
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
				expect(result.reason).toContain("発声キー未押下");
			});
		});

		describe("発声キーが押されている場合", () => {
			it("音階キーも同時押しの場合、その音階を再生", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "a"]),
					keyPressOrder: ["a", "j"],
					lastVoiceKeyPressTime: 1001,
					lastScaleKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("C4");
				expect(result.newAudioState.currentlyPlayingNote).toBe("C4");
				expect(result.reason).toContain("現在押されている音階キー(a)から C4");
			});

			it("発声キーのみ押下で音階キーがない場合、音は鳴らない", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j"]),
					keyPressOrder: ["j"],
					lastVoiceKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
				expect(result.reason).toContain("現在押されている音階キーがない");
			});

			it("複数の音階キーが押されている場合、最後に押されたキーを優先", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j", "a", "s", "d"]),
					keyPressOrder: ["a", "j", "s", "d"], // dが最後
					lastVoiceKeyPressTime: 999,
					lastScaleKeyPressTime: 1002,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(true);
				expect(result.noteToPlay).toBe("E4"); // dキー = E4
				expect(result.reason).toContain("現在押されている音階キー(d)から E4");
			});
		});

		describe("音階キーが離された場合の動作", () => {
			it("音階キーを離した場合、発声キーが押されていても音は停止すべき", () => {
				const keyboardState: KeyboardState = {
					pressedKeys: new Set(["j"]), // 音階キーは離されている
					keyPressOrder: ["a", "j"], // aは押下履歴にあるが現在は離されている
					lastVoiceKeyPressTime: 1001,
					lastScaleKeyPressTime: 1000,
				};
				const audioState = createEmptyAudioState();

				const result = determineOutputScale(keyboardState, audioState, mockConfig);

				expect(result.shouldPlay).toBe(false);
				expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
				expect(result.reason).toContain("現在押されている音階キーがない");
			});
		});
	});

	describe("updateKeyboardState", () => {
		it("キー押下時に状態を正しく更新", () => {
			const currentState = createEmptyKeyboardState();
			const timestamp = 1000;

			const newState = updateKeyboardState(
				currentState,
				"a",
				"press",
				timestamp,
				mockConfig
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
				mockConfig
			);

			expect(newState.pressedKeys.has("j")).toBe(true);
			expect(newState.keyPressOrder).toEqual(["j"]);
			expect(newState.lastVoiceKeyPressTime).toBe(timestamp);
		});

		it("キー解放時に押下キーから削除（押下順序は保持）", () => {
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
				mockConfig
			);

			expect(newState.pressedKeys.has("a")).toBe(false);
			expect(newState.pressedKeys.has("j")).toBe(true);
			expect(newState.keyPressOrder).toEqual(["a", "j"]); // 順序は保持
			expect(newState.lastVoiceKeyPressTime).toBe(1000); // タイムスタンプは変更されない
		});

		it("同じキーを再度押した場合、押下順序の末尾に移動", () => {
			const currentState: KeyboardState = {
				pressedKeys: new Set(["a", "s"]),
				keyPressOrder: ["a", "s"],
				lastScaleKeyPressTime: 1000,
			};

			const newState = updateKeyboardState(
				currentState,
				"a",
				"press",
				1001,
				mockConfig
			);

			expect(newState.keyPressOrder).toEqual(["s", "a"]); // aが末尾に移動
			expect(newState.lastScaleKeyPressTime).toBe(1001);
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

	describe("複雑なシナリオテスト", () => {
		it("正しい要求: A押下 → J押下 → S押下 → A解放 → J解放の流れ", () => {
			let keyboardState = createEmptyKeyboardState();
			let audioState = createEmptyAudioState();

			// A押下 (音階キーのみ、音は鳴らない)
			keyboardState = updateKeyboardState(keyboardState, "a", "press", 1000, mockConfig);
			let result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			expect(result.reason).toContain("発声キー未押下");
			audioState = result.newAudioState;

			// J押下 (発声キー + 音階キー、C4を再生)
			keyboardState = updateKeyboardState(keyboardState, "j", "press", 1001, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("C4");
			expect(result.reason).toContain("現在押されている音階キー(a)から C4");
			audioState = result.newAudioState;

			// S押下 (C4からD4に切り替え)
			keyboardState = updateKeyboardState(keyboardState, "s", "press", 1002, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("D4"); // 最後に押されたsキーが優先
			expect(result.reason).toContain("現在押されている音階キー(s)から D4");
			audioState = result.newAudioState;

			// A解放 (sキーがまだ押されているのでD4を継続)
			keyboardState = updateKeyboardState(keyboardState, "a", "release", 1003, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(true);
			expect(result.noteToPlay).toBe("D4");
			expect(result.reason).toContain("現在押されている音階キー(s)から D4");
			audioState = result.newAudioState;

			// J解放 (発声キー解放で音停止)
			keyboardState = updateKeyboardState(keyboardState, "j", "release", 1004, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			expect(result.newAudioState.currentlyPlayingNote).toBeUndefined();
			expect(result.reason).toContain("発声キー未押下");
		});

		it("間違ったパターン: A押下 → A解放 → J押下 では音は鳴らない", () => {
			let keyboardState = createEmptyKeyboardState();
			let audioState = createEmptyAudioState();

			// A押下
			keyboardState = updateKeyboardState(keyboardState, "a", "press", 1000, mockConfig);
			let result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			audioState = result.newAudioState;

			// A解放
			keyboardState = updateKeyboardState(keyboardState, "a", "release", 1001, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			audioState = result.newAudioState;

			// J押下 (音階キーが押されていないので音は鳴らない)
			keyboardState = updateKeyboardState(keyboardState, "j", "press", 1002, mockConfig);
			result = determineOutputScale(keyboardState, audioState, mockConfig);
			expect(result.shouldPlay).toBe(false);
			expect(result.reason).toContain("現在押されている音階キーがない");
		});
	});
});