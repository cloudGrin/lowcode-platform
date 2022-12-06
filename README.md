# 乐搭

使用[Strapi](https://strapi.io/)和[低代码引擎](https://lowcode-engine.cn/)构建的低代码平台。UI和平台逻辑主要参考自[宜搭](http://yida.alibaba-inc.com/)。

## Demo

使用Docker compose 在自家Nas上部署的demo，会实时跟进开发进度。

https://q.210313.cn:12220

账号: platformAdmin
密码: platformAdmin

## 进度

- [x] 用户、平台角色功能开发
- [x] 应用增删改查功能开发
- [x] 应用角色功能开发
- [x] 应用路由增删改查、修改顺序功能开发
- [x] 低代码引擎接入，完成schema存储及页面预览
- [x] 应用页面版本初步功能完成
- [x] 应用多版本控制初步功能完成
- [ ] 应用页面版本支持本地浏览器IndexDb存储，点击保存后再提交到数据库
- [ ] 应用整体预览（包含左侧菜单）

...more

## 开发

### 项目介绍

./backend

使用strapi开发的服务端系统，输出Restful风格接口。建议使用Postgres数据库。

./platform

使用webpack4和React16.14开发的平台前端。受制于低代码引擎限制，暂时无法升级webpack4和react版本。

### 安装依赖

```bash
yarn install
yarn --cwd backend install
yarn --cwd platform install
```

### 配置数据库

生成 .env 文件，修改为自己的Pg数据库配置

```bash
cp ./backend/.env.example ./backend/.env
```

### 启动项目

```bash
yarn develop
```

### 注册后台系统管理员账号

访问 http://localhost:1337/admin

### 注册低代码平台账号

访问 http://localhost:8000/register

> 新注册的账号默认平台角色是“Engineer（开发者）”，无权限创建应用。

访问 http://localhost:1337/admin/content-manager/collectionType/plugin::users-permissions.user

修改刚刚创建的账户的role为“platformAdmin（平台管理员）”

访问 http://localhost:8000，可以创建应用体验了。

## Docker部署

目前已发布了平台前端和strapi后台两个Docker镜像，可直接使用根目录下的 docker-compose.yml 直接部署在自己机器上。

- 前端 https://hub.docker.com/r/cloudgrin/frontend-lowcode-platform
- strapi后台 https://hub.docker.com/r/cloudgrin/strapi-lowcode-platform

### docker-compose 部署

拷贝根目录下的 docker-compose.yml到服务器上，修改环境变量，并在当前目录下运行。

```bash
docker-compose up -d
```

### 定制镜像

可修改./backend和./platform目录下的Dockerfile.prod，自己输出镜像

```bash
docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.prod -t [docker镜像名称和tag] . --push
```