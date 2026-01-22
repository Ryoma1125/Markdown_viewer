# Phase 2-1: FastAPI 入門

## 学習目標

この単元を終えると、以下ができるようになります：

- FastAPI でシンプルな API を作成できる
- パスパラメータ・クエリパラメータを扱える
- CRUD 操作を実装できる

## 環境構築

```bash
# 仮想環境作成
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate   # Windows

# インストール
pip install fastapi uvicorn[standard] pydantic
```

## ハンズオン

### 演習1: Hello World

```python
# main.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

```bash
# 起動
uvicorn main:app --reload

# アクセス
curl http://localhost:8000/
curl http://localhost:8000/health

# ドキュメント
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

### 演習2: パスパラメータ

```python
from fastapi import FastAPI, Path

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    return {"user_id": user_id}

# バリデーション付き
@app.get("/items/{item_id}")
def get_item(
    item_id: int = Path(..., ge=1, le=1000, description="アイテムID")
):
    return {"item_id": item_id}

# 列挙型
from enum import Enum

class Status(str, Enum):
    active = "active"
    inactive = "inactive"

@app.get("/users/status/{status}")
def get_users_by_status(status: Status):
    return {"status": status}
```

### 演習3: クエリパラメータ

```python
from fastapi import FastAPI, Query
from typing import Optional

app = FastAPI()

@app.get("/users")
def get_users(
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(20, ge=1, le=100, description="取得件数"),
    status: Optional[str] = Query(None, description="ステータスフィルタ"),
    sort: str = Query("created_at", description="ソートフィールド"),
):
    return {
        "page": page,
        "limit": limit,
        "status": status,
        "sort": sort
    }

# リスト型クエリパラメータ
@app.get("/items")
def get_items(
    ids: list[int] = Query(default=[])
):
    # /items?ids=1&ids=2&ids=3
    return {"ids": ids}
```

### 演習4: リクエストボディ

```python
from fastapi import FastAPI
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

app = FastAPI()

class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: Optional[int] = Field(None, ge=0, le=150)
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "age": 25
            }
        }

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int]
    created_at: datetime

@app.post("/users", response_model=UserResponse, status_code=201)
def create_user(user: UserCreate):
    # 実際はDBに保存
    return UserResponse(
        id=1,
        name=user.name,
        email=user.email,
        age=user.age,
        created_at=datetime.now()
    )
```

### 演習5: CRUD 実装

```python
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

app = FastAPI(title="Users API", version="1.0.0")

# モデル定義
class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    age: Optional[int] = Field(None, ge=0, le=150)

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=0, le=150)

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

# 仮のデータストア
users_db: dict[int, dict] = {}
user_id_counter = 0

@app.get("/users", response_model=list[User])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """ユーザー一覧を取得"""
    users = list(users_db.values())
    return users[skip:skip + limit]

@app.get("/users/{user_id}", response_model=User)
def get_user(user_id: int):
    """ユーザーを取得"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return users_db[user_id]

@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate):
    """ユーザーを作成"""
    global user_id_counter
    user_id_counter += 1
    
    now = datetime.now()
    new_user = {
        "id": user_id_counter,
        "name": user.name,
        "email": user.email,
        "age": user.age,
        "created_at": now,
        "updated_at": now,
    }
    users_db[user_id_counter] = new_user
    return new_user

@app.put("/users/{user_id}", response_model=User)
def update_user(user_id: int, user: UserUpdate):
    """ユーザーを更新"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    stored_user = users_db[user_id]
    update_data = user.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        stored_user[key] = value
    stored_user["updated_at"] = datetime.now()
    
    return stored_user

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int):
    """ユーザーを削除"""
    if user_id not in users_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    del users_db[user_id]
```

### 演習6: レスポンスヘッダーとステータス

```python
from fastapi import FastAPI, Response, status
from fastapi.responses import JSONResponse

app = FastAPI()

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(response: Response):
    user_id = 123
    response.headers["Location"] = f"/users/{user_id}"
    return {"id": user_id}

@app.get("/items/{item_id}")
def get_item(item_id: int):
    if item_id == 0:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": {"code": "NOT_FOUND", "message": "Item not found"}}
        )
    return {"id": item_id}
```

## 依存性注入

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# 依存関係の定義
def get_db():
    db = DatabaseSession()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme)):
    user = decode_token(token)
    return user

@app.get("/users/me")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/items")
def get_items(db = Depends(get_db)):
    return db.query(Item).all()
```

## 理解度確認

### 問題

FastAPI でリクエストボディを受け取るために使用するクラスはどれか。

**A.** `dataclass`

**B.** `Pydantic BaseModel`

**C.** `TypedDict`

**D.** `NamedTuple`

---

### 解答・解説

**正解: B**

FastAPI は Pydantic を使用してリクエストボディをバリデーション：

```python
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str

@app.post("/users")
def create_user(user: UserCreate):
    return user
```

---

## 次のステップ

FastAPI 入門を学びました。次はバリデーションとエラー処理を学びましょう。

**次の単元**: [Phase 2-2: バリデーション](./02_バリデーション.md)
