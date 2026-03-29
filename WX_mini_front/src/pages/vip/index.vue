<template>
  <view class="vip-container">
    <wd-tabs v-model="currentTab">
      <!-- 原有的错题集 -->
      <wd-tab title="错题集" name="wrongbook">
        <view class="tab-content">
          <scroll-view scroll-y class="wrong-list">
            <view class="wrong-item" v-for="item in wrongBookData" :key="item.id">
              <view class="w-header">
                <text class="subject">{{ item.subject }}</text>
                <text class="time">{{ item.time }}</text>
              </view>
              <view class="w-question">{{ item.question }}</view>
              <view class="w-tags">
                <text class="tag" v-for="(tag, idx) in item.tags" :key="idx">{{ tag }}</text>
              </view>
              <view class="w-ans">
                <view class="row"><text class="label">你的答案：</text><text class="wrong">{{ item.studentAnswer }}</text></view>
                <view class="row"><text class="label">正确答案：</text><text class="correct">{{ item.correctAnswer }}</text></view>
                <view class="row"><text class="label">解析：</text><text class="exp">{{ item.explanation }}</text></view>
              </view>
              <view class="w-actions">
                <wd-button size="small" plain @click="handleExport">导出 PDF/Word</wd-button>
                <wd-button size="small" plain type="success" @click="showPrintDialog = true">纸质打印下单</wd-button>
              </view>
            </view>
          </scroll-view>
        </view>
      </wd-tab>

      <!-- 新增：SVIP 专属 AI 专区 -->
      <wd-tab title="AI专区(SVIP)" name="svip">
        <scroll-view scroll-y class="tab-content svip-content">
          <!-- 权限判断遮罩 -->
          <view class="svip-lock" v-if="!isSVIPUser">
            <wd-icon name="lock-on" size="64px" color="#f6d365" />
            <view class="lock-text">此专区为 SVIP 专属功能</view>
            <wd-button custom-class="upgrade-btn" @click="goToRecharge">立即升级 SVIP</wd-button>
          </view>
          
          <view v-else>
            <!-- AI 课程 -->
            <view class="card svip-card">
              <view class="card-title"><wd-icon name="video" class="icon" /> AI 公益课程</view>
              <view class="desc">由专家与算法联合设计，实时更新</view>
              <view class="course-grid">
                <view class="c-item">
                  <view class="c-icon math">数</view>
                  <text>高中数学压轴</text>
                </view>
                <view class="c-item">
                  <view class="c-icon eng">英</view>
                  <text>外教口语特训</text>
                </view>
                <view class="c-item">
                  <view class="c-icon phy">物</view>
                  <text>力学实验全解</text>
                </view>
              </view>
            </view>

            <!-- AI 自习室 -->
            <view class="card svip-card">
              <view class="card-title"><wd-icon name="time" class="icon" /> AI 智能自习室</view>
              <view class="desc">智能辅导 / 专注训练 / 计划管理</view>
              <view class="room-info">
                <view class="status">
                  <view class="dot"></view> 当前开放中 (08:00 - 23:00)
                </view>
                <wd-button type="primary" block size="small" @click="joinRoom">一键报名进入自习室</wd-button>
              </view>
            </view>

            <!-- AI 学习建议 -->
            <view class="card svip-card">
              <view class="card-title"><wd-icon name="chart-pie" class="icon" /> AI 专属学习建议</view>
              <view class="desc">基于你的近期表现动态生成</view>
              <view class="ai-suggestion-box">
                <view class="s-item">
                  <text class="s-title">📅 每日学习安排</text>
                  <text class="s-txt">建议每天 19:00-20:00 攻克数学函数错题，20:00-20:30 进行英语听力磨耳朵。</text>
                </view>
                <view class="s-item">
                  <text class="s-title">📚 资源智能推荐</text>
                  <text class="s-txt">检测到物理运动学模块薄弱，已为您匹配《高一物理必刷题-运动学专练》。</text>
                  <text class="link">点击直接查看 >></text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </wd-tab>
    </wd-tabs>

    <!-- 打印下单弹窗 -->
    <wd-popup v-model="showPrintDialog" position="bottom" custom-style="height: 75%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
      <scroll-view scroll-y style="height: 100%;">
        <view class="print-dialog">
          <view class="d-title">纸质打印服务下单</view>
          
          <view class="form-section">
            <view class="sec-title">纸张配置</view>
            <view class="config-row">
              <text class="label">纸张规格</text>
              <view class="options">
                <view class="opt-btn" :class="{active: printForm.paperSize === 'A4'}" @click="printForm.paperSize = 'A4'">A4</view>
                <view class="opt-btn" :class="{active: printForm.paperSize === 'A3'}" @click="printForm.paperSize = 'A3'">A3</view>
              </view>
            </view>
            <view class="config-row">
              <text class="label">单/双面</text>
              <view class="options">
                <view class="opt-btn" :class="{active: printForm.printSide === '单面'}" @click="printForm.printSide = '单面'">单面</view>
                <view class="opt-btn" :class="{active: printForm.printSide === '双面'}" @click="printForm.printSide = '双面'">双面</view>
              </view>
            </view>
            <view class="config-row">
              <text class="label">颜色</text>
              <view class="options">
                <view class="opt-btn" :class="{active: printForm.color === '黑白'}" @click="printForm.color = '黑白'">黑白</view>
                <view class="opt-btn" :class="{active: printForm.color === '彩色'}" @click="printForm.color = '彩色'">彩色</view>
              </view>
            </view>
          </view>

          <view class="form-section">
            <view class="sec-title">配送配置</view>
            <view class="config-row">
              <text class="label">配送方式</text>
              <view class="options delivery-options">
                <view 
                  v-for="d in printConfig.deliveryConfigs" 
                  :key="d.method"
                  class="opt-btn" 
                  :class="{active: printForm.deliveryMethod === d.method}" 
                  @click="printForm.deliveryMethod = d.method"
                >
                  {{ d.name }}
                </view>
              </view>
            </view>
            <view class="delivery-desc" v-if="currentDeliveryConfig">
              <wd-icon name="info-circle" size="14px" />
              {{ currentDeliveryConfig.desc }}（基础运费：￥{{ currentDeliveryConfig.baseFee }}，满￥{{ currentDeliveryConfig.freeThreshold }}免邮）
            </view>
            <wd-input v-model="printForm.address" placeholder="请输入收件地址/线下取件点" no-border />
            <wd-input v-model="printForm.phone" placeholder="联系电话" no-border />
          </view>

          <view class="price-preview">
            <text>预估费用：</text>
            <text class="price">￥{{ estimatedPrice }}</text>
          </view>

          <view class="d-action">
            <wd-button type="primary" block @click="submitPrint">确认下单</wd-button>
          </view>
        </view>
      </scroll-view>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getVipWrongBookApi, submitPrintOrderApi, getPrintConfigApi } from '@/api/vip'

