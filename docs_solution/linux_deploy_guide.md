# Windows 测试环境迁移到 Linux 正式部署说明

## 1. 项目结构和当前检查结论

本项目不是单体前端，而是 3 个独立部分：

- `JavaSB_back`：Spring Boot 后端，端口当前配置为 `8082`
- `Backend_front`：后台管理前端，Vite + Vue3
- `WX_mini_front`：微信小程序前端，uni-app

根据仓库当前配置，和正式部署最相关的现状如下：

- 后端配置文件在 `JavaSB_back/src/main/resources/application.yml`
- 后台前端开发环境通过 Vite 代理访问后端
- 后台前端生产环境默认 `VITE_API_URL=/`，这意味着正式环境必须依赖 Nginx 反向代理
- 小程序前端直接把 `VITE_SERVER_BASEURL` 拼到请求地址里
- 后端上传目录当前写成了相对路径 `src/main/resources/uploads/...`
- 微信支付回调地址当前默认写的是开发内网 IP

这几个点正是“Windows 开发/测试正常，但 Linux 正式部署后表现不一样”的主要原因。

## 2. 为什么部署后后台和开发环境不一样

### 2.1 后台前端开发环境和生产环境的请求入口本来就不同

当前仓库里：

- `Backend_front/.env.development`
  - `VITE_API_URL=/`
  - `VITE_API_PROXY_URL=http://localhost:8082`
- `Backend_front/.env.production`
  - `VITE_API_URL=/`

这代表：

- 开发环境里，浏览器请求的是前端开发服务器的 `/api`
- 但真正转发到 `localhost:8082` 是 Vite 的 `proxy` 在做
- 生产环境打包后，Vite 不存在了
- 所以 `/api` 是否还能工作，完全取决于 Linux 上的 Nginx 是否继续把 `/api` 转发给 Spring Boot

如果你只是把 `Backend_front/dist` 丢到 Linux 上当静态站点，没有配置：

- `/api` 反向代理
- `/uploads` 反向代理

那么后台页面就会和开发环境表现不一致，常见现象是：

- 登录接口 404
- 页面数据为空
- 上传和图片地址失效
- 部分接口走到了错误的域名

### 2.2 小程序前端开发和生产读取的是两套不同地址

当前仓库里：

- `WX_mini_front/.env.development`
  - `VITE_SERVER_BASEURL=http://10.62.61.71:8082`
- `WX_mini_front/.env.production`
  - `VITE_SERVER_BASEURL=http://10.63.205.29:8082`

这说明小程序开发包和生产包本来就不是请求同一台机器。

如果 Linux 正式环境已经换机、换 IP、换域名，但 `.env.production` 没同步修改，小程序会继续打到旧地址，结果就是：

- 后端数据和开发环境不一致
- 明明后端部署好了，但小程序还在访问旧服务器
- 微信支付、上传、下载、图片、视频都可能出现问题

### 2.3 后端里还有开发环境残留配置

当前后端配置里还有几个明显的开发环境痕迹：

- 数据库默认连接：`localhost:3306/edu_data`
- 微信支付通知地址默认值：`http://10.62.61.71:8082/api/pay/wechat/notify`
- 上传目录：`src/main/resources/uploads/...`

这些配置在 Windows 开发目录里能跑，不代表 Linux 正式环境也合适。

尤其是上传目录：

- 开发时通常是从源码目录启动
- 生产时通常是直接运行 `jar`
- 这时相对路径会相对于 Linux 的启动目录解析
- 结果就是上传文件位置、静态资源访问路径、重启后文件保留位置都可能和开发环境不同

### 2.4 Windows 和 Linux 运行习惯不同

除了配置差异，还要注意系统层差异：

- Windows 对路径大小写不敏感，Linux 敏感
- Windows 常用源码目录直接启动，Linux 常用 `systemd + jar` 启动
- Windows 本地常常数据库、Redis、前后端都在同一台机器，Linux 正式环境往往拆分服务

所以正式部署时必须把“环境变量、反向代理、上传目录、域名、回调地址、数据库连接”全部显式配置出来，不能继续依赖开发默认值。

