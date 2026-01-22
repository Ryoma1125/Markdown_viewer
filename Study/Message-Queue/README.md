# メッセージキュー・非同期処理

## 概要

メッセージキューの概念から RabbitMQ、Celery を使った非同期タスク処理まで学ぶカリキュラムです。AWS SQS との比較も含めます。

## 前提知識

- Python の基本
- Docker の基本
- API の基本概念

## 学習期間の目安

- 1日1〜2時間: 約10日
- 集中学習: 約5日

## カリキュラム構成

```
Message-Queue/
├── README.md（このファイル）
├── phase1/
│   ├── 01_非同期処理とは.md        # 同期vs非同期、ユースケース
│   └── 02_メッセージキュー基礎.md   # キューの概念、パターン
├── phase2/
│   ├── 01_RabbitMQ入門.md          # RabbitMQ セットアップ
│   └── 02_RabbitMQ実践.md          # Exchange、Routing
├── phase3/
│   ├── 01_Celery入門.md            # Celery 基礎
│   └── 02_Celery実践.md            # タスクチェーン、エラー処理
└── phase4/
    └── 01_総仕上げ.md              # 実践プロジェクト
```

## 到達目標

- 非同期処理のユースケースを説明できる
- RabbitMQ でメッセージをやり取りできる
- Celery で非同期タスクを実装できる
