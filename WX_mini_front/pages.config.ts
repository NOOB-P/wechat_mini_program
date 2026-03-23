import { defineUniPages } from "@uni-helper/vite-plugin-uni-pages";

export default defineUniPages({
	// 你也可以定义 pages 字段，它具有最高的优先级。
	pages: [
		{
			path: "pages/index/index",
			style: {
				navigationBarTitleText: "首页",
			},
		},
		{
			path: "pages/mine/index",
			style: {
				navigationBarTitleText: "我的",
			},
		}
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
			pagePath: 'pages/index/index',
			text: '首页',
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
