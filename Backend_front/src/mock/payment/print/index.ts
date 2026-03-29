/**
 * 打印价格管理 Mock 数据
 */
export const mockPrintConfig = {
  // 纸张价格配置
  paperPrices: [
    { id: 1, type: 'A4', side: '单面', color: '黑白', price: 0.20, minQuantity: 1, unit: '张' },
    { id: 2, type: 'A4', side: '双面', color: '黑白', price: 0.35, minQuantity: 1, unit: '张' },
    { id: 3, type: 'A4', side: '单面', color: '彩色', price: 1.00, minQuantity: 1, unit: '张' },
    { id: 4, type: 'A4', side: '双面', color: '彩色', price: 1.80, minQuantity: 1, unit: '张' },
    { id: 5, type: 'A3', side: '单面', color: '黑白', price: 0.50, minQuantity: 1, unit: '张' }
  ],
  // 配送费配置
  deliveryConfigs: [
    { id: 1, name: '标准快递', price: 8.00, freeLimit: 50.00, description: '普通快递配送，预计2-3天送达' },
    { id: 2, name: '极速达', price: 15.00, freeLimit: 100.00, description: '顺丰特快，预计次日送达' },
    { id: 3, name: '自提', price: 0.00, freeLimit: 0.00, description: '学校指定地点自提' }
  ],
  // 其他配置
  otherConfigs: {
    bindingPrice: 2.00, // 装订费
    minOrderPrice: 5.00 // 起印金额
  }
}
