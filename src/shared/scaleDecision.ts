import type { NoteName } from "./noteFrequencies";

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
	/** 現在発声中の音階 */
	currentlyPlayingNote?: NoteName;
}

/**
 * 音階決定の設定を表すインターフェース
 */
export interface ScaleDecisionConfig {
	/** 発声キーの定義 */
	voiceKeys: readonly string[];
	/** 音階キーから音階へのマッピング */
	scaleKeyMapping: Record<string, NoteName>;
	/** 優先戦略 */
	priorityStrategy?: 'last-pressed' | 'voice-key-priority';
}

/**
 * 音階決定の結果を表すインターフェース
 */
export interface ScaleDecisionResult {
	/** 音を再生すべきかどうか */
	shouldPlay: boolean;
	/** 再生すべき音階（shouldPlayがtrueの場合のみ有効） */
	noteToPlay?: NoteName;
	/** 新しいオーディオ状態 */
	newAudioState: AudioState;
	/** デバッグ用の決定理由 */
	reason: string;
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
	audioState: AudioState,
	config: ScaleDecisionConfig
): ScaleDecisionResult {
	const { pressedKeys, keyPressOrder } = keyboardState;
	const { currentlyPlayingNote } = audioState;
	
	// 発声キーが押されているか判定
	const isVoiceKeyPressed = config.voiceKeys.some(key => pressedKeys.has(key));
	
	// 現在押されている最新の音階キーを取得（後に押されたキーが優先）
	const latestScaleKey = [...keyPressOrder]
		.reverse()
		.find(key => key in config.scaleKeyMapping && pressedKeys.has(key));
		
	const latestScale = latestScaleKey ? config.scaleKeyMapping[latestScaleKey] : undefined;
	
	if (isVoiceKeyPressed) {
		// 発声キーが押されている場合
		if (latestScale) {
			// 現在押されている音階キーがある場合のみ再生
			return {
				shouldPlay: true,
				noteToPlay: latestScale,
				newAudioState: {
					currentlyPlayingNote: latestScale
				},
				reason: `発声キー押下中: 現在押されている音階キー(${latestScaleKey})から ${latestScale}`
			};
		} else {
			// 現在押されている音階キーがない場合は再生しない
			return {
				shouldPlay: false,
				newAudioState: {
					currentlyPlayingNote: undefined
				},
				reason: "発声キー押下中だが現在押されている音階キーがない"
			};
		}
	} else {
		// 発声キーが押されていない場合は音を停止
		return {
			shouldPlay: false,
			newAudioState: {
				currentlyPlayingNote: undefined
			},
			reason: "発声キー未押下: 音を停止"
		};
	}
}

/**
 * キーボード状態を更新するヘルパー関数
 */
export function updateKeyboardState(
	currentState: KeyboardState,
	key: string,
	action: 'press' | 'release',
	timestamp: number = Date.now(),
	config: ScaleDecisionConfig
): KeyboardState {
	const newPressedKeys = new Set(currentState.pressedKeys);
	let newKeyPressOrder = [...currentState.keyPressOrder];
	let newLastVoiceKeyPressTime = currentState.lastVoiceKeyPressTime;
	let newLastScaleKeyPressTime = currentState.lastScaleKeyPressTime;
	
	if (action === 'press') {
		newPressedKeys.add(key);
		
		// キーが既に押下順序に含まれている場合は削除してから末尾に追加
		newKeyPressOrder = newKeyPressOrder.filter(k => k !== key);
		newKeyPressOrder.push(key);
		
		// タイムスタンプの更新
		if (config.voiceKeys.includes(key)) {
			newLastVoiceKeyPressTime = timestamp;
		}
		if (key in config.scaleKeyMapping) {
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
		lastScaleKeyPressTime: newLastScaleKeyPressTime
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
		lastScaleKeyPressTime: undefined
	};
}

/**
 * 空のオーディオ状態を作成するヘルパー関数
 */
export function createEmptyAudioState(): AudioState {
	return {
		currentlyPlayingNote: undefined
	};
}