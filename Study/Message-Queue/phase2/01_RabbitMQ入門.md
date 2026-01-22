# Phase 2-1: RabbitMQ 入門

## 学習目標

この単元を終えると、以下ができるようになります：

- RabbitMQ を Docker で起動できる
- Python でメッセージを送受信できる
- 管理画面を使いこなせる

## 環境構築

```yaml
# docker-compose.yml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"    # AMQP
      - "15672:15672"  # 管理画面
    environment:
      RABBITMQ_DEFAULT_USER: guest
      RABBITMQ_DEFAULT_PASS: guest
```

```bash
docker-compose up -d

# 管理画面: http://localhost:15672
# Username: guest / Password: guest
```

## ハンズオン

### 演習1: Hello World

```bash
pip install pika
```

```python
# producer.py
import pika

# 接続
connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# キュー作成
channel.queue_declare(queue='hello')

# メッセージ送信
channel.basic_publish(
    exchange='',
    routing_key='hello',
    body='Hello World!'
)

print(" [x] Sent 'Hello World!'")
connection.close()
```

```python
# consumer.py
import pika

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.queue_declare(queue='hello')

def callback(ch, method, properties, body):
    print(f" [x] Received {body.decode()}")

channel.basic_consume(
    queue='hello',
    on_message_callback=callback,
    auto_ack=True
)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

```bash
# ターミナル1
python consumer.py

# ターミナル2
python producer.py
```

### 演習2: タスクキュー（Work Queue）

```python
# task_producer.py
import pika
import sys

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

# 永続化キュー
channel.queue_declare(queue='task_queue', durable=True)

message = ' '.join(sys.argv[1:]) or "Hello World!"

channel.basic_publish(
    exchange='',
    routing_key='task_queue',
    body=message,
    properties=pika.BasicProperties(
        delivery_mode=2,  # メッセージ永続化
    )
)

print(f" [x] Sent '{message}'")
connection.close()
```

```python
# task_worker.py
import pika
import time

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()

channel.queue_declare(queue='task_queue', durable=True)

# Fair dispatch（1つずつ処理）
channel.basic_qos(prefetch_count=1)

def callback(ch, method, properties, body):
    message = body.decode()
    print(f" [x] Received {message}")
    
    # ドットの数だけスリープ（重い処理をシミュレート）
    time.sleep(message.count('.'))
    
    print(" [x] Done")
    ch.basic_ack(delivery_tag=method.delivery_tag)

channel.basic_consume(
    queue='task_queue',
    on_message_callback=callback
)

print(' [*] Waiting for messages. To exit press CTRL+C')
channel.start_consuming()
```

```bash
# ターミナル1, 2
python task_worker.py

# ターミナル3
python task_producer.py "Task 1..."
python task_producer.py "Task 2."
python task_producer.py "Task 3...."
```

### 演習3: JSON メッセージ

```python
# json_producer.py
import pika
import json

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()
channel.queue_declare(queue='json_queue', durable=True)

task = {
    "task_type": "email",
    "data": {
        "to": "user@example.com",
        "subject": "Welcome!",
        "body": "Hello, welcome to our service!"
    }
}

channel.basic_publish(
    exchange='',
    routing_key='json_queue',
    body=json.dumps(task),
    properties=pika.BasicProperties(
        content_type='application/json',
        delivery_mode=2,
    )
)

print(f" [x] Sent task: {task}")
connection.close()
```

```python
# json_worker.py
import pika
import json

def process_email(data):
    print(f"Sending email to {data['to']}")
    print(f"Subject: {data['subject']}")
    print("Email sent!")

def callback(ch, method, properties, body):
    task = json.loads(body)
    print(f" [x] Received task: {task['task_type']}")
    
    if task['task_type'] == 'email':
        process_email(task['data'])
    
    ch.basic_ack(delivery_tag=method.delivery_tag)

connection = pika.BlockingConnection(
    pika.ConnectionParameters('localhost')
)
channel = connection.channel()
channel.queue_declare(queue='json_queue', durable=True)
channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='json_queue', on_message_callback=callback)

print(' [*] Waiting for tasks...')
channel.start_consuming()
```

### 演習4: エラー処理とリトライ

```python
# robust_worker.py
import pika
import json
import time

MAX_RETRIES = 3

def process_task(task):
    if task.get('should_fail'):
        raise Exception("Task failed!")
    return True

def callback(ch, method, properties, body):
    task = json.loads(body)
    headers = properties.headers or {}
    retry_count = headers.get('x-retry-count', 0)
    
    try:
        print(f" [x] Processing task (retry: {retry_count})")
        process_task(task)
        print(" [x] Task completed")
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f" [!] Error: {e}")
        
        if retry_count < MAX_RETRIES:
            # リトライ
            print(f" [!] Retrying... ({retry_count + 1}/{MAX_RETRIES})")
            time.sleep(2 ** retry_count)  # Exponential backoff
            
            ch.basic_publish(
                exchange='',
                routing_key='task_queue',
                body=body,
                properties=pika.BasicProperties(
                    headers={'x-retry-count': retry_count + 1},
                    delivery_mode=2,
                )
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)
        else:
            # DLQ に送信
            print(" [!] Max retries reached, sending to DLQ")
            ch.basic_publish(
                exchange='',
                routing_key='dead_letter_queue',
                body=body
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)
```

## 管理画面の使い方

| タブ | 機能 |
|-----|------|
| Overview | 概要、メッセージレート |
| Connections | 接続中のクライアント |
| Channels | チャンネル一覧 |
| Exchanges | Exchange 一覧 |
| Queues | キュー一覧、メッセージ確認 |

## 理解度確認

### 問題

RabbitMQ で Consumer がメッセージを正常に処理したことを通知するのはどれか。

**A.** commit

**B.** confirm

**C.** basic_ack

**D.** basic_publish

---

### 解答・解説

**正解: C**

```python
ch.basic_ack(delivery_tag=method.delivery_tag)
```

ACK を送信することで、RabbitMQ はメッセージを削除します。

---

## 次のステップ

RabbitMQ 入門を学びました。次は Exchange とルーティングを学びましょう。

**次の単元**: [Phase 2-2: RabbitMQ 実践](./02_RabbitMQ実践.md)
