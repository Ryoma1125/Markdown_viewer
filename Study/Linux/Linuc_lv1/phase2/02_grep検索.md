# Phase 2-2: grep で宝探し ～ ファイル内検索の極意 ～

## 学習目標

この単元を終えると、以下ができるようになります：

- `grep` で特定の文字列を含む行を抽出できる
- 正規表現の基本パターンを使った検索ができる
- オプションを使い分けて効率的に検索できる
- 複数ファイルから一括検索できる

## 概念解説

### grep とは？

**G**lobally search a **R**egular **E**xpression and **P**rint の略。
ファイルの中から特定のパターンにマッチする行を見つけ出すコマンドです。

```mermaid
flowchart LR
    Input[入力ファイル<br/>たくさんの行] --> grep[grep パターン]
    grep --> Output[マッチした行<br/>だけ出力]

    style grep fill:#FFD700
```

**Windowsで例えると：**
- Ctrl+F（検索）をコマンドラインで実行
- ただし、**複数ファイルを一括検索**できるのが強み

### 基本文法

```
grep [オプション] 'パターン' ファイル名
```

### 正規表現の基本（grep で使えるもの）

| メタ文字 | 意味 | 例 |
|---------|------|-----|
| `.` | 任意の1文字 | `a.c` → abc, aXc, a1c |
| `*` | 直前の文字の0回以上の繰り返し | `ab*c` → ac, abc, abbc |
| `^` | 行頭 | `^Error` → 行頭のError |
| `$` | 行末 | `done$` → 行末のdone |
| `[]` | 文字クラス（いずれか1文字） | `[aeiou]` → 母音 |
| `[^]` | 否定（含まない1文字） | `[^0-9]` → 数字以外 |
| `\` | エスケープ | `\.` → リテラルのドット |

**注意:** ワイルドカード（ファイル名の `*`）と正規表現の `*` は意味が違う！

## 基本コマンド

```bash
# 基本形
grep 'パターン' ファイル

# よく使うオプション
grep -i 'パターン' ファイル    # 大文字小文字を無視（Ignore case）
grep -n 'パターン' ファイル    # 行番号を表示（Number）
grep -v 'パターン' ファイル    # マッチしない行を表示（inVert）
grep -c 'パターン' ファイル    # マッチした行数を表示（Count）
grep -l 'パターン' ファイル*   # マッチしたファイル名のみ（List）
grep -r 'パターン' ディレクトリ # 再帰的に検索（Recursive）
grep -E 'パターン' ファイル    # 拡張正規表現（Extended）
grep -w 'パターン' ファイル    # 単語単位でマッチ（Word）
grep -A 2 'パターン' ファイル  # マッチ行の後2行も表示（After）
grep -B 2 'パターン' ファイル  # マッチ行の前2行も表示（Before）
grep -C 2 'パターン' ファイル  # マッチ行の前後2行を表示（Context）
```

## ハンズオン

### 演習1: grep の基本

```bash
cd ~/練習場/logs

# ログファイルの内容確認
cat system.log

# 1. ERRORを含む行を検索
grep 'ERROR' system.log

# 2. 行番号付きで検索
grep -n 'ERROR' system.log

# 3. 大文字小文字を無視
grep -i 'error' system.log

# 4. ERRORを含まない行
grep -v 'ERROR' system.log

# 5. ERROR の件数をカウント
grep -c 'ERROR' system.log
```

### 演習2: 正規表現を使った検索

```bash
cd ~/練習場/logs

# 1. 行頭が数字で始まる行
grep '^2024' system.log

# 2. 行末が「admin」で終わる行
grep 'admin$' system.log

# 3. INFO または WARN を含む行（拡張正規表現）
grep -E 'INFO|WARN' system.log

# 4. 時刻パターン（09:XX:XX）にマッチ
grep '09:..:' system.log

# 5. 数字3桁の「Retry X/3」パターン
grep 'Retry [0-9]/3' system.log
```

### 演習3: 複数ファイルの検索

```bash
cd ~/練習場

# 複数のログファイルを作成
echo -e "ERROR: File not found\nINFO: Process started" > logs/web.log
echo -e "WARN: Slow query\nERROR: Timeout" > logs/db.log

