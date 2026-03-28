import { defineUniPages } from "@uni-helper/vite-plugin-uni-pages";

export default defineUniPages({
  pages: [
    {
      path: 'pages/login/index',
      type: 'home',
      style: {
        navigationBarTitleText : '登录',
      },
    },
    {
      path: 'pages/auth/bind-student',
      style: {
        navigationBarTitleText: '绑定学生账号',
        appPlus: {
          titleNView: {
            buttons: [
              {
                text: '跳过',
                fontSize: '14px',
                color: '#666666'
              }
            ]
          }
        }
      },
    },
    {
      path: 'pages/auth/forgot-account',
      style: {
        navigationBarTitleText: '找回账号',
      },
    },
    {
      path: 'pages/auth/forgot-password',
      style: {
        navigationBarTitleText: '找回密码',
      },
    },
    {
      path: 'pages/auth/reset-password',
      style: {
        navigationBarTitleText: '重置密码',
      },
    },
    {
      path: 'pages/home/index',
      style: {
        navigationBarTitleText: '首页',
      },
    },
    {
      path: 'pages/course/index',
      style: {
        navigationBarTitleText: '课程',
      },
    },
    {
      path: 'pages/mine/index',
      style: {
        navigationBarTitleText: '我的',
      },
    },
    {
      path: 'pages/paper/index',
      style: {
        navigationBarTitleText: '试卷报告',
      },
    },
    {
      path: 'pages/score/index',
      style: {
        navigationBarTitleText: '成绩分析',
      },
    },
    {
      path: 'pages/service/index',
      style: {
        navigationBarTitleText: '客服帮助',
      },
    },
    {
      path: 'pages/vip/index',
      style: {
        navigationBarTitleText: 'VIP会员',
      },
    },
    {
      path: 'pages/vip/recharge',
      style: {
        navigationBarTitleText: '会员充值',
      },
    },
    {
      path: 'pages/mine/settings/index',
      style: {
        navigationBarTitleText: '个人设置',
      },
    },
    {
      path: 'pages/register/index',
      style: {
        navigationBarTitleText: '注册账号',
      },
    },
  ],
	globalStyle: {
		navigationBarTextStyle: "black",
		navigationBarTitleText: "russ-uniapp",
		navigationBarBackgroundColor: "#F8F8F8",
		backgroundColor: "#F8F8F8",
	},
	tabBar: {
		color: '#999999',
		selectedColor: '#1a5f8e',
		backgroundColor: '#fefefe',
		borderStyle: 'black',
		list: [
		  {
			iconPath: 'static/tabbar/tabbar_home.png',
			selectedIconPath: 'static/tabbar/tabbar_home.png',
			pagePath: 'pages/home/index',
			text: '首页',
		  },
		  {
			iconPath: 'static/tabbar/tabbar_course.png',
			selectedIconPath: 'static/tabbar/tabbar_course.png',
			pagePath: 'pages/course/index',
			text: '课程',
		  },
		  {
			iconPath: 'static/tabbar/tabbar_mine.png',
			selectedIconPath: 'static/tabbar/tabbar_mine.png',
			pagePath: 'pages/mine/index',
			text: '我的',
		  },
		],
	  },
});
