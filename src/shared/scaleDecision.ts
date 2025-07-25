import { createFrequencyNote, type FrequencyNote } from "./frequencySystem";

/**
 * キーボードの状態を表すインターフェース
 */
export interface KeyboardState {
	/** 現在押されているすべてのキー */
	pressedKeys: Set<string>;
	/** キーが押された順序（後に押されたキーが優先） */
	keyPressOrder: string[];
	/** 最後に発声キーが押された時刻 */
	lastVoiceKeyPressTime?: number;
	/** 最後に音階キーが押された時刻 */
	lastScaleKeyPressTime?: number;
}

/**
 * オーディオの状態を表すインターフェース
 */
export interface AudioState {
	/** 現在発声中の周波数音階 */
	currentlyPlayingFrequency?: FrequencyNote;
}

/**
 * 音階決定の設定を表すインターフェース
 */
export interface ScaleDecisionConfig {
	/** 発声キーの定義 */
	voiceKeys: readonly string[];
	/** 優先戦略 */
	priorityStrategy?: "last-pressed" | "voice-key-priority";
	/** 0000時の基準音階 */
	baseNote?: string;
}

/**
 * 音階決定の結果を表すインターフェース
 */
export interface ScaleDecisionResult {
	/** 音を再生すべきかどうか */
	shouldPlay: boolean;
	/** 再生すべき周波数音階（shouldPlayがtrueの場合のみ有効） */
	frequencyToPlay?: FrequencyNote;
	/** 新しいオーディオ状態 */
	newAudioState: AudioState;
	/** デバッグ用の決定理由 */
	reason: string;
}

/**
 * 二進数キーの定義 (a, s, d, f)
 */
export const BINARY_KEYS = ["a", "s", "d", "f"] as const;

/**
 * キーボード状態から二進数値を計算し、対応する周波数音階を返す
 * asdf = 左から右へ二進数として解釈（視覚的に左から読んだ値を反転）
 * 例: a=on, s=off, d=on, f=off → 0101（左から） → 反転して1010 → 10半音上
 *
 * @param pressedKeys 現在押されているキーのSet
 * @param baseNote 0000時の基準音階（デフォルト: "C4"）
 * @returns 対応する周波数音階（FrequencyNote）
 */
export function calculateBinaryFrequency(
	pressedKeys: Set<string>,
	baseNote: string = "C4",
): FrequencyNote {
	let binaryValue = 0;

	// 左から読んだ二進数を構築し、それを反転して通常の二進数値にする
	BINARY_KEYS.forEach((key, index) => {
		if (pressedKeys.has(key)) {
			binaryValue |= 1 << index; // indexそのままを使用（左から右への位置）
		}
	});

	// 0-15の範囲を保証
	const clampedValue = Math.max(0, Math.min(15, binaryValue));

	// 基準音から周波数音階を生成
	return createFrequencyNote(baseNote, clampedValue);
}

/**
 * キーボード状態から出力すべき音階を決定する純粋関数
 *
 * @param keyboardState 現在のキーボード状態
 * @param audioState 現在のオーディオ状態
 * @param config 音階決定の設定
 * @returns 音階決定の結果
 */
