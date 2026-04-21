# 考试项目管理接口

统一返回格式：

```json
{
  "code": 200,
  "msg": "提示信息",
  "data": {}
}
```

状态说明：

| code | 说明 |
| --- | --- |
| 200 | 请求成功 |
| 500 | 业务校验失败或服务异常 |

## 1. 获取考试项目列表

- 方法：`GET`
- 地址：`/api/system/exam-project/list`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| current | number | 否 | 当前页，默认 `1` |
| size | number | 否 | 每页条数，默认 `10` |
| name | string | 否 | 项目名称模糊搜索 |
| examType | string | 否 | 考试类型：`NORMAL` / `JOINT` |

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| records | array | 项目列表 |
| total | number | 总数 |
| current | number | 当前页 |
| size | number | 每页条数 |
| pages | number | 总页数 |

## 2. 获取考试项目创建配置

- 方法：`GET`
- 地址：`/api/system/exam-project/options`
- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| schools | array | 学校选项列表 |
| classes | array | 班级选项列表 |
| subjects | array | 科目选项列表 |

## 3. 创建考试项目

- 方法：`POST`
- 地址：`/api/system/exam-project/add`
- 请求体：

```json
{
  "name": "2026春季期中联考",
  "examType": "JOINT",
  "schoolIds": ["SCH001", "SCH002"],
  "classIds": [],
  "subjects": ["语文", "数学", "英语"]
}
```

说明：

- `NORMAL` 普通考试时必须传 `classIds`
- `JOINT` 联合考试时必须传 `schoolIds`
- `subjects` 至少选择一个科目

## 4. 编辑考试项目

- 方法：`PUT`
- 地址：`/api/system/exam-project/edit`
- 请求体：

```json
{
  "id": "EP202604090001",
  "name": "2026春季期中联考",
  "examType": "NORMAL",
  "schoolIds": [],
  "classIds": ["CLS001", "CLS002"],
  "subjects": ["语文", "数学", "英语"]
}
```

## 5. 删除考试项目

- 方法：`DELETE`
- 地址：`/api/system/exam-project/delete/{id}`

## 6. 获取考试项目详情

- 方法：`GET`
- 地址：`/api/system/exam-project/detail/{id}`
- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| project | object | 项目基础信息与已选学校/班级 |
| stats | object | 学校数、班级数、考生数、科目数、成绩条数 |
| classes | array | 当前项目纳入的班级列表 |
| subjects | array | 当前项目科目概览 |
| schools | array | 当前项目学校概览 |

## 7. 获取项目考生列表

- 方法：`GET`
- 地址：`/api/system/exam-project/students`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |
| current | number | 否 | 当前页，默认 `1` |
| size | number | 否 | 每页条数，默认 `10` |
| keyword | string | 否 | 姓名/考号搜索 |
| schoolId | string | 否 | 学校筛选 |
| classId | string | 否 | 班级筛选 |

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| records | array | 考生列表 |
| total | number | 总数 |
| current | number | 当前页 |
| size | number | 每页条数 |
| pages | number | 总页数 |
| stats | object | 覆盖学校、班级、考生、完成数等统计 |

## 8. 获取项目成绩概览

- 方法：`GET`
- 地址：`/api/system/exam-project/scores/summary`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| records | array | 各科目成绩概览 |
| stats | object | 科目数、已录入科目数、成绩条数、项目考生数 |

## 9. 获取项目成绩明细

- 方法：`GET`
- 地址：`/api/system/exam-project/scores/list`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |
| subjectName | string | 否 | 科目筛选 |
| current | number | 否 | 当前页，默认 `1` |
| size | number | 否 | 每页条数，默认 `10` |
| keyword | string | 否 | 姓名/考号搜索 |
| schoolId | string | 否 | 学校筛选 |
| classId | string | 否 | 班级筛选 |

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| records | array | 成绩明细列表 |
| total | number | 总数 |
| current | number | 当前页 |
| size | number | 每页条数 |
| pages | number | 总页数 |

## 9.1 获取试卷配置

- 方法：`GET`
- 地址：`/api/system/exam-project/papers/config`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |
| subjectName | string | 是 | 学科名称 |

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| templateUrl | string/null | 样板答题卡图片地址 |
| originalUrl | string/null | 原卷图片地址 |
| templateRegions | array | 样板答题卡框选区域 |
| originalRegions | array | 原卷框选区域 |

