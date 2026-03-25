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


# 提示词模板
1. 把pages所有实现模拟实现后端逻辑的script文件的和位置标注出来，之后将这些逻辑写在mock文件夹中，模拟后端逻辑，接着把调用请求的函数写在api中，用来对接前端和后端，最后pages页面调用api中的接口
2. 

