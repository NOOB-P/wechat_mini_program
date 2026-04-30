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
      path: 'pages/resource/index',
      style: {
        navigationBarTitleText: '资源库',
      },
    },
    {
      path: 'pages/mine/index',
      style: {
        navigationBarTitleText: '我的',
      },
    },
    {
      path: 'pages/register/index',
      style: {
        navigationBarTitleText: '注册账号',
      },
    },
  ],
  subPackages: [
    {
      root: 'subpkg_resource',
      pages: [
        {
          path: 'pages/family-edu',
          style: {
            navigationBarTitleText: '家庭教育',
          },
        },
        {
          path: 'pages/paper',
          style: {
            navigationBarTitleText: '名校试卷',
          },
        },
        {
          path: 'pages/paper-list',
          style: {
            navigationBarTitleText: '试卷列表',
          },
        },
        {
          path: 'pages/student-talk',
          style: {
            navigationBarTitleText: '学霸说',
          },
        },
        {
          path: 'pages/sync-course',
          style: {
            navigationBarTitleText: '同步/专题课',
          },
        },
      ],
    },
    {
      root: 'subpkg_course',
      pages: [
        {
          path: 'pages/course/index',
          style: {
            navigationBarTitleText: '课程',
          },
        },
        {
          path: 'pages/course/detail',
          style: {
            navigationBarTitleText: '课程详情',
            navigationBarBackgroundColor: '#FFFFFF',
            navigationBarTextStyle: 'black',
          },
        },
        {
          path: 'pages/course/pay',
          style: {
            navigationBarTitleText: '订单支付',
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
          path: 'pages/vip/school-status',
          style: {
            navigationBarTitleText: '校讯通状态',
          },
        },
      ],
    },
    {
      root: 'subpkg_analysis',
      pages: [
        {
          path: 'pages/score/index',
          style: {
            navigationBarTitleText: '学情分析',
          },
        },
        {
          path: 'pages/score/composition',
          style: {
            navigationBarTitleText: '成绩构成分析',
          },
        },
        {
          path: 'pages/score/distribution',
          style: {
            navigationBarTitleText: '分数分布统计',
          },
        },
        {
          path: 'pages/score/trend',
          style: {
            navigationBarTitleText: '近六次考试趋势分析',
          },
        },
        {
          path: 'pages/score/wrong-push',
          style: {
            navigationBarTitleText: '错题举一反三',
          },
        },
        {
          path: 'pages/paper/index',
          style: {
            navigationBarTitleText: '试卷报告',
          },
        },
      ],
    },
    {
      root: 'subpkg_mine',
      pages: [
        {
          path: 'pages/mine/course-list',
          style: {
            navigationBarTitleText: '我的课程',
          },
        },
        {
          path: 'pages/mine/about',
          style: {
            navigationBarTitleText: '关于我们',
          },
        },
        {
          path: 'pages/mine/edit-profile',
          style: {
            navigationBarTitleText: '修改资料',
          },
        },
        {
          path: 'pages/mine/order-list',
          style: {
            navigationBarTitleText: '已购订单',
          },
        },
        {
          path: 'pages/mine/notifications',
          style: {
            navigationBarTitleText: '消息通知',
          },
        },
        {
          path: 'pages/mine/notification-detail',
          style: {
            navigationBarTitleText: '通知详情',
          },
        },
        {
          path: 'pages/mine/settings/index',
          style: {
            navigationBarTitleText: '个人设置',
          },
        },
        {
          path: 'pages/service/index',
          style: {
            navigationBarTitleText: '客服帮助',
          },
        },
      ],
    },
  ],
  preloadRule: {
    'pages/home/index': {
      network: 'all',
      packages: ['subpkg_course', 'subpkg_analysis'],
    },
    'pages/resource/index': {
      network: 'all',
      packages: ['subpkg_resource'],
    },
    'pages/mine/index': {
      network: 'all',
      packages: ['subpkg_mine'],
    },
  },
	globalStyle: {
		navigationBarTextStyle: "black",
		navigationBarTitleText: "优题慧",
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
			selectedIconPath: 'static/tabbar/tabbar_home_active.png',
			pagePath: 'pages/home/index',
			text: '首页',
		  },
		  {
			iconPath: 'static/tabbar/tabbar_resource.png',
			selectedIconPath: 'static/tabbar/tabbar_resource_active.png',
			pagePath: 'pages/resource/index',
			text: '资源库',
		  },
		  {
			iconPath: 'static/tabbar/tabbar_mine.png',
			selectedIconPath: 'static/tabbar/tabbar_mine_active.png',
			pagePath: 'pages/mine/index',
			text: '我的',
		  },
		],
	  },
});

