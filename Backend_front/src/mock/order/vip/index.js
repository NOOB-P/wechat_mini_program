/**
 * VIP 订单管理 Mock 数据
 */
import Mock from 'mockjs';
export const mockVipOrders = Mock.mock({
    'list|30-50': [
        {
            'id|+1': 10001,
            'orderNo': /VOD\d{12}/,
            'userName|1': ['张小明', '李华', '王建国', '赵红', '刘洋'],
            'userPhone': /1[3-9]\d{9}/,
            'packageType|1': ['VIP 基础版', 'SVIP 专业版'],
            'period|1': ['月包', '季包(一学期)', '年包'],
            'price|1': [29.00, 59.00, 99.00, 199.00, 299.00, 599.00],
            'paymentStatus|1': [1, 1, 1, 0, 2], // 1: 已支付, 0: 待支付, 2: 已退款
            'paymentMethod|1': ['微信支付', '支付宝', '余额支付'],
            'createTime': '@datetime'
        }
    ]
}).list;
//# sourceMappingURL=index.js.map