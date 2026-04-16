/**
 * 日志管理 Mock 数据
 */
import Mock from 'mockjs';
export const mockLogList = Mock.mock({
    'list|50-100': [
        {
            'id|+1': 1,
            'userName|1': ['admin', 'school_admin', 'parent_wang', 'student_zhang', 'teacher_li'],
            'nickName|1': ['超级管理员', '第一中学校长', '王小明家长', '张三', '李老师'],
            'operation|1': [
                '登录系统',
                '退出系统',
                '修改用户: admin',
                '新增学生: 李华',
                '导出考试数据: 期中考试',
                '删除角色: 访客',
                '更新学校架构',
                '重置密码: student_001',
                '上传试卷: 高一数学',
                '批量开通 VIP'
            ],
            'method|1': ['POST', 'GET', 'PUT', 'DELETE'],
            'url|1': [
                '/api/auth/login',
                '/api/system/user/update',
                '/api/student/add',
                '/api/exam/export',
                '/api/system/role/delete',
                '/api/school/update',
                '/api/auth/reset-password',
                '/api/exam/upload'
            ],
            'ip': '@ip',
            'location|1': ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京'],
            'status|1': [200, 200, 200, 200, 500, 403, 401],
            'createTime': '@datetime'
        }
    ]
}).list;
//# sourceMappingURL=log.js.map