## 9.2 保存试卷框选布局

- 方法：`POST`
- 地址：`/api/system/exam-project/papers/layout/save`
- 请求体：

```json
{
  "projectId": "EP202604180001",
  "subjectName": "数学",
  "type": "original",
  "regions": [
    {
      "id": "PR202604180001",
      "questionNo": "第1题",
      "questionType": "选择题",
      "knowledgePoint": "",
      "score": 5,
      "remark": "",
      "sortOrder": 1,
      "x": 0.12,
      "y": 0.08,
      "width": 0.32,
      "height": 0.11
    }
  ]
}
```

- 说明：

- `type` 仅支持 `template` 或 `original`
- 坐标采用相对比例，取值范围 `0 ~ 1`

## 9.3 OCR 自动切割试卷

- 方法：`POST`
- 地址：`/api/system/exam-project/papers/layout/ocr-auto`
- 请求体：

```json
{
  "projectId": "EP202604180001",
  "subjectName": "数学",
  "type": "original",
  "imageType": "scan"
}
```

- 说明：

- 后端会读取当前项目学科下已上传的样板答题卡或原卷图片，调用阿里云 `RecognizeEduPaperCut` 试卷切题接口
- 成功后会直接覆盖保存当前 `type` 对应的框选结果
- `imageType` 可选，未传时走后端全局配置，默认 `scan`

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| projectId | string | 项目ID |
| subjectName | string | 学科名称 |
| type | string | 切割目标：`template` / `original` |
| paperUrl | string | 当前识别试卷地址 |
| requestId | string | 阿里云 OCR 请求ID |
| ocrSubject | string | 实际传给 OCR 的学科编码 |
| imageType | string | 实际识别图片类型 |
| cutType | string | OCR 切割类型 |
| recognizedCount | number | 成功识别的题目区域数量 |
| regions | array | 标准化后的框选区域 |

## 10. 获取分析项目列表

- 方法：`GET`
- 地址：`/api/system/exam-analysis/projects`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| name | string | 否 | 项目名称模糊搜索 |

## 11. 获取项目分析大屏

- 方法：`GET`
- 地址：`/api/system/exam-analysis/project-dashboard`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |

## 12. 获取班级分析选择数据

- 方法：`GET`
- 地址：`/api/system/exam-analysis/class-select`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |

## 13. 获取班级分析大屏

- 方法：`GET`
- 地址：`/api/system/exam-analysis/class-dashboard`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |

## 14. 小程序获取考试 AI 成绩报告

- 方法：`GET`
- 地址：`/api/app/score/ai-report`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| examId | string | 是 | 考试项目ID |

- 说明：

- 首次调用时，后端会基于当前学生在该考试项目下的总分、各科分数、小题分、项目/学校/年级/班级对比数据调用 `qwen3.6-plus` 生成报告
- 同一学生在同一考试项目下的报告仅生成一次，后续直接读取缓存
- AI 报告只返回强势点、薄弱点和错题定向推送，不返回学习计划、课程推荐、自习室等内容

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| cached | boolean | 是否命中缓存 |
| model | string | 实际使用的模型名 |
| generatedAt | string | 报告生成时间 |
| summary | object | 总体评价、强势点、薄弱点、重点关注 |
| subjectInsights | array | 各学科洞察 |
| wrongQuestionPushes | array | AI 错题定向推送列表 |
| classId | string | 是 | 考试班级ID |

## 14. 获取学生分析报告

- 方法：`GET`
- 地址：`/api/system/exam-analysis/student-report`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |
| classId | string | 是 | 考试班级ID |
| studentNo | string | 是 | 学号 |

## 15. 获取学生单科分析报告

- 方法：`GET`
- 地址：`/api/system/exam-analysis/student-subject-report`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| projectId | string | 是 | 项目ID |
| classId | string | 是 | 考试班级ID |
| studentNo | string | 是 | 学号 |
| subjectName | string | 是 | 科目名称 |

# 系统通知管理接口

## 1. 获取通知列表

- 方法：`GET`
- 地址：`/api/admin/notifications/list`
- 请求参数：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| title | string | 否 | 通知标题模糊搜索 |

- `data` 返回字段：`Array<Notification>`

## 2. 保存通知 (新增/修改)

- 方法：`POST`
- 地址：`/api/admin/notifications/save`
- 请求体：

