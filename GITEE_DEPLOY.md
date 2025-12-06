# Gitee Pages 部署说明

## 已完成的步骤

1. ✅ 代码已推送到 Gitee 仓库：`https://gitee.com/jjzhang_iko/merry_christmas`
2. ✅ 远程仓库已配置：`git remote add gitee https://gitee.com/jjzhang_iko/merry_christmas.git`

## 启用 Gitee Pages

### 方法一：手动部署（推荐）

1. 访问 Gitee 仓库：`https://gitee.com/jjzhang_iko/merry_christmas`
2. 进入 **服务** → **Gitee Pages**
3. 选择部署方式：
   - **部署分支**：选择 `master` 分支
   - **部署目录**：填写 `dist`（构建后的目录）
   - **构建命令**：`npm install && npm run build`
4. 点击 **启动** 按钮

### 方法二：使用 Gitee Go（CI/CD）

如果需要自动化部署，可以配置 Gitee Go 工作流。

## 本地构建并推送

如果需要手动构建并推送 dist 目录：

```bash
# 构建项目
npm install
npm run build

# 将 dist 目录推送到 gitee-pages 分支
git subtree push --prefix dist gitee gh-pages
```

或者创建一个单独的 pages 分支：

```bash
# 切换到 dist 目录
cd dist

# 初始化 git 仓库
git init
git add .
git commit -m "Deploy to Gitee Pages"

# 推送到 gitee 的 pages 分支
git remote add gitee https://gitee.com/jjzhang_iko/merry_christmas.git
git push gitee HEAD:pages --force
```

## 访问地址

部署成功后，你的网站可以通过以下地址访问：
- `https://jjzhang_iko.gitee.io/merry_christmas/`

## 注意事项

1. Gitee Pages 需要手动触发部署（免费版）
2. 每次代码更新后，需要重新构建和部署
3. 如果使用 base path `/merry_christmas_stemhub/`，需要确保 Gitee Pages 的路径配置正确

## 同步更新

以后每次更新代码后，可以同时推送到 GitHub 和 Gitee：

```bash
# 推送到 GitHub
git push origin main

# 推送到 Gitee
git push gitee main:master
```

