import { KEY_TO_NOTE, type NoteName } from "./noteFrequencies";

/**
 * 発声キーの定義
 * 音の発声を制御するキー群
 */
const VOICE_KEYS = ["j"] as const;

/**
 * 指定されたキーが発声キーかどうかを判定する
 * @param key キーボードキー
 * @returns 発声キーの場合true
 */
export const isVoiceKey = (key: string): boolean => {
	return VOICE_KEYS.includes(key as (typeof VOICE_KEYS)[number]);
};

/**
 * 指定されたキーが音階キーかどうかを判定する
 * @param key キーボードキー
 * @returns 音階キーの場合true
 */
export const isScaleKey = (key: string): boolean => {
	return key in KEY_TO_NOTE;
};

/**
 * 発声キーの一覧を取得する
 * @returns 発声キーの配列
 */
export const getVoiceKeys = (): readonly string[] => {
	return VOICE_KEYS;
};

/**
 * 音階キーの一覧を取得する
 * @returns 音階キーの配列
 */
export const getScaleKeys = (): string[] => {
	return Object.keys(KEY_TO_NOTE);
};

/**
 * 音階キーから対応する音階を取得する
 * @param key 音階キー
 * @returns 対応する音階、または undefined
 */
export const getScaleFromKey = (key: string): NoteName | undefined => {
	return isScaleKey(key) ? KEY_TO_NOTE[key] : undefined;
};
