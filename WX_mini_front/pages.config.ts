import { defineUniPages } from "@uni-helper/vite-plugin-uni-pages";

export default defineUniPages({
	pages: [
		{
			path: "pages/login/index",
			style: {
				navigationBarTitleText: "登录",
			},
		},
		{
			path: "pages/home/index",
			style: {
				navigationBarTitleText: "首页",
			},
		},
		{
			path: "pages/course/index",
			style: {
				navigationBarTitleText: "课程",
			},
		},
		{
			path: "pages/mine/index",
			style: {
				navigationBarTitleText: "我的",
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