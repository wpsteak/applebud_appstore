# Applebud App Store MVP Google Sheets 欄位定義稿

## 1. 文件目的

本文件用來定義 MVP 階段 Google Sheets 的實際欄位。

目的有兩個：

- 讓 Apps Script 讀寫資料時有固定欄位可依循
- 讓前面 API 與 route 文件可以對應到實際資料表

本文件以目前已確認的方向為前提：

- 核心產品是便利貼牆
- 後端使用 Google Apps Script
- 資料儲存使用 Google Sheets
- 工作表控制在三張內
- 不存詳細行為 log

## 2. 工作表總覽

第一版預計使用以下三張工作表：

1. `posts`
2. `categories`
3. `config`

## 3. 設計原則

### 3.1 命名原則

- 欄位名稱統一使用小寫 snake_case
- key 欄位名稱盡量固定
- 與 API 對外欄位可不同，但內部命名先保持穩定

### 3.2 資料原則

- 盡量打扁
- 不做複雜關聯
- 不追求資料庫正規化
- 優先支援首頁、貼文 CRUD、分類與權限

### 3.3 MVP 邊界

- 不存詳細點閱 log
- 不存留言資料
- 不存收藏資料
- 不存操作審計紀錄

## 4. `posts` 工作表

### 4.1 用途

- 儲存便利貼牆主資料

### 4.2 欄位定義

| 欄位名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `id` | string | 是 | 貼文唯一 ID |
| `title` | string | 是 | 貼文標題 |
| `summary` | string | 否 | 貼文摘要 |
| `content` | string | 是 | 貼文內文 |
| `category_key` | string | 是 | 分類 key，對應 `categories.key` |
| `author_email` | string | 是 | 作者公司 email |
| `author_name` | string | 是 | 作者名稱 |
| `status` | string | 是 | 貼文狀態，MVP 先用 `published` / `archived` |
| `is_featured` | boolean | 是 | 是否精選 |
| `view_count` | number | 是 | 彙總點閱數 |
| `created_at` | string | 是 | 建立時間，ISO 8601 |
| `updated_at` | string | 是 | 更新時間，ISO 8601 |
| `published_at` | string | 是 | 發佈時間，ISO 8601 |

### 4.3 建議欄位順序

1. `id`
2. `title`
3. `summary`
4. `content`
5. `category_key`
6. `author_email`
7. `author_name`
8. `status`
9. `is_featured`
10. `view_count`
11. `created_at`
12. `updated_at`
13. `published_at`

### 4.4 欄位規則

#### `id`

- 由系統產生
- 不可重複
- 建議格式：

`post_20260402_0001`

或

`post_xxxxx`

重點是唯一即可。

#### `status`

第一版先固定兩種：

- `published`
- `archived`

#### `is_featured`

可接受值：

- `TRUE`
- `FALSE`

預設值：

- `FALSE`

#### `view_count`

規則：

- 預設值為 `0`
- 只作為排序訊號
- 不作為精準流量分析資料

### 4.5 範例資料

| id | title | summary | content | category_key | author_email | author_name | status | is_featured | view_count | created_at | updated_at | published_at |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `post_20260402_0001` | `如何整理 AI Bot SOP` | `整理一份實際流程` | `完整內容...` | `skill` | `user@company.com` | `王小明` | `published` | `FALSE` | `12` | `2026-04-02T11:30:00+08:00` | `2026-04-02T11:30:00+08:00` | `2026-04-02T11:30:00+08:00` |

## 5. `categories` 工作表

### 5.1 用途

- 儲存便利貼牆分類

### 5.2 欄位定義

| 欄位名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `key` | string | 是 | 分類唯一 key |
| `name` | string | 是 | 分類顯示名稱 |
| `sort_order` | number | 是 | 排序用數字 |
| `is_active` | boolean | 是 | 是否啟用 |

### 5.3 建議欄位順序

1. `key`
2. `name`
3. `sort_order`
4. `is_active`

### 5.4 暫定分類資料

