<template>
  <view class="recharge-container">
    <view class="content">
      
      <!-- 左右卡片容器：可以通过滑动或缩小尺寸并排显示，这里采用上下堆叠，但内部结构一致 -->
      <view class="plan-container">
        
        <!-- VIP 基础版 卡片 -->
        <view class="plan-card vip-card" :class="{ 'is-selected': currentPlan === 'vip' }" @click="currentPlan = 'vip'">
          <view class="card-header">
            <view class="header-top">
              <text class="badge">VIP</text>
              <switch :checked="currentPlan === 'vip'" color="#fff" style="transform: scale(0.7)" @change="e => onSwitchChange('vip', e.detail.value)" />
            </view>
            <view class="title">VIP 基础版</view>
            <view class="subtitle">适合个人学习，包含基础题库与分析功能</view>
          </view>
          
          <view class="card-body">
            <view class="privilege-section">
              <view class="section-title"><wd-icon name="check-circle" size="14px" /> 功能权益</view>
              <view class="tags">
                <text class="tag">基础题库访问</text>
                <text class="tag">错题本功能</text>
                <text class="tag">月度学习报告</text>
              </view>
            </view>
            
            <view class="price-section">
              <view class="section-title"><wd-icon name="money-circle" size="14px" /> 价格体系 <text class="edit-link">修改价格</text></view>
              <view class="price-grid">
                <view class="price-item" :class="{ active: vipDuration === 'month' }" @click.stop="vipDuration = 'month'">
                  <text class="duration">月包</text>
                  <text class="current-price">￥29</text>
                  <text class="original-price">￥39</text>
                </view>
                <view class="price-item" :class="{ active: vipDuration === 'season' }" @click.stop="vipDuration = 'season'">
                  <text class="duration">季包(一学期)</text>
                  <text class="current-price">￥99</text>
                  <text class="original-price">￥129</text>
                </view>
                <view class="price-item" :class="{ active: vipDuration === 'year' }" @click.stop="vipDuration = 'year'">
                  <text class="duration">年包</text>
                  <text class="current-price">￥299</text>
                  <text class="original-price">￥399</text>
                </view>
              </view>
            </view>
            
            <view class="action-buttons">
              <wd-button size="small" plain custom-class="action-btn">编辑权益</wd-button>
              <wd-button size="small" plain disabled custom-class="action-btn">营销配置</wd-button>
            </view>
          </view>
        </view>

        <!-- SVIP 专业版 卡片 -->
        <view class="plan-card svip-card" :class="{ 'is-selected': currentPlan === 'svip' }" @click="currentPlan = 'svip'">
          <view class="card-header">
            <view class="header-top">
              <text class="badge">SVIP</text>
              <switch :checked="currentPlan === 'svip'" color="#fff" style="transform: scale(0.7)" @change="e => onSwitchChange('svip', e.detail.value)" />
            </view>
            <view class="title">SVIP 专业版</view>
            <view class="subtitle">全能学习助手，解锁所有高级分析与名师课程</view>
          </view>
          
          <view class="card-body">
            <view class="privilege-section">
              <view class="section-title"><wd-icon name="check-circle" size="14px" /> 功能权益</view>
              <view class="tags">
                <text class="tag">全站题库无限访问</text>
                <text class="tag">AI 智能解析</text>
                <text class="tag">名师精讲视频</text>
                <text class="tag">专属客服优先响应</text>
              </view>
            </view>
            
            <view class="price-section">
              <view class="section-title"><wd-icon name="money-circle" size="14px" /> 价格体系 <text class="edit-link">修改价格</text></view>
              <view class="price-grid">
                <view class="price-item" :class="{ active: svipDuration === 'month' }" @click.stop="svipDuration = 'month'">
                  <text class="duration">月包</text>
                  <text class="current-price">￥59</text>
                  <text class="original-price">￥79</text>
                </view>
                <view class="price-item" :class="{ active: svipDuration === 'season' }" @click.stop="svipDuration = 'season'">
                  <text class="duration">季包(一学期)</text>
                  <text class="current-price">￥199</text>
                  <text class="original-price">￥249</text>
                </view>
                <view class="price-item" :class="{ active: svipDuration === 'year' }" @click.stop="svipDuration = 'year'">
                  <text class="duration">年包</text>
                  <text class="current-price">￥599</text>
                  <text class="original-price">￥799</text>
                </view>
              </view>
            </view>
            
            <view class="action-buttons">
              <wd-button size="small" plain custom-class="action-btn">编辑权益</wd-button>
              <wd-button size="small" plain disabled custom-class="action-btn">营销配置</wd-button>
            </view>
          </view>
        </view>

      </view>

      <!-- 支付按钮 -->
      <view class="pay-btn-wrapper">
        <wd-button type="primary" block custom-class="pay-btn" @click="handlePay">
          立即开通 {{ currentPlan === 'svip' ? 'SVIP' : 'VIP' }}
        </wd-button>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'

