// ============================================================
// service.gs — 商業邏輯
// ============================================================

// ---------- 身份驗證 ----------

function getCurrentUser(email) {
  if (!email) return null;

  var cfg = getConfig();
  var domain = cfg.company_domain || '';
  if (!email.endsWith('@' + domain)) return null;

  var adminEmails = (cfg.admin_emails || '').split(',').map(function(e) { return e.trim(); });

  return {
    email: email,
    name: email.split('@')[0],
    isAdmin: adminEmails.indexOf(email) !== -1,
    domain: domain
  };
}

// ---------- Post 物件轉換（sheet row → API 格式）----------

function rowToPost(row, categories) {
  var cat = (categories || getAllCategories()).find(function(c) { return c.key === row.category_key; });
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    content: row.content,
    categoryKey: row.category_key,
    categoryName: cat ? cat.name : row.category_key,
    authorEmail: row.author_email,
    authorName: row.author_name,
    status: row.status,
    isFeatured: row.is_featured === true || row.is_featured === 'TRUE',
    viewCount: Number(row.view_count) || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at
  };
}

// ---------- getMe ----------

function svcGetMe(email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };
  return { data: user };
}

// ---------- getHome ----------

function svcGetHome(email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var cfg = getConfig();
  var featuredLimit = Number(cfg.home_featured_limit) || 5;
  var latestLimit = Number(cfg.home_latest_limit) || 10;
  var topLimit = Number(cfg.home_top_limit) || 10;

  var categories = getAllCategories();
  var published = getAllPostRows().filter(function(r) { return r.status === 'published'; });

  var featured = published
    .filter(function(r) { return r.is_featured === true || r.is_featured === 'TRUE'; })
    .slice(0, featuredLimit)
    .map(function(r) { return rowToPost(r, categories); });

  var latest = published
    .slice()
    .sort(function(a, b) { return new Date(b.published_at) - new Date(a.published_at); })
    .slice(0, latestLimit)
    .map(function(r) { return rowToPost(r, categories); });

  var top = published
    .slice()
    .sort(function(a, b) { return Number(b.view_count) - Number(a.view_count); })
    .slice(0, topLimit)
    .map(function(r) { return rowToPost(r, categories); });

  return { data: { featured: featured, latest: latest, top: top } };
}

// ---------- getCategories ----------

function svcGetCategories(email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var data = getAllCategories().map(function(c) {
    return { key: c.key, name: c.name, sortOrder: Number(c.sort_order), isActive: true };
  });
  return { data: data };
}

// ---------- getPosts ----------

function svcGetPosts(params, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var categories = getAllCategories();
  var rows = getAllPostRows().filter(function(r) { return r.status === 'published'; });

  if (params.categoryKey) {
    rows = rows.filter(function(r) { return r.category_key === params.categoryKey; });
  }
  if (params.authorEmail) {
    rows = rows.filter(function(r) { return r.author_email === params.authorEmail; });
  }

  if (params.sort === 'top') {
    rows.sort(function(a, b) { return Number(b.view_count) - Number(a.view_count); });
  } else {
    rows.sort(function(a, b) { return new Date(b.published_at) - new Date(a.published_at); });
  }

  var pageSize = Number(params.pageSize) || 20;
  var page = Number(params.page) || 1;
  var total = rows.length;
  var items = rows.slice((page - 1) * pageSize, page * pageSize).map(function(r) { return rowToPost(r, categories); });

  return { data: { items: items, pagination: { page: page, pageSize: pageSize, total: total } } };
}

// ---------- getPost ----------

function svcGetPost(id, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var row = getPostById(id);
  if (!row) return { error: 'NOT_FOUND' };

  return { data: rowToPost(row) };
}

// ---------- createPost ----------

function svcCreatePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  if (!payload.title || !payload.content || !payload.categoryKey) {
    return { error: 'INVALID_INPUT', message: 'title, content, categoryKey 為必填' };
  }
  if (!categoryKeyExists(payload.categoryKey)) {
    return { error: 'INVALID_INPUT', message: '無效的 categoryKey' };
  }

  var now = nowISO();
  var id = generatePostId();

  insertPost({
    id: id,
    title: payload.title,
    summary: payload.summary || '',
    content: payload.content,
    category_key: payload.categoryKey,
    author_email: user.email,
    author_name: user.name,
    status: 'published',
    is_featured: false,
    view_count: 0,
    created_at: now,
    updated_at: now,
    published_at: now
  });

  return { data: { id: id } };
}

// ---------- updatePost ----------

function svcUpdatePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };
  if (row.author_email !== user.email) return { error: 'FORBIDDEN' };

  if (payload.categoryKey && !categoryKeyExists(payload.categoryKey)) {
    return { error: 'INVALID_INPUT', message: '無效的 categoryKey' };
  }

  var fields = { updated_at: nowISO() };
  if (payload.title) fields.title = payload.title;
  if (payload.summary !== undefined) fields.summary = payload.summary;
  if (payload.content) fields.content = payload.content;
  if (payload.categoryKey) fields.category_key = payload.categoryKey;

  updatePostFields(payload.id, fields);
  return { data: { id: payload.id } };
}

// ---------- deletePost ----------

function svcDeletePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };

  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };
  if (row.author_email !== user.email) return { error: 'FORBIDDEN' };

  deletePostRow(payload.id);
  return { data: { id: payload.id } };
}

// ---------- incrementPostView ----------

function svcIncrementPostView(payload) {
  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };

  var newCount = (Number(row.view_count) || 0) + 1;
  updatePostFields(payload.id, { view_count: newCount });
  return { data: { id: payload.id, viewCount: newCount } };
}

// ---------- featurePost / unfeaturePost ----------

function svcFeaturePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };
  if (!user.isAdmin) return { error: 'FORBIDDEN' };

  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };

  updatePostFields(payload.id, { is_featured: true, updated_at: nowISO() });
  return { data: { id: payload.id, isFeatured: true } };
}

function svcUnfeaturePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };
  if (!user.isAdmin) return { error: 'FORBIDDEN' };

  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };

  updatePostFields(payload.id, { is_featured: false, updated_at: nowISO() });
  return { data: { id: payload.id, isFeatured: false } };
}

// ---------- archivePost ----------

function svcArchivePost(payload, email) {
  var user = getCurrentUser(email);
  if (!user) return { error: 'UNAUTHORIZED' };
  if (!user.isAdmin) return { error: 'FORBIDDEN' };

  var row = getPostById(payload.id);
  if (!row) return { error: 'NOT_FOUND' };

  updatePostFields(payload.id, { status: 'archived', updated_at: nowISO() });
  return { data: { id: payload.id, status: 'archived' } };
}
