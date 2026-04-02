# Applebud App Store MVP Apps Script Route 設計稿

## 1. 文件目的

本文件用來把 [Apps Script API規格草案.md](/Users/pin/Code/applebud/appstore/Apps%20Script%20API%E8%A6%8F%E6%A0%BC%E8%8D%89%E6%A1%88.md) 轉成適合 Google Apps Script 的實際 route 形式。

目的不是改變 API 語意，而是把它映射成 Apps Script 比較容易落地的結構。

## 2. 設計原則

Apps Script 不像一般後端框架有完整 router，因此第一版先採：

- 一個 Web App 入口
- 透過 `doGet(e)` / `doPost(e)` 分流
- 使用 `action` 參數決定要執行的操作

這樣做的理由：

- 實作簡單
- 前端容易呼叫
- MVP 階段足夠清楚

## 3. API 入口形式

假設 Web App base URL 為：

`/exec`

則第一版 API 入口統一為：

- `GET /exec?action=...`
- `POST /exec?action=...`

## 4. Route 對應策略

### 4.1 `GET` 用途

`GET` 只處理讀取類操作，例如：

- 取得目前使用者資訊
- 取得首頁資料
- 取得分類
- 取得貼文列表
- 取得單篇貼文

### 4.2 `POST` 用途

`POST` 處理所有會改變資料的操作，例如：

- 建立貼文
- 編輯貼文
- 刪除貼文
- 增加點閱
- 設定精選
- 取消精選
- 下架貼文

說明：

- Apps Script 對 `PUT` / `DELETE` 支援不自然
- MVP 階段直接統一用 `POST` 會比較務實

## 5. Action 一覽

### 5.1 GET actions

- `getMe`
- `getHome`
- `getCategories`
- `getPosts`
- `getPost`

### 5.2 POST actions

- `createPost`
- `updatePost`
- `deletePost`
- `incrementPostView`
- `featurePost`
- `unfeaturePost`
- `archivePost`

## 6. GET Route 規格

### 6.1 `GET /exec?action=getMe`

用途：

- 取得目前登入者資訊

參數：

- 無

對應 API 語意：

- `GET /me`

### 6.2 `GET /exec?action=getHome`

用途：

- 取得首頁所需資料

參數：

- 無

對應 API 語意：

- `GET /home`

回應資料建議包含：

- `featured`
- `latest`
- `top`

### 6.3 `GET /exec?action=getCategories`

用途：

- 取得分類列表

參數：

- 無

對應 API 語意：

- `GET /categories`

### 6.4 `GET /exec?action=getPosts`

用途：

- 取得貼文列表

查詢參數：

- `categoryKey`
- `authorEmail`
- `status`
- `sort`
- `page`
- `pageSize`

對應 API 語意：

- `GET /posts`

範例：

`/exec?action=getPosts&sort=latest&page=1&pageSize=20`

`/exec?action=getPosts&categoryKey=skill&sort=top`

### 6.5 `GET /exec?action=getPost&id=post_001`

用途：

- 取得單篇貼文

必要參數：

- `id`

對應 API 語意：

- `GET /posts/:id`

## 7. POST Route 規格

### 7.1 共用原則

所有 `POST` action 建議使用 JSON body。

Apps Script 端做法可統一為：

- 從 `e.postData.contents` 讀取原始字串
- `JSON.parse(...)`
- 取得 body 內容

共用請求格式：

```json
{
  "action": "createPost",
  "payload": {}
}
```

這樣做的好處：

- `doPost` 只需要解析一次 body
- action 與資料內容分離
- 前端呼叫格式一致

## 8. POST Action 詳細規格

### 8.1 `POST /exec`

#### `action: createPost`

用途：

- 建立新貼文

請求範例：

```json
{
  "action": "createPost",
  "payload": {
    "title": "標題",
    "summary": "摘要",
    "content": "內文",
    "categoryKey": "skill"
  }
}
```

對應 API 語意：

- `POST /posts`

### 8.2 `POST /exec`

#### `action: updatePost`

用途：

- 編輯既有貼文

請求範例：

```json
{
  "action": "updatePost",
  "payload": {
    "id": "post_001",
    "title": "更新後標題",
    "summary": "更新後摘要",
    "content": "更新後內文",
    "categoryKey": "inspiration"
  }
}
```

對應 API 語意：

- `PUT /posts/:id`

### 8.3 `POST /exec`

