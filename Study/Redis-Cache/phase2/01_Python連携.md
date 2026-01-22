# Phase 2-1: Python 連携

## 学習目標

この単元を終えると、以下ができるようになります：

- redis-py でデータ操作できる
- JSON データを扱える
- 接続プールを使える

## redis-py

```bash
pip install redis
```

## 基本的な使い方

```python
import redis

# 接続
r = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True  # 文字列で返す
)

# 基本操作
r.set('greeting', 'Hello!')
value = r.get('greeting')
print(value)  # Hello!

# TTL付き
r.setex('session', 3600, 'data')

# 存在確認
if r.exists('greeting'):
    print('Key exists')

# 削除
r.delete('greeting')
```

## ハンズオン

### 演習1: 基本操作

```python
# basic_redis.py
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# String
r.set('name', 'Alice')
print(r.get('name'))

# カウンター
r.set('counter', 0)
r.incr('counter')
r.incr('counter')
print(r.get('counter'))  # 2

# TTL
r.setex('temp_key', 60, 'temporary data')
print(r.ttl('temp_key'))  # 60

# 複数キー
r.mset({'key1': 'value1', 'key2': 'value2'})
values = r.mget(['key1', 'key2'])
print(values)  # ['value1', 'value2']
```

### 演習2: JSON データの扱い

```python
# json_redis.py
import redis
import json
from datetime import datetime

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# ユーザーデータを JSON で保存
user = {
    'id': 1,
    'name': 'Alice',
    'email': 'alice@example.com',
    'created_at': datetime.now().isoformat()
}

# 保存（JSON 文字列に変換）
r.set(f'user:{user["id"]}', json.dumps(user))

# 取得（JSON をパース）
data = r.get('user:1')
if data:
    user = json.loads(data)
    print(user['name'])  # Alice

# Hash を使う方法
r.hset('user:2', mapping={
    'name': 'Bob',
    'email': 'bob@example.com',
    'age': '30'
})

user2 = r.hgetall('user:2')
print(user2)  # {'name': 'Bob', 'email': 'bob@example.com', 'age': '30'}
```

### 演習3: リスト操作

```python
# list_redis.py
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# タスクキュー
queue_name = 'task_queue'

# タスク追加（左から）
r.lpush(queue_name, 'task1', 'task2', 'task3')

# タスク取得（右から、FIFO）
task = r.rpop(queue_name)
print(f'Processing: {task}')

# ブロッキング取得（タイムアウト5秒）
task = r.brpop(queue_name, timeout=5)
if task:
    queue, value = task
    print(f'Got {value} from {queue}')

# キュー長
length = r.llen(queue_name)
print(f'Remaining tasks: {length}')

# 全て取得
all_tasks = r.lrange(queue_name, 0, -1)
print(all_tasks)
```

### 演習4: 接続プール

```python
# connection_pool.py
import redis
from redis.connection import ConnectionPool

# 接続プールを作成
pool = ConnectionPool(
    host='localhost',
    port=6379,
    db=0,
    max_connections=10,
    decode_responses=True
)

# プールから接続を取得
r = redis.Redis(connection_pool=pool)

# 複数の操作
for i in range(100):
    r.set(f'key:{i}', f'value:{i}')

print('Done!')

# FastAPI での使用例
# app.py
from fastapi import FastAPI, Depends

app = FastAPI()
pool = ConnectionPool(host='localhost', port=6379, decode_responses=True)

def get_redis():
    return redis.Redis(connection_pool=pool)

@app.get("/cache/{key}")
def get_cache(key: str, r: redis.Redis = Depends(get_redis)):
    return {"value": r.get(key)}
```

### 演習5: パイプライン

```python
# pipeline_redis.py
import redis
import time

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

# パイプラインなし（遅い）
start = time.time()
for i in range(1000):
    r.set(f'normal:{i}', i)
print(f'Normal: {time.time() - start:.3f}s')

# パイプラインあり（速い）
start = time.time()
pipe = r.pipeline()
for i in range(1000):
    pipe.set(f'pipeline:{i}', i)
pipe.execute()
print(f'Pipeline: {time.time() - start:.3f}s')
```

## 非同期 Redis

```python
# async_redis.py
import asyncio
import redis.asyncio as aioredis

async def main():
    r = aioredis.from_url('redis://localhost:6379', decode_responses=True)
    
    await r.set('async_key', 'async_value')
    value = await r.get('async_key')
    print(value)
    
    await r.close()

asyncio.run(main())
```

## 理解度確認

### 問題

redis-py で複数のコマンドを効率的に実行する方法はどれか。

**A.** マルチスレッド

**B.** パイプライン

**C.** コネクションプール

**D.** 非同期

---

### 解答・解説

**正解: B**

パイプラインは複数のコマンドをまとめて送信し、ネットワークラウンドトリップを削減します。

```python
pipe = r.pipeline()
pipe.set('key1', 'value1')
pipe.set('key2', 'value2')
pipe.execute()  # まとめて実行
```

---

## 次のステップ

Python 連携を学びました。次はキャッシュパターンを学びましょう。

**次の単元**: [Phase 2-2: キャッシュパターン](./02_キャッシュパターン.md)
