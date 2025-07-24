## 開発環境・ツール

### パッケージマネージャー

**pnpmを使用してください**:
- このプロジェクトでは `pnpm` をパッケージマネージャーとして使用します
- `npm` や `yarn` ではなく、必ず `pnpm` コマンドを使用してください

**主要コマンド**:
```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm run dev

# ビルド実行
pnpm run build

# テスト実行
pnpm test

# リンタ実行
pnpm run lint

# 型チェック
pnpm run typecheck
```

**理由**:
- 高速なインストールとディスク容量の節約
- より厳密な依存関係管理
- モノレポサポートの優秀さ

## コーディングスタイル

### フォルダ構造設計

フォルダ構造はコンポーネントとその関連ファイルで整理してください。

#### ファイル配置の判断基準

ファイルの配置は以下の判断フローに従って決定します：

1. **単一コンポーネント専用か？** → YES: コンポーネントフォルダ内に配置
2. **特定の責任領域か？** → YES: 該当責任領域フォルダに配置  
3. **複数領域で共有か？** → YES: shared/に配置

#### フォルダの分類例

- `auth/` - 認証・ログイン関連
- `data/` - API通信・データ取得関連
- `display/` - UI表示・レンダリング関連
- `settings/` - 設定・構成管理関連
- `components/` - 子コンポーネント群の整理
- `shared/` - 複数領域で使用される共通要素

#### コンポーネント専用hooksの配置指針

hooksの配置は以下の基準で決定します：

**配置基準**:
- **単一コンポーネント専用**: `ComponentName/useSpecificHook.ts`
- **関連領域内共通**: `relatedArea/useSharedHook.ts`
- **全体共通**: `shared/useGlobalHook.ts`

**実装例**:
```typescript
// ❌ バケツリレーパターン（避けるべき）
export const ParentComponent = () => {
  const { data, loading } = useCustomHook();
  return <ChildComponent data={data} loading={loading} />;
};

// ✅ 直接参照パターン（推奨）
export const ChildComponent = () => {
  const { data, loading } = useCustomHook();
  return <div>{data}</div>;
};
```

**判断基準**:
- propsとして渡しているデータが、親コンポーネントで直接使用されていない
- 子コンポーネントが特定のhookに強く依存している
- インポートチェーンが深くなっている

#### 大規模リファクタリングについて

肥大化したコンポーネントやhooksの分割、適切なフォルダ構造への移行などの大規模リファクタリングを行う際は、[REFACTORING_GUIDE.md](./REFACTORING_GUIDE.md)を参照してください。このガイドには具体的な手順、アンチパターンの検出方法、段階的な実行プロセスが記載されています。

**避けるべき構造**:
```
src/
├── components/           # 技術的分類（コンポーネント単位の整理なし）
│   ├── CalendarGrid.tsx
│   └── FamilyMember.tsx
├── hooks/               # 技術的分類（コンポーネント単位の整理なし）
│   ├── useCalendarData.ts
│   └── useFamilySettings.ts
└── types/               # 技術的分類（コンポーネント単位の整理なし）
    ├── CalendarTypes.ts
    └── FamilyTypes.ts
```

### 構造化されたファイル構成の指針

複雑なコンポーネントや関連する子コンポーネントがある場合は、専用ディレクトリを作成して適切にスコープを分離します。

**適用基準**:
- コンポーネントが複数の子コンポーネントを持つ場合
- 子コンポーネントが親コンポーネント専用で他から参照されない場合
- 重複するロジックを子コンポーネントとして抽出できる場合

**構造化の例**:
```
src/calendar/settingsModal/
├── index.tsx            # メインコンポーネント（SettingsModal）
├── TimeRangeInput.tsx   # 専用子コンポーネント
└── types.ts            # 必要に応じてモーダル専用の型定義
```

**メリット**:
- 適切なスコープ分離（子コンポーネントが外部に公開されない）
- コードの重複排除と保守性向上
- テスト容易性の向上
- 機能の凝集度向上

### 説明変数の適切な使用指針

コードの可読性向上のため、説明変数は適切に使用し、不要な代入は避けます。

**✅ 使用すべき例**:
```typescript
// 計算結果に意味のある名前を付ける
const duration = event.endHour - event.startHour;
const height = duration * cellHeight;
const topPosition = (event.startHour - startHour) * cellHeight + headerHeight;

// 複雑な条件式を分かりやすくする
const isOverlapping = newEvent.startTime < existingEvent.endTime;
const isSameDay = format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');

// 長いプロパティアクセスを短縮し、意味を明確にする
const screenHeight = window.innerHeight;
const availableHeight = screenHeight - reservedHeight;
```

