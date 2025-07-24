# デジタル楽器 - オーディオ処理フロー技術仕様

## 概要
このドキュメントでは、キーが押されてから音が鳴るまでの技術的な処理フローを、実際のコードと照らし合わせながら詳細に説明します。

## アーキテクチャ概要

システムは以下の主要コンポーネントで構成されています：

1. **NotePlayer**: キーボードイベントを捕捉し、音階に変換
2. **useAudioContext**: Web Audio APIを管理し、実際の音声生成を担当
3. **App.tsx**: アプリケーション全体の状態管理（現在再生中の音階）
4. **Keyboard**: 現在の状態を視覚的に表示するUIコンポーネント

処理の流れは、キーボードイベントがNotePlayerで捕捉され、useAudioContextでWeb Audio APIを通じて音声出力が行われる一方で、App.tsxの状態管理を経由してKeyboardコンポーネントのUI表示が更新されます。

## 1. キーボードイベントの捕捉

### ファイル: `src/audio/NotePlayer/index.tsx`

```typescript
// 1.1 イベントリスナーの登録
useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { /* ... */ };
    const handleKeyUp = (event: KeyboardEvent) => { /* ... */ };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
    };
}, [playNote, stopNote, isSupported, onNotePlay, onNoteStop, currentNote]);
```

**技術的詳細:**
- `window`レベルでグローバルにイベントをキャッチ
- `useEffect`の依存配列により、関連する値が変更されるとイベントリスナーが再登録される
- クリーンアップ関数でメモリリークを防止

### 1.2 キー押下時の処理

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();          // 大文字小文字を正規化
    const note = KEY_TO_NOTE[key];               // キーを音階にマッピング
    
    if (note && !event.repeat) {                 // 有効なキーかつ連打でない場合
        console.log(`KeyDown: ${key} -> ${note}, currentNote: ${currentNote}`);
        playNote(note);                          // オーディオ再生
        onNotePlay?.(note);                      // 状態管理通知
    }
};
```

**技術的詳細:**
- `event.repeat`チェックにより、キー長押し時の連続イベントを防止
- `KEY_TO_NOTE`マッピング（`src/shared/noteFrequencies.ts`）を使用してキーを音階に変換
- オプショナルチェイニング（`?.`）でコールバックの安全な呼び出し

## 2. 音階マッピングと周波数変換

### ファイル: `src/shared/noteFrequencies.ts`

```typescript
// 2.1 キーマッピング定義
export const KEY_TO_NOTE: KeyMapping = {
    a: "C",    // ド
    s: "D",    // レ
    d: "E",    // ミ
    f: "F",    // ファ
    g: "G",    // ソ
    h: "A",    // ラ
    j: "B",    // シ
} as const;