const toast = useToast()

// 状态管理
const currentPlan = ref('svip') // 选中的大套餐 'vip' | 'svip'
const vipDuration = ref('year') // VIP 选中的时长
const svipDuration = ref('season') // SVIP 选中的时长

const onSwitchChange = (plan: string, checked: boolean) => {
  if (checked) {
    currentPlan.value = plan
  }
}

const handlePay = () => {
  toast.loading('正在支付...')
  setTimeout(() => {
    toast.success('支付成功 (Mock)')
    // 模拟更新权限逻辑
    const phone = currentPlan.value === 'svip' ? '13688888888' : '13800000000'
    uni.setStorageSync('token', `mock-token-${phone}`)
    setTimeout(() => {
      uni.switchTab({ url: '/pages/mine/index' })
    }, 1500)
  }, 1500)
}
</script>

<style lang="scss" scoped>
.recharge-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 40rpx 32rpx 100rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.plan-container {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.plan-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.05);
  border: 4rpx solid transparent;
  transition: all 0.3s;

  &.is-selected {
    border-color: #4a90e2;
    transform: translateY(-4rpx);
    box-shadow: 0 12rpx 30rpx rgba(74, 144, 226, 0.15);
  }

  &.svip-card {
    &.is-selected {
      border-color: #7b42f6;
      box-shadow: 0 12rpx 30rpx rgba(123, 66, 246, 0.15);
    }
    .card-header {
      background: linear-gradient(135deg, #8a50f8 0%, #6127e2 100%);
    }
  }

  .card-header {
    background: linear-gradient(135deg, #5ba4ff 0%, #357ee8 100%);
    padding: 30rpx 30rpx 50rpx;
    color: #fff;
    // 底部倾斜效果模拟
    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .badge {
        font-size: 20rpx;
        background: rgba(255,255,255,0.2);
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        border: 1px solid rgba(255,255,255,0.4);
      }
    }

    .title {
      font-size: 40rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }

    .subtitle {
      font-size: 24rpx;
      opacity: 0.9;
    }
  }

  .card-body {
    padding: 20rpx 30rpx 40rpx;

    .section-title {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      margin-bottom: 20rpx;
      display: flex;
      align-items: center;
      gap: 10rpx;

      .edit-link {
        margin-left: auto;
        font-size: 24rpx;
        color: #4a90e2;
        font-weight: normal;
      }
    }

    .privilege-section {
      margin-bottom: 40rpx;

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 16rpx;

        .tag {
          font-size: 22rpx;
          color: #666;
          background: #f5f7fa;
          padding: 8rpx 16rpx;
          border-radius: 8rpx;
          border: 1px solid #eee;
        }
      }
    }

    .price-section {
      background: #fcfcfc;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 30rpx;

      .price-grid {
        display: flex;
        justify-content: space-between;

        .price-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16rpx 0;
          border-right: 1px solid #eee;
          transition: all 0.2s;

          &:last-child {
            border-right: none;
          }

          &.active {
            background: #fff;
            border-radius: 12rpx;
            box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.05);
            border-right: none;
            transform: scale(1.05);
            
            .duration { color: #333; font-weight: bold; }
            .current-price { color: #ff4d4f; }
          }

          .duration {
            font-size: 24rpx;
            color: #999;
            margin-bottom: 12rpx;
          }

          .current-price {
            font-size: 36rpx;
            font-weight: bold;
            color: #333;
            margin-bottom: 6rpx;
          }

          .original-price {
            font-size: 22rpx;
            color: #ccc;
            text-decoration: line-through;
          }
        }
      }
    }

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 20rpx;

      .action-btn {
        margin: 0;
        border-radius: 8rpx;
      }
    }
  }
}

.pay-btn-wrapper {
  margin-top: 60rpx;
  
  .pay-btn {
    height: 96rpx;
    border-radius: 48rpx;
    font-size: 34rpx;
    font-weight: bold;
    background: linear-gradient(135deg, #4a90e2 0%, #7b42f6 100%) !important;
    border: none !important;
    color: #fff !important;
    box-shadow: 0 8rpx 24rpx rgba(123, 66, 246, 0.3);
  }
}
</style>