**❌ 避けるべき例**:
```typescript
// 単純な代入で意味が変わらない
const eventStartHour = event.startHour; // ❌ 不要
const userName = user.name;             // ❌ 不要

// 文字数も変わらず、意味も同じ
const id = item.id;                     // ❌ 不要
const title = data.title;               // ❌ 不要
```

**判断基準**:
- **計算や変換が含まれる** → 説明変数を使用
- **意味的に異なる概念を表現する** → 説明変数を使用  
- **単純なプロパティアクセスの別名** → 直接使用
- **文字数がほぼ同じで意味も同じ** → 直接使用

### 状態オブジェクトの適切な命名指針

状態をグループ化する際は、メインとなるデータを基準とした命名を行い、そのデータが「何のため」に使われるのかを明確にします。

**✅ 適切な命名例**:
```typescript
// メインデータを基準とした命名
currentDate: { date, isDateChanging }           // メイン: 現在の日付
swipe: { startX, setStartX }                    // 目的: スワイプ操作
cell: { startHour, endHour, cellHeight, headerHeight } // 目的: セルレンダリング
settingsModal: { isOpen, setIsOpen }           // 目的: 設定モーダル制御
settingsControl: { setStartHour, setEndHour }  // 目的: 設定値変更
actions: { goToPreviousDay, goToNextDay, goToToday } // 役割: アクション群
```

**❌ 避けるべき命名例**:
```typescript
// 抽象的で目的が不明確
dateState: { currentDate, isDateChanging }     // ❌ State接尾語は冗長
touchState: { startX, setStartX }              // ❌ 何のタッチか不明
layoutState: { startHour, endHour, ... }      // ❌ 何のレイアウトか不明
modalState: { isSettingsOpen, ... }           // ❌ どのモーダルか不明
```

**命名原則**:
1. **メインデータを基準にする**: オブジェクトの主要な値から命名
2. **目的・用途を明確にする**: そのデータが何のために使われるかを表現
3. **具体性を重視する**: `touch`より`swipe`、`layout`より`cell`
4. **冗長な接尾語を避ける**: `State`、`Data`などの汎用的な接尾語は除く
5. **データ重複を避ける**: 同じデータが複数のオブジェクトに含まれないよう設計

### ファイル・ディレクトリ命名規則

#### ファイル命名規則
- **コンポーネント**: PascalCase (`CalendarGrid.tsx`)
- **hooks**: camelCase with use prefix (`useCalendarData.ts`)
- **型定義**: PascalCase (`CalendarEvent`)
- **その他**: camelCase (`utils.ts`, `mockData.ts`)

#### ディレクトリ命名規則

**基本概念**: フォルダはコンポーネントフォルダ（PascalCase）かその他フォルダ（camelCase）のいずれかです。

##### コンポーネントフォルダ (PascalCase)
- 直下の`index.tsx`でコンポーネントをexport
- 例: `Calendar/`, `CalendarGrid/`, `FamilyMemberColumn/`

##### その他フォルダ (camelCase)  
- 関連ファイルの整理・分類
- 例: `Calendar/auth/`, `Calendar/settings/`, `Calendar/components/`

**実例**:
```
src/
├── Calendar/              # コンポーネントフォルダ (Calendarコンポーネント)
│   ├── index.tsx         # export const Calendar = ...
│   ├── auth/             # その他フォルダ (認証関連)
│   ├── settings/         # その他フォルダ (設定関連) 
│   ├── components/       # その他フォルダ (子コンポーネント群)
│   │   ├── CalendarGrid/ # コンポーネントフォルダ (CalendarGridコンポーネント)
│   │   │   └── index.tsx # export const CalendarGrid = ...
│   │   ├── FamilyMemberColumn/ # コンポーネントフォルダ (FamilyMemberColumnコンポーネント)
│   │   │   └── index.tsx # export const FamilyMemberColumn = ...
│   │   └── ...
│   ├── shared/          # その他フォルダ (共通要素)
│   └── display/         # その他フォルダ (UI表示関連)
└── api/                 # その他フォルダ
```

### エラーハンドリング

**明確なエラー型定義**:
```typescript
// ✅ 良い例
export type CalendarError = 
  | { type: 'GOOGLE_API_ERROR'; message: string; code: number }
  | { type: 'NETWORK_ERROR'; message: string }
  | { type: 'PERMISSION_ERROR'; requiredScope: string };

export const useCalendarData = (): {
  data: CalendarEvent[] | null;
  error: CalendarError | null;
  loading: boolean;
} => {
  // エラー処理の実装
};
```

### テスト可能性の向上

**依存関係注入による分離**: テストが困難な外部依存（API呼び出し、ブラウザAPI等）はインターフェースで抽象化し、テスト時にモック実装を注入できるようにする。