// 2.2 音階周波数マッピング
export const NOTE_FREQUENCIES: Record<NoteName, number> = {
    C: 261.63, // ド (中央のC、C4)
    D: 293.66, // レ
    E: 329.63, // ミ
    F: 349.23, // ファ
    G: 392.00, // ソ
    A: 440.00, // ラ (A4、標準ピッチ)
    B: 493.88, // シ
} as const;
```

**技術的詳細:**
- 西洋音楽の平均律に基づく周波数値
- `as const`により型安全性を確保し、値の変更を防止
- A4=440Hzを基準とした標準的な音律

## 3. オーディオコンテキスト初期化と管理

### ファイル: `src/audio/useAudioContext.ts`

### 3.1 AudioContext初期化

```typescript
const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
        if (!isSupported()) {
            const audioError: AudioError = {
                type: "WEB_AUDIO_API_NOT_SUPPORTED",
                message: "お使いのブラウザはWeb Audio APIをサポートしていません。",
            };
            setError(audioError);
            return false;
        }

        try {
            const AudioContextClass =
                window.AudioContext ||
                (window as unknown as { webkitAudioContext: typeof AudioContext })
                    .webkitAudioContext;
            audioContextRef.current = new AudioContextClass();
            setError(null);
        } catch (cause) {
            const audioError: AudioError = {
                type: "AUDIO_CONTEXT_CREATION_FAILED",
                message: "Audio Contextの作成に失敗しました。",
                cause,
            };
            setError(audioError);
            return false;
        }
    }
    return true;
}, [isSupported]);
```

**技術的詳細:**
- Safari対応のため`webkitAudioContext`もフォールバック対象に含める
- シングルトンパターンでAudioContextを管理（一度作成したら再利用）
- 型安全なエラーハンドリングシステム

### 3.2 音の停止処理（競合状態対策）

```typescript
const stopNote = useCallback(() => {
    if (
        oscillatorRef.current &&
        gainNodeRef.current &&
        audioContextRef.current
    ) {
        try {
            const audioContext = audioContextRef.current;
            const currentTime = audioContext.currentTime;
            const currentOscillator = oscillatorRef.current;
            const currentGainNode = gainNodeRef.current;

            // ★重要: refを即座にクリア（新しい音の再生を妨げないため）
            oscillatorRef.current = null;
            gainNodeRef.current = null;

            // フェードアウト効果
            currentGainNode.gain.setValueAtTime(
                currentGainNode.gain.value,
                currentTime,
            );
            currentGainNode.gain.linearRampToValueAtTime(0, currentTime + 0.01);

            // 非同期停止処理（ローカル変数を使用）
            setTimeout(() => {
                try {
                    currentOscillator.stop();
                } catch (error) {
                    console.warn('Oscillator stop warning:', error);
                }
            }, 20);
        } catch (cause) {
            // エラーハンドリング...
        }
    }
}, []);
```

**技術的詳細:**
- **競合状態対策**: refを即座にクリアし、ローカル変数で非同期処理を実行
- **フェードアウト効果**: 10ms（0.01秒）でボリュームを0に線形変化
- **非同期停止**: 20ms後にオシレーターを実際に停止（プチプチ音を防止）

### 3.3 音の再生処理

```typescript
const playNote = useCallback(
    (note: NoteName) => {
        if (!initializeAudioContext()) return;

        // ★重要: 既存の音を停止
        stopNote();

        if (!audioContextRef.current) return;
        const audioContext = audioContextRef.current;
        const frequency = NOTE_FREQUENCIES[note];

        try {
            // オシレーターとゲインノードを作成
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            // オシレーター設定
            oscillator.type = "sine";                    // サイン波
            oscillator.frequency.setValueAtTime(
                frequency,
                audioContext.currentTime,
            );

            // フェードイン効果
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                0.3,                                     // 最大音量30%
                audioContext.currentTime + 0.01,
            );

            // ノード接続: Oscillator → Gain → Destination
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // 再生開始
            oscillator.start();

            // 参照を保存
            oscillatorRef.current = oscillator;
            gainNodeRef.current = gainNode;
        } catch (cause) {
            // エラーハンドリング...
        }
    },
    [initializeAudioContext, stopNote],
);
```

**技術的詳細:**
- **音の切り替え**: 新しい音を再生する前に既存の音を必ず停止
- **Web Audio APIノードグラフ**: Oscillator → Gain → Destination の接続
- **フェードイン効果**: 10msでボリュームを0から30%に上昇
- **サイン波**: 純音に近い滑らかな音質

## 4. 状態管理とUI更新

### ファイル: `src/App.tsx`

```typescript
const handleNotePlay = (note: NoteName) => {
    console.log(`App.handleNotePlay: ${note} (prev: ${currentNote})`);
    // 新しい音に即座に切り替え
    setCurrentNote(note);
};

