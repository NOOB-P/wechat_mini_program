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
      nickName: '系统管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      roles: ['R_ADMIN'],
      buttons: ['*']
    }
  },
  school: {
    token: 'mock-token-school',
    refreshToken: 'mock-refresh-token-school',
    userInfo: {
      userId: 2,
      userName: 'School',
      nickName: '学校管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=School',
      roles: ['R_SCHOOL'],
      buttons: ['exam:view', 'student:view']
    }
  }
};
