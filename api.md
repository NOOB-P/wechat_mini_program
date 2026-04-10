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
