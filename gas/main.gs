// ============================================================
// main.gs — 入口：doGet / doPost
// ============================================================

var GET_ACTIONS = ['getMe', 'getHome', 'getCategories', 'getPosts', 'getPost'];
var POST_ACTIONS = ['createPost', 'updatePost', 'deletePost', 'incrementPostView', 'featurePost', 'unfeaturePost', 'archivePost'];

function doGet(e) {
  try {
    var action = e.parameter.action;
    var email = e.parameter.email || '';

    if (!action || GET_ACTIONS.indexOf(action) === -1) {
      return fail('INVALID_INPUT', 'Unsupported action: ' + action);
    }

    var result;
    switch (action) {
      case 'getMe':         result = svcGetMe(email); break;
      case 'getHome':       result = svcGetHome(email); break;
      case 'getCategories': result = svcGetCategories(email); break;
      case 'getPosts':      result = svcGetPosts(e.parameter, email); break;
      case 'getPost':       result = svcGetPost(e.parameter.id, email); break;
    }

    return handleResult(result);
  } catch (err) {
    return fail('INTERNAL_ERROR', err.message);
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var payload = body.payload || {};
    var email = body.email || '';

    if (!action || POST_ACTIONS.indexOf(action) === -1) {
      return fail('INVALID_INPUT', 'Unsupported action: ' + action);
    }

    var result;
    switch (action) {
      case 'createPost':        result = svcCreatePost(payload, email); break;
      case 'updatePost':        result = svcUpdatePost(payload, email); break;
      case 'deletePost':        result = svcDeletePost(payload, email); break;
      case 'incrementPostView': result = svcIncrementPostView(payload); break;
      case 'featurePost':       result = svcFeaturePost(payload, email); break;
      case 'unfeaturePost':     result = svcUnfeaturePost(payload, email); break;
      case 'archivePost':       result = svcArchivePost(payload, email); break;
    }

    return handleResult(result);
  } catch (err) {
    return fail('INTERNAL_ERROR', err.message);
  }
}

// ---------- 統一處理 service 回傳 ----------

function handleResult(result) {
  if (result.error) {
    var msgMap = {
      UNAUTHORIZED: 'Authentication required.',
      FORBIDDEN: 'User is not allowed to perform this action.',
      NOT_FOUND: 'Resource not found.',
      INVALID_INPUT: result.message || 'Invalid input.',
      INTERNAL_ERROR: 'Internal error.'
    };
    return fail(result.error, result.message || msgMap[result.error] || result.error);
  }
  return ok(result.data);
}
