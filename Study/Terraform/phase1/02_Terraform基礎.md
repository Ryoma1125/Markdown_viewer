# Phase 1-2: Terraform 基礎

## 学習目標

この単元を終えると、以下ができるようになります：

- HCL の基本構文を理解できる
- Terraform の基本コマンドを使える
- リソース定義の書き方を理解できる

## HCL（HashiCorp Configuration Language）

### 基本構文

```hcl
# ブロック構文
<BLOCK TYPE> "<BLOCK LABEL>" "<BLOCK LABEL>" {
  # 引数
  <IDENTIFIER> = <EXPRESSION>
}

# 例: リソースブロック
resource "aws_instance" "example" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"
  
  tags = {
    Name = "MyInstance"
  }
}
```

### データ型

```hcl
# 文字列
name = "hello"
name = "Hello, ${var.name}!"  # 変数展開

# 数値
count = 3
price = 10.5

# 真偽値
enabled = true

# リスト
ports = [80, 443, 8080]

# マップ
tags = {
  Name        = "web"
  Environment = "prod"
}

# オブジェクト
config = {
  name    = "app"
  version = "1.0"
}
```

### 変数

```hcl
# variables.tf - 変数定義
variable "instance_type" {
  description = "EC2 インスタンスタイプ"
  type        = string
  default     = "t3.micro"
}

variable "allowed_ports" {
  type    = list(number)
  default = [80, 443]
}

variable "tags" {
  type = map(string)
  default = {
    Environment = "dev"
  }
}

# main.tf - 変数の参照
resource "aws_instance" "web" {
  instance_type = var.instance_type
  tags          = var.tags
}
```

### 出力

```hcl
# outputs.tf
output "instance_ip" {
  description = "EC2 のパブリック IP"
  value       = aws_instance.web.public_ip
}

output "instance_id" {
  value = aws_instance.web.id
}
```

## Terraform コマンド

### 基本フロー

```bash
# 1. 初期化（プロバイダーダウンロード）
terraform init

# 2. フォーマット
terraform fmt

# 3. 検証
terraform validate

# 4. 計画（実行プレビュー）
terraform plan

# 5. 適用
terraform apply

# 6. 状態確認
terraform show

# 7. 削除
terraform destroy
```

### よく使うオプション

```bash
# 自動承認（yes 入力不要）
terraform apply -auto-approve

# 変数指定
terraform apply -var="instance_type=t3.small"

# 変数ファイル指定
terraform apply -var-file="prod.tfvars"

# 特定リソースのみ
terraform apply -target=aws_instance.web

# plan の保存と適用
terraform plan -out=tfplan
terraform apply tfplan
```

## ハンズオン

### 演習1: ローカルファイル作成

```hcl
# main.tf
terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

resource "local_file" "hello" {
  content  = "Hello, Terraform!"
  filename = "${path.module}/hello.txt"
}

output "file_path" {
  value = local_file.hello.filename
}
```

```bash
# 実行
terraform init
terraform plan
terraform apply

# 確認
cat hello.txt

# クリーンアップ
terraform destroy
```

### 演習2: 変数を使う

```hcl
# variables.tf
variable "message" {
  description = "ファイルに書き込むメッセージ"
  type        = string
  default     = "Default message"
}

variable "file_count" {
  type    = number
  default = 3
}

# main.tf
resource "local_file" "files" {
  count    = var.file_count
  content  = "${var.message} - File ${count.index + 1}"
  filename = "${path.module}/file_${count.index + 1}.txt"
}

output "file_names" {
  value = local_file.files[*].filename
}
```

```bash
# デフォルト値で実行
terraform apply

# 変数を指定
terraform apply -var="message=Custom message" -var="file_count=5"
```

### 演習3: for_each を使う

```hcl
variable "files" {
  type = map(string)
  default = {
    "config.txt" = "Configuration data"
    "readme.txt" = "README content"
    "notes.txt"  = "Some notes"
  }
}

resource "local_file" "multi" {
  for_each = var.files
  
  filename = "${path.module}/${each.key}"
  content  = each.value
}

output "created_files" {
  value = { for k, v in local_file.multi : k => v.filename }
}
```

### 演習4: 条件分岐

```hcl
variable "create_backup" {
  type    = bool
  default = true
}

variable "environment" {
  type    = string
  default = "dev"
}

resource "local_file" "main" {
  content  = "Main file for ${var.environment}"
  filename = "${path.module}/main_${var.environment}.txt"
}

# 条件付きリソース
resource "local_file" "backup" {
  count = var.create_backup ? 1 : 0
  
  content  = local_file.main.content
  filename = "${path.module}/backup_${var.environment}.txt"
}

# 三項演算子
output "backup_status" {
  value = var.create_backup ? "Backup created" : "No backup"
}

# 環境による分岐
output "log_level" {
  value = var.environment == "prod" ? "ERROR" : "DEBUG"
}
```

## リソース参照

```hcl
# 同じ設定内の他リソース参照
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id  # 他リソースの属性参照
  cidr_block = "10.0.1.0/24"
}

# データソース（既存リソースの参照）
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "web" {
  ami = data.aws_ami.amazon_linux.id
}
```

## 理解度確認

### 問題

Terraform で変数 `var.instance_type` を参照する正しい構文はどれか。

**A.** `${var.instance_type}`（リソース内で常に）

**B.** `var.instance_type`（リソース内で）

**C.** `$var.instance_type`

**D.** `variable.instance_type`

---

### 解答・解説

**正解: B**

```hcl
resource "aws_instance" "web" {
  instance_type = var.instance_type  # 正しい
}
```

- `${}` は文字列内での変数展開のみ必要
- 単体で参照する場合は `var.変数名` のみ

```hcl
# 文字列内
name = "instance-${var.environment}"

# 単体
instance_type = var.instance_type
```

---

## 次のステップ

Terraform の基礎を学びました。次は AWS プロバイダーを学びましょう。

**次の単元**: [Phase 2-1: AWS プロバイダー](../phase2/01_AWS_プロバイダー.md)
