# Phase 1-2: TypeScript 実践

## 学習目標

この単元を終えると、以下ができるようになります：

- interface と type の使い分けができる
- ジェネリクスを使える
- 実践的な型定義ができる

## Interface vs Type

### interface

```typescript
// オブジェクトの形を定義
interface User {
    id: number;
    name: string;
    email: string;
}

// 拡張可能
interface Admin extends User {
    role: string;
    permissions: string[];
}

// 同名で追加定義（マージ）
interface User {
    age?: number;  // 追加される
}
```

### type

```typescript
// 型エイリアス
type UserId = number;
type Status = "active" | "inactive" | "pending";

// オブジェクト型
type User = {
    id: number;
    name: string;
};

// 交差型
type Admin = User & {
    role: string;
};

// Union型
type Response = Success | Error;
```

### 使い分け

| ケース | 推奨 |
|--------|------|
| オブジェクトの形 | interface |
| Union型 | type |
| API レスポンス | interface |
| 関数の型 | type |

## ジェネリクス

### 基本

```typescript
// 型パラメータ T
function identity<T>(value: T): T {
    return value;
}

// 使用時に型が決まる
const num = identity<number>(42);
const str = identity<string>("hello");

// 型推論
const inferred = identity(42);  // number と推論
```

### 配列のジェネリクス

```typescript
// 最初の要素を返す
function first<T>(arr: T[]): T | undefined {
    return arr[0];
}

const numbers = [1, 2, 3];
const firstNum = first(numbers);  // number | undefined

const names = ["Alice", "Bob"];
const firstName = first(names);  // string | undefined
```

### 複数の型パラメータ

```typescript
// Python の dict[K, V] に相当
function mapObject<K extends string, V>(
    obj: Record<K, V>,
    fn: (value: V) => V
): Record<K, V> {
    const result = {} as Record<K, V>;
    for (const key in obj) {
        result[key] = fn(obj[key]);
    }
    return result;
}
```

### 制約付きジェネリクス

```typescript
// length プロパティを持つ型に制限
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(item: T): void {
    console.log(item.length);
}

logLength("hello");      // OK
logLength([1, 2, 3]);    // OK
logLength({ length: 5 }); // OK
// logLength(123);       // エラー: number に length がない
```

## 実践的な型定義

### API レスポンス

```typescript
// API レスポンスの型
interface ApiResponse<T> {
    data: T;
    status: "success" | "error";
    message?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

// 使用例
async function fetchUser(id: number): Promise<ApiResponse<User>> {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
}

// 配列の場合
async function fetchUsers(): Promise<ApiResponse<User[]>> {
    const response = await fetch("/api/users");
    return response.json();
}
```

### React コンポーネントの Props

```typescript
// Props の型定義
interface ButtonProps {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
    disabled?: boolean;
}

// 子要素を受け取る場合
interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}
```

### フォームの型

```typescript
interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface SignupForm {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}
```

## ユーティリティ型

### よく使うもの

```typescript
interface User {
    id: number;
    name: string;
    email: string;
    age: number;
}

// Partial: 全てオプショナルに
type UpdateUser = Partial<User>;
// { id?: number; name?: string; ... }

// Required: 全て必須に
type CompleteUser = Required<User>;

// Pick: 特定のプロパティのみ
type UserName = Pick<User, "id" | "name">;
// { id: number; name: string }

// Omit: 特定のプロパティを除外
type UserWithoutId = Omit<User, "id">;
// { name: string; email: string; age: number }

// Record: キーと値の型を指定
type UserMap = Record<string, User>;
// { [key: string]: User }
```

### 実践例

```typescript
// 更新用の型
interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// 作成時（id と日時は自動生成）
type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;

// 更新時（全てオプショナル）
type UpdateUserInput = Partial<Omit<User, "id" | "createdAt" | "updatedAt">>;
```

## ハンズオン

### 演習1: API レスポンスの型

```typescript
// 以下のAPIレスポンスの型を定義せよ

// GET /api/products
// {
//   "data": [
//     { "id": 1, "name": "iPhone", "price": 99800, "stock": 10 },
//     { "id": 2, "name": "MacBook", "price": 198000, "stock": 5 }
//   ],
//   "total": 2,
//   "page": 1
// }
```

<details>
<summary>解答</summary>

```typescript
interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

interface ProductListResponse {
    data: Product[];
    total: number;
    page: number;
}
```
</details>

### 演習2: ジェネリック関数

```typescript
// TODO: ジェネリクスを使って実装

// 配列をシャッフルする関数
function shuffle(arr) {
    // 実装
}

// オブジェクトのキーを配列で返す関数
function keys(obj) {
    // 実装
}
```

<details>
<summary>解答</summary>

```typescript
function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function keys<T extends object>(obj: T): (keyof T)[] {
    return Object.keys(obj) as (keyof T)[];
}
```
</details>

## 理解度確認

### 問題

`Partial<User>` が返す型の特徴はどれか。

```typescript
interface User {
    id: number;
    name: string;
}
```

**A.** 全てのプロパティが必須になる

**B.** 全てのプロパティがオプショナルになる

**C.** 全てのプロパティが readonly になる

**D.** 全てのプロパティが nullable になる

---

### 解答・解説

**正解: B**

```typescript
type PartialUser = Partial<User>;
// { id?: number; name?: string; }
```

`Partial<T>` は全プロパティをオプショナル（`?`）にします。

---

## 次のステップ

TypeScript 実践を学びました。次は React を学びましょう。

**次の単元**: [Phase 2-1: React 入門](../phase2/01_React入門.md)
