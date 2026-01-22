# Docker 入門

実践重視の Docker 学習教材です。コンテナ技術を基礎から学び、開発環境の構築から本番運用の考え方まで習得できます。

## 前提知識

このカリキュラムを始める前に、以下の知識・スキルが必要です：

| 必須 | 推奨 |
|------|------|
| Linux 基本コマンド（ls, cd, cat など） | Git/GitHub の基本操作 |
| ターミナル操作の基礎 | |

> 💡 Python メインで AWS（Lambda, EC2 など）を使っている方は、すぐに始められます！

## 学習環境の準備

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) をインストール
2. ターミナルで `docker --version` を実行して動作確認
3. Phase 0 から学習開始！

```bash
# Docker がインストールされているか確認
docker --version
# Docker version 24.0.x, build xxxxx

# Hello World を実行してみる
docker run hello-world
```

## カリキュラム

### Phase 0: 環境準備
- [環境構築](./phase0/00_環境構築.md) - Docker Desktop インストール、動作確認

### Phase 1: コンテナの基本概念
- [コンテナとは](./phase1/01_コンテナとは.md) - コンテナ vs 仮想マシン、Docker アーキテクチャ

### Phase 2: コンテナ操作
- [コンテナ基本操作](./phase2/01_コンテナ基本操作.md) - run, ps, stop, rm, exec, logs
- [ポートとネットワーク基礎](./phase2/02_ポートとネットワーク.md) - ポートマッピング、コンテナ接続

### Phase 3: イメージ管理
- [イメージの基礎](./phase3/01_イメージ基礎.md) - images, pull, レイヤー構造
- [Dockerfile入門](./phase3/02_Dockerfile入門.md) - FROM, RUN, COPY, CMD, EXPOSE

### Phase 4: データ永続化
- [ボリュームとマウント](./phase4/01_ボリュームとマウント.md) - Volume, バインドマウント
- [Dockerネットワーク](./phase4/02_Dockerネットワーク.md) - bridge, host, コンテナ間通信

### Phase 5: Docker Compose
- [Compose入門](./phase5/01_Compose入門.md) - docker-compose.yml 基礎
- [マルチコンテナ構成](./phase5/02_マルチコンテナ構成.md) - Web + DB 構成、環境変数

### Phase 6: 実践＆ベストプラクティス
- [Dockerfile最適化](./phase6/01_Dockerfile最適化.md) - マルチステージビルド、キャッシュ活用
- [総仕上げ](./phase6/02_総仕上げ.md) - 実践プロジェクト、チェックリスト

## 各単元の構成

各教材は以下の構造で統一されています：

1. **学習目標** - この単元で何ができるようになるか
2. **概念解説** - 図解、AWS との対比、メタファー
3. **基本コマンド** - 実務でよく使うもの（5個以内）
4. **ハンズオン** - 実際に手を動かす演習（3〜7個）
5. **現場でよくある落とし穴** - 初心者がハマりやすいポイント
6. **理解度確認** - 確認問題（解説付き）

## 推奨学習フロー

1. 教材を読みながらコマンドを実行
2. ハンズオンを全て試す
3. 理解度確認問題を解く
4. 不明点があれば再度ハンズオンで確認
5. 次の Phase へ

## AWS との関連

Docker を学ぶと、以下の AWS サービスがより深く理解できます：

| Docker 概念 | 関連 AWS サービス |
|------------|------------------|
| コンテナ | ECS, EKS, Fargate |
| イメージ | ECR (Elastic Container Registry) |
| docker-compose | ECS Task Definition |
| ネットワーク | VPC, Security Group |

## 注意事項

- Docker Desktop は開発環境用です。本番では Docker Engine を使います
- コンテナを削除するとデータも消えます（Volume を使わない場合）
- イメージのサイズに注意（大きすぎるとビルド・デプロイが遅くなる）

## ライセンス

この教材は学習目的で自由にご利用いただけます。

---

**Let's Containerize! 🐳**