## 3. 正式部署推荐架构

推荐使用下面这种正式部署方式：

1. `Nginx` 负责对外提供 HTTPS 和静态文件
2. `Backend_front/dist` 放到 Nginx 静态目录
3. `JavaSB_back` 由 `systemd` 托管，监听 `127.0.0.1:8082`
4. `Nginx` 把 `/api`、`/uploads`、`/static` 反向代理到后端
5. 小程序生产环境统一请求 `https://api.你的域名`
6. MySQL、Redis 使用 Linux 正式环境服务

如果你的域名规划允许，推荐：

- 管理后台：`https://admin.example.com`
- 后端接口：`https://api.example.com`
- 资源 CDN：`https://cdn.example.com`

如果你想让后台继续保持当前 `VITE_API_URL=/` 的写法，最简单的是：

- 后台页面和 `/api` 走同一个域名
- 由 Nginx 在同域下做反向代理

## 4. Linux 正式部署步骤

### 4.1 服务器准备

准备一台 Linux 服务器，建议安装：

- Nginx
- MySQL 8
- Redis 6 或 7
- JDK 21 或其他可兼容当前 `pom.xml` 的 JDK 20+
- Node.js 20+
- pnpm 8+

建议建立统一目录：

```bash
sudo mkdir -p /opt/edu/backend
sudo mkdir -p /opt/edu/config
sudo mkdir -p /data/edu/uploads/code
sudo mkdir -p /data/edu/uploads/papers
sudo mkdir -p /data/edu/uploads/course/cover
sudo mkdir -p /data/edu/uploads/course/video
sudo mkdir -p /data/edu/tmp
sudo mkdir -p /var/www/edu-admin
```

### 4.2 初始化数据库和 Redis

1. 在 Linux 上安装并启动 MySQL、Redis。
2. 创建数据库，例如：

```sql
CREATE DATABASE edu_data DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

3. 导入仓库根目录的 `database.sql`。
4. 为正式环境创建独立数据库账号，不建议继续使用 `root`。
5. 确认 Redis 可用，并记录连接信息。

### 4.3 为后端创建生产配置

不要直接拿当前仓库里的 `application.yml` 当正式配置。正式环境建议新建外部配置文件，例如：

`/opt/edu/config/application-prod.yml`

示例：

```yaml
spring:
  datasource:
    dynamic:
      primary: master
      datasource:
        master:
          url: jdbc:mysql://127.0.0.1:3306/edu_data?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: edu_app
          password: "请替换成正式库密码"
          driver-class-name: com.mysql.cj.jdbc.Driver
        slave:
          url: jdbc:mysql://127.0.0.1:3306/edu_data?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
          username: edu_app
          password: "请替换成正式库密码"
          driver-class-name: com.mysql.cj.jdbc.Driver
  data:
    redis:
      host: 127.0.0.1
      port: 6379
      database: 0

server:
  port: 8082

app:
  config:
    jwt-secret: "请替换成正式环境密钥"
    upload-dir: /data/edu/uploads/code/
    paper-dir: /data/edu/uploads/papers/
    course-cover-dir: /data/edu/uploads/course/cover/
    course-video-dir: /data/edu/uploads/course/video/
    upload-temp-dir: /data/edu/tmp/
    oss-endpoint: oss-cn-hangzhou.aliyuncs.com
    oss-bucket: your-bucket
    oss-access-key-id: "请改成环境变量或正式值"
    oss-access-key-secret: "请改成环境变量或正式值"
    oss-public-base-url: https://cdn.example.com/
    qwen-api-key: "请改成环境变量或正式值"
    aliyun-ocr-access-key-id: "请改成环境变量或正式值"
    aliyun-ocr-access-key-secret: "请改成环境变量或正式值"
    aliyun-sms-access-key-id: "请改成环境变量或正式值"
    aliyun-sms-access-key-secret: "请改成环境变量或正式值"