export function determineOutputScale(
	keyboardState: KeyboardState,
	_audioState: AudioState,
	config: ScaleDecisionConfig,
): ScaleDecisionResult {
	const { pressedKeys } = keyboardState;

	// 発声キーが押されているか判定
	const isVoiceKeyPressed = config.voiceKeys.some((key) =>
		pressedKeys.has(key),
	);

	if (isVoiceKeyPressed) {
		// 発声キーが押されている場合
		// 二進数キー（a,s,d,f）のいずれかが押されているかチェック
		const hasBinaryKeyPressed = BINARY_KEYS.some((key) => pressedKeys.has(key));

		// 基準音を決定（設定値またはデフォルト）
		const baseNote = config.baseNote || "C4";

		if (hasBinaryKeyPressed) {
			// 二進数計算で周波数音階を決定
			const frequencyNote = calculateBinaryFrequency(pressedKeys, baseNote);

			// デバッグ用: 左から読んだ二進数表示と実際の値を計算
			let _binaryValue = 0;
			BINARY_KEYS.forEach((key, index) => {
				if (pressedKeys.has(key)) {
					_binaryValue |= 1 << index;
				}
			});
			const binaryString = BINARY_KEYS.map((key) =>
				pressedKeys.has(key) ? "1" : "0",
			).join("");

			return {
				shouldPlay: true,
				frequencyToPlay: frequencyNote,
				newAudioState: {
					currentlyPlayingFrequency: frequencyNote,
				},
				reason: `発声キー押下中: ${frequencyNote.baseNote}+${frequencyNote.semitoneOffset}半音 (${binaryString}) → ${frequencyNote.noteName} (${frequencyNote.frequency.toFixed(2)}Hz)`,
			};
		} else {
			// 二進数キーが押されていない場合は基準音を使用（0000として扱う）
			const frequencyNote = calculateBinaryFrequency(new Set(), baseNote);

			return {
				shouldPlay: true,
				frequencyToPlay: frequencyNote,
				newAudioState: {
					currentlyPlayingFrequency: frequencyNote,
				},
				reason: `発声キー押下中: 二進数キー未押下のため0000として ${frequencyNote.baseNote}+0半音 → ${frequencyNote.noteName} (${frequencyNote.frequency.toFixed(2)}Hz)`,
			};
		}
	} else {
		// 発声キーが押されていない場合は音を停止
		return {
			shouldPlay: false,
			newAudioState: {
				currentlyPlayingFrequency: undefined,
			},
			reason: "発声キー未押下: 音を停止",
		};
	}
}

/**
 * キーボード状態を更新するヘルパー関数
 */
export function updateKeyboardState(
	currentState: KeyboardState,
	key: string,
	action: "press" | "release",
	timestamp: number = Date.now(),
	config: ScaleDecisionConfig,
): KeyboardState {
	const newPressedKeys = new Set(currentState.pressedKeys);
	let newKeyPressOrder = [...currentState.keyPressOrder];
	let newLastVoiceKeyPressTime = currentState.lastVoiceKeyPressTime;
	let newLastScaleKeyPressTime = currentState.lastScaleKeyPressTime;

	if (action === "press") {
		newPressedKeys.add(key);

		// キーが既に押下順序に含まれている場合は削除してから末尾に追加
		newKeyPressOrder = newKeyPressOrder.filter((k) => k !== key);
		newKeyPressOrder.push(key);

		// タイムスタンプの更新
		if (config.voiceKeys.includes(key)) {
			newLastVoiceKeyPressTime = timestamp;
		}
		if (BINARY_KEYS.includes(key as (typeof BINARY_KEYS)[number])) {
			newLastScaleKeyPressTime = timestamp;
		}
	} else {
		newPressedKeys.delete(key);
		// キーが離された場合は押下順序からは削除しない（最後に押されたキーの情報を保持）
	}

	return {
		pressedKeys: newPressedKeys,
		keyPressOrder: newKeyPressOrder,
		lastVoiceKeyPressTime: newLastVoiceKeyPressTime,
		lastScaleKeyPressTime: newLastScaleKeyPressTime,
	};
}

/**
 * 空のキーボード状態を作成するヘルパー関数
 */
export function createEmptyKeyboardState(): KeyboardState {
	return {
		pressedKeys: new Set(),
		keyPressOrder: [],
		lastVoiceKeyPressTime: undefined,
		lastScaleKeyPressTime: undefined,
	};
}

/**
 * 空のオーディオ状態を作成するヘルパー関数
 */
export function createEmptyAudioState(): AudioState {
	return {
		currentlyPlayingFrequency: undefined,
	};
}

/**
 * 2つのFrequencyNoteが同じ音階かどうかを判定するヘルパー関数
 *
 * @param freq1 比較する周波数音階1
 * @param freq2 比較する周波数音階2
 * @param toleranceHz 周波数の許容誤差（Hz）
 * @returns 同じ音階かどうか
 */
export function isSameFrequency(
	freq1?: FrequencyNote,
	freq2?: FrequencyNote,
	toleranceHz: number = 0.1,
): boolean {
	if (!freq1 || !freq2) {
		return freq1 === freq2;
	}

	return Math.abs(freq1.frequency - freq2.frequency) < toleranceHz;
}
