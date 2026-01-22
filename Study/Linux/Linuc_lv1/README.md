# LinuC Level 1 学習教材

実践重視の LinuC Level 1 学習教材です。Docker 環境で手を動かしながら学習できます。

## 学習環境の準備

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) をインストール
2. Phase 0 の Dockerfile をビルド
3. コンテナを起動して学習開始！

```bash
cd materials/phase0
docker build -t linuc-study .
docker run -it --name mylinux linuc-study
```

## カリキュラム

### Phase 0: 環境準備
- [環境構築](./phase0/00_環境構築.md) - Docker/CloudShell セットアップ

### Phase 1: 日常操作
- [ファイル操作基本](./phase1/01_ファイル操作基本.md) - ls, cd, pwd, ディレクトリ構造
- [ファイル操作実践](./phase1/02_ファイル操作実践.md) - cp, mv, rm, mkdir, ワイルドカード

### Phase 2: 調査と検索
- [ファイル閲覧](./phase2/01_ファイル閲覧.md) - cat, less, head, tail
- [grep検索](./phase2/02_grep検索.md) - grep, 正規表現の基本
- [find検索](./phase2/03_find検索.md) - find, 条件指定
- [パイプ](./phase2/04_パイプ.md) - |, リダイレクト, wc, sort, uniq

### Phase 3: テキスト処理
- [sed入門](./phase3/01_sed入門.md) - sed, 置換, 行操作
- [awk入門](./phase3/02_awk入門.md) - awk, 列抽出, 集計

### Phase 4: 権限管理
- [パーミッション基礎](./phase4/01_パーミッション基礎.md) - chmod, 数値/記号表記
- [sudo特殊権限](./phase4/02_sudo特殊権限.md) - sudo, SUID, SGID, スティッキービット

### Phase 5: プロセス管理
- [プロセス監視](./phase5/01_プロセス監視.md) - ps, top, プロセス状態
- [プロセス制御](./phase5/02_プロセス制御.md) - kill, シグナル, ジョブ制御

### Phase 6: シェルの力
- [シェル変数](./phase6/01_シェル変数.md) - 変数, 環境変数, export
- [シェルスクリプト](./phase6/02_シェルスクリプト.md) - if, for, while, スクリプト作成

### Phase 7: ネットワーク
- [ネットワーク基礎](./phase7/01_ネットワーク基礎.md) - ip, ping, ss, DNS

### Phase 8: システム管理
- [サービス管理](./phase8/01_サービス管理.md) - systemctl, journalctl
- [ログとcron](./phase8/02_ログとcron.md) - syslog, cron, logrotate

### Phase 9: 総仕上げ
- [総仕上げ](./phase9/01_総仕上げ.md) - 模擬問題20問, チェックリスト

## 各単元の構成

各教材は以下の構造で統一されています：

1. **学習目標** - この単元で何ができるようになるか
2. **概念解説** - Mermaid図解、Windows対比、メタファー
3. **基本コマンド** - 実務でよく使うもの（5個以内）
4. **ハンズオン** - 実際に手を動かす演習（3〜7個）
5. **試験のツボ** - ひっかけポイント、頻出事項
6. **理解度確認** - 4択問題1問（解説付き）

## 推奨学習フロー

1. Docker 環境を起動
2. 教材を読みながらハンズオンを実行
3. 理解度確認問題を解く
4. 不明点があれば再度ハンズオンで確認
5. 次の Phase へ

## 注意事項

- Docker コンテナ内での実験は自由に行えます（壊しても再作成可能）
- `sudo` が必要な操作は Docker 環境では制限される場合があります
- 本番環境での `rm -rf` や `chmod 777` は慎重に！

## ライセンス

この教材は学習目的で自由にご利用いただけます。

---

**学習頑張ってください！**