#### `action: deletePost`

用途：

- 刪除貼文

請求範例：

```json
{
  "action": "deletePost",
  "payload": {
    "id": "post_001"
  }
}
```

對應 API 語意：

- `DELETE /posts/:id`

### 8.4 `POST /exec`

#### `action: incrementPostView`

用途：

- 增加貼文 `viewCount`

請求範例：

```json
{
  "action": "incrementPostView",
  "payload": {
    "id": "post_001"
  }
}
```

對應 API 語意：

- `POST /posts/:id/view`

說明：

- `viewCount` 為彙總欄位
- 只作為排序訊號

### 8.5 `POST /exec`

#### `action: featurePost`

用途：

- 將貼文設為精選

請求範例：

```json
{
  "action": "featurePost",
  "payload": {
    "id": "post_001"
  }
}
```

對應 API 語意：

- `POST /posts/:id/feature`

### 8.6 `POST /exec`

#### `action: unfeaturePost`

用途：

- 取消精選

請求範例：

```json
{
  "action": "unfeaturePost",
  "payload": {
    "id": "post_001"
  }
}
```

對應 API 語意：

- `POST /posts/:id/unfeature`

### 8.7 `POST /exec`

#### `action: archivePost`

用途：

- 下架貼文

請求範例：

```json
{
  "action": "archivePost",
  "payload": {
    "id": "post_001",
    "reason": "內容需先下架"
  }
}
```

對應 API 語意：

- `POST /posts/:id/archive`

說明：

- `reason` 可先視為選填

## 9. 建議的 `doGet` / `doPost` 結構

### 9.1 `doGet(e)`

負責：

- 解析 `e.parameter.action`
- 驗證登入身份
- dispatch 到對應 handler
- 包裝統一回應格式

概念流程：

1. 讀取 `action`
2. 驗證是否為允許的 GET action
3. 驗證使用者身份
4. 呼叫對應 service function
5. 回傳 JSON

### 9.2 `doPost(e)`

負責：

- 解析 body JSON
- 取得 `action` 與 `payload`
- 驗證登入身份
- dispatch 到對應 handler
- 包裝統一回應格式

概念流程：

1. 解析 `e.postData.contents`
2. 取出 `action`
3. 驗證是否為允許的 POST action
4. 驗證使用者身份
5. 呼叫對應 service function
6. 回傳 JSON

## 10. 建議的程式分層

雖然是 Apps Script，還是建議做最小限度分層。

### 10.1 `routes`

責任：

- action 分派
- request parsing
- response formatting

### 10.2 `services`

責任：

- 貼文邏輯
- 首頁資料整理
- 權限判斷

### 10.3 `repositories`

責任：

- 讀寫 Google Sheets

### 10.4 `utils`

責任：

- 時間處理
- ID 產生
- 共用錯誤格式

說明：

- MVP 不必過度拆檔
- 但至少要把 route 跟 Sheet 操作分開

## 11. 錯誤處理建議

### 11.1 action 無效

若 `action` 不存在或不支援，回傳：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Unsupported action."
  }
}
```

### 11.2 權限不足

若不是公司帳號，或沒有操作權限，回傳：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "FORBIDDEN",
    "message": "User is not allowed to perform this action."
  }
}
```

### 11.3 找不到資料

若貼文不存在，回傳：

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "NOT_FOUND",
    "message": "Post not found."
  }
}
```

## 12. 呼叫範例

### 12.1 取得首頁

```http
GET /exec?action=getHome
```

### 12.2 建立貼文

```http
POST /exec
Content-Type: application/json
```

```json
{
  "action": "createPost",
  "payload": {
    "title": "如何設定機器人",
    "summary": "設定流程整理",
    "content": "完整內容",
    "categoryKey": "skill"
  }
}
```

### 12.3 設定精選

```http
POST /exec
Content-Type: application/json
```

```json
{
  "action": "featurePost",
  "payload": {
    "id": "post_001"
  }
}
```

## 13. 目前結論

MVP 階段 Apps Script route 建議採：

- `GET /exec?action=...`
- `POST /exec` 搭配 `{ action, payload }`

這樣可以在不追求完整 REST 框架的前提下，仍保有清楚的 API 語意與足夠一致的實作方式。

下一步若要繼續收斂，最適合做的是：

1. `posts / categories / config` 的實際欄位定稿
2. Apps Script 檔案結構草案
3. handler / service / repository 的函式命名草案
