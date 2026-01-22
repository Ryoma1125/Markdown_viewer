# Phase 4-2: GraphQL 実装

## 学習目標

この単元を終えると、以下ができるようになります：

- Strawberry で GraphQL API を実装できる
- リゾルバーを作成できる
- FastAPI と統合できる

## 環境構築

```bash
pip install strawberry-graphql[fastapi]
```

## ハンズオン

### 演習1: 基本的な GraphQL サーバー

```python
# schema.py
import strawberry
from typing import List, Optional

@strawberry.type
class User:
    id: int
    name: str
    email: str

# 仮のデータ
users_db = [
    {"id": 1, "name": "John", "email": "john@example.com"},
    {"id": 2, "name": "Jane", "email": "jane@example.com"},
]

@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[User]:
        return [User(**u) for u in users_db]
    
    @strawberry.field
    def user(self, id: int) -> Optional[User]:
        for u in users_db:
            if u["id"] == id:
                return User(**u)
        return None

schema = strawberry.Schema(query=Query)
```

```python
# main.py
from fastapi import FastAPI
from strawberry.fastapi import GraphQLRouter
from schema import schema

app = FastAPI()

graphql_app = GraphQLRouter(schema)
app.include_router(graphql_app, prefix="/graphql")

# http://localhost:8000/graphql でアクセス
```

### 演習2: Mutation

```python
import strawberry
from typing import List, Optional
from datetime import datetime

@strawberry.type
class User:
    id: int
    name: str
    email: str
    created_at: datetime

@strawberry.input
class CreateUserInput:
    name: str
    email: str

@strawberry.input
class UpdateUserInput:
    name: Optional[str] = None
    email: Optional[str] = None

users_db: List[dict] = []
user_id_counter = 0

@strawberry.type
class Query:
    @strawberry.field
    def users(self) -> List[User]:
        return [User(**u) for u in users_db]
    
    @strawberry.field
    def user(self, id: int) -> Optional[User]:
        for u in users_db:
            if u["id"] == id:
                return User(**u)
        return None

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, input: CreateUserInput) -> User:
        global user_id_counter
        user_id_counter += 1
        
        new_user = {
            "id": user_id_counter,
            "name": input.name,
            "email": input.email,
            "created_at": datetime.now(),
        }
        users_db.append(new_user)
        return User(**new_user)
    
    @strawberry.mutation
    def update_user(self, id: int, input: UpdateUserInput) -> Optional[User]:
        for u in users_db:
            if u["id"] == id:
                if input.name is not None:
                    u["name"] = input.name
                if input.email is not None:
                    u["email"] = input.email
                return User(**u)
        return None
    
    @strawberry.mutation
    def delete_user(self, id: int) -> bool:
        for i, u in enumerate(users_db):
            if u["id"] == id:
                users_db.pop(i)
                return True
        return False

schema = strawberry.Schema(query=Query, mutation=Mutation)
```

### 演習3: リレーション

```python
import strawberry
from typing import List, Optional

@strawberry.type
class Post:
    id: int
    title: str
    content: str
    author_id: int
    
    @strawberry.field
    def author(self) -> "User":
        # N+1問題に注意（後で DataLoader で解決）
        for u in users_db:
            if u["id"] == self.author_id:
                return User(**u)
        raise ValueError(f"Author {self.author_id} not found")

@strawberry.type
class User:
    id: int
    name: str
    email: str
    
    @strawberry.field
    def posts(self) -> List[Post]:
        return [Post(**p) for p in posts_db if p["author_id"] == self.id]

users_db = [
    {"id": 1, "name": "John", "email": "john@example.com"},
]

posts_db = [
    {"id": 1, "title": "First Post", "content": "Hello", "author_id": 1},
    {"id": 2, "title": "Second Post", "content": "World", "author_id": 1},
]
```

### 演習4: DataLoader（N+1問題の解決）

```python
from strawberry.dataloader import DataLoader
from typing import List

# バッチローダー関数
async def load_users(keys: List[int]) -> List[User]:
    # 1回のクエリで複数ユーザーを取得
    users = {u["id"]: User(**u) for u in users_db if u["id"] in keys}
    return [users.get(key) for key in keys]

# Context にDataLoader を追加
async def get_context():
    return {
        "user_loader": DataLoader(load_fn=load_users)
    }

@strawberry.type
class Post:
    id: int
    title: str
    author_id: int
    
    @strawberry.field
    async def author(self, info: strawberry.Info) -> User:
        loader = info.context["user_loader"]
        return await loader.load(self.author_id)

# FastAPI 統合
from strawberry.fastapi import GraphQLRouter

graphql_app = GraphQLRouter(
    schema,
    context_getter=get_context
)
```

