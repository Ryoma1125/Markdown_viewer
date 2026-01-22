# Phase 3-2: OAuth 2.0 実装

## 学習目標

この単元を終えると、以下ができるようになります：

- OAuth 2.0 の認可フローを実装できる
- PKCE を実装できる
- トークンの管理ができる

## 環境構築

```bash
pip install httpx authlib
```

## ハンズオン

### 演習1: Authorization Code Flow (サーバーサイド)

```python
# oauth_server.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
import httpx
import secrets
from urllib.parse import urlencode

app = FastAPI()

# 設定（Google Cloud Console で取得）
CLIENT_ID = 'your-client-id.apps.googleusercontent.com'
CLIENT_SECRET = 'your-client-secret'
REDIRECT_URI = 'http://localhost:8000/callback'

# State 保存（本番では Redis）
states = {}

@app.get('/login')
async def login():
    """OAuth ログイン開始"""
    state = secrets.token_urlsafe(32)
    states[state] = True  # 保存
    
    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid profile email',
        'state': state,
        'access_type': 'offline',
    }
    
    url = f'https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}'
    return RedirectResponse(url)

@app.get('/callback')
async def callback(code: str = None, state: str = None, error: str = None):
    """OAuth コールバック"""
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    # State 検証
    if state not in states:
        raise HTTPException(status_code=400, detail='Invalid state')
    del states[state]
    
    # 認可コードをトークンに交換
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://oauth2.googleapis.com/token',
            data={
                'client_id': CLIENT_ID,
                'client_secret': CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': REDIRECT_URI,
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail='Token exchange failed')
        
        tokens = response.json()
    
    # ユーザー情報を取得
    async with httpx.AsyncClient() as client:
        response = await client.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            headers={'Authorization': f'Bearer {tokens["access_token"]}'}
        )
        user_info = response.json()
    
    return {
        'user': user_info,
        'access_token': tokens['access_token'][:20] + '...',
    }
```

### 演習2: PKCE の実装

```python
# pkce.py
import base64
import hashlib
import secrets

def generate_pkce_pair():
    """PKCE の code_verifier と code_challenge を生成"""
    # code_verifier: 43-128文字のランダム文字列
    code_verifier = secrets.token_urlsafe(64)
    
    # code_challenge: verifier の SHA256 ハッシュを Base64URL エンコード
    digest = hashlib.sha256(code_verifier.encode()).digest()
    code_challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
    
    return code_verifier, code_challenge

# 使用例
verifier, challenge = generate_pkce_pair()
print(f'Verifier: {verifier}')
print(f'Challenge: {challenge}')
```

### 演習3: PKCE フロー全体

```python
# pkce_oauth.py
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
import httpx
import secrets
import hashlib
import base64
from urllib.parse import urlencode

app = FastAPI()

CLIENT_ID = 'your-client-id'
REDIRECT_URI = 'http://localhost:8000/callback'

# 状態保存
auth_states = {}

def generate_pkce():
    verifier = secrets.token_urlsafe(64)
    digest = hashlib.sha256(verifier.encode()).digest()
    challenge = base64.urlsafe_b64encode(digest).rstrip(b'=').decode()
    return verifier, challenge

@app.get('/login')
async def login():
    state = secrets.token_urlsafe(32)
    verifier, challenge = generate_pkce()
    
    # 保存
    auth_states[state] = {'verifier': verifier}
    
    params = {
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'response_type': 'code',
        'scope': 'openid profile email',
        'state': state,
        'code_challenge': challenge,
        'code_challenge_method': 'S256',
    }
    
    url = f'https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}'
    return RedirectResponse(url)

@app.get('/callback')
async def callback(code: str, state: str):
    if state not in auth_states:
        raise HTTPException(status_code=400, detail='Invalid state')
    
    verifier = auth_states[state]['verifier']
    del auth_states[state]
    
    # トークン交換（PKCE）
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://oauth2.googleapis.com/token',
            data={
                'client_id': CLIENT_ID,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': REDIRECT_URI,
                'code_verifier': verifier,  # Secret の代わり
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail='Token exchange failed')
        
        return response.json()
```

### 演習4: Authlib を使った実装

```python
# authlib_oauth.py
from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
import secrets

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key=secrets.token_hex(32))

oauth = OAuth()
oauth.register(
    name='google',
    client_id='your-client-id',
    client_secret='your-client-secret',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid profile email'}
)

@app.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get('/callback')
async def callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user = token.get('userinfo')
    return {'user': user}
```

## トークンの保存場所

| 場所 | セキュリティ | 用途 |
|------|------------|------|
| Cookie (HttpOnly) | 高 | サーバーサイド |
| localStorage | 低（XSS 脆弱） | 非推奨 |
| sessionStorage | 中 | タブごと |
| メモリ | 高 | SPA（短時間） |

## 理解度確認

### 問題

PKCE の code_challenge は何から生成されるか。

**A.** client_secret

**B.** access_token

**C.** code_verifier

**D.** state

---

### 解答・解説

**正解: C**

```python
code_challenge = base64url(sha256(code_verifier))
```

認可サーバーは、トークン交換時に受け取った code_verifier をハッシュ化し、最初に受け取った code_challenge と一致するか検証します。

---

## 次のステップ

OAuth 2.0 実装を学びました。次は OpenID Connect を学びましょう。

**次の単元**: [Phase 4-1: OpenID Connect](../phase4/01_OpenIDConnect.md)
