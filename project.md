# 项目说明
1. 先配置好trea
- 配置知识库（文档）:
名字：vue3前端ui库element-plus
url: https://element-plus.org/zh-CN/component/overview

名字：vue3前端ui库wot-design-uni
url: https://wot-design-uni.youyushe.com/

- 配置rule.md文件

2. 配置项目
前端都要pnpm install
1. idea打开后端，自动下载组件
2. uniapp的编辑器HBuilderX导入小程序前端，运行自动打开微信开发者工具（自动编译热更新，方便看ui）

# 开发说明
1. 提示词前要加上`小程序前端``后台前端`等字，要不然会改串
2. 一个后端可以被小程序请求，也可以被后台请求但是接口要分别设置（两个文件夹）
3. 一个人开发一个功能，功能包含前端和后端，接口传参细节看rule
4. 开发的页面一个页面文件，对应一个前端的请求文件，对应后端一个类文件，同名（好维护）

数据库结构参考：
database.sql



# 后端配置手册
## 1. 基础环境
- **JDK版本**: JDK 21+ (请确保本地环境变量已正确配置 `JAVA_HOME`)
- **构建工具**: Maven (项目自带 `mvnw` 包装器，无需全局安装)
- **数据库**: MySQL 8.0+
- **中间件**: Redis (建议安装并启动在默认端口 6379)

## 2. 启动说明
### 2.1 修改配置文件
在运行项目之前，请确认 `src/main/resources/application.properties` (或 `.yml`) 中的以下配置是否与你本地环境一致：
- **数据库连接**: `spring.datasource.url`、`username`、`password`
- **Redis连接**: `spring.data.redis.host`、`port`

### 2.2 启动项目
在后端根目录 (`JavaSB_back`) 下打开终端，运行以下命令启动：
```bash
# Windows
./mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```
默认运行端口为 `8080`。

## 3. 常见问题 (FAQ)
- **跨域问题 (CORS)**
  项目已在 `CorsConfig.java` 中全局配置跨域。如果前端请求仍报跨域，请检查前端启动的端口（如 `http://localhost:5173`）是否已添加到 `CorsConfig` 的 `allowedOrigins` 列表中。注意：配置了 `allowCredentials(true)` 时，不允许使用 `*` 匹配源。

- **403 Forbidden 错误**
  项目集成了 Spring Security，默认会拦截所有未授权请求。测试接口或新开发的免登录接口，请在 `SecurityConfig.java` 中的 `securityFilterChain` 方法里，使用 `.requestMatchers("/your-api/**").permitAll()` 进行放行配置。
  *注：测试阶段为了方便可临时放行 `/**`，上线前务必修改回精确的权限控制。*

- **端口被占用 (Port 8080 in use)**
  如果提示 `Port 8080 was already in use`，请通过以下命令杀死占用端口的进程：
  - Windows (PowerShell): `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess -Force`
  - macOS/Linux: `kill -9 $(lsof -t -i:8080)`

  现在可修改后端端口，现在默认为 `8082`，与前端端口对应。

