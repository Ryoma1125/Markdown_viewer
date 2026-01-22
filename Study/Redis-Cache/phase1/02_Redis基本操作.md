# Phase 1-2: Redis 基本操作

## 学習目標

この単元を終えると、以下ができるようになります：

- 主要なコマンドを使える
- TTL を設定できる
- データの削除・検索ができる

## キー操作

```bash
# キー一覧（本番では使わない）
KEYS *
KEYS user:*

# キー存在確認
EXISTS mykey

# キー削除
DEL mykey

# キーの型確認
TYPE mykey

# キーのリネーム
RENAME oldkey newkey
```

## TTL（有効期限）

```bash
# 秒で設定
EXPIRE mykey 3600

# ミリ秒で設定
PEXPIRE mykey 3600000

# 残り時間確認
TTL mykey
PTTL mykey

# SET と同時に設定
SET session:abc "data" EX 3600

# TTL 削除（永続化）
PERSIST mykey
```

## ハンズオン

### 演習1: セッション管理シミュレーション

```bash
# セッション作成（1時間有効）
SET session:user123 '{"user_id": 1, "name": "Alice"}' EX 3600

# 残り時間確認
TTL session:user123

# セッション更新（スライディングウィンドウ）
EXPIRE session:user123 3600

# セッション取得
GET session:user123

# セッション削除（ログアウト）
DEL session:user123
```

### 演習2: キャッシュ操作

```bash
# キャッシュ設定（5分）
SET cache:products:list '[{"id":1,"name":"iPhone"}]' EX 300

# 存在確認してから取得
EXISTS cache:products:list
GET cache:products:list

# パターンマッチで削除
# 本番では SCAN を使う
KEYS cache:products:*
```

### 演習3: アトミック操作

```bash
# カウンター
SET page_views 0
INCR page_views
INCRBY page_views 10
GET page_views

# 存在しない場合のみ設定（ロック）
SETNX lock:resource "locked"
TTL lock:resource

# SET NX EX（推奨）
SET lock:resource "locked" NX EX 30
```

### 演習4: トランザクション

```bash
# MULTI/EXEC
MULTI
SET user:1:name "Alice"
SET user:1:email "alice@example.com"
INCR user:count
EXEC

# WATCH（楽観的ロック）
WATCH user:1:balance
GET user:1:balance
MULTI
DECRBY user:1:balance 100
EXEC
# 途中で変更されると EXEC は null を返す
```

## パフォーマンスのヒント

| やること | やらないこと |
|---------|-------------|
| SCAN でイテレート | KEYS * |
| パイプライン | 個別コマンド |
| 適切なデータ型選択 | String のみ使用 |
| TTL 設定 | 永続データだらけ |

### SCAN の使い方

```bash
# KEYS の代わりに SCAN
SCAN 0 MATCH user:* COUNT 100

# cursor が 0 になるまで繰り返す
SCAN <cursor> MATCH user:* COUNT 100
```

### パイプライン

```bash
# 複数コマンドを一度に送信
redis-cli --pipe < commands.txt
```

## 理解度確認

### 問題

Redis でキーが存在しない場合のみ値を設定するコマンドはどれか。

**A.** SET key value

**B.** SETNX key value

**C.** SETEX key value

**D.** APPEND key value

---

### 解答・解説

**正解: B**

```bash
SETNX lock:resource "locked"
```

または SET の NX オプション：
```bash
SET lock:resource "locked" NX EX 30
```

分散ロックの実装に使われます。

---

## 次のステップ

Redis 基本操作を学びました。次は Python との連携を学びましょう。

**次の単元**: [Phase 2-1: Python 連携](../phase2/01_Python連携.md)
