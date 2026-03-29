<template>
  <view class="score-container">
    <view class="filter-bar">
      <!-- 使用 wd-picker 实现学期和考试的联动选择 -->
      <wd-picker 
        :columns="pickerColumns" 
        v-model="pickerValue" 
        label="选择考试" 
        title="请选择学期和考试" 
        @confirm="onPickerConfirm"
        :column-change="onPickerColumnChange"
      >
        <view class="picker-inner">
          <text class="picker-text">{{ currentDisplayLabel }}</text>
          <wd-icon name="arrow-down" size="14px" color="#666" />
        </view>
      </wd-picker>
    </view>

    <scroll-view scroll-y class="content" v-if="scoreData">
      <!-- 考试概览 -->
      <view class="overview-card">
        <view class="exam-info">
          <text class="exam-name">{{ scoreData.examName }}</text>
          <text class="exam-date">{{ scoreData.examDate }}</text>
        </view>
        <view class="total-score-box">
          <view class="score-item">
            <text class="label">总分</text>
            <text class="value">{{ scoreData.totalScore }}</text>
          </view>
          <view class="divider"></view>
          <view class="score-item">
            <text class="label">综合等级</text>
            <text class="value level">{{ scoreData.totalLevel }}</text>
          </view>
        </view>
      </view>

      <!-- 各科成绩 -->
      <view class="section">
        <view class="section-title">各科成绩</view>
        <view class="subject-grid">
          <view class="subject-card" v-for="(sub, index) in scoreData.subjects" :key="index" @click="goToPaperDetail(sub)">
            <view class="sub-header">
              <text class="sub-name">{{ sub.name }}</text>
              <text class="sub-level" :class="'level-' + sub.level">{{ sub.level }}</text>
            </view>
            <view class="sub-score-box">
              <text class="sub-score">{{ sub.score }}</text>
              <text class="full-score">/ {{ sub.fullScore }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 快捷功能区：试卷分析、错题集、成绩分析 -->
      <view class="function-grid">
        <wd-grid :column="3" :border="false" clickable>
          <wd-grid-item use-slot @itemclick="handleGridClick('paper')">
            <view class="grid-content-wrap">
              <view class="grid-icon-wrap paper">
                <wd-icon name="edit" size="24px" color="#fff" />
              </view>
              <view class="grid-text-wrap">
                <text class="grid-label">试卷报告</text>
              </view>
            </view>
          </wd-grid-item>
          <wd-grid-item use-slot @itemclick="handleGridClick('wrong')">
            <view class="grid-content-wrap">
              <view class="grid-icon-wrap wrong">
                <wd-icon name="close-circle" size="24px" color="#fff" />
              </view>
              <view class="grid-text-wrap">
                <text class="grid-label">错题本</text>
              </view>
            </view>
          </wd-grid-item>
          <wd-grid-item use-slot @itemclick="handleGridClick('analysis')">
            <view class="grid-content-wrap">
              <view class="grid-icon-wrap analysis">
                <wd-icon name="chart-line" size="24px" color="#fff" />
              </view>
              <view class="grid-text-wrap">
                <text class="grid-label">总体分析</text>
              </view>
            </view>
          </wd-grid-item>
        </wd-grid>
      </view>

      <!-- 近6次考试趋势分析 -->
      <view class="section">
        <view class="section-title">近6次考试趋势分析</view>
        <view class="chart-tabs">
          <view 
            class="chart-tab" 
            :class="{ active: currentSubject === '总分' }"
            @click="currentSubject = '总分'"
          >总分</view>
          <view 
            class="chart-tab" 
            v-for="(sub, idx) in scoreData.subjects" 
            :key="idx"
            :class="{ active: currentSubject === sub.name }"
            @click="currentSubject = sub.name"
          >{{ sub.name }}</view>
        </view>
        
        <view class="bar-chart-container">
          <view class="bar-item" v-for="(item, idx) in scoreData.history" :key="idx">
            <view class="bar-val">{{ getChartValue(item) }}</view>
            <view class="bar-track">
              <view class="bar-fill" :style="{ height: getChartHeight(item) }"></view>
            </view>
            <view class="bar-label">{{ item.period }}</view>
          </view>
        </view>
      </view>

      <!-- VIP 专属：错题本数据分析 -->
      <view class="vip-analysis-section">
        <view class="vip-lock-mask" v-if="!isVIPUser">
          <wd-icon name="lock-on" size="48px" color="#f6d365" />
          <view class="lock-text">开通 VIP 解锁深度分析</view>
          <wd-button custom-class="upgrade-btn" size="small" @click="goToRecharge">立即开通</wd-button>
        </view>

        <view class="vip-analysis-content" :class="{ 'blurred': !isVIPUser }">
          
          <!-- 详细的成绩构成分析 -->
          <view class="analysis-card detail-card" v-if="analysisData && analysisData.composition">
            <view class="card-header">
              <text class="card-title">成绩构成分析</text>
              <text class="vip-tag">VIP</text>
            </view>
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

          <!-- 详细的成绩分布统计 -->
          <view class="analysis-card detail-card" v-if="analysisData && analysisData.distribution">
            <view class="card-header">
              <text class="card-title">成绩分布统计</text>
              <text class="vip-tag">VIP</text>
            </view>
            <view class="desc">
              班级相对位置：<text class="highlight">{{ analysisData.distribution.rankInfo }}</text> | 综合等级：<text class="highlight">{{ analysisData.distribution.overallLevel }}</text>
            </view>
            
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

          <!-- 详细的成绩趋势分析 -->
          <view class="analysis-card detail-card" v-if="analysisData && analysisData.trend">
            <view class="card-header">
              <text class="card-title">成绩趋势分析</text>
              <text class="vip-tag">VIP</text>
            </view>
            <view class="desc">成绩随时间变化走势</view>
            
            <view class="trend-chart">
              <view class="trend-point" v-for="(item, index) in analysisData.trend" :key="index">
                <view class="point-val">{{ item.score }}</view>
                <view class="point-dot"></view>
                <view class="point-label">{{ item.date }}</view>
              </view>
            </view>
          </view>

        </view>
      </view>
    </scroll-view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { getStudentScoresApi } from '@/api/score'
import { getVipAnalysisDataApi } from '@/api/vip'

const toast = useToast()
const scoreData = ref<any>(null)
const currentSubject = ref('总分')

// VIP 数据与权限
const isVIPUser = ref(false)
const analysisData = ref<any>(null)

// 学期与考试的联动数据结构
const semesterData: Record<string, any[]> = {
  '2023-2024-2': [
    { label: '期末考试', value: 'final' },
    { label: '六月模拟', value: 'mock2' },
    { label: '五月月考', value: 'month3' },
    { label: '期中考试', value: 'midterm' },
    { label: '三月月考', value: 'month1' },
    { label: '开学考', value: 'start' }
  ],
  '2023-2024-1': [
    { label: '期末考试', value: 'final' },
    { label: '五月模拟', value: 'mock1' },
    { label: '四月模拟', value: 'mock2' },
    { label: '三月月考', value: 'month2' },
    { label: '期中考试', value: 'midterm' },
    { label: '一月月考', value: 'month1' }
  ]
}

const semesters = [
  { label: '2023-2024学年 第二学期', value: '2023-2024-2' },
  { label: '2023-2024学年 第一学期', value: '2023-2024-1' }
]

// Picker 数据列
const pickerColumns = ref([
  semesters,
  semesterData[semesters[0].value]
])
// 当前选中的值 [学期value, 考试value]
const pickerValue = ref([semesters[0].value, semesterData[semesters[0].value][0].value])

// 用于顶部显示的文本
const currentDisplayLabel = ref(`${semesters[0].label} - ${semesterData[semesters[0].value][0].label}`)

// 动态级联切换
const onPickerColumnChange = (picker: any, value: any, columnIndex: number, resolve: Function) => {
  if (columnIndex === 0) {
    // 选择了不同的学期，更新第二列的考试列表
    const selectedSemesterValue = value[0]
    picker.setColumnData(1, semesterData[selectedSemesterValue])
  }
  resolve()
}

const onPickerConfirm = (e: any) => {
  const selectedValues = e.value // [学期value, 考试value]
  const selectedItems = e.selectedItems // [学期对象, 考试对象]
  
  pickerValue.value = selectedValues
  currentDisplayLabel.value = `${selectedItems[0].label} - ${selectedItems[1].label}`
  
  loadData(selectedValues[0], selectedValues[1])
}

const goToPaperDetail = (subjectInfo: any) => {
  // 点击各科成绩，携带科目和当前考试参数，跳转到试卷报告页
  uni.navigateTo({
    url: `/pages/paper/index?subject=${subjectInfo.name}&exam=${currentDisplayLabel.value}`
  })
}

const getChartValue = (item: any) => {
  if (currentSubject.value === '总分') {
    return item.score
  }
  return item.subjects?.[currentSubject.value] || 0
}

const getChartHeight = (item: any) => {
  const val = getChartValue(item)
  const max = currentSubject.value === '总分' ? 750 : 150
  return (val / max * 100) + '%'
}

const loadData = async (semesterVal: string, examIdVal: string) => {
  try {
    toast.loading('加载中...')
    
    // 检查 VIP 权限
    const token = uni.getStorageSync('token') || ''
    isVIPUser.value = token.includes('13688888888') || token.includes('13588888888') || token.includes('13800000000')

    const p1 = getStudentScoresApi({ semester: semesterVal, examId: examIdVal })
    const p2 = isVIPUser.value ? getVipAnalysisDataApi() : Promise.resolve({ code: 200, data: null })

    const [res, anaRes] = await Promise.all([p1, p2])
    
    if (res.code === 200) {
      scoreData.value = res.data
      currentSubject.value = '总分'
    } else {
      toast.error(res.msg || '获取数据失败')
    }

    if (anaRes.code === 200 && isVIPUser.value) {
      analysisData.value = anaRes.data
    }

    toast.close()
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/vip/recharge' })
}

const handleGridClick = (type: string) => {
  if (type === 'analysis') {
    uni.showToast({ title: '请查看下方数据分析', icon: 'none' })
  } else if (type === 'paper') {
    uni.navigateTo({ url: `/pages/paper/index?exam=${currentDisplayLabel.value}` })
  } else if (type === 'wrong') {
    if (!isVIPUser.value) {
      toast.warning('请先开通 VIP 体验错题本')
      return
    }
    uni.navigateTo({ url: '/pages/vip/index?tab=wrongbook' })
  }
}

onMounted(() => {
  loadData(pickerValue.value[0], pickerValue.value[1])
})
</script>

<style lang="scss" scoped>
.score-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.filter-bar {
  background: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.02);
  display: flex;
  justify-content: center;

  .picker-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f7fa;
    padding: 16rpx 40rpx;
    border-radius: 40rpx;
    
    .picker-text {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      margin-right: 12rpx;
    }
  }
}