const toast = useToast()
const currentTab = ref('wrongbook')
const analysisData = ref<any>(null)
const wrongBookData = ref<any[]>([])
const isSVIPUser = ref(false)

// 处理从首页传来的参数，直接定位到对应 Tab
onLoad((options) => {
  const token = uni.getStorageSync('token') || ''
  isSVIPUser.value = token.includes('13688888888')

  if (options && options.tab) {
    currentTab.value = options.tab
  }
})

const showPrintDialog = ref(false)
const printForm = ref({
  address: '',
  phone: '',
  paperSize: 'A4',
  printSide: '双面',
  color: '黑白',
  deliveryMethod: 'standard'
})

// 打印配置数据
const printConfig = ref<any>({
  paperConfigs: [],
  globalParams: { minAmount: 5, bindingFee: 2 },
  deliveryConfigs: []
})

// 动态计算当前选中的配送配置
const currentDeliveryConfig = computed(() => {
  return printConfig.value.deliveryConfigs.find((d: any) => d.method === printForm.value.deliveryMethod)
})

// 动态计算预估费用
const estimatedPrice = computed(() => {
  // 基础纸张费用
  const paperConfig = printConfig.value.paperConfigs.find((p: any) => 
    p.size === printForm.value.paperSize && 
    p.side === printForm.value.printSide && 
    p.color === printForm.value.color
  )
  
  // 假设默认打印 20 页
  const pageCount = 20
  let paperCost = paperConfig ? paperConfig.price * pageCount : 0
  
  // 加上装订费
  let totalCost = paperCost + (printConfig.value.globalParams.bindingFee || 0)
  
  // 如果不满起印金额，按起印金额算
  if (totalCost < printConfig.value.globalParams.minAmount) {
    totalCost = printConfig.value.globalParams.minAmount
  }

  // 加上运费
  if (currentDeliveryConfig.value) {
    if (totalCost < currentDeliveryConfig.value.freeThreshold || currentDeliveryConfig.value.freeThreshold === 0) {
      totalCost += currentDeliveryConfig.value.baseFee
    }
  }
  
  return totalCost.toFixed(2)
})

const loadData = async () => {
  try {
    toast.loading('加载中...')
    const [wrongRes, printRes] = await Promise.all([
      getVipWrongBookApi({}),
      getPrintConfigApi()
    ])
    
    if (wrongRes.code === 200) wrongBookData.value = wrongRes.data
    if (printRes.code === 200) printConfig.value = printRes.data
    
    toast.close()
  } catch (error: any) {
    toast.error(error.msg || '获取数据失败')
  }
}

onMounted(() => {
  loadData()
})

const handleExport = () => {
  toast.loading('正在生成...')
  setTimeout(() => {
    toast.success('导出成功，请查看通知')
  }, 1500)
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/vip/recharge' })
}

const joinRoom = () => {
  toast.loading('正在为您分配座位...')
  setTimeout(() => {
    toast.success('报名成功，即将进入自习室')
  }, 1500)
}

const submitPrint = async () => {
  if (!printForm.value.address || !printForm.value.phone) {
    return toast.show('请填写完整信息')
  }
  try {
    toast.loading('提交中...')
    const res = await submitPrintOrderApi(printForm.value)
    if (res.code === 200) {
      toast.success(res.msg || '下单成功')
      showPrintDialog.value = false
    } else {
      toast.error('下单失败')
    }
  } catch (e: any) {
    toast.error('下单失败')
  }
}
</script>

