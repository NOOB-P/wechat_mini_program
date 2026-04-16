/**
 * 登录 Mock 数据
 */
export const mockLoginData = {
    admin: {
        token: 'mock-token-admin',
        refreshToken: 'mock-refresh-token-admin',
        userInfo: {
            userId: 1,
            userName: 'Admin',
            nickName: '超级管理员',
            userPhone: '13800000001',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
            roles: ['R_SUPER'],
            buttons: ['*'],
            email: 'admin@example.com'
        }
    },
    school: {
        token: 'mock-token-school',
        refreshToken: 'mock-refresh-token-school',
        userInfo: {
            userId: 2,
            userName: 'School',
            nickName: '第一中学校长',
            userPhone: '13800000002',
            schoolName: '第一中学',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=School',
            roles: ['R_SCHOOL'],
            buttons: ['exam:view', 'student:view'],
            email: 'school1@example.com'
        }
    }
};
//# sourceMappingURL=login.js.map