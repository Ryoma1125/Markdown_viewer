# Phase 2-1: SELECT 基礎 ～ データを取得する ～

## 学習目標

この単元を終えると、以下ができるようになります：

- SELECT 文でデータを取得できる
- WHERE 句で条件を指定できる
- ORDER BY で並び替えができる
- LIMIT で取得件数を制限できる

## 概念解説

### SELECT 文の構造

```sql
SELECT 列名1, 列名2, ...    -- 取得する列
FROM テーブル名              -- 対象テーブル
WHERE 条件                  -- 絞り込み（任意）
ORDER BY 列名               -- 並び替え（任意）
LIMIT 件数;                 -- 取得件数制限（任意）
```

### 実行順序

```mermaid
graph LR
    A[FROM] --> B[WHERE]
    B --> C[SELECT]
    C --> D[ORDER BY]
    D --> E[LIMIT]
```

## ハンズオン

### 演習0: サンプルデータ準備

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 既存テーブルをリセット
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;

-- ユーザーテーブル
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    department VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 注文テーブル
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    quantity INT DEFAULT 1,
    ordered_at DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- サンプルデータ挿入
INSERT INTO users (name, email, age, department) VALUES
    ('田中太郎', 'tanaka@example.com', 28, '開発部'),
    ('佐藤花子', 'sato@example.com', 32, '営業部'),
    ('鈴木一郎', 'suzuki@example.com', 25, '開発部'),
    ('高橋美咲', 'takahashi@example.com', 30, '人事部'),
    ('伊藤健太', 'ito@example.com', 35, '開発部'),
    ('渡辺さくら', 'watanabe@example.com', 27, '営業部'),
    ('山本翔', 'yamamoto@example.com', 29, '開発部'),
    ('中村愛', 'nakamura@example.com', NULL, '営業部');

INSERT INTO orders (user_id, product, price, quantity, ordered_at) VALUES
    (1, 'ノートPC', 150000, 1, '2024-01-15'),
    (1, 'マウス', 3000, 2, '2024-01-15'),
    (2, 'キーボード', 8000, 1, '2024-01-20'),
    (3, 'モニター', 45000, 1, '2024-02-01'),
    (1, 'USBハブ', 2500, 1, '2024-02-10'),
    (4, 'ヘッドセット', 12000, 1, '2024-02-15'),
    (5, 'ノートPC', 180000, 1, '2024-03-01'),
    (2, 'マウス', 3000, 1, '2024-03-05'),
    (6, 'Webカメラ', 8000, 1, '2024-03-10');

SELECT 'データ準備完了' AS status;
EOF
```

### 演習1: 基本的な SELECT

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 全列を取得
SELECT * FROM users;

-- 特定の列を取得
SELECT name, email FROM users;

-- 列に別名をつける
SELECT name AS 名前, email AS メールアドレス FROM users;

-- 重複を除く
SELECT DISTINCT department FROM users;
EOF
```

### 演習2: WHERE による絞り込み

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 等価条件
SELECT * FROM users WHERE department = '開発部';

-- 数値比較
SELECT * FROM users WHERE age >= 30;

-- 複合条件（AND）
SELECT * FROM users WHERE department = '開発部' AND age >= 28;

-- 複合条件（OR）
SELECT * FROM users WHERE department = '開発部' OR department = '営業部';

-- IN 演算子
SELECT * FROM users WHERE department IN ('開発部', '営業部');

-- BETWEEN（範囲）
SELECT * FROM users WHERE age BETWEEN 25 AND 30;

-- LIKE（部分一致）
SELECT * FROM users WHERE name LIKE '%田%';      -- 含む
SELECT * FROM users WHERE email LIKE '%@example.com';  -- 後方一致

-- NULL の扱い
SELECT * FROM users WHERE age IS NULL;
SELECT * FROM users WHERE age IS NOT NULL;
EOF
```

### 演習3: ORDER BY による並び替え

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 昇順（デフォルト）
SELECT * FROM users ORDER BY age;

-- 降順
SELECT * FROM users ORDER BY age DESC;

-- NULL の扱い（NULL は最初か最後に来る）
SELECT name, age FROM users ORDER BY age;

-- 複数列で並び替え
SELECT * FROM users ORDER BY department, age DESC;
EOF
```

