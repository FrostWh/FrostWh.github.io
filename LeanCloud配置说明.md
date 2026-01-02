# LeanCloud 浏览数和点赞功能配置说明

## 配置状态

✅ 已在 `_config.fluid.yml` 中配置 LeanCloud：
- App ID: `LMwqda8ySnf0uS6WGCClJvVj-MdYXbMMI`
- App Key: `tRKr9DQ7NRd99oF5iNQE5e65`
- 浏览数统计已设置为使用 LeanCloud 存储
- 点赞功能已设置为使用 LeanCloud 存储
- 网站统计已设置为使用 LeanCloud

## 需要在 LeanCloud 控制台完成的配置

### 1. 创建浏览数统计数据表（Counter Class）

1. 登录 [LeanCloud 控制台](https://console.leancloud.cn/)
2. 选择你的应用
3. 进入 **数据存储** → **结构化数据**
4. 点击 **创建 Class**
5. Class 名称填写：`Counter`（注意大小写，这是 Fluid 主题默认使用的）
6. 选择 **无限制** 或 **标准版**（根据你的需求）
7. 点击 **创建**

**字段说明（会自动创建）：**
- `target` (String) - 存储页面路径或标识，如 `/2024/01/15/example-post-1/` 或 `site-pv`、`site-uv`
- `time` (Number) - 存储访问次数，默认为 0

**权限设置：**
- `add_fields`: 所有用户
- `create`: 所有用户
- `read`: 所有用户
- `update`: 所有用户
- `delete`: 仅创建者

### 2. 创建点赞数据表（Like Class）

1. 在 **数据存储** → **结构化数据** 中
2. 点击 **创建 Class**
3. Class 名称填写：`Like`（注意大小写）
4. 选择 **无限制** 或 **标准版**
5. 点击 **创建**

**字段说明（会自动创建）：**
- `target` (String) - 存储页面路径，如 `like_/2024/01/15/example-post-1/`
- `count` (Number) - 存储点赞数量，默认为 0

**权限设置：**
- `add_fields`: 所有用户
- `create`: 所有用户
- `read`: 所有用户
- `update`: 所有用户
- `delete`: 仅创建者（或根据需要设置）

### 3. 设置安全域名（可选但推荐）

1. 进入 **设置** → **安全中心**
2. 在 **Web 安全域名** 中添加你的域名：
   - `wanghongrich.com`
   - `*.wanghongrich.com`（如果需要子域名）
   - `localhost`（用于本地开发测试）

## 测试配置

### 1. 重新生成静态文件

```bash
hexo clean
hexo generate
```

### 2. 启动本地服务器

```bash
hexo server
```

### 3. 测试点赞功能

1. 访问任意文章页面
2. 查看文章底部是否显示点赞按钮
3. 点击点赞按钮
4. 检查浏览器控制台（F12）是否有错误
5. 在 LeanCloud 控制台的 `Like` Class 中查看是否有新记录

### 4. 验证数据

**浏览数数据：**
在 LeanCloud 控制台 → 数据存储 → Counter Class 中，应该能看到：
- `target` 字段：页面路径（如 `/2024/01/15/example-post-1/`）或 `site-pv`、`site-uv`
- `time` 字段：访问次数

**点赞数据：**
在 LeanCloud 控制台 → 数据存储 → Like Class 中，应该能看到：
- `target` 字段：页面路径（如 `like_/2024/01/15/example-post-1/`）
- `count` 字段：点赞数量

## 故障排除

### 问题 1：点赞按钮点击无反应

**检查：**
1. 打开浏览器控制台（F12），查看是否有错误
2. 检查网络请求是否成功（Network 标签）
3. 确认 LeanCloud 配置是否正确

**解决：**
- 检查 `_config.fluid.yml` 中的 LeanCloud 配置
- 确认 App ID 和 App Key 是否正确
- 检查安全域名设置

### 问题 2：浏览数不显示或不增加

**检查：**
1. 确认 `web_analytics.enable` 是否为 `true`（必须启用才能增加浏览数）
2. LeanCloud 控制台 → Counter Class 是否有记录
3. 浏览器控制台是否有错误信息
4. 网络请求是否返回错误

**解决：**
- 检查 `_config.fluid.yml` 中 `web_analytics.enable` 是否为 `true`
- 检查数据表权限设置是否正确
- 确认 `Counter` Class 是否存在
- 检查安全域名是否包含当前访问的域名

### 问题 3：点赞数据不保存

**检查：**
1. LeanCloud 控制台 → Like Class 是否有记录
2. 浏览器控制台是否有错误信息
3. 网络请求是否返回错误

**解决：**
- 检查数据表权限设置是否正确
- 确认 `Like` Class 是否存在
- 检查安全域名是否包含当前访问的域名

### 问题 4：跨设备数据不同步

**原因：**
- 如果使用 localStorage，数据只存储在本地浏览器
- 需要确保使用 LeanCloud 存储

**解决：**
- 确认 `_config.fluid.yml` 中：
  - `post.meta.views.source` 设置为 `leancloud`
  - `post.meta.likes.source` 设置为 `leancloud`
- 确认 `web_analytics.enable` 为 `true`
- 重新生成并部署

### 问题 5：CORS 错误

**错误信息：**
```
Access to fetch at 'https://...' from origin '...' has been blocked by CORS policy
```

**解决：**
1. 在 LeanCloud 控制台 → 设置 → 安全中心
2. 添加 Web 安全域名
3. 确保包含你的域名和 localhost（用于测试）

## 数据迁移（如果需要）

如果之前使用 localStorage，现在想迁移到 LeanCloud：

1. 数据会自动在新设备上从 LeanCloud 读取
2. 旧设备的 localStorage 数据不会自动迁移
3. 可以手动在 LeanCloud 控制台创建初始数据

## 注意事项

1. **免费额度**：LeanCloud 免费版有 API 调用次数限制，对于个人博客通常足够
2. **数据安全**：确保权限设置正确，避免数据被恶意修改
3. **备份**：定期在 LeanCloud 控制台导出数据作为备份
4. **性能**：LeanCloud 响应速度通常很快，但网络状况可能影响加载速度

## 相关链接

- [LeanCloud 控制台](https://console.leancloud.cn/)
- [LeanCloud 文档](https://leancloud.cn/docs/)
- [Fluid 主题文档](https://hexo.fluid-dev.com/docs/)

## 配置完成检查清单

- [ ] LeanCloud 应用已创建
- [ ] App ID 和 App Key 已配置到 `_config.fluid.yml`
- [ ] `Counter` Class 已创建（用于浏览数统计）
- [ ] `Like` Class 已创建（用于点赞功能）
- [ ] 两个数据表权限已设置（允许所有用户读写）
- [ ] Web 安全域名已添加
- [ ] `web_analytics.enable` 设置为 `true`
- [ ] `post.meta.views.source` 设置为 `leancloud`
- [ ] `post.meta.likes.source` 设置为 `leancloud`
- [ ] `footer.statistics.source` 设置为 `leancloud`（可选）
- [ ] 已重新生成静态文件
- [ ] 已测试浏览数统计功能
- [ ] 已测试点赞功能
- [ ] LeanCloud 控制台能看到浏览数和点赞数据

配置完成后，浏览数和点赞数据将存储在 LeanCloud 中，可以在任何设备上同步显示！

