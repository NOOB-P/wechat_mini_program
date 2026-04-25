/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义
 *
 * ## 主要功能
 *
 * - 通用类型（分页参数、响应结构等）
 * - 认证类型（登录、用户信息等）
 * - 系统管理类型（用户、角色等）
 * - 全局命名空间声明
 *
 * ## 使用场景
 *
 * - API 请求参数类型约束
 * - API 响应数据类型定义
 * - 接口文档类型同步
 *
 * ## 注意事项
 *
 * - 在 .vue 文件使用需要在 eslint.config.mjs 中配置 globals: { Api: 'readonly' }
 * - 使用全局命名空间，无需导入即可使用
 *
 * ## 使用方式
 *
 * ```typescript
 * const params: Api.Auth.LoginParams = { userName: 'admin', password: '123456' }
 * const response: Api.Auth.UserInfo = await fetchUserInfo()
 * ```
 *
 * @module types/api/api
 * @author Art Design Pro Team
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数 */
    interface PaginationParams {
      /** 当前页码 */
      current: number
      /** 每页条数 */
      size: number
      /** 总条数 */
      total: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Pick<PaginationParams, 'current' | 'size'>

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      records: T[]
      current: number
      size: number
      total: number
    }

    /** 启用状态 */
    type EnableStatus = '1' | '2'
  }

  /** 认证类型 */
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      userName?: string
      phone?: string
      password?: string
      code?: string
      loginType?: string
      roleId?: number
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      permissions: string[]
      roles: string[]
      userId: number
      userName: string
      nickName?: string
      phone?: string
      userPhone?: string
      schoolName?: string
      email: string
      avatar?: string
      roleCode?: string
    }
  }

  /** 内容管理相关类型 */
  namespace ContentManage {
    interface PermissionOption {
      menuPermission: string
      title: string
      routePath: string
      icon?: string
      permissionCodes: string[]
    }

    interface RolePermissionItem {
      id: number
      roleName: string
      roleCode: string
      description?: string
      status: number
      permissionCodes: string[]
    }

    interface PermissionSearchParams extends Api.Common.CommonSearchParams {
      roleName?: string
    }
  }

  /** 系统管理类型 */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<UserListItem>

    /** 用户列表项 */
    interface UserListItem {
      id: number
      avatar: string
      status: string
      userName: string
      userGender: string
      nickName: string
      isVip?: number
      isSvip?: number
      vipStartTime?: string
      svipStartTime?: string
      vipExpireTime?: string
      svipExpireTime?: string
      userPhone?: string
      userType?: '1' | '2' | '3' | '4'
      schoolName?: string
      gradeName?: string
      className?: string
      studentName?: string
      parentName?: string
      boundStudents?: Array<Record<string, any>>
    }

    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'status'> &
        Api.Common.CommonSearchParams & {
          userPhone?: string
          userEmail?: string
        }
    >

    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    interface RoleListItem {
      id?: number
      roleId: number
      roleName: string
      roleCode: string
      description: string
      status?: number
      enabled: boolean
      createTime: string
    }

    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }

  /** 核心业务 - 学校架构 */
  namespace School {
    /** 节点类型 */
    type NodeType = 'province' | 'city' | 'school' | 'grade' | 'class'

    /** 架构节点 */
    interface ArchitectureNode {
      id: string
      name: string
      type: NodeType
      children?: ArchitectureNode[]
    }

    /** 节点操作参数 */
    interface NodeParams {
      id?: string
      name: string
      type: NodeType
      parentId?: string
      parentName?: string
    }
  }

  /** 核心业务 - 学生档案 */
  namespace Student {
    /** 学生信息 */
    interface StudentItem {
      id: string
      name: string
      studentNo: string
      schoolId?: string
      classId?: string
      school: string
      grade: string
      className: string
      parentPhone: string
      boundCount: number
    }

    /** 学生搜索参数 */
    interface StudentSearchParams extends Api.Common.CommonSearchParams {
      name?: string
      studentNo?: string
      school?: string
      grade?: string
      className?: string
    }

    /** 批量操作参数 */
    interface BatchOpParams {
      ids: string[]
      type: 'vip' | 'svip'
      action: 'enable' | 'disable'
    }
  }

  /** 核心业务 - 考试数据 */
  namespace Exam {
    /** 考试项 */
    interface ExamItem {
      id: string
      name: string
      school: string
      grade: string
      className: string
      date: string
      status: '已解析' | '解析中' | '待解析'
      successCount: number
      failCount: number
    }

    /** 考试搜索参数 */
    interface ExamSearchParams extends Api.Common.CommonSearchParams {
      name?: string
      school?: string
      grade?: string
      className?: string
    }

    /** 解析成功项 */
    interface SuccessItem {
      studentNo: string
      name: string
      school: string
      grade: string
      className: string
      questionScores: number[]
      score: number
    }

    /** 解析失败项 */
    interface FailItem {
      studentNo: string
      reason: string
    }

    /** 解析结果 */
    interface AnalysisResult {
      successList: SuccessItem[]
      failList: FailItem[]
    }

    /** 用户列表项 */
    interface UserListItem {
      id: number
      userName: string
      userGender: string
      nickName: string
      userPhone: string
      userEmail: string
      userRoles: string[]
      status: string
      roleId: number | string

      isVip?: number
      isSvip?: number
      /** 用户类型: 1-管理员, 2-学校, 3-家长, 4-学生 */
      userType: '1' | '2' | '3' | '4'
      /** 绑定的学校 */
      schoolName?: string
      /** 绑定的年级 */
      gradeName?: string
      /** 绑定的班级 */
      className?: string
      /** 绑定的学生姓名（家长用户用） */
      studentName?: string
      /** 绑定的家长姓名（学生用户用） */
      parentName?: string
      createBy: string
      createTime: string
      updateBy: string
      updateTime: string
    }

    /** 用户搜索参数 */
    type UserSearchParams = Partial<
      Pick<UserListItem, 'id' | 'userName' | 'userGender' | 'userPhone' | 'userEmail' | 'status' | 'roleId' | 'schoolName' | 'className'> &
        Api.Common.CommonSearchParams
    >

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      id?: number
      roleId: number
      roleName: string
      roleCode: string
      description: string
      status?: number
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }

}