### 演習4: LIMIT と OFFSET

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 最初の3件
SELECT * FROM users LIMIT 3;

-- 3件目から5件（ページネーション）
SELECT * FROM users LIMIT 5 OFFSET 2;
-- または
SELECT * FROM users LIMIT 2, 5;

-- 年齢上位3名
SELECT name, age FROM users 
WHERE age IS NOT NULL
ORDER BY age DESC 
LIMIT 3;
EOF
```

### 演習5: 算術演算と関数

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- 計算
SELECT product, price, quantity, price * quantity AS total
FROM orders;

-- 文字列関数
SELECT name, LENGTH(name) AS name_length FROM users;
SELECT CONCAT(name, ' (', department, ')') AS profile FROM users;
SELECT UPPER(email) FROM users;

-- 日付関数
SELECT product, ordered_at, 
       YEAR(ordered_at) AS year,
       MONTH(ordered_at) AS month
FROM orders;

-- 現在日時
SELECT NOW(), CURDATE(), CURTIME();
EOF
```

### 演習6: 条件式

```bash
docker exec -it mysql-practice mysql -u student -pstudentpass practice << 'EOF'
-- CASE 式
SELECT name, age,
    CASE 
        WHEN age >= 30 THEN 'シニア'
        WHEN age >= 25 THEN 'ミドル'
        ELSE 'ジュニア'
    END AS level
FROM users
WHERE age IS NOT NULL;

-- IF 関数
SELECT name, age,
    IF(age >= 30, 'シニア', 'ジュニア') AS category
FROM users
WHERE age IS NOT NULL;

-- COALESCE（NULL の場合のデフォルト値）
SELECT name, COALESCE(age, 0) AS age FROM users;
EOF
```

## 現場でよくある落とし穴

| 落とし穴 | 説明 | 対策 |
|---------|------|------|
| SELECT * の多用 | 不要な列も取得、パフォーマンス低下 | 必要な列だけ指定 |
| NULL の比較に = を使う | NULL = NULL は FALSE | IS NULL を使う |
| LIMIT なしで大量データ取得 | メモリ不足、遅延 | LIMIT を必ず付ける |

## 理解度確認

### 問題

users テーブルから、開発部に所属する30歳以上のユーザーを年齢の降順で取得し、最初の5件だけ表示するSQLとして正しいものはどれか。

**A.**
```sql
SELECT * FROM users 
WHERE department = '開発部' AND age >= 30 
LIMIT 5 
ORDER BY age DESC;
```

**B.**
```sql
SELECT * FROM users 
WHERE department = '開発部' AND age >= 30 
ORDER BY age DESC 
LIMIT 5;
```

**C.**
```sql
SELECT * FROM users 
ORDER BY age DESC 
WHERE department = '開発部' AND age >= 30 
LIMIT 5;
```

**D.**
```sql
SELECT * FROM users 
WHERE department = '開発部' OR age >= 30 
ORDER BY age DESC 
LIMIT 5;
```

---

### 解答・解説

**正解: B**

SQL の句の順序は決まっています：
`SELECT → FROM → WHERE → ORDER BY → LIMIT`

- **A.** 誤り。LIMIT と ORDER BY の順序が逆。
- **B.** 正解。句の順序が正しく、条件も AND で正しい。
- **C.** 誤り。ORDER BY が WHERE より前に来ている。
- **D.** 誤り。OR を使うと「開発部または30歳以上」になり、条件が異なる。

---

## まとめ

| 句 | 役割 | 例 |
|----|------|-----|
| SELECT | 取得する列 | SELECT name, age |
| FROM | 対象テーブル | FROM users |
| WHERE | 絞り込み条件 | WHERE age >= 30 |
| ORDER BY | 並び替え | ORDER BY age DESC |
| LIMIT | 取得件数制限 | LIMIT 10 |

## 次のステップ

SELECT でデータを取得する方法を学びました。次はデータを追加・更新・削除する方法を学びましょう。

**次の単元**: [Phase 2-2: データ操作](./02_データ操作.md)