.content {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}

.overview-card {
  background: linear-gradient(135deg, #1a5f8e 0%, #2b7aab 100%);
  border-radius: 24rpx;
  padding: 40rpx;
  color: #fff;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(26, 95, 142, 0.3);

  .exam-info {
    margin-bottom: 30rpx;
    .exam-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 10rpx;
    }
    .exam-date {
      font-size: 24rpx;
      opacity: 0.8;
    }
  }

  .score-main {
    display: flex;
    align-items: center;
    justify-content: space-around;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 16rpx;
    padding: 30rpx 0;

    .score-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10rpx;

      .label {
        font-size: 26rpx;
        opacity: 0.9;
      }
      .value {
        font-size: 56rpx;
        font-weight: bold;
      }
      .level {
        color: #ffd700;
      }
    }

    .divider {
      width: 2rpx;
      height: 80rpx;
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    padding-left: 10rpx;
    border-left: 8rpx solid #1a5f8e;
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;

  .subject-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

    .sub-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .sub-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }
      .sub-level {
        font-size: 24rpx;
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
        font-weight: bold;
        
        &.level-A { color: #00c853; background: rgba(0, 200, 83, 0.1); }
        &.level-B { color: #2196f3; background: rgba(33, 150, 243, 0.1); }
        &.level-C { color: #ff9800; background: rgba(255, 152, 0, 0.1); }
        &.level-D { color: #f44336; background: rgba(244, 67, 54, 0.1); }
      }
    }

    .sub-score {
      display: flex;
      align-items: baseline;
      
      .score {
        font-size: 40rpx;
        font-weight: bold;
        color: #1a5f8e;
      }
      .full-score {
        font-size: 24rpx;
        color: #999;
        margin-left: 8rpx;
      }
    }
  }
}

.function-grid {
  background: #fff;
  border-radius: 24rpx;
  padding: 30rpx 10rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .grid-content-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .grid-icon-wrap {
    width: 80rpx;
    height: 80rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16rpx;
    
    &.paper { background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); }
    &.wrong { background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%); }
    &.analysis { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
  }

  .grid-text-wrap {
    text-align: center;
    .grid-label {
      display: block;
      font-size: 26rpx;
      color: #666;
      margin-bottom: 4rpx;
    }
  }
}

.chart-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
  
  .chart-tab {
    padding: 8rpx 24rpx;
    font-size: 26rpx;
    color: #666;
    background: #fff;
    border: 1rpx solid #eee;
    border-radius: 30rpx;
    transition: all 0.3s;
    
    &.active {
      background: #1a5f8e;
      color: #fff;
      border-color: #1a5f8e;
    }
  }
}

