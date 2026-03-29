/**
 * 打印订单管理 Mock 数据
 */
import Mock from 'mockjs'

export const mockPrintOrders = Mock.mock({
  'list|30-50': [
    {
      'id|+1': 20001,
      'orderNo': /POD\d{12}/,
      'userName|1': ['王小二', '陈老师', '周同学', '孙家长', '郑女士'],
      'userPhone': /1[3-9]\d{9}/,
      'documentName|1': ['高一数学错题本', '期中模拟试卷-语文', '英语作文精选', '物理公式汇总'],
      'pages|1-50': 1,
      'printType|1': ['黑白单面', '黑白双面', '彩色单面', '彩色双面'],
      'deliveryMethod|1': ['标准快递', '极速达', '自提'],
      'totalPrice|10-150.2': 1,
      'orderStatus|1': [1, 2, 3, 4, 0], // 1: 待支付, 2: 待打印, 3: 待配送, 4: 已完成, 0: 已取消
      'createTime': '@datetime'
    }
  ]
}).list