### 演習5: 認証

```python
import strawberry
from strawberry.types import Info
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# コンテキストでユーザー情報を渡す
async def get_context(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)  # JWT デコード
    return {"current_user": user}

@strawberry.type
class Query:
    @strawberry.field
    def me(self, info: Info) -> User:
        current_user = info.context.get("current_user")
        if not current_user:
            raise Exception("Not authenticated")
        return current_user

# 権限チェックデコレータ
def require_auth(func):
    def wrapper(self, info: Info, *args, **kwargs):
        if not info.context.get("current_user"):
            raise Exception("Not authenticated")
        return func(self, info, *args, **kwargs)
    return wrapper

@strawberry.type
class Mutation:
    @strawberry.mutation
    @require_auth
    def create_post(self, info: Info, title: str, content: str) -> Post:
        user = info.context["current_user"]
        # 投稿作成
        pass
```

### 演習6: エラーハンドリング

```python
import strawberry
from typing import Union

# エラー型
@strawberry.type
class NotFoundError:
    message: str

@strawberry.type
class ValidationError:
    message: str
    field: str

# Union でエラーを返す
UserResult = strawberry.union("UserResult", (User, NotFoundError))

@strawberry.type
class Query:
    @strawberry.field
    def user(self, id: int) -> UserResult:
        for u in users_db:
            if u["id"] == id:
                return User(**u)
        return NotFoundError(message=f"User {id} not found")

# クライアント側
"""
query {
  user(id: 999) {
    ... on User {
      id
      name
    }
    ... on NotFoundError {
      message
    }
  }
}
"""
```

### 演習7: ページネーション

```python
import strawberry
from typing import List, Optional
import base64

@strawberry.type
class PageInfo:
    has_next_page: bool
    has_previous_page: bool
    start_cursor: Optional[str]
    end_cursor: Optional[str]

@strawberry.type
class UserEdge:
    node: User
    cursor: str

@strawberry.type
class UserConnection:
    edges: List[UserEdge]
    page_info: PageInfo
    total_count: int

def encode_cursor(id: int) -> str:
    return base64.b64encode(f"cursor:{id}".encode()).decode()

def decode_cursor(cursor: str) -> int:
    decoded = base64.b64decode(cursor).decode()
    return int(decoded.split(":")[1])

@strawberry.type
class Query:
    @strawberry.field
    def users(
        self,
        first: Optional[int] = 10,
        after: Optional[str] = None,
    ) -> UserConnection:
        start_idx = 0
        if after:
            after_id = decode_cursor(after)
            for i, u in enumerate(users_db):
                if u["id"] == after_id:
                    start_idx = i + 1
                    break
        
        sliced = users_db[start_idx:start_idx + first]
        
        edges = [
            UserEdge(node=User(**u), cursor=encode_cursor(u["id"]))
            for u in sliced
        ]
        
        return UserConnection(
            edges=edges,
            page_info=PageInfo(
                has_next_page=start_idx + first < len(users_db),
                has_previous_page=start_idx > 0,
                start_cursor=edges[0].cursor if edges else None,
                end_cursor=edges[-1].cursor if edges else None,
            ),
            total_count=len(users_db),
        )
```

## 理解度確認

### 問題

Strawberry で GraphQL の入力型を定義するデコレータはどれか。

**A.** `@strawberry.type`

**B.** `@strawberry.input`

**C.** `@strawberry.mutation`

**D.** `@strawberry.argument`

---

### 解答・解説

**正解: B**

```python
@strawberry.input
class CreateUserInput:
    name: str
    email: str

@strawberry.type  # 出力型
class User:
    id: int
    name: str
```

- `@strawberry.type` - 出力型
- `@strawberry.input` - 入力型（Mutation の引数など）

---

## 次のステップ

GraphQL 実装を学びました。次は総仕上げです。

**次の単元**: [Phase 5-1: 総仕上げ](../phase5/01_総仕上げ.md)
