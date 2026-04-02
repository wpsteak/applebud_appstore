# Applebud App Store MVP Apps Script API 規格草案

## 1. 文件目的

本文件定義 MVP 階段的 Apps Script API 草案。

目標是先把前後端之間的資料交換方式定清楚，讓後續實作時有一致的接口可依循。

本文件只涵蓋便利貼牆 MVP，不處理未來的工具入口或進階分析功能。

## 2. API 設計原則

MVP 階段 API 原則如下：

- 接口數量盡量少
- 回傳格式盡量一致
- 優先支援首頁、貼文 CRUD、分類、管理功能
- 不為未來可能需求過度設計

## 3. 基本假設

- 後端由 `Google Apps Script` 提供 API
- 資料來源為 `Google Sheets`
- 使用者登入身份已可由 Google 帳號辨識
- 僅公司網域帳號可使用 API

## 4. API 共用規則

### 4.1 回應格式

所有 API 盡量使用一致回應格式：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

失敗時：

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

### 4.2 常見錯誤代碼

- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `INVALID_INPUT`
- `INTERNAL_ERROR`

### 4.3 時間格式

所有時間欄位統一使用 ISO 8601 字串，例如：

`2026-04-02T11:30:00+08:00`

### 4.4 貼文狀態

貼文 `status` 先定義為：

- `published`
- `archived`

MVP 不處理草稿。

## 5. 使用者與權限

### 5.1 使用者類型

- 一般使用者
- 管理者

### 5.2 權限規則

- 只有公司 Google 帳號可呼叫 API
- 一般使用者只能建立、編輯、刪除自己的貼文
- 管理者可設定精選
- 管理者可下架任何貼文

## 6. 資料模型摘要

### 6.1 Post

```json
{
  "id": "post_001",
  "title": "標題",
  "summary": "摘要",
  "content": "內文",
  "categoryKey": "skill",
  "categoryName": "Skills",
  "authorEmail": "user@company.com",
  "authorName": "王小明",
  "status": "published",
  "isFeatured": false,
  "viewCount": 12,
  "createdAt": "2026-04-02T11:30:00+08:00",
  "updatedAt": "2026-04-02T11:30:00+08:00",
  "publishedAt": "2026-04-02T11:30:00+08:00"
}
```

### 6.2 Category

```json
{
  "key": "skill",
  "name": "Skills",
  "sortOrder": 1,
  "isActive": true
}
```

### 6.3 Current User

```json
{
  "email": "user@company.com",
  "name": "王小明",
  "isAdmin": false,
  "domain": "company.com"
}
```

## 7. API 一覽

第一版建議 API 如下：

- `GET /me`
- `GET /home`
- `GET /categories`
- `GET /posts`
- `GET /posts/:id`
- `POST /posts`
- `PUT /posts/:id`
- `DELETE /posts/:id`
- `POST /posts/:id/view`
- `POST /posts/:id/feature`
- `POST /posts/:id/unfeature`
- `POST /posts/:id/archive`

## 8. API 詳細規格

### 8.1 `GET /me`

用途：

- 取得目前登入者資訊

回應範例：

```json
{
  "success": true,
  "data": {
    "email": "user@company.com",
    "name": "王小明",
    "isAdmin": false,
    "domain": "company.com"
  },
  "error": null
}
```

### 8.2 `GET /home`

用途：

- 取得首頁所需資料

首頁目前建議回傳：

- `featured`
- `latest`
- `top`

回應範例：

```json
{
  "success": true,
  "data": {
    "featured": [],
    "latest": [],
    "top": []
  },
  "error": null
}
```

說明：

- `featured` 為精選貼文列表
- `latest` 為最新張貼列表
- `top` 為依 `viewCount` 排序的總排行列表

### 8.3 `GET /categories`

用途：

- 取得可選分類列表

回應範例：

```json
{
  "success": true,
  "data": [
    {
      "key": "replicable",
      "name": "可複製案例",
      "sortOrder": 1,
      "isActive": true
    }
  ],
  "error": null
}
```

### 8.4 `GET /posts`

用途：

- 取得貼文列表

支援查詢參數：

- `categoryKey`
- `authorEmail`
- `status`
- `sort`
- `page`
- `pageSize`

建議 `sort` 值：

- `latest`
- `top`

