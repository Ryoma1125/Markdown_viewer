# Phase 2-1: AWS プロバイダー

## 学習目標

この単元を終えると、以下ができるようになります：

- AWS プロバイダーを設定できる
- 認証方法を理解できる
- マルチリージョン設定ができる

## AWS プロバイダーの設定

### 基本設定

```hcl
# providers.tf
terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}
```

### バージョン制約

| 記法 | 意味 |
|------|------|
| `= 5.0.0` | 厳密に 5.0.0 |
| `>= 5.0.0` | 5.0.0 以上 |
| `~> 5.0` | 5.x（5.0 以上、6.0 未満） |
| `~> 5.0.0` | 5.0.x（5.0.0 以上、5.1.0 未満） |
| `>= 5.0, < 6.0` | 範囲指定 |

## 認証方法

### 優先順位

1. プロバイダー設定内のハードコード（非推奨）
2. 環境変数
3. 共有認証情報ファイル（~/.aws/credentials）
4. IAM ロール（EC2 / ECS / Lambda など）

### 環境変数

```bash
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_REGION="ap-northeast-1"
```

### 共有認証情報

```hcl
provider "aws" {
  region  = "ap-northeast-1"
  profile = "dev"  # ~/.aws/credentials のプロファイル
}
```

### Assume Role

```hcl
provider "aws" {
  region = "ap-northeast-1"
  
  assume_role {
    role_arn     = "arn:aws:iam::123456789012:role/TerraformRole"
    session_name = "TerraformSession"
  }
}
```

## ハンズオン

### 演習1: 接続確認

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "ap-northeast-1"
}

# 現在のアカウント情報を取得
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "region" {
  value = data.aws_region.current.name
}
```

```bash
terraform init
terraform apply
```

### 演習2: マルチリージョン

```hcl
# デフォルトプロバイダー（東京）
provider "aws" {
  region = "ap-northeast-1"
}

# エイリアス付きプロバイダー（バージニア）
provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

# 東京リージョンのリソース
resource "aws_s3_bucket" "tokyo" {
  bucket = "my-bucket-tokyo-${random_id.suffix.hex}"
}

# バージニアリージョンのリソース
resource "aws_s3_bucket" "virginia" {
  provider = aws.virginia
  bucket   = "my-bucket-virginia-${random_id.suffix.hex}"
}

resource "random_id" "suffix" {
  byte_length = 4
}
```

### 演習3: デフォルトタグ

```hcl
provider "aws" {
  region = "ap-northeast-1"
  
  default_tags {
    tags = {
      Project     = "MyProject"
      Environment = "dev"
      ManagedBy   = "Terraform"
    }
  }
}

# 全リソースに自動でタグが付く
resource "aws_instance" "web" {
  ami           = "ami-12345678"
  instance_type = "t3.micro"
  
  tags = {
    Name = "WebServer"  # 追加タグ
  }
  # Project, Environment, ManagedBy は自動付与
}
```

### 演習4: 複数アカウント

```hcl
# 開発アカウント
provider "aws" {
  alias   = "dev"
  region  = "ap-northeast-1"
  profile = "dev"
}

# 本番アカウント
provider "aws" {
  alias   = "prod"
  region  = "ap-northeast-1"
  profile = "prod"
}

# 開発環境のリソース
resource "aws_s3_bucket" "dev" {
  provider = aws.dev
  bucket   = "dev-bucket-${random_id.suffix.hex}"
}

# 本番環境のリソース
resource "aws_s3_bucket" "prod" {
  provider = aws.prod
  bucket   = "prod-bucket-${random_id.suffix.hex}"
}
```

## データソース

### 既存リソースの参照

```hcl
# 最新の Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]
  
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# 既存の VPC
data "aws_vpc" "default" {
  default = true
}

# 既存のサブネット
data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# 使用
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t3.micro"
  subnet_id     = data.aws_subnets.public.ids[0]
}
```

### よく使うデータソース

| データソース | 用途 |
|-------------|------|
| aws_ami | AMI ID の取得 |
| aws_vpc | VPC 情報 |
| aws_subnets | サブネット一覧 |
| aws_availability_zones | AZ 一覧 |
| aws_caller_identity | アカウント情報 |
| aws_region | リージョン情報 |
| aws_iam_policy_document | IAM ポリシー生成 |

## 理解度確認

### 問題

Terraform で複数の AWS リージョンにリソースを作成する場合に使用する機能はどれか。

**A.** multi_region ブロック

**B.** プロバイダーの alias

**C.** region 変数

**D.** aws_multi_region リソース

---

### 解答・解説

**正解: B**

```hcl
provider "aws" {
  region = "ap-northeast-1"
}

provider "aws" {
  alias  = "virginia"
  region = "us-east-1"
}

resource "aws_s3_bucket" "virginia" {
  provider = aws.virginia
  bucket   = "my-virginia-bucket"
}
```

`alias` でプロバイダーに名前を付け、リソースで `provider` 引数で指定します。

---

## 次のステップ

AWS プロバイダーを学びました。次は基本リソースの作成を学びましょう。

**次の単元**: [Phase 2-2: 基本リソース](./02_基本リソース.md)