const handleNoteStop = (stoppedNote?: NoteName) => {
    console.log(`App.handleNoteStop: ${stoppedNote} (current: ${currentNote})`);
    // 特定の音階の停止が指定された場合、現在の音階と一致する場合のみ停止
    if (stoppedNote && currentNote !== stoppedNote) {
        console.log(`App.handleNoteStop: ignored (${stoppedNote} !== ${currentNote})`);
        return;
    }
    setCurrentNote(null);
};
```

**技術的詳細:**
- **即座の状態更新**: `handleNotePlay`は条件なしで即座に状態を更新
- **条件付き停止**: `handleNoteStop`は現在再生中の音階の場合のみ停止
- **デバッグログ**: 状態変更を追跡可能

## 5. キー離し時の処理

### ファイル: `src/audio/NotePlayer/index.tsx`

```typescript
const handleKeyUp = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const note = KEY_TO_NOTE[key];

    // 現在再生中の音階に対応するキーが離された場合のみ停止
    if (note && currentNote === note) {
        console.log(`KeyUp: ${key} -> ${note}, stopping currentNote: ${currentNote}`);
        stopNote();
        onNoteStop?.(note);
    } else if (note) {
        console.log(`KeyUp: ${key} -> ${note}, ignored (currentNote: ${currentNote})`);
    }
};
```

**技術的詳細:**
- **条件付き停止**: 離されたキーが現在再生中の音階と一致する場合のみ処理
- **競合回避**: 複数キー同時押し時の意図しない停止を防止

## 6. 完全な処理フロー例

### シナリオ: A押下 → S押下 → A離す → S離す

1. **A押下**:
   ```
   KeyDown: a -> C, currentNote: null
   App.handleNotePlay: C (prev: null)
   [Web Audio] C音（261.63Hz）再生開始
   [UI] Keyboard表示がC音でハイライト
   ```

2. **S押下**:
   ```
   KeyDown: s -> D, currentNote: C
   [Web Audio] 既存のC音停止処理開始（非同期）
   [Web Audio] D音（293.66Hz）再生開始
   App.handleNotePlay: D (prev: C)
   [UI] Keyboard表示がD音でハイライト
   ```

3. **A離す**:
   ```
   KeyUp: a -> C, ignored (currentNote: D)
   [処理なし - 現在の音階がDのため]
   ```

4. **S離す**:
   ```
   KeyUp: s -> D, stopping currentNote: D
   App.handleNoteStop: D (current: D)
   [Web Audio] D音停止
   [UI] Keyboard表示のハイライト解除
   ```

## 7. エラーハンドリング

### エラー型定義: `src/audio/types.ts`

```typescript
export type AudioError = 
  | { type: "WEB_AUDIO_API_NOT_SUPPORTED"; message: string }
  | { type: "AUDIO_CONTEXT_CREATION_FAILED"; message: string; cause?: unknown }
  | { type: "NOTE_PLAYBACK_FAILED"; message: string; noteName: string; cause?: unknown }
  | { type: "NOTE_STOP_FAILED"; message: string; cause?: unknown };
```

**各エラーの発生条件:**
- `WEB_AUDIO_API_NOT_SUPPORTED`: ブラウザがWeb Audio APIをサポートしていない
- `AUDIO_CONTEXT_CREATION_FAILED`: AudioContextの作成に失敗
- `NOTE_PLAYBACK_FAILED`: 特定の音階の再生に失敗
- `NOTE_STOP_FAILED`: 音の停止処理に失敗

## 8. パフォーマンス考慮事項

### メモリ管理
- **AudioContext**: シングルトンパターンで再利用
- **Oscillator**: 使い捨て（stop後は再利用不可）
- **GainNode**: 音ごとに新規作成
- **イベントリスナー**: useEffectのクリーンアップで確実に削除

### レイテンシ最適化
- **即座のref更新**: stopNote時に即座にrefをクリアして次の音再生を阻害しない
- **非同期停止**: フェードアウト中に新しい音を開始可能
- **プリフェッチなし**: 音階マッピングは定数時間でアクセス可能

## 9. 既知の問題と制限

### ブラウザ制限
- **自動再生ポリシー**: 多くのブラウザでユーザーインタラクション後のみAudioContext作成可能
- **Safari**: webkitAudioContextプレフィックスが必要（対応済み）
- **モバイル**: タッチイベントには未対応（物理キーボードのみ）

### 実装制限
- **同時発音**: 1音のみ（意図された設計）
- **音階範囲**: C4-B4の1オクターブのみ
- **音色**: サイン波固定（波形変更は今後の拡張点）