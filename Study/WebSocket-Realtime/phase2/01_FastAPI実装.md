# Phase 2-1: FastAPI 実装

## 学習目標

この単元を終えると、以下ができるようになります：

- FastAPI で WebSocket を実装できる
- 接続管理を実装できる
- ブロードキャストを実装できる

## FastAPI WebSocket 基礎

```python
# basic_fastapi_ws.py
from fastapi import FastAPI, WebSocket

app = FastAPI()

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f'Echo: {data}')
```

## ハンズオン

### 演習1: 基本的な WebSocket エンドポイント

```python
# fastapi_ws.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()

# テスト用 HTML ページ
html = """
<!DOCTYPE html>
<html>
<body>
    <h1>WebSocket Test</h1>
    <input type="text" id="message" placeholder="Enter message">
    <button onclick="sendMessage()">Send</button>
    <ul id="messages"></ul>
    
    <script>
        const ws = new WebSocket('ws://localhost:8000/ws');
        
        ws.onmessage = function(event) {
            const messages = document.getElementById('messages');
            const li = document.createElement('li');
            li.textContent = event.data;
            messages.appendChild(li);
        };
        
        function sendMessage() {
            const input = document.getElementById('message');
            ws.send(input.value);
            input.value = '';
        }
    </script>
</body>
</html>
"""

@app.get('/')
async def get():
    return HTMLResponse(html)

@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'You said: {data}')
    
    except WebSocketDisconnect:
        print('Client disconnected')
```

### 演習2: 接続マネージャー

```python
# connection_manager.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

app = FastAPI()
manager = ConnectionManager()

@app.websocket('/ws/{client_id}')
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket)
    
    try:
        # 参加通知
        await manager.broadcast(f'{client_id} joined the chat')
        
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(f'{client_id}: {data}')
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f'{client_id} left the chat')
```

### 演習3: JSON メッセージ

```python
# json_messages.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional
import json
from datetime import datetime

class Message(BaseModel):
    type: str
    content: str
    sender: Optional[str] = None
    timestamp: Optional[str] = None

app = FastAPI()
connections = {}

@app.websocket('/ws/{user_id}')
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await websocket.accept()
    connections[user_id] = websocket
    
    try:
        while True:
            data = await websocket.receive_json()
            
            message = Message(
                type=data.get('type', 'message'),
                content=data.get('content', ''),
                sender=user_id,
                timestamp=datetime.now().isoformat()
            )
            
            # 全員に送信
            for uid, ws in connections.items():
                await ws.send_json(message.dict())
    
    except WebSocketDisconnect:
        del connections[user_id]
        
        # 退出通知
        for ws in connections.values():
            await ws.send_json({
                'type': 'system',
                'content': f'{user_id} left',
                'timestamp': datetime.now().isoformat()
            })
```

### 演習4: 認証付き WebSocket

```python
# authenticated_ws.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException
import jwt

app = FastAPI()
SECRET_KEY = 'your-secret-key'

async def get_current_user(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.InvalidTokenError:
        return None

@app.websocket('/ws')
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...)
):
    # トークン検証
    user = await get_current_user(token)
    if not user:
        await websocket.close(code=4001, reason='Unauthorized')
        return
    
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'{user["username"]}: {data}')
    
    except WebSocketDisconnect:
        pass

# クライアント側
# const ws = new WebSocket('ws://localhost:8000/ws?token=...');
```

### 演習5: ルーム機能

```python
# rooms.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from collections import defaultdict
from typing import Dict, Set

class RoomManager:
    def __init__(self):
        self.rooms: Dict[str, Set[WebSocket]] = defaultdict(set)
    
    async def join_room(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        self.rooms[room_id].add(websocket)
    
    def leave_room(self, room_id: str, websocket: WebSocket):
        self.rooms[room_id].discard(websocket)
        if not self.rooms[room_id]:
            del self.rooms[room_id]
    
    async def broadcast_to_room(self, room_id: str, message: str, exclude: WebSocket = None):
        for ws in self.rooms[room_id]:
            if ws != exclude:
                await ws.send_text(message)

app = FastAPI()
manager = RoomManager()

@app.websocket('/ws/{room_id}/{user_id}')
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: str,
    user_id: str
):
    await manager.join_room(room_id, websocket)
    await manager.broadcast_to_room(room_id, f'{user_id} joined room {room_id}')
    
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_to_room(room_id, f'{user_id}: {data}')
    
    except WebSocketDisconnect:
        manager.leave_room(room_id, websocket)
        await manager.broadcast_to_room(room_id, f'{user_id} left room {room_id}')
```

## 理解度確認

### 問題

FastAPI で WebSocket の切断を検知するにはどうするか。

**A.** websocket.is_closed を確認

**B.** WebSocketDisconnect 例外をキャッチ

**C.** websocket.close() を呼ぶ

**D.** タイムアウトを設定

---

### 解答・解説

**正解: B**

FastAPI では `WebSocketDisconnect` 例外をキャッチすることでクライアントの切断を検知できます。

```python
try:
    while True:
        data = await websocket.receive_text()
except WebSocketDisconnect:
    # 切断処理
```

---

## 次のステップ

FastAPI 実装を学びました。次はクライアント実装を学びましょう。

**次の単元**: [Phase 2-2: クライアント実装](./02_クライアント実装.md)
