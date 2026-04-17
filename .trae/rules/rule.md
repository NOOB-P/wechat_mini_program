# 当前项目的程序架构
### 后台前端
ui库 Element Plus
模板 Art Design Pro

### 小程序前端
ui库 Wot Design Uni
模版 uniapp-WXMiniProgram-develop-template

### 后端
springboot JDK20

### 中间件
redis
mysql

# 项目修改的规则
### 前端规则
- 前端接收后端的数据错误都要进行用户提示

### 统一前端ui库
- 小程序前端：Wot Design Uni
- 后台前端：Element Plus

- 小程序页面统一添加"navigationBarTitleText"

### 统一返回请求接口

- 统一后端接口，返回值格式为：
```json
{
    "code": 200,
    "msg": "提示",
    "data": {}
}
```
- 统一后端接口，请求参数格式为：
```json
{
    "param1": "value1",
    "param2": "value2"
}
```

### 文件以及目录规定
- 需要按照功能和组件创建目录名字
- 每个前端文件不能超过500行，超过500行的文件需要进行拆分
- 每个目录不能超过10个文件，超过10个文件的目录需要进行拆分
- 每个前端的界面.vue都要有一个文件对应的api，api文件的名字要和.vue文件的名字相同，只是后缀名不同


### 后端规则
- 后端中，小程序和后台分别用不同接口
- 统一把接口（包括请求参数和返回值的格式）返回状态表写在api.md中
- 账户管理做一个权限控制，低权限角色无法操作高权限角色，比如说后台管理账户无法增删改查管理员，同级权限可以操作同级账户，家长无权登录后台
- 后端在创建实例时，需要加上setters和getter

