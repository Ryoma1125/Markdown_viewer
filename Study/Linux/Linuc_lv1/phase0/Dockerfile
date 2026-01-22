# LinuC Level 1 学習用 Docker イメージ
# Ubuntu 22.04 LTS ベース

FROM ubuntu:22.04

# 日本語環境とよく使うツールをインストール
RUN apt-get update && apt-get install -y \
    locales \
    vim \
    nano \
    less \
    tree \
    curl \
    wget \
    net-tools \
    iputils-ping \
    iproute2 \
    procps \
    sudo \
    man-db \
    file \
    bzip2 \
    gzip \
    tar \
    cron \
    at \
    rsyslog \
    openssh-client \
    dnsutils \
    && rm -rf /var/lib/apt/lists/*

# 日本語ロケール設定
RUN locale-gen ja_JP.UTF-8
ENV LANG=ja_JP.UTF-8
ENV LC_ALL=ja_JP.UTF-8

# 学習用ユーザーを作成（sudo権限付き）
RUN useradd -m -s /bin/bash student \
    && echo "student:student" | chpasswd \
    && usermod -aG sudo student

# 演習用のサンプルファイル・ディレクトリを作成
RUN mkdir -p /home/student/練習場/{documents,logs,scripts} \
    && echo "Hello, Linux World!" > /home/student/練習場/documents/hello.txt \
    && echo "これは日本語のファイルです。" > /home/student/練習場/documents/japanese.txt \
    && echo -e "apple\nbanana\ncherry\ndate\nelderberry" > /home/student/練習場/documents/fruits.txt \
    && echo -e "ERROR: Connection failed\nINFO: Server started\nWARN: Low memory\nERROR: Timeout occurred\nINFO: Process completed" > /home/student/練習場/logs/app.log \
    && echo '#!/bin/bash\necho "Hello from script!"' > /home/student/練習場/scripts/hello.sh \
    && chmod +x /home/student/練習場/scripts/hello.sh \
    && chown -R student:student /home/student/練習場

# 作業ディレクトリ
WORKDIR /home/student

# student ユーザーで起動
USER student

CMD ["/bin/bash"]
