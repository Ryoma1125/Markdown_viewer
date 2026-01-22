# Phase 3-1: API 設計パターン

## 学習目標

この単元を終えると、以下ができるようになります：

- API Gateway の設計パターンを選択できる
- REST と HTTP API を使い分けられる
- GraphQL（AppSync）を設計できる

## API Gateway の種類

| 種類 | 特徴 | 料金 |
|------|------|------|
| **REST API** | フル機能、WAF 対応 | 高め |
| **HTTP API** | シンプル、低遅延 | 安い（70%減） |
| **WebSocket API** | リアルタイム通信 | 接続+メッセージ |

## ハンズオン

### 演習1: REST API + Lambda

```python
# api_handler.py
"""
REST API ハンドラー
"""

import json
from typing import Dict, Any

def lambda_handler(event, context) -> Dict[str, Any]:
    """
    API Gateway からのイベント処理
    """
    http_method = event['httpMethod']
    path = event['path']
    path_params = event.get('pathParameters') or {}
    query_params = event.get('queryStringParameters') or {}
    body = json.loads(event.get('body') or '{}')
    
    # ルーティング
    routes = {
        ('GET', '/orders'): list_orders,
        ('GET', '/orders/{id}'): get_order,
        ('POST', '/orders'): create_order,
        ('PUT', '/orders/{id}'): update_order,
        ('DELETE', '/orders/{id}'): delete_order,
    }
    
    # パスパターンマッチング
    for (method, pattern), handler in routes.items():
        if method == http_method and match_path(pattern, path):
            try:
                result = handler(path_params, query_params, body)
                return response(200, result)
            except NotFoundError as e:
                return response(404, {'error': str(e)})
            except ValidationError as e:
                return response(400, {'error': str(e)})
            except Exception as e:
                return response(500, {'error': 'Internal server error'})
    
    return response(404, {'error': 'Not found'})

def response(status_code: int, body: dict) -> Dict[str, Any]:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(body)
    }

def match_path(pattern: str, path: str) -> bool:
    # 簡易パターンマッチ
    if '{' in pattern:
        pattern_parts = pattern.split('/')
        path_parts = path.split('/')
        if len(pattern_parts) != len(path_parts):
            return False
        for p, a in zip(pattern_parts, path_parts):
            if not p.startswith('{') and p != a:
                return False
        return True
    return pattern == path

# ハンドラー関数
def list_orders(path_params, query_params, body):
    limit = int(query_params.get('limit', 10))
    return {'orders': [], 'count': 0}

def get_order(path_params, query_params, body):
    order_id = path_params['id']
    # DBから取得
    return {'orderId': order_id, 'status': 'confirmed'}

def create_order(path_params, query_params, body):
    # バリデーション
    if not body.get('items'):
        raise ValidationError('items is required')
    # DB保存
    return {'orderId': 'ORD-123', 'status': 'created'}

def update_order(path_params, query_params, body):
    order_id = path_params['id']
    return {'orderId': order_id, 'status': 'updated'}

def delete_order(path_params, query_params, body):
    order_id = path_params['id']
    return {'message': f'Order {order_id} deleted'}

class NotFoundError(Exception):
    pass

class ValidationError(Exception):
    pass
```

### 演習2: API Gateway + Lambda Proxy

```yaml
# serverless.yml（Serverless Framework）
service: order-api

provider:
  name: aws
  runtime: python3.11
  region: ap-northeast-1
  environment:
    TABLE_NAME: !Ref OrdersTable

functions:
  api:
    handler: api_handler.lambda_handler
    events:
      - httpApi:
          path: /orders
          method: GET
      - httpApi:
          path: /orders
          method: POST
      - httpApi:
          path: /orders/{id}
          method: GET
      - httpApi:
          path: /orders/{id}
          method: PUT
      - httpApi:
          path: /orders/{id}
          method: DELETE

resources:
  Resources:
    OrdersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: orders
        AttributeDefinitions:
          - AttributeName: orderId
            AttributeType: S
        KeySchema:
          - AttributeName: orderId
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
```

### 演習3: GraphQL with AppSync