| key | name | sort_order | is_active |
| --- | --- | --- | --- |
| `tool` | `小工具` | `1` | `TRUE` |
| `skill` | `Skills` | `2` | `TRUE` |
| `prompt` | `Prompts` | `3` | `TRUE` |
| `gem` | `Gems` | `4` | `TRUE` |
| `case` | `案例分享` | `5` | `TRUE` |

### 5.5 欄位規則

#### `key`

- 不可重複
- 建議只使用英文小寫與底線或簡單字串

#### `is_active`

用途：

- 停用分類但不必刪除資料

## 6. `config` 工作表

### 6.1 用途

- 儲存少量系統設定

第一版不再另外開 `admins` 表，因此管理者與系統設定放在同一張。

### 6.2 建議欄位

| 欄位名稱 | 型別 | 必填 | 說明 |
| --- | --- | --- | --- |
| `key` | string | 是 | 設定鍵值 |
| `value` | string | 是 | 設定內容 |
| `description` | string | 否 | 說明 |

### 6.3 建議欄位順序

1. `key`
2. `value`
3. `description`

### 6.4 建議設定項目

| key | value | description |
| --- | --- | --- |
| `company_domain` | `company.com` | `允許登入的公司網域` |
| `admin_emails` | `admin1@company.com,admin2@company.com` | `管理者 email 清單，以逗號分隔` |
| `home_featured_limit` | `5` | `首頁精選顯示數量` |
| `home_latest_limit` | `10` | `首頁最新張貼顯示數量` |
| `home_top_limit` | `10` | `首頁總排行顯示數量` |

### 6.5 欄位規則

#### `admin_emails`

格式：

- 先用逗號分隔字串即可

說明：

- MVP 階段先用這種簡單做法
- 若未來管理者屬性變複雜，再拆成獨立工作表

## 7. 欄位與 API 對應

為了避免前後端命名混亂，先定義以下對應原則。

### 7.1 `posts`

Sheet 欄位對應 API 欄位：

| Sheet | API |
| --- | --- |
| `id` | `id` |
| `title` | `title` |
| `summary` | `summary` |
| `content` | `content` |
| `category_key` | `categoryKey` |
| `author_email` | `authorEmail` |
| `author_name` | `authorName` |
| `status` | `status` |
| `is_featured` | `isFeatured` |
| `view_count` | `viewCount` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `published_at` | `publishedAt` |

### 7.2 `categories`

| Sheet | API |
| --- | --- |
| `key` | `key` |
| `name` | `name` |
| `sort_order` | `sortOrder` |
| `is_active` | `isActive` |

## 8. 實作注意事項

### 8.1 標題列固定

每張工作表第一列固定為欄位名稱，不應在中途更改順序。

原因：

- Apps Script 讀寫時會依欄位名稱映射
- 若欄位順序經常改動，容易出錯

### 8.2 型別一致性

雖然 Google Sheets 沒有嚴格型別，但 Apps Script 端需要自行維持欄位一致性：

- `is_featured` / `is_active` 當作 boolean 使用
- `view_count` / `sort_order` 當作 number 使用
- 時間欄位統一輸出為字串

### 8.3 空值處理

建議：

- `summary` 可允許空字串
- 其他必填欄位不可留空

## 9. MVP 階段不納入的欄位

以下欄位目前不建議先加入：

- `like_count`
- `bookmark_count`
- `comment_count`
- `archived_reason`
- `updated_by`
- `last_viewed_at`
- `slug`

原因：

- 目前需求不需要
- 加入太早會讓資料模型膨脹

## 10. 目前結論

Google Sheets 第一版欄位定義如下：

- `posts` 作為主表，承接大部分功能
- `categories` 管理少量分類
- `config` 管理公司網域、管理者與首頁設定

這樣的資料結構已足夠支撐：

- 公司帳號登入後的權限判斷
- 貼文建立、編輯、刪除
- 首頁精選、最新、總排行
- 管理者精選與下架

若要繼續往下推，下一步最適合做的是：

1. Apps Script 檔案結構草案
2. handler / service / repository 函式命名稿
3. 前端資料呼叫流程稿
