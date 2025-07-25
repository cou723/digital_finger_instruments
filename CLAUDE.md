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

### キー操作システムの抽象概念

デジタル楽器アプリケーションは、二進数ベースの音階指定システムを採用しており、キーボード操作を以下の概念で分類します：

#### バイナリ音階キー (Binary Scale Keys)
**定義**: 二進数パターンで音階を指定するキー群  
**対応キー**: `a`, `s`, `d`, `f` (4ビット二進数)  
**操作手**: 主に左手で操作  
**機能**: 
- 4ビット二進数パターンで0-15の値を生成
- メジャースケール内の音階位置を指定
- オクターブ自動展開（7音循環システム）

**バイナリマッピング**:
```typescript
// 二進数キーパターンの例
const BINARY_PATTERNS = {
  "0000": 0,  // a=0, s=0, d=0, f=0 → ド (1オクターブ目)
  "0001": 1,  // a=1, s=0, d=0, f=0 → レ (1オクターブ目) 
  "0010": 2,  // a=0, s=1, d=0, f=0 → ミ (1オクターブ目)
  "0111": 7,  // a=1, s=1, d=1, f=0 → ド (2オクターブ目)
  // ...
} as const;
```

#### 半音修正キー (Sharp Modifier Key)
**定義**: 音階を半音上げるための修正キー  
**対応キー**: `スペース`  
**操作手**: 両手どちらでも操作可能  
**機能**:
- 任意の音階に対して+1半音のオフセット
- メジャースケール外の音階（黒鍵相当）への対応
- バイナリ音階キーと組み合わせて使用

#### 発声キー (Voice Key)
**定義**: 実際の音の発声を制御するキー  
**対応キー**: `j`  
**操作手**: 主に右手で操作  
**機能**:
- 音の発声開始・停止を制御
- 押している間のみ音が鳴る
- バイナリパターン変更時の即座な音階切り替え

### 音階決定システム

**メジャースケール変換アルゴリズム**:
```typescript
// 基本的な音階決定の流れ
function calculateScale(binaryKeys: Set<string>, hasSharp: boolean): Note {
  // 1. バイナリ値計算 (0-15)
  const binaryValue = calculateBinaryFromKeys(binaryKeys);
  
  // 2. スケール位置決定 (0-6の循環)
  const scalePosition = binaryValue % 7;
  
  // 3. オクターブ計算
  const octave = Math.floor(binaryValue / 7);
  
  // 4. 半音オフセット適用
  const sharpOffset = hasSharp ? 1 : 0;
  
  // 5. 最終周波数計算
  return calculateFinalFrequency(scalePosition, octave, sharpOffset);
}
```

### 操作フローパターン

**基本操作シーケンス**:
1. **バイナリキー組み合わせ** → 0-15値生成
2. **メジャースケール変換** → 7音循環位置決定  
3. **オクターブ展開** → 複数オクターブ対応
4. **半音修正** → スペースキーによる微調整
5. **発声制御** → jキーによる音出力制御

**状態管理の概念**:
- `pressedKeys`: 現在押下されているキーの集合
- `binaryValue`: バイナリキーから計算された数値 (0-15)
- `currentFrequency`: 現在の周波数情報
- `isVoiceActive`: 発声キーの押下状態

### 実装パターンと命名規則

```typescript
// ✅ 推奨パターン - 純粋関数による音階計算
const calculateBinaryFrequency = (
  pressedKeys: Set<string>, 
  baseNote: string = "C4"
): FrequencyNote => {
  // バイナリ値計算
  const binaryValue = computeBinaryValue(pressedKeys);
  
  // メジャースケール変換
  const { scalePosition, octaveOffset } = convertToMajorScale(binaryValue);
  
  // 半音修正
  const sharpOffset = pressedKeys.has(" ") ? 1 : 0;
  
  // 周波数計算
  return createFrequencyNote(baseNote, scalePosition, octaveOffset, sharpOffset);
};

// ✅ 発声制御パターン
const handleVoiceControl = (keyboardState: KeyboardState) => {
  if (isVoiceKeyPressed(keyboardState)) {
    const frequency = calculateBinaryFrequency(keyboardState.pressedKeys);
    playFrequency(frequency);
  } else {
    stopAudio();
  }
};
```

**命名規則**:
- バイナリ関連: `binaryValue`, `binaryKeys`, `calculateBinary*`
- 音階変換: `scalePosition`, `majorScale*`, `convertTo*`
- 周波数計算: `frequency*`, `calculateFrequency*`, `FrequencyNote`
- 発声制御: `voice*`, `audio*`, `play*`, `stop*`
- 状態管理: `keyboardState`, `pressedKeys`, `*State`

### 設計の拡張ポイント

**音階システムの拡張性**:
- 異なる音律体系への対応（ペンタトニック、クロマチックなど）
- カスタム音階マッピングの設定可能性
- 基準音程の動的変更

**入力システムの拡張性**:
- より多くのバイナリビットへの拡張
- 異なるキー配置への対応
- MIDI入力デバイスとの統合

**出力システムの拡張性**:
- 複数音の同時発声
- 音色・エフェクトの追加
- 録音・再生機能の統合