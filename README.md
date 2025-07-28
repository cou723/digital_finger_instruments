# デジタル楽器

二進数パターンで音階を指定するWebベースの楽器です。

## 使い方

**発声キー**: J, K, L のいずれか  
**音階キー**: A, S, D, F (4ビット二進数)  
**半音上**: スペースキー

発声キーを押しながら音階キーを組み合わせて演奏します。音は自動的にフェードアウトします。

## システム概要

```mermaid
graph LR
    A[二進数入力] --> B[メジャースケール変換]
    B --> C[周波数計算]
    C --> D[音声出力]
```

- **音階システム**: 0-15の二進数値 → メジャースケール7音循環
- **エンベロープ**: ADSR による自然な音量減衰
- **複数オクターブ**: 自動オクターブ展開

## 開発環境

```bash
pnpm install
pnpm run dev
pnpm run build
```

## 技術スタック

- React + TypeScript + Vite
- Web Audio API
- pnpm + Biome

## ドキュメント

- [AUDIO_FLOW_DOCUMENTATION.md](./AUDIO_FLOW_DOCUMENTATION.md) - 技術仕様
- [CLAUDE.md](./CLAUDE.md) - 開発ガイドライン