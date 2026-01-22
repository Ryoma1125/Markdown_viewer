# Kubernetes 入門

## 概要

コンテナオーケストレーションツール Kubernetes (K8s) を学び、コンテナ化されたアプリケーションのデプロイ・管理ができるようになるカリキュラムです。

## 前提知識

- Docker の基本操作（コンテナ、イメージ）
- Linux の基本コマンド
- YAML の基本構文

## 学習期間の目安

- 1日1〜2時間: 約5週間
- 集中学習: 約2.5週間

## カリキュラム構成

```
Kubernetes/
├── README.md（このファイル）
├── phase0/
│   └── 00_環境構築.md              # minikube / kind のセットアップ
├── phase1/
│   └── 01_Kubernetesとは.md        # 概念・アーキテクチャ
├── phase2/
│   ├── 01_Pod基礎.md               # Pod の作成と管理
│   └── 02_ReplicaSet_Deployment.md # スケーリングとデプロイ
├── phase3/
│   ├── 01_Service.md               # ネットワーク・負荷分散
│   └── 02_Ingress.md               # 外部公開
├── phase4/
│   ├── 01_ConfigMap_Secret.md      # 設定管理
│   └── 02_Volume.md                # 永続化
├── phase5/
│   └── 01_実践デプロイ.md           # アプリケーションのデプロイ
└── phase6/
    └── 01_総仕上げ.md              # マイクロサービス構築
```

## 到達目標

- Kubernetes の基本概念を説明できる
- kubectl を使ってリソースを操作できる
- アプリケーションを Kubernetes にデプロイできる
- 本番運用で必要な設定ができる

## AWS との対応

| Kubernetes | AWS |
|-----------|-----|
| Pod | ECS Task |
| Deployment | ECS Service |
| Service | ALB / NLB |
| ConfigMap | Parameter Store |
| Secret | Secrets Manager |
| PersistentVolume | EBS |
