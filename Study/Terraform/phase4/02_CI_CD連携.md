# Phase 4-2: CI/CD 連携

## 学習目標

この単元を終えると、以下ができるようになります：

- GitHub Actions で Terraform を実行できる
- PR での plan レビューを設定できる
- 安全な自動 apply を実装できる

## GitHub Actions + Terraform

### 基本ワークフロー

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
    paths:
      - 'infrastructure/**'
  pull_request:
    branches: [main]
    paths:
      - 'infrastructure/**'

env:
  TF_VERSION: "1.7.0"
  AWS_REGION: "ap-northeast-1"

jobs:
  terraform:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: infrastructure
    
    permissions:
      contents: read
      pull-requests: write
      id-token: write  # OIDC 用
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: ${{ env.TF_VERSION }}
      
      - name: Terraform Format
        run: terraform fmt -check -recursive
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        id: plan
        run: terraform plan -no-color -out=tfplan
        continue-on-error: true
      
      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const output = `#### Terraform Plan 📖
            
            \`\`\`
            ${{ steps.plan.outputs.stdout }}
            \`\`\`
            
            *Pushed by: @${{ github.actor }}*`;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: terraform apply -auto-approve tfplan
```

### OIDC 認証の設定

```hcl
# oidc-provider.tf（事前に手動作成）
data "aws_caller_identity" "current" {}

resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = ["ffffffffffffffffffffffffffffffffffffffff"]
}

resource "aws_iam_role" "github_actions" {
  name = "github-actions-terraform"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:myorg/myrepo:*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "admin" {
  role       = aws_iam_role.github_actions.name
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}
```

## 高度なワークフロー

### 環境別デプロイ

```yaml
# .github/workflows/terraform-env.yml
name: Terraform Deploy

on:
  push:
    branches:
      - main
      - 'release/**'
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        type: choice
        options:
          - dev
          - staging
          - prod

jobs:
  determine-env:
    runs-on: ubuntu-latest
    outputs:
      environment: ${{ steps.env.outputs.environment }}
    steps:
      - id: env
        run: |
          if [ "${{ github.event_name }}" == "workflow_dispatch" ]; then
            echo "environment=${{ inputs.environment }}" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/heads/main ]]; then
            echo "environment=dev" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == refs/heads/release/* ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi
  
  plan:
    needs: determine-env
    runs-on: ubuntu-latest
    environment: ${{ needs.determine-env.outputs.environment }}
    defaults:
      run:
        working-directory: infrastructure/environments/${{ needs.determine-env.outputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-1
      
      - uses: hashicorp/setup-terraform@v3
      
      - run: terraform init
      - run: terraform plan -out=tfplan
      
      - uses: actions/upload-artifact@v4
        with:
          name: tfplan-${{ needs.determine-env.outputs.environment }}
          path: infrastructure/environments/${{ needs.determine-env.outputs.environment }}/tfplan
  
  apply:
    needs: [determine-env, plan]
    runs-on: ubuntu-latest
    environment: ${{ needs.determine-env.outputs.environment }}
    defaults:
      run:
        working-directory: infrastructure/environments/${{ needs.determine-env.outputs.environment }}
    steps:
      - uses: actions/checkout@v4
      
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-1
      
      - uses: hashicorp/setup-terraform@v3
      
      - uses: actions/download-artifact@v4
        with:
          name: tfplan-${{ needs.determine-env.outputs.environment }}
          path: infrastructure/environments/${{ needs.determine-env.outputs.environment }}
      
      - run: terraform init
      - run: terraform apply -auto-approve tfplan
```

### Drift Detection

```yaml
# .github/workflows/drift-detection.yml
name: Drift Detection

on:
  schedule:
    - cron: '0 9 * * *'  # 毎日9時

jobs:
  detect:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [dev, staging, prod]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ap-northeast-1
      
      - uses: hashicorp/setup-terraform@v3
      
      - name: Terraform Plan
        id: plan
        working-directory: infrastructure/environments/${{ matrix.environment }}
        run: |
          terraform init
          terraform plan -detailed-exitcode -out=tfplan 2>&1 | tee plan_output.txt
        continue-on-error: true
      
      - name: Check for drift
        if: steps.plan.outcome == 'failure' || steps.plan.outputs.exitcode == '2'
        run: |
          echo "⚠️ Drift detected in ${{ matrix.environment }}!"
          # Slack 通知など
```

## Terraform Cloud / Enterprise

```hcl
# versions.tf
terraform {
  cloud {
    organization = "my-org"
    
    workspaces {
      name = "my-workspace"
    }
  }
}
```

## ベストプラクティス

| プラクティス | 説明 |
|-------------|------|
| PR で plan | main への直接 apply は禁止 |
| plan の保存 | apply は保存した plan を使用 |
| OIDC 認証 | 長期認証情報を使わない |
| 環境分離 | 環境ごとに状態ファイル分離 |
| Drift 検知 | 定期的に差分を確認 |

## 理解度確認

### 問題

GitHub Actions で AWS 認証に OIDC を使用する主なメリットはどれか。

**A.** 実行速度の向上

**B.** 長期認証情報を Secrets に保存する必要がない

**C.** 複数リージョンへの同時デプロイ

**D.** Terraform のバージョン自動更新

---

### 解答・解説

**正解: B**

OIDC 認証のメリット：
- 長期認証情報（Access Key）が不要
- 一時的な認証情報を自動取得
- Secrets の漏洩リスク軽減

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
    # Access Key は不要！
```

---

## 次のステップ

CI/CD 連携を学びました。次は総仕上げです。

**次の単元**: [Phase 5-1: 総仕上げ](../phase5/01_総仕上げ.md)
