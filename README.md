# shelledit

zsh / bash のシェル設定ファイルを管理・編集するための CLI ツールです。

## 機能

- 既存の zsh / bash 設定ファイルの読み込み・パース
- 環境変数の追加・編集・削除・確認
- PATH エントリの追加・編集・削除・確認
- 出力フォーマットの選択（デフォルト: zsh、bash も対応）
- 出力フォーマットの拡張が可能
- 設定ファイルの Linter（重複定義・矛盾する値・空の値などを検出）

## インストール

```bash
npm install
npm run build
```

## 使い方

### 設定ファイルの読み込み

```bash
shelledit load ~/.zshrc
```

### 環境変数の管理

```bash
# 一覧表示
shelledit env list ~/.zshrc

# 値の取得
shelledit env get ~/.zshrc EDITOR

# 値の設定（ファイルに保存）
shelledit env set ~/.zshrc EDITOR vim

# 削除
shelledit env rm ~/.zshrc EDITOR
```

### PATH の管理

```bash
# 一覧表示
shelledit path list ~/.zshrc

# 追加（デフォルト: prepend）
shelledit path add ~/.zshrc /usr/local/bin

# append で追加
shelledit path add ~/.zshrc /opt/bin -p append

# 削除
shelledit path rm ~/.zshrc /usr/local/bin
```

### Lint

```bash
shelledit lint ~/.zshrc
```

検出ルール:

| ルール | 重要度 | 説明 |
|---|---|---|
| `duplicate-env` | warning | 同じ環境変数が複数回定義されている |
| `contradictory-env` | error | 同じ環境変数に異なる値が設定されている |
| `duplicate-path` | warning | 同じ PATH エントリが複数回追加されている |
| `empty-value` | info | 環境変数の値が空 |

### エクスポート

```bash
# zsh 形式で出力（デフォルト）
shelledit export ~/.zshrc

# bash 形式で出力
shelledit export ~/.zshrc -f bash
```

### フォーマット一覧

```bash
shelledit formats
```

## 出力フォーマットの書き方（拡張する場合）

`ShellFormatter` インターフェースを実装して `FormatterRegistry` に登録します。

```typescript
import type { ShellFormatter } from "./formatter/types.js";
import type { ShellConfig } from "./config/types.js";

class FishFormatter implements ShellFormatter {
  readonly name = "fish";

  format(config: ShellConfig): string {
    const lines: string[] = [];
    for (const env of config.envVars) {
      lines.push(`set -gx ${env.name} ${env.value}`);
    }
    for (const entry of config.pathEntries) {
      lines.push(`fish_add_path ${entry.path}`);
    }
    return lines.join("\n") + "\n";
  }
}

// 登録
registry.register(new FishFormatter());
```

## Lint ルールの追加

`LintRule` インターフェースを実装して `Linter` に登録します。

```typescript
import type { LintRule, LintMessage } from "./linter/types.js";
import type { ShellConfig } from "./config/types.js";

class MyCustomRule implements LintRule {
  readonly name = "my-custom-rule";

  check(config: ShellConfig): LintMessage[] {
    // 検証ロジック
    return [];
  }
}

// 登録
linter.addRule(new MyCustomRule());
```

## 開発

```bash
# 開発時の実行
npm run dev -- load ~/.zshrc

# テスト
npm test

# ビルド
npm run build
```

## ライセンス

MIT
