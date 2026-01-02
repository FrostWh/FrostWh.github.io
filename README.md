# Hexo + Fluid 个人博客

基于 Hexo 和 Fluid 主题搭建的个人博客网站。

## 功能特性

- ✅ 使用 Hexo 8.0 静态博客框架
- ✅ 使用 Fluid 主题，界面美观
- ✅ 支持中文界面
- ✅ 支持搜索功能
- ✅ 支持暗色模式
- ✅ 响应式设计

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动本地服务器

```bash
npm run server
```

访问 http://localhost:4000 查看博客。

### 生成静态文件

```bash
npm run build
```

### 清理缓存

```bash
npm run clean
```

## 创建新文章

```bash
npx hexo new "文章标题"
```

文章会创建在 `source/_posts/` 目录下。

## 创建新页面

```bash
npx hexo new page "页面名称"
```

页面会创建在 `source/页面名称/` 目录下。

## 配置说明

### 主配置文件

- `_config.yml` - Hexo 主配置文件
- `_config.fluid.yml` - Fluid 主题配置文件

### 目录结构

```
.
├── _config.yml          # Hexo 配置文件
├── _config.fluid.yml    # Fluid 主题配置
├── source/              # 源文件目录
│   ├── _posts/         # 文章目录
│   └── about/          # 关于页面
├── themes/              # 主题目录
└── public/              # 生成的静态文件（运行 hexo generate 后生成）
```

## 部署

### GitHub Pages

1. 在 GitHub 上创建仓库
2. 安装 hexo-deployer-git：

```bash
npm install --save hexo-deployer-git
```

3. 在 `_config.yml` 中配置部署信息：

```yaml
deploy:
  type: git
  repo: https://github.com/yourusername/yourusername.github.io.git
  branch: main
```

4. 部署：

```bash
npx hexo deploy
```

## 参考资源

- [Hexo 文档](https://hexo.io/docs/)
- [Fluid 主题文档](https://hexo.fluid-dev.com/docs/)
- [参考网站](https://goulandis.github.io/)

## 许可证

MIT

