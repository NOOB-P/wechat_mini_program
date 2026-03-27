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
        <view class="score-main">
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
          <view class="subject-card" v-for="(sub, index) in scoreData.subjects" :key="index">
            <view class="sub-header">
              <text class="sub-name">{{ sub.name }}</text>
              <text class="sub-level" :class="'level-' + sub.level">{{ sub.level }}</text>
            </view>
            <view class="sub-score">
              <text class="score">{{ sub.score }}</text>
              <text class="full-score">/ {{ sub.fullScore }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 历史成绩趋势 (CSS柱状图实现) -->
      <view class="section">
        <view class="section-title">近6次考试趋势分析</view>
        
        <!-- 图表切换控制 -->
        <view class="chart-controls">
          <view 
            class="control-item" 
            :class="{ active: currentSubject === '总分' }"
            @click="currentSubject = '总分'"
          >总分</view>
          <view 
            class="control-item" 
            v-for="(sub, index) in scoreData.subjects" 
            :key="index"
            :class="{ active: currentSubject === sub.name }"
            @click="currentSubject = sub.name"
          >{{ sub.name }}</view>
        </view>

        <view class="chart-card">
          <view class="bar-chart">
            <view class="bar-item" v-for="(item, index) in scoreData.history" :key="index">
              <view class="bar-value">{{ getChartValue(item) }}</view>
              <view class="bar-track">
                <!-- 总分满分按750算，单科按150算 -->
                <view class="bar-fill" :style="{ height: getChartHeight(item) }"></view>
              </view>
              <view class="bar-label">{{ item.period }}</view>
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

const toast = useToast()
const scoreData = ref<any>(null)
const currentSubject = ref('总分')

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
    const res = await getStudentScoresApi({ 
      semester: semesterVal,
      examId: examIdVal
    })
    if (res.code === 200) {
      scoreData.value = res.data
      currentSubject.value = '总分' // 切换数据后重置为总分
      toast.close()
    } else {
      toast.error(res.msg || '获取数据失败')
    }
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
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

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
  
  .control-item {
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

.chart-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  .bar-chart {
    display: flex;
    justify-content: space-around;
    align-items: flex-end;
    height: 400rpx;
    padding-top: 40rpx;

    .bar-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;

      .bar-value {
        font-size: 24rpx;
        color: #666;
        margin-bottom: 10rpx;
      }

      .bar-track {
        width: 40rpx;
        flex: 1;
        background: #f0f0f0;
        border-radius: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        overflow: hidden;

        .bar-fill {
          width: 100%;
          background: linear-gradient(to top, #1a5f8e, #4da8da);
          border-radius: 20rpx;
          transition: height 0.5s ease-out;
        }
      }

      .bar-label {
        font-size: 24rpx;
        color: #999;
        margin-top: 16rpx;
      }
    }
  }
}
</style>