<style lang="scss" scoped>
.vip-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
  height: calc(100vh - 100rpx);
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
    border-left: 8rpx solid #f6d365;
    padding-left: 12rpx;
  }

  .desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 30rpx;
    .highlight { color: #f6d365; font-weight: bold; }
  }
}

.wrong-list {
  height: calc(100% - 100rpx);
}

.wrong-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  
  .w-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16rpx;
    .subject { font-weight: bold; color: #1a5f8e; }
    .time { font-size: 24rpx; color: #999; }
  }
  
  .w-question {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 16rpx;
    line-height: 1.5;
  }
  
  .w-tags {
    display: flex;
    gap: 10rpx;
    margin-bottom: 20rpx;
    .tag {
      font-size: 22rpx;
      padding: 4rpx 12rpx;
      background: #e3f2fd;
      color: #0288d1;
      border-radius: 8rpx;
    }
  }
  
  .w-ans {
    background: #f9f9f9;
    padding: 20rpx;
    border-radius: 12rpx;
    margin-bottom: 20rpx;
    
    .row {
      margin-bottom: 10rpx;
      font-size: 26rpx;
      .label { color: #666; }
      .wrong { color: #f44336; }
      .correct { color: #00c853; font-weight: bold; }
      .exp { color: #555; }
    }
  }
  
  .w-actions {
    display: flex;
    justify-content: flex-end;
    gap: 20rpx;
  }
}

.print-dialog {
  .d-title { font-size: 34rpx; font-weight: bold; text-align: center; margin-bottom: 40rpx; }
  
  .form-section {
    background: #f8f9fa;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .sec-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 24rpx;
      border-left: 6rpx solid #1a5f8e;
      padding-left: 12rpx;
    }

    .config-row {
      display: flex;
      align-items: center;
      margin-bottom: 24rpx;
      
      .label {
        width: 140rpx;
        font-size: 26rpx;
        color: #666;
      }
      
      .options {
        flex: 1;
        display: flex;
        gap: 20rpx;
        
        .opt-btn {
          padding: 10rpx 30rpx;
          border-radius: 8rpx;
          font-size: 24rpx;
          background: #fff;
          border: 1px solid #ddd;
          color: #333;
          transition: all 0.3s;
          
          &.active {
            background: rgba(26, 95, 142, 0.1);
            border-color: #1a5f8e;
            color: #1a5f8e;
            font-weight: bold;
          }
        }

        &.delivery-options {
          flex-wrap: wrap;
        }
      }
    }

    .delivery-desc {
      font-size: 22rpx;
      color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
      padding: 16rpx;
      border-radius: 8rpx;
      margin-bottom: 20rpx;
      display: flex;
      align-items: center;
      gap: 8rpx;
    }
    
    :deep(.wd-input) {
      margin-top: 20rpx;
      background: #fff;
      border-radius: 8rpx;
    }
  }

  .price-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    background: rgba(26, 95, 142, 0.05);
    border-radius: 16rpx;
    margin-bottom: 40rpx;
    
    text {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
    }
    
    .price {
      font-size: 40rpx;
      color: #f44336;
    }
  }

  .d-action { margin-top: 40rpx; }
}

// SVIP 专区样式
.svip-content {
  position: relative;
}

.svip-lock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;

  .lock-text {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    margin: 30rpx 0 40rpx;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%) !important;
    color: #f6d365 !important;
    border: none !important;
    border-radius: 40rpx;
    width: 300rpx;
  }
}

.svip-card {
  .icon { color: #f6d365; margin-right: 10rpx; }
  border-left: 8rpx solid #333 !important;

  .course-grid {
    display: flex;
    justify-content: space-between;
    
    .c-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16rpx;
      font-size: 24rpx;
      color: #333;
      
      .c-icon {
        width: 100rpx;
        height: 100rpx;
        border-radius: 24rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36rpx;
        font-weight: bold;
        color: #fff;
        
        &.math { background: linear-gradient(135deg, #4facfe, #00f2fe); }
        &.eng { background: linear-gradient(135deg, #ff0844, #ffb199); }
        &.phy { background: linear-gradient(135deg, #43e97b, #38f9d7); }
      }
    }
  }

  .room-info {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 30rpx;
    
    .status {
      display: flex;
      align-items: center;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 30rpx;
      
      .dot {
        width: 16rpx;
        height: 16rpx;
        background: #00c853;
        border-radius: 50%;
        margin-right: 12rpx;
        box-shadow: 0 0 10rpx rgba(0, 200, 83, 0.4);
      }
    }
  }

  .ai-suggestion-box {
    .s-item {
      background: #fcfcfc;
      padding: 24rpx;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      
      .s-title { display: block; font-weight: bold; font-size: 28rpx; margin-bottom: 12rpx; color: #333; }
      .s-txt { font-size: 26rpx; color: #666; line-height: 1.5; display: block; }
      .link { font-size: 24rpx; color: #007aff; margin-top: 10rpx; display: block; }
    }
  }
}
</style>