```json
{
  "id": 1, 
  "title": "系统维护通知",
  "content": "我们将于凌晨2点进行系统维护...",
  "category": "system",
  "level": "info",
  "targetType": 0,
  "targetUid": null,
  "actionText": "查看详情",
  "actionPath": "/pages/index/index",
  "isPublished": 1
}
```

## 3. 删除通知

- 方法：`DELETE`
- 地址：`/api/admin/notifications/{id}`
# 小程序支付接口

统一返回格式：
```json
{
  "code": 200,
  "msg": "提示信息",
  "data": {}
}
```

状态码补充说明：

| code | 说明 |
| --- | --- |
| 200 | 请求成功 |
| 401 | 未登录 |
| 40101 | 未绑定微信 OpenID，需要先调用微信绑定接口 |
| 500 | 业务处理失败 |

## 1. 绑定当前登录用户微信 OpenID

- 方法：`POST`
- 地址：`/api/app/auth/wechat/bind`
- 请求体：

```json
{
  "code": "wx.login 返回的 code"
}
```

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| openid | string | 当前账号绑定的微信 OpenID |

## 2. 创建课程微信支付参数

- 方法：`POST`
- 地址：`/api/app/course/pay`
- 请求体：

```json
{
  "orderNo": "课程订单号"
}
```

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 本地订单号 |
| payParams | object | `uni.requestPayment` 所需参数 |

## 3. 创建 VIP 微信支付参数

- 方法：`POST`
- 地址：`/api/app/vip/order/pay`
- 请求体：

```json
{
  "orderNo": "VIP订单号"
}
```

- `data` 返回字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 本地订单号 |
| packageType | string | 套餐类型 |
| period | string | 套餐周期 |
| payParams | object | `uni.requestPayment` 所需参数 |

## 4. 微信支付回调

- 方法：`POST`
- 地址：`/api/pay/wechat/notify`
- 说明：
- 仅供微信支付平台回调，不需要前端调用
- 后端会校验签名并按订单号前缀分别处理课程订单与 VIP 订单

## 支付改造补充（虚拟支付拆分）

### 1. 课程支付参数接口

- 方法：`POST`
- 地址：`/api/app/course/pay`
- 请求体：

```json
{
  "orderNo": "课程订单号"
}
```

- `data` 返回字段：
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 本地订单号 |
| paymentType | string | 支付类型，`VIRTUAL` 表示微信虚拟支付，`PHYSICAL` 表示普通微信支付 |
| payParams | object | 支付参数；虚拟商品场景下返回 `offerId`、`goodsId` |
| security | object | 虚拟支付确认签名，包含 `timestamp`、`nonceStr`、`signature` |
| courseTitle | string | 课程标题 |

### 2. 课程虚拟支付确认接口

- 方法：`POST`
- 地址：`/api/app/course/pay/confirm`
- 请求体：

```json
{
  "orderNo": "课程订单号",
  "security": {
    "timestamp": "1713700000",
    "nonceStr": "随机串",
    "signature": "后端签名"
  }
}
```

### 3. VIP 支付参数接口

- 方法：`POST`
- 地址：`/api/app/vip/order/pay`
- 请求体：

```json
{
  "orderNo": "VIP订单号"
}
```

- `data` 返回字段：
| 字段 | 类型 | 说明 |
| --- | --- | --- |
| orderNo | string | 本地订单号 |
| paymentType | string | 支付类型，`VIRTUAL` 表示微信虚拟支付，`PHYSICAL` 表示普通微信支付 |
| packageType | string | 套餐类型 |
| period | string | 套餐周期 |
| payParams | object | 支付参数；虚拟商品场景下返回 `offerId`、`goodsId` |
| security | object | 虚拟支付确认签名，包含 `timestamp`、`nonceStr`、`signature` |

### 4. VIP 虚拟支付确认接口

- 方法：`POST`
- 地址：`/api/app/vip/order/pay/confirm`
- 请求体：

```json
{
  "orderNo": "VIP订单号",
  "security": {
    "timestamp": "1713700000",
    "nonceStr": "随机串",
    "signature": "后端签名"
  }
}
```

### 5. 说明

- 课程、VIP 等虚拟商品统一返回 `paymentType=VIRTUAL`，前端走 `wx.requestVirtualPayment`
- 错题打印等实物商品继续保留原有普通微信支付逻辑
- 后端保留普通微信支付回调 `/api/pay/wechat/notify`，仅用于实物商品或后续普通支付场景