wechat:
  pay:
    appid: "你的小程序 appid"
    mchid: "你的商户号"
    apiV3Key: "你的 APIv3 Key"
    privateKeyPath: apiclient_key.pem
    publicKeyPath: pub_key.pem
    publicKeyId: "你的微信支付公钥 ID"
    merchantSerialNumber: "你的商户证书序列号"
    notifyUrl: https://api.example.com/api/pay/wechat/notify
    virtual-payment:
      offerId: "你的 offerId"
      appSecret: "你的虚拟支付 appSecret"
      env: 1
      securityKey: "你的 securityKey"
      notifyUrl: /api/pay/midas/notify
```

说明：

- `upload-dir`、`paper-dir`、`course-cover-dir`、`course-video-dir` 必须改成 Linux 绝对路径
- `notifyUrl` 必须改成正式可公网访问地址，不能继续用开发内网 IP
- 敏感信息不要继续直接写死在仓库里，建议改成环境变量或外部配置
- 当前代码里的微信支付证书通过 classpath 读取，因此如果继续沿用现有实现，`apiclient_key.pem` 和 `pub_key.pem` 需要跟随打包进入 jar 的 classpath

### 4.4 打包 Spring Boot 后端

在 Windows 构建也可以，在 Linux 构建也可以。当前项目自带 Maven Wrapper。

Windows：

```powershell
cd JavaSB_back
.\mvnw.cmd clean package -DskipTests
```

Linux：

```bash
cd JavaSB_back
chmod +x mvnw
./mvnw clean package -DskipTests
```

打包完成后，把生成的 jar 上传到 Linux，例如：

```bash
/opt/edu/backend/app.jar
```

### 4.5 使用 systemd 托管后端

新建：

`/etc/systemd/system/edu-backend.service`

示例：

```ini
[Unit]
Description=Edu Spring Boot Backend
After=network.target mysql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/edu/backend
ExecStart=/usr/bin/java -jar /opt/edu/backend/app.jar --spring.profiles.active=prod --spring.config.additional-location=/opt/edu/config/
SuccessExitStatus=143
Restart=always
RestartSec=5
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

然后执行：

```bash
sudo systemctl daemon-reload
sudo systemctl enable edu-backend
sudo systemctl start edu-backend
sudo systemctl status edu-backend
sudo journalctl -u edu-backend -f
```

### 4.6 打包并部署后台管理前端

当前后台前端生产配置是：

```env
VITE_API_URL=/
```

这意味着正式部署有两种方案：

方案 A，推荐，保持当前代码不改：

- 保持 `VITE_API_URL=/`
- 让 Nginx 把 `/api` 代理到 Spring Boot
- 让 Nginx 把 `/uploads` 代理到 Spring Boot

方案 B：

- 把 `VITE_API_URL` 改成 `https://api.example.com`
- 后台前端直接跨域请求接口
- 这种方式对 CORS、Cookie、网关配置要求更高

因为当前项目已经按方案 A 设计，所以建议继续用方案 A。

构建命令：

```bash
cd Backend_front
pnpm install
pnpm build
```

构建产物在：

```text
Backend_front/dist
```

部署到 Linux：

```bash
sudo cp -r Backend_front/dist/* /var/www/edu-admin/
```

### 4.7 打包并发布微信小程序前端

这里要特别注意，当前仓库里的 `WX_mini_front/.env.production` 还是内网 IP：

```env
VITE_SERVER_BASEURL=http://10.63.205.29:8082
```

正式发布前必须改成正式可访问地址，建议改成：

```env
VITE_SERVER_BASEURL=https://api.example.com
VITE_STATIC_BASEURL=https://cdn.example.com/static
```

然后执行：

```bash
cd WX_mini_front
pnpm install
pnpm build:mp-weixin
```

产物目录：

```text
WX_mini_front/dist/build/mp-weixin
```

再通过微信开发者工具导入该目录并上传发布。

同时必须在微信公众平台配置合法域名：

- request 合法域名：`https://api.example.com`
- uploadFile 合法域名：`https://api.example.com`
- downloadFile 合法域名：`https://api.example.com` 或 `https://cdn.example.com`
- 媒体文件域名：如果图片/视频走 CDN，也要把 CDN 域名加入

如果你继续使用 IP 地址、`http`、未备案域名，生产版小程序会直接失败。