.bar-chart-container {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 250rpx;
  padding-top: 40rpx;

  .bar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    
    .bar-val {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 8rpx;
      font-weight: bold;
    }
    
    .bar-track {
      width: 40rpx;
      flex: 1;
      background: #f0f0f0;
      border-radius: 8rpx;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      
      .bar-fill {
        width: 100%;
        background: linear-gradient(to top, #6fb1fc, #4364f7);
        border-radius: 8rpx;
        transition: height 0.3s ease;
      }
    }
    
    .bar-label {
      font-size: 22rpx;
      color: #999;
      margin-top: 12rpx;
      text-align: center;
      width: 60rpx;
    }
  }
}

// VIP 区域样式
.vip-analysis-section {
  position: relative;
  overflow: hidden;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
}

.vip-tag {
  background: linear-gradient(to right, #f6d365, #fda085);
  color: #fff;
  font-size: 20rpx;
  padding: 2rpx 12rpx;
  border-radius: 20rpx 20rpx 20rpx 0;
  margin-left: 10rpx;
  vertical-align: super;
}

.vip-lock-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
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
    margin: 20rpx 0 30rpx;
  }
  .upgrade-btn {
    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%) !important;
    color: #f6d365 !important;
    border: none !important;
    border-radius: 40rpx;
    width: 260rpx;
  }
}

.vip-analysis-content {
  &.blurred {
    filter: blur(4px);
    pointer-events: none;
    user-select: none;
  }
}

.analysis-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  &.detail-card {
    display: block;
    .card-header {
      display: flex;
      align-items: center;
      margin-bottom: 10rpx;
    }
    .card-title {
      font-size: 30rpx;
      font-weight: bold;
      color: #333;
      border-left: 8rpx solid #f6d365;
      padding-left: 12rpx;
      margin-bottom: 0;
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
}
</style>
