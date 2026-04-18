export interface EnterpriseCustomerServiceConfig {
  groupName?: string
  corpId?: string
  customerServiceUrl?: string
}

export const openEnterpriseCustomerServiceChat = (config?: EnterpriseCustomerServiceConfig) => {
  return new Promise<void>((resolve, reject) => {
    if (!config?.corpId || !config?.customerServiceUrl) {
      reject(new Error('客服配置不完整'))
      return
    }

    const wechatApi = typeof wx !== 'undefined' ? wx : null
    if (!wechatApi || typeof wechatApi.openCustomerServiceChat !== 'function') {
      reject(new Error('当前环境不支持企业微信客服'))
      return
    }

    wechatApi.openCustomerServiceChat({
      corpId: config.corpId,
      extInfo: {
        url: config.customerServiceUrl
      },
      success: () => resolve(),
      fail: (error) => reject(error)
    })
  })
}