```python
# appsync_resolvers.py
"""
AppSync Lambda リゾルバー
"""

def lambda_handler(event, context):
    """
    AppSync からの GraphQL リクエスト処理
    """
    info = event.get('info', {})
    field_name = info.get('fieldName')
    arguments = event.get('arguments', {})
    
    resolvers = {
        'getOrder': resolve_get_order,
        'listOrders': resolve_list_orders,
        'createOrder': resolve_create_order,
    }
    
    resolver = resolvers.get(field_name)
    if resolver:
        return resolver(arguments)
    
    raise Exception(f'Unknown field: {field_name}')

def resolve_get_order(args):
    order_id = args['orderId']
    # DBから取得
    return {
        'orderId': order_id,
        'status': 'confirmed',
        'items': [
            {'productId': 'PROD-1', 'quantity': 2}
        ]
    }

def resolve_list_orders(args):
    limit = args.get('limit', 10)
    # DBから取得
    return {
        'orders': [],
        'nextToken': None
    }

def resolve_create_order(args):
    input_data = args['input']
    # DB保存
    return {
        'orderId': 'ORD-NEW',
        'status': 'created',
        'items': input_data['items']
    }
```

```graphql
# schema.graphql
type Order {
  orderId: ID!
  status: String!
  items: [OrderItem!]!
  createdAt: AWSDateTime!
}

type OrderItem {
  productId: ID!
  quantity: Int!
  unitPrice: Int!
}

type OrderConnection {
  orders: [Order!]!
  nextToken: String
}

input CreateOrderInput {
  items: [OrderItemInput!]!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
}

type Query {
  getOrder(orderId: ID!): Order
  listOrders(limit: Int, nextToken: String): OrderConnection!
}

type Mutation {
  createOrder(input: CreateOrderInput!): Order!
}

type Subscription {
  onOrderCreated: Order
    @aws_subscribe(mutations: ["createOrder"])
}
```

### 演習4: API バージョニング

```python
# versioned_api.py
"""
APIバージョニングパターン
"""

# パターン1: URLパス
# /v1/orders
# /v2/orders

# パターン2: ヘッダー
# Accept: application/vnd.myapi.v1+json

def lambda_handler(event, context):
    # ヘッダーからバージョン取得
    headers = event.get('headers', {})
    accept = headers.get('Accept', '')
    
    if 'v2' in accept:
        return handle_v2(event)
    else:
        return handle_v1(event)  # デフォルト

def handle_v1(event):
    """V1 レスポンス形式"""
    return {
        'statusCode': 200,
        'body': json.dumps({
            'order_id': 'ORD-123',  # snake_case
            'status': 'confirmed'
        })
    }

def handle_v2(event):
    """V2 レスポンス形式"""
    return {
        'statusCode': 200,
        'body': json.dumps({
            'orderId': 'ORD-123',  # camelCase
            'status': 'confirmed',
            'metadata': {  # 新フィールド
                'version': 2,
                'createdAt': '2024-01-01T00:00:00Z'
            }
        })
    }
```

## API 設計のベストプラクティス

| プラクティス | 説明 |
|-------------|------|
| **冪等性** | PUT, DELETE は同じ結果 |
| **ページネーション** | 大量データはページング |
| **フィルタリング** | クエリパラメータで条件指定 |
| **エラー形式** | 統一されたエラーレスポンス |
| **レート制限** | API Gateway で設定 |

## 理解度確認

### 問題

REST API と HTTP API のどちらを選ぶべき場合が正しいのはどれか。

**A.** コスト重視で基本的な API → HTTP API

**B.** WAF 連携が必要 → HTTP API

**C.** WebSocket が必要 → REST API

**D.** キャッシュが必要 → HTTP API

---

### 解答・解説

**正解: A**

HTTP API は REST API の約70%のコストで、基本的な機能（Lambda プロキシ、認証）を提供します。WAF やキャッシュ、詳細なマッピングが必要な場合は REST API を選択します。

---

## 次のステップ

API 設計パターンを学びました。次は認証とセキュリティを学びましょう。

**次の単元**: [Phase 3-2: 認証とセキュリティ](./02_認証とセキュリティ.md)
