# Phase 1-2: pytest 入門

## 学習目標

この単元を終えると、以下ができるようになります：

- pytest でテストを実行できる
- アサーションを使いこなせる
- フィクスチャを使える

## 環境構築

```bash
pip install pytest pytest-cov
```

## ハンズオン

### 演習1: 最初のテスト

```python
# calculator.py
def add(a: int, b: int) -> int:
    return a + b

def subtract(a: int, b: int) -> int:
    return a - b

def multiply(a: int, b: int) -> int:
    return a * b

def divide(a: int, b: int) -> float:
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b
```

```python
# test_calculator.py
from calculator import add, subtract, multiply, divide
import pytest

def test_add():
    assert add(1, 2) == 3

def test_subtract():
    assert subtract(5, 3) == 2

def test_multiply():
    assert multiply(3, 4) == 12

def test_divide():
    assert divide(10, 2) == 5.0

def test_divide_by_zero():
    with pytest.raises(ValueError):
        divide(10, 0)
```

```bash
# テスト実行
pytest                      # 全テスト
pytest test_calculator.py   # 特定ファイル
pytest -v                   # 詳細表示
pytest -k "add"             # 名前でフィルタ
pytest --tb=short           # トレースバック短縮
```

### 演習2: アサーション

```python
import pytest

def test_assertions():
    # 等価
    assert 1 + 1 == 2
    
    # 不等価
    assert 1 != 2
    
    # 比較
    assert 5 > 3
    assert 3 <= 5
    
    # 真偽
    assert True
    assert not False
    
    # None
    assert None is None
    value = "hello"
    assert value is not None
    
    # 含む
    assert "hello" in "hello world"
    assert 1 in [1, 2, 3]
    
    # 型
    assert isinstance(1, int)
    
    # 近似値（浮動小数点）
    assert 0.1 + 0.2 == pytest.approx(0.3)

def test_exception():
    # 例外が発生することを確認
    with pytest.raises(ValueError) as exc_info:
        raise ValueError("Invalid value")
    
    assert "Invalid" in str(exc_info.value)

def test_exception_match():
    # 正規表現でメッセージを確認
    with pytest.raises(ValueError, match=r"Invalid.*"):
        raise ValueError("Invalid input")
```

### 演習3: フィクスチャ

```python
import pytest

# 基本的なフィクスチャ
@pytest.fixture
def sample_user():
    return {
        "id": 1,
        "name": "John",
        "email": "john@example.com"
    }

def test_user_has_name(sample_user):
    assert sample_user["name"] == "John"

def test_user_has_email(sample_user):
    assert "example.com" in sample_user["email"]

# スコープ
@pytest.fixture(scope="module")
def db_connection():
    """モジュール内で1回だけ作成"""
    conn = create_connection()
    yield conn
    conn.close()

@pytest.fixture(scope="session")
def app():
    """テストセッション全体で1回だけ作成"""
    return create_app()

# セットアップ / ティアダウン
@pytest.fixture
def temp_file():
    # セットアップ
    file = open("temp.txt", "w")
    file.write("test")
    file.close()
    
    yield "temp.txt"  # テストに渡す
    
    # ティアダウン
    import os
    os.remove("temp.txt")

def test_temp_file(temp_file):
    with open(temp_file) as f:
        assert f.read() == "test"
```

### 演習4: conftest.py

```python
# conftest.py - 共通フィクスチャ
import pytest

@pytest.fixture
def api_client():
    from app import create_app
    app = create_app()
    return app.test_client()

@pytest.fixture
def auth_token(api_client):
    response = api_client.post("/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    return response.json()["token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}
```

### 演習5: パラメータ化

```python
import pytest
from calculator import add, divide

# 複数のテストケースを1つの関数で
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add_parametrized(a, b, expected):
    assert add(a, b) == expected

# ID付き
@pytest.mark.parametrize("a, b, expected", [
    pytest.param(1, 2, 3, id="positive"),
    pytest.param(-1, -2, -3, id="negative"),
    pytest.param(0, 0, 0, id="zero"),
])
def test_add_with_ids(a, b, expected):
    assert add(a, b) == expected

# 複数のパラメータを組み合わせ
@pytest.mark.parametrize("a", [1, 2, 3])
@pytest.mark.parametrize("b", [10, 20])
def test_multiply_combinations(a, b):
    result = a * b
    assert result == a * b
```

### 演習6: マーカー

```python
import pytest
import sys

# スキップ
@pytest.mark.skip(reason="Not implemented yet")
def test_not_implemented():
    pass

# 条件付きスキップ
@pytest.mark.skipif(sys.platform == "win32", reason="Unix only")
def test_unix_only():
    pass

# 失敗を期待
@pytest.mark.xfail(reason="Known bug")
def test_known_bug():
    assert 1 == 2

# カスタムマーカー
@pytest.mark.slow
def test_slow_operation():
    import time
    time.sleep(5)

# pytest.ini でマーカー定義
"""
[pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
"""

# 実行時にフィルタ
# pytest -m "not slow"       # slowをスキップ
# pytest -m "integration"    # integrationのみ
```

## テストの構成

```
project/
├── src/
│   └── myapp/
│       ├── __init__.py
│       └── calculator.py
├── tests/
│   ├── conftest.py          # 共通フィクスチャ
│   ├── unit/
│   │   ├── test_calculator.py
│   │   └── test_utils.py
│   └── integration/
│       └── test_api.py
└── pytest.ini
```

```ini
# pytest.ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

## 理解度確認

### 問題

pytest で例外が発生することをテストするために使用するのはどれか。

**A.** `pytest.throws`

**B.** `pytest.raises`

**C.** `pytest.exception`

**D.** `pytest.error`

---

### 解答・解説

**正解: B**

```python
with pytest.raises(ValueError):
    raise ValueError("error")
```

例外のメッセージを確認する場合：
```python
with pytest.raises(ValueError, match="error"):
    raise ValueError("error message")
```

---

## 次のステップ

pytest 入門を学びました。次は単体テストを学びましょう。

**次の単元**: [Phase 2-1: 単体テスト](../phase2/01_単体テスト.md)
