# 乐搭

使用[Strapi](https://strapi.io/)和[低代码引擎](https://lowcode-engine.cn/)构建的低代码平台。UI 和平台逻辑主要参考自[宜搭](http://yida.alibaba-inc.com/)。

## Demo

使用 Docker compose 在自家 Nas 上部署的 demo，会实时跟进开发进度。

<a href="https://q.210313.cn:12220" target="_blank">https://q.210313.cn:12220</a>

| 账号             | 密码             | 平台角色                       |
| ---------------- | ---------------- | ------------------------------ |
| engineer         | engineer         | Engineer（开发者）             |
| applicationAdmin | applicationAdmin | ApplicationAdmin（应用管理员） |
| platformAdmin    | platformAdmin    | PlatformAdmin（平台管理员）    |
| superAdmin       | superAdmin       | SuperAdmin（超级管理员）       |

## 目前进度

- [x] 用户、平台角色功能开发
- [x] 应用增删改查功能开发
- [x] 应用角色功能开发
- [x] 应用路由增删改查、修改顺序功能开发
- [x] 低代码引擎接入，完成 schema 存储及页面预览
- [x] 应用页面版本功能
- [x] 应用多版本控制功能
- [x] 应用发布及整体预览功能（包含左侧菜单）
- [x] 应用页面版本支持本地浏览器 IndexDb 存储，点击保存或快捷键保存后再提交到数据库
- [x] 应用页面历史记录，支持回滚
- [x] 应用页面历史记录支持 diff
- [x] 应用全局状态管理的支持
- [x] 页面数据源面板中使用[axios@1.6.2](https://github.com/axios/axios)调用第三方api（不需要鉴权），渲染动态数据
- [x] 支持页面跳转全局方法
- [ ] 支持定制请求拦截器，完成需要鉴权的第三方api调用
- [ ] 支持在请求拦截器里，使用navigateTo和全局store

...more

## 项目长期目标

- [ ] 梳理低代码物料，定制列表页和表单页物料。
- [ ] 复写符合阿里低代码规范的低代码引擎
- [ ] 支持用户存储自定义数据，实现服务端低代码。

## 开发

### 项目介绍

./backend

使用 strapi 开发的服务端系统，输出 Restful 风格接口。建议使用 Postgres 数据库。

./platform

使用 webpack4 和 React16.14 开发的平台前端。受制于低代码引擎限制，暂时无法升级到 webpack5 和 react高 版本。

### 安装依赖

```bash
yarn install
yarn --cwd backend install
yarn --cwd platform install
```

### 配置数据库

生成 .env 文件，修改为自己的 Pg 数据库配置

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

修改刚刚创建的账户的 role 为“platformAdmin（平台管理员）”

访问 http://localhost:8000，可以创建应用体验了。

## Docker 部署

目前已发布了平台前端和 strapi 后台两个 Docker 镜像，可直接使用根目录下的 docker-compose.yml 直接部署在自己机器上。

- 前端 https://hub.docker.com/r/cloudgrin/frontend-lowcode-platform
- strapi 后台 https://hub.docker.com/r/cloudgrin/strapi-lowcode-platform

### docker-compose 部署

拷贝根目录下的 docker-compose.yml 到服务器上，修改环境变量，并在当前目录下运行。

```bash
docker-compose up -d
```

### 定制镜像

可修改./backend 和./platform 目录下的 Dockerfile.prod，自己输出镜像

```bash
docker buildx build --platform linux/amd64,linux/arm64 -f Dockerfile.prod -t [docker镜像名称和tag] . --push
```

## 主要功能设计介绍

### 平台角色

平台侧一共有四个角色，一个用户只允许有一个角色。

| 角色             | 介绍                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Engineer         | 开发者，注册用户的默认身份，不可以创建应用，需要被其他管理员在应用管理里将其加入应用。     |
| ApplicationAdmin | 应用管理员，具有创建应用的权限，仅可管理自己的应用。                                       |
| PlatformAdmin    | 平台管理员，具有管理所有应用的权限。                                                       |
| SuperAdmin       | 超级管理员，权限同平台管理员，另外可以管理平台管理员。需要在 Strapi 管理后台进行角色管理。 |

表格向下，权限越高，且拥有其表格上方角色的全部平台权限。例如 PlatformAdmin 拥有 ApplicationAdmin 和 Engineer 的全部平台权限。

在平台权限管理里进行角色移除时，只能一级一级移除角色，例如 PlatformAdmin 被移除平台管理员角色后，转为应用管理员角色，再次被移除应用管理员角色后，转为开发者角色。

平台权限管理:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/平台权限管理.png" height="246">


### 应用角色

应用内一共有两个角色，一个用户可以拥有多个角色。创建应用的管理员默认为 master 角色。

| 角色      | 介绍                                                                 |
| --------- | -------------------------------------------------------------------- |
| master    | 应用主管理员，拥有应用管理后台的全部权限，可进行应用搭建、编辑及设置 |
| developer | 开发者，拥有应用开发权限，无应用管理员设置等权限                     |

应用角色管理:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用角色管理.png" height="280">

### 应用路由管理

支持新增普通路由、外部链接和路由分组。支持路由拖拽排序。

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用路由新增.png" height="252">

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用路由排序.png" height="246"><img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用路由更名.png" height="246" style="margin-left:10px;">

### 页面版本管理

支持页面本地及云端保存，页面版本历史记录展示，command+s快捷键保存，保存冲突检测，版本回滚，版本diff。

页面版本管理:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/页面版本管理.png">

### 数据源（请求）

支持axios请求配置页面数据源

数据源:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/数据源.png" height="400">

### 应用发布

应用发布管理:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用发布管理.png" height="240">

应用发布展示:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/应用发布展示.png" height="231">


### 全局状态管理

使用[zustand](https://github.com/pmndrs/zustand)完成应用级跨页面共享全局状态

![全局状态管理](https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/全局状态管理.gif)

使用低代码引擎提供的[apphelper](https://lowcode-engine.cn/site/docs/guide/expand/runtime/renderer#apphelper)接入store，通过 this.constants.store 进行操作

store获取:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/store获取.png" height="380">

store设置:

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/store设置.png" height="231">


### 路由跳转

#### utils.navigateTo()

该方法用来在应用程序的页面之间导航。

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/navigateTo.png" height="340">

##### 定义

navigateTo(pageNavId: string, params?: {}, replace: boolean): void

##### 参数

pageNavId

要跳转到的页面 ID，从页面管理里点击页面后，在 url 中获取

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/页面NavId.png" height="200">


params

通过 URL 传递的查询参数。用于跨页面传递数据。

replace

默认 true，是否需要替换当前页面，不在历史记录中保留上一条路由信息

#### utils.parseQuery()

该方法用来在当前页面获取 URL 的查询参数

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/parseQuery.png" height="260">



#### 演示

<img src="https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/路由跳转加获取urlparams.gif" height="260">


### 管理后台

strapi 提供了管理后台

![strapi管理后台](https://cloudgrin.oss-cn-shanghai.aliyuncs.com/images/clip-images/strapi管理后台.png)
