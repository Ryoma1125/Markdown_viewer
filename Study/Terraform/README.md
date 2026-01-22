# Terraform / IaC（Infrastructure as Code）

## 概要

インフラをコードで管理する概念と、Terraform を使った AWS インフラの構築を学ぶカリキュラムです。

## 前提知識

- AWS の基本サービス（EC2, VPC, S3 など）
- コマンドラインの基本操作
- YAML/JSON の基本

## 学習期間の目安

- 1日1〜2時間: 約2週間
- 集中学習: 約1週間

## カリキュラム構成

```
Terraform/
├── README.md（このファイル）
├── phase0/
│   └── 00_環境構築.md           # Terraform インストール
├── phase1/
│   ├── 01_IaCとは.md            # 概念と利点
│   └── 02_Terraform基礎.md      # 基本構文
├── phase2/
│   ├── 01_AWS_プロバイダー.md   # AWS 接続
│   └── 02_基本リソース.md       # EC2, VPC, S3
├── phase3/
│   ├── 01_変数とモジュール.md   # 再利用性
│   └── 02_状態管理.md           # tfstate, バックエンド
├── phase4/
│   ├── 01_実践構築.md           # 本番環境構築
│   └── 02_CI_CD連携.md          # GitHub Actions + Terraform
└── phase5/
    └── 01_総仕上げ.md           # 完全なインフラ構築
```

## 到達目標

- IaC の概念と利点を説明できる
- Terraform で AWS リソースを管理できる
- モジュール化して再利用可能なコードを書ける
- CI/CD パイプラインでインフラデプロイできる