回應範例：

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100
    }
  },
  "error": null
}
```

說明：

- MVP 若不想太早做分頁，也可先保留欄位但固定回傳第一批資料

### 8.5 `GET /posts/:id`

用途：

- 取得單篇貼文內容

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "title": "標題",
    "summary": "摘要",
    "content": "內文",
    "categoryKey": "skill",
    "categoryName": "可複製案例",
    "authorEmail": "user@company.com",
    "authorName": "王小明",
    "status": "published",
    "isFeatured": false,
    "viewCount": 12,
    "createdAt": "2026-04-02T11:30:00+08:00",
    "updatedAt": "2026-04-02T11:30:00+08:00",
    "publishedAt": "2026-04-02T11:30:00+08:00"
  },
  "error": null
}
```

### 8.6 `POST /posts`

用途：

- 建立新貼文

請求 body：

```json
{
  "title": "標題",
  "summary": "摘要",
  "content": "內文",
  "categoryKey": "skill"
}
```

欄位規則：

- `title` 必填
- `content` 必填
- `categoryKey` 必填
- `summary` 是否必填，可依需求文件後續定案

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001"
  },
  "error": null
}
```

### 8.7 `PUT /posts/:id`

用途：

- 編輯既有貼文

請求 body：

```json
{
  "title": "更新後標題",
  "summary": "更新後摘要",
  "content": "更新後內文",
  "categoryKey": "inspiration"
}
```

權限：

- 只有作者可編輯

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001"
  },
  "error": null
}
```

### 8.8 `DELETE /posts/:id`

用途：

- 刪除貼文

權限：

- 只有作者可刪除

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001"
  },
  "error": null
}
```

說明：

- MVP 可先做實體刪除
- 若擔心誤刪，之後可改成軟刪除

### 8.9 `POST /posts/:id/view`

用途：

- 增加單篇貼文的 `viewCount`

請求 body：

```json
{}
```

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "viewCount": 13
  },
  "error": null
}
```

說明：

- `viewCount` 只作為排序訊號
- 不保證是精準流量數字

### 8.10 `POST /posts/:id/feature`

用途：

- 將貼文設為精選

權限：

- 僅管理者可操作

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "isFeatured": true
  },
  "error": null
}
```

### 8.11 `POST /posts/:id/unfeature`

用途：

- 取消貼文精選狀態

權限：

- 僅管理者可操作

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "isFeatured": false
  },
  "error": null
}
```

### 8.12 `POST /posts/:id/archive`

用途：

- 將貼文下架

權限：

- 僅管理者可操作

建議請求 body：

```json
{
  "reason": "內容不適合保留在首頁"
}
```

回應範例：

```json
{
  "success": true,
  "data": {
    "id": "post_001",
    "status": "archived"
  },
  "error": null
}
```

說明：

- `reason` 在 MVP 可先選擇不落資料
- 若未來要保留管理紀錄，再擴充即可

## 9. 輸入驗證規則

### 9.1 建立與編輯貼文

至少需驗證：

- `title` 不可為空
- `content` 不可為空
- `categoryKey` 必須存在於有效分類中

### 9.2 權限驗證

至少需驗證：

- 呼叫者是否為公司網域帳號
- 編輯與刪除時，是否為貼文作者
- 精選與下架時，是否為管理者

## 10. 實作備註

### 10.1 API 風格

Apps Script 不一定會真的用到完整 REST 路徑格式，但本文件先用 REST 方式定義接口，方便前後端對焦。

實作時可以映射成：

- `GET?action=home`
- `POST?action=createPost`

或其他更適合 Apps Script 的方式。

重點是：

- 介面語意先定義清楚
- 實際路由形式可在實作時再對應

### 10.2 `viewCount` 的定位

`viewCount` 是簡化後的排序欄位。

因此：

- 它不是正式分析資料
- 不要求百分之百精準
- 只需要足夠支撐總排行

### 10.3 首頁區塊範圍

在目前資料模型下，首頁 API 先以這三區為主：

- 精選
- 最新
- 總排行

不先納入：

- 週排行
- 月排行

## 11. 目前建議

若要繼續往下走，下一步最適合補的是：

1. request / response 欄位最終定稿
2. `posts` / `categories` / `config` 的實際 Sheet 欄位定稿
3. Apps Script route 對應方式

這樣就可以進入真正的實作設計。