# 1. 全ログファイルからERRORを検索
grep 'ERROR' logs/*.log

# 2. どのファイルにERRORがあるか（ファイル名のみ）
grep -l 'ERROR' logs/*.log

# 3. 再帰的に検索（ディレクトリを指定）
grep -r 'ERROR' logs/

# 4. 再帰検索 + 行番号
grep -rn 'ERROR' logs/
```

### 演習4: 前後の文脈も表示

```bash
cd ~/練習場/logs

# エラーの前後を確認（原因と結果を把握）
# 1. エラー行の前2行も表示
grep -B 2 'All retries failed' system.log

# 2. エラー行の後2行も表示
grep -A 2 'Database connection failed' system.log

# 3. 前後2行を表示
grep -C 2 'ERROR' system.log
```

### 演習5: 実践シナリオ - ログ解析

```bash
cd ~/練習場/logs

# 詳細なアクセスログを作成
cat << 'EOF' > access.log
192.168.1.100 - - [18/Jan/2024:10:00:00] "GET /index.html HTTP/1.1" 200 1234
192.168.1.101 - - [18/Jan/2024:10:00:01] "GET /api/users HTTP/1.1" 200 567
192.168.1.100 - - [18/Jan/2024:10:00:02] "POST /api/login HTTP/1.1" 200 89
10.0.0.50 - - [18/Jan/2024:10:00:03] "GET /admin HTTP/1.1" 403 0
192.168.1.102 - - [18/Jan/2024:10:00:04] "GET /notfound HTTP/1.1" 404 0
192.168.1.100 - - [18/Jan/2024:10:00:05] "GET /index.html HTTP/1.1" 200 1234
10.0.0.50 - - [18/Jan/2024:10:00:06] "GET /admin HTTP/1.1" 403 0
192.168.1.103 - - [18/Jan/2024:10:00:07] "GET /api/data HTTP/1.1" 500 0
EOF

# シナリオ1: エラーレスポンス（4xx, 5xx）を抽出
grep -E '" (4|5)[0-9]{2} ' access.log

# シナリオ2: 特定IPからのアクセス
grep '^10.0.0.50' access.log

# シナリオ3: POSTリクエストのみ
grep '"POST ' access.log

# シナリオ4: /api/ へのアクセス
grep '/api/' access.log

# シナリオ5: 成功（200）以外のレスポンス
grep -v '" 200 ' access.log
```

### 演習6: 単語単位の検索（-w の重要性）

```bash
# テスト用ファイルを作成
cat << 'EOF' > ~/練習場/words.txt
error
Error
ERROR
error_handler
my_error_log
This is an error message
There is no problem here
EOF

# 1. 普通の検索（部分一致）
grep 'error' ~/練習場/words.txt
# error, error_handler, my_error_log, error message にマッチ

# 2. 単語単位の検索
grep -w 'error' ~/練習場/words.txt
# error, error message のみにマッチ

# 3. 大文字小文字無視 + 単語単位
grep -iw 'error' ~/練習場/words.txt
```

## 試験のツボ

### grep のバリエーション

| コマンド | 説明 |
|---------|------|
| `grep` | 基本の正規表現（BRE） |
| `grep -E` = `egrep` | 拡張正規表現（ERE） |
| `grep -F` = `fgrep` | 固定文字列（正規表現なし、高速） |

**違い:**
```bash
# BRE: () や + はエスケープが必要
grep 'ab\+' file          # a の後に b が1回以上

# ERE: エスケープ不要
grep -E 'ab+' file        # 同上
egrep 'ab+' file          # 同上
```

### よく出るオプションの組み合わせ

```bash
# 実務で頻出
grep -rn 'ERROR' /var/log/    # 再帰 + 行番号
grep -i 'error\|warn' file    # 大文字小文字無視 + OR
grep -c '^$' file             # 空行をカウント
```

### 正規表現の ^ と $

```bash
# 行頭・行末は「位置」を表す（文字ではない）
grep '^ERROR' file    # ERROR で始まる行
grep 'ERROR$' file    # ERROR で終わる行
grep '^ERROR$' file   # ERROR のみの行
grep '^$' file        # 空行
```

### -v の使いどころ

「〇〇を含まないものを探す」は `-v`

```bash
# コメント行を除外
grep -v '^#' /etc/passwd

# 空行を除外
grep -v '^$' file
```

## 理解度確認

### 問題

ファイル `log.txt` から、大文字小文字を区別せずに「error」という文字列を含む行の数をカウントするコマンドはどれか。

**A.** `grep -c error log.txt`

**B.** `grep -ic error log.txt`

**C.** `grep -n error log.txt | wc -l`

**D.** `grep -v error log.txt`

---

### 解答・解説

**正解: B**

- **A.** 誤り。大文字小文字を区別して検索するため、「ERROR」や「Error」はカウントされません。
- **B.** 正解。`-i` で大文字小文字を無視、`-c` でカウントを表示します。
- **C.** 部分的に正しいが非効率。`-n` は行番号を付けて表示、それを `wc -l` でカウント。大文字小文字の区別をしているため不正解。
- **D.** 誤り。`-v` は「マッチしない行」を表示するため、逆の結果になります。

**実務Tips:** オプションは組み合わせ可能。`-ic` のように短くまとめるか、`-i -c` のように分けて書いてもOK。

---

## 次のステップ

grep で検索できるようになったら、次はファイル自体を探す find コマンドを学びましょう！

**次の単元**: [Phase 2-3: find でファイルを狩る ～ ディスク中の宝探し ～](./03_find検索.md)