```typescript
// ✅ 良い例 - 依存関係注入パターン
interface IAuthClient {
  login(): Promise<void>;
  logout(): Promise<void>;
  checkAuthStatus(): Promise<boolean>;
}

export const useAuth = (options: { authClient?: IAuthClient } = {}) => {
  const authClient = options.authClient || new AuthClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const checkAuthStatus = async () => {
    const authenticated = await authClient.checkAuthStatus();
    setIsAuthenticated(authenticated);
  };
  
  return { isAuthenticated, checkAuthStatus };
};

// テスト例
test('認証状態を正しく取得する', async () => {
  const mockAuthClient: IAuthClient = {
    login: vi.fn(),
    logout: vi.fn(),
    checkAuthStatus: vi.fn().mockResolvedValue(true)
  };
  
  const { result } = renderHook(() => useAuth({ authClient: mockAuthClient }));
  // テスト実行...
});
```

**実装済みテスタビリティ改善**:
- `useAuth`: AuthClientをインターフェース化し、MockAuthClientでテスト可能
- `useGoogleCalendar`: 認証依存関係を注入可能に設計
- テスト用モック: `MockAuthClient`でエラーケースや状態変化をテスト可能

**避けるべきパターン**:
```typescript
// ❌ 悪い例 - 直接依存でテストが困難
export const useCalendarData = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const loadEvents = async (calendarId: string) => {
    // fetch関数が直接埋め込まれており、テスト時にモックできない
    const response = await fetch(`/api/calendar/${calendarId}`);
    const data = await response.json();
    setEvents(data);
  };
  
  return { events, loadEvents };
};
```

## デジタル楽器アプリケーション固有の概念

### キー操作の抽象概念

デジタル楽器アプリケーションにおいて、キーボード操作を以下の2つの抽象的な概念で分類します：

#### 音階キー (Scale Keys)
**定義**: 演奏する音階を指定するためのキー群  
**対応キー**: `a`, `s`, `d`, `f`, `z`, `x`, `c`, `v`  
**操作手**: 主に左手で操作  
**機能**: 
- 音階を指定（ド、レ、ミ、ファ、ソ、ラ、シ、高いド）
- 発声キーが押されていない場合はキューに保存
- 発声キー押下中は即座に音階変更

**マッピング**:
```typescript
// 音階キーと音階の対応関係
const SCALE_KEY_MAPPING = {
  a: "C4",   // ド
  s: "D4",   // レ  
  d: "E4",   // ミ
  f: "F4",   // ファ
  z: "G4",   // ソ
  x: "A4",   // ラ
  c: "B4",   // シ
  v: "C5",   // 高いド
} as const;
```

#### 発声キー (Voice Keys)
**定義**: 実際の音の発声を制御するキー群  
**対応キー**: `j`  
**操作手**: 主に右手で操作  
**機能**:
- 音の発声開始・停止を制御
- 押している間のみ音が鳴る
- キューされた音階キーがあれば即座に再生

**動作例**:
```typescript
// 発声キーの基本動作
if (isVoiceKeyPressed) {
  // 音階キー押下時: 即座に音階変更
  playNote(scaleKey);
} else {
  // 音階キー押下時: キューに保存（音は鳴らない）
  queueNote(scaleKey);
}
```

### 操作フローの概念モデル

**基本操作パターン**:
1. **音階キー押下** → 音階指定（キューまたは即座再生）
2. **発声キー押下** → 発声開始（キューがあれば再生）
3. **音階キー変更** → 音階切り替え（発声キー押下中）
4. **発声キー解除** → 発声停止

**状態管理の概念**:
- `queuedNote`: 発声待ちの音階（音階キーで指定）
- `currentNote`: 現在発声中の音階（発声キー + 音階キーで決定）
- `isVoiceKeyPressed`: 発声キーの押下状態

### コード内での使用例

```typescript
// ✅ 良い例 - 概念を明確に分離
const handleScaleKeyPress = (scaleKey: string) => {
  const note = SCALE_KEY_MAPPING[scaleKey];
  if (isVoiceKeyPressed) {
    playNoteImmediately(note);
  } else {
    queueNoteForVoice(note);
  }
};

const handleVoiceKeyPress = () => {
  setVoiceKeyPressed(true);
  if (queuedNote) {
    playQueuedNote();
  }
};
```

**命名規則**:
- 音階キー関連: `scaleKey`, `noteMapping`, `queuedNote`
- 発声キー関連: `voiceKey`, `isVoiceKeyPressed`, `voiceControl`
- 複合概念: `notePlayback`, `scaleVoiceSystem`