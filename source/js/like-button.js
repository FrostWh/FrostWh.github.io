/*!
 * 点赞功能实现
 * 支持 localStorage 和 LeanCloud 两种存储方式
 */
(function(window, document) {
  'use strict';

  // 获取页面路径作为唯一标识
  function getPagePath() {
    return window.location.pathname.replace(/\/$/, '') || '/';
  }

  // 创建点赞按钮容器
  function createLikeContainer() {
    // 先尝试查找现有容器
    var container = document.querySelector('#post-like-container');
    if (container) return container;

    // 在文章内容后或评论前创建容器
    var article = document.querySelector('article.markdown-body');
    var comments = document.querySelector('#comments');
    
    if (article || comments) {
      container = document.createElement('div');
      container.id = 'post-like-container';
      container.className = 'post-like-container';
      
      if (comments) {
        comments.parentNode.insertBefore(container, comments);
      } else if (article) {
        article.parentNode.insertBefore(container, article.nextSibling);
      }
      
      return container;
    }
    
    return null;
  }

  // 获取点赞按钮容器
  function getLikeContainer() {
    return document.querySelector('#post-like-container') || createLikeContainer();
  }

  // 显示点赞按钮和数量
  function renderLikeButton(count, isLiked) {
    var container = getLikeContainer();
    if (!container) return;

    container.innerHTML = `
      <div class="post-like">
        <button id="like-button" class="like-btn ${isLiked ? 'liked' : ''}" title="${isLiked ? '已点赞' : '点赞'}">
          <i class="iconfont ${isLiked ? 'icon-like-fill' : 'icon-like'}"></i>
          <span id="like-count">${count || 0}</span>
        </button>
      </div>
    `;

    // 绑定点击事件
    var likeBtn = document.getElementById('like-button');
    if (likeBtn) {
      likeBtn.addEventListener('click', handleLikeClick);
    }
  }

  // 处理点赞点击
  function handleLikeClick() {
    var button = document.getElementById('like-button');
    var countEle = document.getElementById('like-count');
    var path = getPagePath();
    var isLiked = button.classList.contains('liked');

    if (isLiked) {
      // 取消点赞
      decreaseLike(path, function(newCount) {
        button.classList.remove('liked');
        button.querySelector('i').className = 'iconfont icon-like';
        button.title = '点赞';
        countEle.textContent = newCount;
      });
    } else {
      // 点赞
      increaseLike(path, function(newCount) {
        button.classList.add('liked');
        button.querySelector('i').className = 'iconfont icon-like-fill';
        button.title = '已点赞';
        countEle.textContent = newCount;
      });
    }
  }

  // 使用 localStorage 存储
  var localStorageLike = {
    get: function(path) {
      var key = 'like_' + path;
      var data = localStorage.getItem(key);
      return data ? JSON.parse(data) : { count: 0, liked: false };
    },
    set: function(path, data) {
      var key = 'like_' + path;
      localStorage.setItem(key, JSON.stringify(data));
    },
    increase: function(path, callback) {
      var data = this.get(path);
      if (!data.liked) {
        data.count = (data.count || 0) + 1;
        data.liked = true;
        this.set(path, data);
        callback(data.count);
      } else {
        callback(data.count);
      }
    },
    decrease: function(path, callback) {
      var data = this.get(path);
      if (data.liked) {
        data.count = Math.max(0, (data.count || 0) - 1);
        data.liked = false;
        this.set(path, data);
        callback(data.count);
      } else {
        callback(data.count);
      }
    }
  };

  // 使用 LeanCloud 存储
  var leancloudLike = {
    appId: null,
    appKey: null,
    serverUrl: null,

    init: function(config) {
      this.appId = config.app_id;
      this.appKey = config.app_key;
      this.serverUrl = config.server_url;
    },

    getApiServer: function() {
      if (this.serverUrl) {
        return Promise.resolve(this.serverUrl);
      }
      return fetch('https://app-router.leancloud.cn/2/route?appId=' + this.appId)
        .then(resp => resp.json())
        .then(data => 'https://' + data.api_server);
    },

    request: function(method, url, data) {
      return this.getApiServer().then(apiServer => {
        return fetch(apiServer + '/1.1' + url, {
          method: method,
          headers: {
            'X-LC-Id': this.appId,
            'X-LC-Key': this.appKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      });
    },

    get: function(path, callback) {
      var target = 'like_' + path;
      this.request('GET', '/classes/Like?where=' + encodeURIComponent(JSON.stringify({ target: target })))
        .then(resp => resp.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            var record = data.results[0];
            var liked = this.checkLiked(path);
            callback({ count: record.count || 0, liked: liked });
          } else {
            // 创建新记录
            this.request('POST', '/classes/Like', { target: target, count: 0 })
              .then(() => callback({ count: 0, liked: false }));
          }
        })
        .catch(() => callback({ count: 0, liked: false }));
    },

    checkLiked: function(path) {
      var key = 'leancloud_like_' + path;
      return localStorage.getItem(key) === 'true';
    },

    setLiked: function(path, liked) {
      var key = 'leancloud_like_' + path;
      localStorage.setItem(key, liked ? 'true' : 'false');
    },

    increase: function(path, callback) {
      if (this.checkLiked(path)) {
        this.get(path, function(data) { callback(data.count); });
        return;
      }

      var target = 'like_' + path;
      this.request('GET', '/classes/Like?where=' + encodeURIComponent(JSON.stringify({ target: target })))
        .then(resp => resp.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            var record = data.results[0];
            var objectId = record.objectId;
            var newCount = (record.count || 0) + 1;
            
            return this.request('PUT', '/classes/Like/' + objectId, { count: newCount })
              .then(() => {
                this.setLiked(path, true);
                callback(newCount);
              });
          } else {
            return this.request('POST', '/classes/Like', { target: target, count: 1 })
              .then(() => {
                this.setLiked(path, true);
                callback(1);
              });
          }
        })
        .catch(() => callback(0));
    },

    decrease: function(path, callback) {
      if (!this.checkLiked(path)) {
        this.get(path, function(data) { callback(data.count); });
        return;
      }

      var target = 'like_' + path;
      this.request('GET', '/classes/Like?where=' + encodeURIComponent(JSON.stringify({ target: target })))
        .then(resp => resp.json())
        .then(data => {
          if (data.results && data.results.length > 0) {
            var record = data.results[0];
            var objectId = record.objectId;
            var newCount = Math.max(0, (record.count || 0) - 1);
            
            return this.request('PUT', '/classes/Like/' + objectId, { count: newCount })
              .then(() => {
                this.setLiked(path, false);
                callback(newCount);
              });
          } else {
            this.setLiked(path, false);
            callback(0);
          }
        })
        .catch(() => callback(0));
    }
  };

  // 根据配置选择存储方式
  var likeStorage = null;
  var increaseLike = null;
  var decreaseLike = null;

  function initLike() {
    var container = getLikeContainer();
    if (!container) return;

    // 从配置中获取存储方式
    var useLeanCloud = false;
    
    // 检查是否配置了 LeanCloud 且点赞功能使用 leancloud
    if (window.CONFIG) {
      // 检查点赞配置
      var likesConfig = window.CONFIG.post && window.CONFIG.post.meta && window.CONFIG.post.meta.likes;
      if (likesConfig && likesConfig.source === 'leancloud') {
        useLeanCloud = true;
      }
      
      // 或者检查 web_analytics 中是否配置了 LeanCloud
      if (!useLeanCloud && window.CONFIG.web_analytics && window.CONFIG.web_analytics.leancloud) {
        var lcConfig = window.CONFIG.web_analytics.leancloud;
        if (lcConfig.app_id && lcConfig.app_key) {
          useLeanCloud = true;
        }
      }
    }
    
    // 如果配置了 LeanCloud，则使用 LeanCloud 存储
    if (useLeanCloud && window.CONFIG && window.CONFIG.web_analytics && window.CONFIG.web_analytics.leancloud) {
      var lcConfig = window.CONFIG.web_analytics.leancloud;
      if (lcConfig.app_id && lcConfig.app_key) {
        leancloudLike.init(lcConfig);
        likeStorage = leancloudLike;
        increaseLike = function(path, callback) { leancloudLike.increase(path, callback); };
        decreaseLike = function(path, callback) { leancloudLike.decrease(path, callback); };
      } else {
        console.warn('LeanCloud 配置不完整，将使用 localStorage');
        useLeanCloud = false;
      }
    }

    // 如果没有配置 LeanCloud 或配置不完整，使用 localStorage
    if (!useLeanCloud || !likeStorage) {
      likeStorage = localStorageLike;
      increaseLike = function(path, callback) { localStorageLike.increase(path, callback); };
      decreaseLike = function(path, callback) { localStorageLike.decrease(path, callback); };
    }

    // 加载点赞数据
    var path = getPagePath();
    if (likeStorage && likeStorage.get) {
      likeStorage.get(path, function(data) {
        renderLikeButton(data.count, data.liked);
      });
    } else {
      // 如果 get 方法不存在，使用默认值
      renderLikeButton(0, false);
    }
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLike);
  } else {
    initLike();
  }

})(window, document);

