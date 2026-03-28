<template>
  <view class="vip-container">
    <wd-tabs v-model="currentTab">
      <!-- 原有的数据分析 -->
      <wd-tab title="数据分析" name="analysis">
        <!-- 内容保持不变... -->
        <scroll-view scroll-y class="tab-content" v-if="analysisData">
          
          <!-- 成绩构成分析 -->
          <view class="card">
            <view class="card-title">成绩构成分析</view>
            <view class="desc">各科成绩结构（基础 / 综合 / 难题）</view>
            <view class="pie-chart-mock">
              <view class="pie-slice" v-for="(item, index) in analysisData.composition" :key="index">
                <text class="label">{{ item.name }} ({{ item.level }})</text>
                <view class="bar-bg">
                  <view class="bar-fill" :style="{ width: item.value + '%' }"></view>
                </view>
                <text class="value">{{ item.value }}%</text>
              </view>
            </view>
          </view>

          <!-- 成绩分布统计 -->
          <view class="card">
            <view class="card-title">成绩分布统计</view>
            <view class="desc">班级相对位置：<text class="highlight">{{ analysisData.distribution.rankInfo }}</text> | 综合等级：<text class="highlight">{{ analysisData.distribution.overallLevel }}</text></view>
            <view class="dist-chart">
              <view class="dist-bar" v-for="(item, index) in analysisData.distribution.levels" :key="index">
                <view class="bar-val">{{ item.count }}人</view>
                <view class="bar-track">
                  <view class="bar-fill" :style="{ height: (item.count / 20 * 100) + '%' }"></view>
                </view>
                <view class="bar-label">{{ item.level }}</view>
              </view>
            </view>
          </view>

          <!-- 成绩趋势分析 -->
          <view class="card">
            <view class="card-title">成绩趋势分析</view>
            <view class="desc">成绩随时间变化走势</view>
            <view class="trend-chart">
              <view class="trend-point" v-for="(item, index) in analysisData.trend" :key="index">
                <view class="point-val">{{ item.score }}</view>
                <view class="point-dot"></view>
                <view class="point-label">{{ item.date }}</view>
              </view>
            </view>
          </view>

          <!-- 学习习惯分析 -->
          <view class="card">
            <view class="card-title">学习习惯分析</view>
            <view class="radar-mock">
              <view class="radar-item" v-for="(item, index) in analysisData.habit.radarData" :key="index">
                <text class="label">{{ item.indicator }}</text>
                <view class="score-stars">
                  <wd-icon name="star-on" size="16px" color="#f6d365" v-for="n in Math.floor(item.value/20)" :key="n" />
                </view>
                <text class="val">{{ item.value }}分</text>
              </view>
            </view>
            <view class="suggestion">
              <text class="sug-label">💡 个性化建议：</text>
              {{ analysisData.habit.suggestion }}
            </view>
          </view>
        </scroll-view>
      </wd-tab>

      <!-- 原有的错题集 -->
      <wd-tab title="错题集" name="wrongbook">
        <view class="tab-content">
          <view class="action-bar">
            <wd-button type="primary" size="small" plain @click="handleExport">导出 PDF/Word</wd-button>
            <wd-button type="success" size="small" @click="showPrintDialog = true">纸质打印下单</wd-button>
          </view>

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
                <wd-button size="small" plain>添加笔记</wd-button>
                <wd-button size="small" plain type="warning">标记分类</wd-button>
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
    <wd-popup v-model="showPrintDialog" position="bottom" custom-style="height: 50%; padding: 40rpx; border-radius: 32rpx 32rpx 0 0;">
        <view class="print-dialog">
          <view class="d-title">纸质打印服务下单</view>
          <wd-input v-model="printForm.address" placeholder="请输入收件地址/线下取件点" no-border />
          <wd-input v-model="printForm.phone" placeholder="联系电话" no-border />
          <view class="d-action">
            <wd-button type="primary" block @click="submitPrint">确认下单</wd-button>
          </view>
        </view>
      </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getVipAnalysisDataApi, getVipWrongBookApi, submitPrintOrderApi } from '@/api/vip'

const toast = useToast()
const currentTab = ref('analysis')
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
const printForm = ref({ address: '', phone: '' })

const loadData = async () => {
  try {
    toast.loading('加载中...')
    const [anaRes, wrongRes] = await Promise.all([
      getVipAnalysisDataApi(),
      getVipWrongBookApi({})
    ])
    
    if (anaRes.code === 200) analysisData.value = anaRes.data
    if (wrongRes.code === 200) wrongBookData.value = wrongRes.data
    
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

// 图表Mock样式
.pie-chart-mock {
  .pie-slice {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .label { width: 160rpx; font-size: 26rpx; color: #555; }
    .bar-bg {
      flex: 1;
      height: 16rpx;
      background: #eee;
      border-radius: 8rpx;
      margin: 0 20rpx;
      overflow: hidden;
      .bar-fill { height: 100%; background: linear-gradient(to right, #f6d365, #fda085); }
    }
    .value { width: 60rpx; font-size: 24rpx; color: #333; text-align: right; }
  }
}

.dist-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200rpx;
  
  .dist-bar {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    
    .bar-val { font-size: 22rpx; color: #666; margin-bottom: 8rpx; }
    .bar-track {
      width: 40rpx;
      flex: 1;
      background: #f0f0f0;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      .bar-fill { width: 100%; background: #4da8da; border-radius: 8rpx; }
    }
    .bar-label { font-size: 24rpx; margin-top: 10rpx; font-weight: bold; }
  }
}

.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx dashed #eee;
  
  .trend-point {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .point-val { font-size: 28rpx; font-weight: bold; color: #1a5f8e; margin-bottom: 10rpx; }
    .point-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #f6d365; margin-bottom: 10rpx; }
    .point-label { font-size: 22rpx; color: #999; }
  }
}

.radar-mock {
  .radar-item {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    
    .label { width: 120rpx; font-size: 26rpx; color: #555; }
    .score-stars { flex: 1; display: flex; gap: 8rpx; }
    .val { width: 80rpx; font-size: 26rpx; color: #333; text-align: right; }
  }
}
.suggestion {
  margin-top: 20rpx;
  padding: 20rpx;
  background: #fff8e1;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  .sug-label { font-weight: bold; color: #f57f17; }
}

// 错题本样式
.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
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
  .d-action { margin-top: 60rpx; }
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