/**
 * オーディオエンベロープシステム
 * ギターや打楽器のような自然な音量減衰を実現
 */

/**
 * エンベロープの設定パラメータ
 */
export interface EnvelopeConfig {
	/** アタック時間（秒） - 音が最大音量に達するまでの時間 */
	attack: number;
	/** ディケイ時間（秒） - 最大音量からサステインレベルまでの時間 */
	decay: number;
	/** サステインレベル（0-1） - 持続音量のレベル */
	sustain: number;
	/** リリース時間（秒） - 音が完全に消えるまでの時間 */
	release: number;
	/** 最大音量（0-1） - アタック時の最大音量 */
	maxVolume: number;
}

/**
 * ギター/打楽器風のデフォルトエンベロープ設定
 */
export const DEFAULT_ENVELOPE: EnvelopeConfig = {
	attack: 0.005, // 5ms - 素早いアタック
	decay: 0.3, // 300ms - 中程度のディケイ
	sustain: 0.2, // 20% - 低めのサステイン
	release: 1.5, // 1.5秒 - 長めのリリース
	maxVolume: 0.3, // 30% - 適度な音量
};

/**
 * エンベロープ制御クラス
 */
export class EnvelopeController {
	private gainNode: GainNode;
	private audioContext: AudioContext;
	private releaseTimeoutId?: number;
	private isReleasing = false;

	constructor(audioContext: AudioContext, gainNode: GainNode) {
		this.audioContext = audioContext;
		this.gainNode = gainNode;
	}

	/**
	 * エンベロープを開始（アタック → ディケイ → サステイン）
	 * @param config エンベロープ設定
	 * @param autoReleaseTime 自動リリース開始時間（秒）、undefinedの場合は自動リリースしない
	 */
	start(config: EnvelopeConfig, autoReleaseTime?: number): void {
		const currentTime = this.audioContext.currentTime;
		const gain = this.gainNode.gain;

		// 既存のスケジュールをクリア
		gain.cancelScheduledValues(currentTime);
		this.clearReleaseTimeout();
		this.isReleasing = false;

		// アタック（0 → maxVolume）
		gain.setValueAtTime(0, currentTime);
		gain.linearRampToValueAtTime(config.maxVolume, currentTime + config.attack);

		// ディケイ（maxVolume → sustain）
		const sustainVolume = config.maxVolume * config.sustain;
		gain.exponentialRampToValueAtTime(
			Math.max(sustainVolume, 0.001), // 0は指数関数で使えないため最小値を設定
			currentTime + config.attack + config.decay,
		);

		// 自動リリースが設定されている場合
		if (autoReleaseTime !== undefined) {
			this.scheduleAutoRelease(config, autoReleaseTime);
		}
	}

	/**
	 * リリースを開始（現在の音量 → 0）
	 * @param config エンベロープ設定
	 */
	release(config: EnvelopeConfig): void {
		if (this.isReleasing) return;

		const currentTime = this.audioContext.currentTime;
		const gain = this.gainNode.gain;

		this.isReleasing = true;
		this.clearReleaseTimeout();

		// 現在の音量からリリース開始
		gain.cancelScheduledValues(currentTime);
		gain.setValueAtTime(gain.value, currentTime);
		gain.exponentialRampToValueAtTime(0.001, currentTime + config.release);

		// リリース完了後にコールバック実行
		this.releaseTimeoutId = window.setTimeout(() => {
			this.onReleaseComplete?.();
		}, config.release * 1000);
	}

	/**
	 * 即座に音を停止
	 */
	stop(): void {
		const currentTime = this.audioContext.currentTime;
		const gain = this.gainNode.gain;

		this.isReleasing = true;
		this.clearReleaseTimeout();

		// 即座に音量を0に
		gain.cancelScheduledValues(currentTime);
		gain.setValueAtTime(gain.value, currentTime);
		gain.linearRampToValueAtTime(0, currentTime + 0.01); // 10msでフェードアウト

		// 即座にコールバック実行
		setTimeout(() => {
			this.onReleaseComplete?.();
		}, 15);
	}

	/**
	 * リリース完了時のコールバック
	 */
	onReleaseComplete?: () => void;

	/**
	 * 現在リリース中かどうか
	 */
	get isReleasingState(): boolean {
		return this.isReleasing;
	}

	/**
	 * 自動リリースをスケジュール
	 */
	private scheduleAutoRelease(
		config: EnvelopeConfig,
		autoReleaseTime: number,
	): void {
		this.releaseTimeoutId = window.setTimeout(() => {
			this.release(config);
		}, autoReleaseTime * 1000);
	}

	/**
	 * リリースタイマーをクリア
	 */
	private clearReleaseTimeout(): void {
		if (this.releaseTimeoutId !== undefined) {
			clearTimeout(this.releaseTimeoutId);
			this.releaseTimeoutId = undefined;
		}
	}

	/**
	 * リソースクリーンアップ
	 */
	dispose(): void {
		this.clearReleaseTimeout();
		this.onReleaseComplete = undefined;
	}
}

/**
 * エンベロープ制御のファクトリー関数
 * @param audioContext Web Audio APIのコンテキスト
 * @param gainNode 制御対象のGainNode
 * @returns EnvelopeControllerのインスタンス
 */
export function createEnvelopeController(
	audioContext: AudioContext,
	gainNode: GainNode,
): EnvelopeController {
	return new EnvelopeController(audioContext, gainNode);
}

/**
 * エンベロープ設定のバリデーション
 * @param config エンベロープ設定
 * @returns バリデーション結果
 */
export function validateEnvelopeConfig(config: EnvelopeConfig): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (config.attack < 0) errors.push("attack must be >= 0");
	if (config.decay < 0) errors.push("decay must be >= 0");
	if (config.sustain < 0 || config.sustain > 1)
		errors.push("sustain must be between 0 and 1");
	if (config.release < 0) errors.push("release must be >= 0");
	if (config.maxVolume < 0 || config.maxVolume > 1)
		errors.push("maxVolume must be between 0 and 1");

	return {
		isValid: errors.length === 0,
		errors,
	};
}