### 4.8 配置 Nginx

如果后台前端和接口走同一个域名，可以用下面的配置思路。

示例：

```nginx
server {
    listen 80;
    server_name admin.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name admin.example.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    root /var/www/edu-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8082/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:8082/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        proxy_pass http://127.0.0.1:8082/static/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果你准备把后端单独挂在 `api.example.com`，也可以再配一个独立的 `server` 块给 API 域名。

## 5. 这次你发现“后台和开发环境不一样”的直接原因

结合当前仓库配置，最可能的直接原因是下面几条中的一条或多条同时存在：

1. `Backend_front` 生产包仍然请求 `/api`，但 Linux 上没有配置 Nginx 反向代理。
2. `WX_mini_front/.env.production` 仍然指向旧内网 IP，不是现在这台 Linux 服务器。
3. 后端 `application.yml` 里还保留着开发环境地址和相对路径。
4. 正式环境的数据库、Redis、OSS、微信支付参数并没有和开发环境同步。
5. 上传目录在 Linux 上落到了与你预期不同的位置。

## 6. 对应修复方案

### 6.1 修复后台前端和开发环境不一致

按下面顺序修：

1. 确认后台生产环境是走同域反代，还是走独立 API 域名。
2. 如果保持当前 `VITE_API_URL=/`，就必须补齐 Nginx 的 `/api`、`/uploads`、`/static` 代理。
3. 重新构建 `Backend_front`，替换 Linux 上的 `dist`。
4. 浏览器打开开发者工具，确认后台请求是否发到了你预期的域名和路径。

### 6.2 修复小程序生产环境地址错误

1. 修改 `WX_mini_front/.env.production`。
2. 将 `VITE_SERVER_BASEURL` 改成正式 HTTPS 域名。
3. 重新执行 `pnpm build:mp-weixin`。
4. 用新产物重新上传微信小程序。

### 6.3 修复后端配置仍然偏开发环境的问题

1. 把数据库、Redis、OSS、支付、短信、AI 配置移到外部生产配置文件。
2. 把上传目录改成 Linux 绝对路径。
3. 把微信支付回调地址改成公网 HTTPS 地址。
4. 重启 `edu-backend` 服务并验证日志。

### 6.4 修复上传文件、图片、试卷、视频地址异常

1. 确认 `/data/edu/uploads/...` 目录存在且有写权限。
2. 确认后端启动用户对这些目录有读写权限。
3. 确认 Nginx 已代理 `/uploads/`。
4. 如果资源已经迁移到 OSS/CDN，确认返回地址和 CDN 域名一致。

## 7. 部署完成后的验收清单

正式部署后，至少验证下面这些项目：

1. 后台登录是否正常。
2. 后台列表接口是否能取到真实数据库数据。
3. 后台上传图片、上传试卷、上传视频是否正常。
4. `/uploads/...` 地址是否能直接访问。
5. 小程序登录、验证码、个人信息、资源页、课程页是否正常。
6. MySQL、Redis、后端服务重启后，系统是否仍能正常工作。
7. 微信支付回调是否打到正式域名，而不是旧内网 IP。
8. Linux 上生成的上传文件是否落在你指定的绝对路径目录。

## 8. 上线前额外建议

从正式部署角度看，当前项目还建议继续做下面几件事：

1. 把 `application.yml` 中的密钥、数据库密码、OSS 密钥、短信密钥全部移出仓库。
2. 新增 `application-prod.yml`，不要让开发配置和生产配置混用。
3. 给 MySQL 建独立业务账号，不要使用 `root`。
4. 把后端监听限制为 `127.0.0.1:8082`，只让 Nginx 对外暴露。
5. 上线前备份数据库，并记录回滚包。

## 9. 一句话结论

这次部署时“后台和开发环境不一样”，本质上不是 Linux 和 Windows 本身不兼容，而是因为这个项目当前强依赖开发代理、内网 IP、相对路径和默认配置。只要把生产环境的反向代理、域名、上传目录、数据库和支付回调改成正式配置，并重新打包发布，Windows 测试环境迁移到 Linux 是可以稳定正式部署的。
