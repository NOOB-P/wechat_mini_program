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



      <!-- 成绩分析 / 错题推送 区域 -->
      <view class="analysis-container">
        <!-- 顶部 Tab -->
        <view class="top-tabs">
          <view 
            class="tab-item" 
            :class="{ active: currentMainTab === 'analysis' }"
            @click="currentMainTab = 'analysis'"
          >
            成绩分析
            <view class="line" v-if="currentMainTab === 'analysis'"></view>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentMainTab === 'wrong_book' }"
            @click="currentMainTab = 'wrong_book'"
          >
            错题集
            <view class="line" v-if="currentMainTab === 'wrong_book'"></view>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentMainTab === 'wrong_push' }"
            @click="currentMainTab = 'wrong_push'"
          >
            错题推送
            <view class="line" v-if="currentMainTab === 'wrong_push'"></view>
          </view>
        </view>

        <!-- 成绩分析内容 (原 VIP 数据分析卡片) -->
        <view v-if="currentMainTab === 'analysis'">
          <view class="vip-analysis-section">
            <view class="vip-lock-mask" v-if="!isVIPUser">
              <view class="lock-icon-wrapper">
                <wd-icon name="lock-on" size="48px" color="#f6d365" />
              </view>
              <view class="lock-text">开通 VIP 解锁深度分析</view>
              <wd-button custom-class="upgrade-btn" @click="goToRecharge">立即升级 VIP</wd-button>
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

              <!-- 近6次考试趋势分析 -->
              <view class="analysis-card detail-card">
                <view class="card-header">
                  <text class="card-title">近6次考试趋势分析</text>
                  <text class="vip-tag">VIP</text>
                </view>
                
                <view class="chart-tabs" style="margin-top: 20rpx;">
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
                
                <view class="bar-chart-container" style="padding-top: 20rpx; height: 300rpx;">
                  <view class="bar-item" v-for="(item, idx) in scoreData.history" :key="idx">
                    <view class="bar-val">{{ getChartValue(item) }}</view>
                    <view class="bar-track">
                      <view class="bar-fill" :style="{ height: getChartHeight(item) }"></view>
                    </view>
                    <view class="bar-label">{{ item.period }}</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 错题集区域 -->
        <view v-if="currentMainTab === 'wrong_book'">
          <view class="tab-content" style="position: relative; min-height: 600rpx;">
            <!-- VIP 权限判断遮罩 -->
            <view class="vip-lock-mask" v-if="!isVIPUser">
              <view class="lock-icon-wrapper">
                <wd-icon name="lock-on" size="48px" color="#f6d365" />
              </view>
              <view class="lock-text">开通 VIP 解锁错题集及打印功能</view>
              <wd-button custom-class="upgrade-btn" @click="goToRecharge">立即升级 VIP</wd-button>
            </view>
            
            <scroll-view scroll-y class="wrong-list" style="height: 600rpx;" v-else>
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
        </view>

        <!-- 错题推送区域（原有 AI 自习室 / 学习建议） -->
        <view v-if="currentMainTab === 'wrong_push'">
          <view class="tab-content svip-content">
            <!-- 权限判断遮罩 -->
            <view class="svip-lock" v-if="!isSVIPUser">
              <view class="lock-icon-wrapper">
                <wd-icon name="lock-on" size="48px" color="#f6d365" />
              </view>
              <view class="lock-text">此专区为 SVIP 专属功能</view>
              <wd-button custom-class="upgrade-btn" @click="goToRecharge">立即升级 SVIP</wd-button>
            </view>
            
            <view v-else>
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
          </view>
        </view>
      </view> <!-- analysis-container 闭合 -->

    </scroll-view>

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
import { ref, onMounted, computed, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getStudentScoresApi, getSemesterListApi } from '@/api/score'
import { getVipAnalysisDataApi, getVipWrongBookApi, submitPrintOrderApi, getPrintConfigApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'

const toast = useToast()
const scoreData = ref<any>(null)
const currentSubject = ref('总分')
const currentMainTab = ref('analysis')

// VIP 数据与权限
const isVIPUser = ref(false)
const isSVIPUser = ref(false)

const checkVipStatus = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      isVIPUser.value = res.data.isVip === 1 || res.data.isSvip === 1
      isSVIPUser.value = res.data.isSvip === 1
      uni.setStorageSync('userInfo', res.data)
    }
  } catch (error) {
    console.error('获取VIP状态失败:', error)
  }
}

onShow(() => {
  checkVipStatus()
})
const analysisData = ref<any>(null)
const wrongBookData = ref<any[]>([])

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

// 学期与考试的联动数据结构
const semesterData = ref<Record<string, any[]>>({})
const semesters = ref<any[]>([])

// Picker 数据列
const pickerColumns = ref<any[]>([[], []])
// 当前选中的值 [学期value, 考试value]
const pickerValue = ref(['', ''])

// 用于顶部显示的文本
const currentDisplayLabel = ref('加载中...')

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
  
  // 假设默认打印 20 页（这个在实际业务中应该是根据错题数量或者用户输入决定的，这里作为 mock 展示计算逻辑）
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

// 动态级联切换
const onPickerColumnChange = (picker: any, value: any, columnIndex: number, resolve: Function) => {
  if (columnIndex === 0) {
    // 选择了不同的学期，更新第二列的考试列表
    const selectedSemesterValue = value[0]
    picker.setColumnData(1, semesterData.value[selectedSemesterValue] || [])
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

const loadInitData = async () => {
  try {
    toast.loading('初始化中...')
    const [semesterRes, printRes] = await Promise.all([
      getSemesterListApi(),
      getPrintConfigApi()
    ])
    
    if (printRes.code === 200) {
      printConfig.value = printRes.data
    }
    
    if (semesterRes.code === 200) {
      semesters.value = semesterRes.data.semesters
      semesterData.value = semesterRes.data.semesterData
      
      const firstSemester = semesters.value[0].value
      const firstExam = semesterData.value[firstSemester][0].value
      
      pickerColumns.value = [
        semesters.value,
        semesterData.value[firstSemester]
      ]
      pickerValue.value = [firstSemester, firstExam]
      currentDisplayLabel.value = `${semesters.value[0].label} - ${semesterData.value[firstSemester][0].label}`
      
      loadData(firstSemester, firstExam)
    }
  } catch (error: any) {
    toast.error('初始化失败')
  }
}

const loadData = async (semesterVal: string, examIdVal: string) => {
  try {
    toast.loading('加载中...')
    
    // VIP 权限已在 onShow 中通过 checkVipStatus 更新

    const p1 = getStudentScoresApi({ semester: semesterVal, examId: examIdVal })
    const p2 = isVIPUser.value ? getVipAnalysisDataApi() : Promise.resolve({ code: 200, data: null })
    const p3 = getVipWrongBookApi({})

    const [res, anaRes, wrongRes] = await Promise.all([p1, p2, p3])
    
    if (res.code === 200) {
      scoreData.value = res.data
      currentSubject.value = '总分'
    } else {
      toast.error(res.msg || '获取数据失败')
    }

    if (anaRes.code === 200 && isVIPUser.value) {
      analysisData.value = anaRes.data
    }

    if (wrongRes.code === 200) {
      wrongBookData.value = wrongRes.data
    }

    toast.close()
  } catch (error: any) {
    toast.error(error.msg || '网络错误')
  }
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/pages/vip/recharge' })
}

const handleExport = () => {
  toast.loading('正在生成...')
  setTimeout(() => {
    toast.success('导出成功，请查看通知')
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

const joinRoom = () => {
  toast.loading('正在为您分配座位...')
  setTimeout(() => {
    toast.success('报名成功，即将进入自习室')
  }, 1500)
}

onMounted(() => {
  loadInitData()
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

.analysis-container {
  margin-bottom: 40rpx;
}

.top-tabs {
  display: flex;
  justify-content: space-around;
  background: #fff;
  padding: 0 40rpx;
  margin-bottom: 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.02);

  .tab-item {
    position: relative;
    padding: 30rpx 0;
    font-size: 30rpx;
    color: #666;
    transition: all 0.3s;

    &.active {
      font-weight: bold;
      color: #1a5f8e;
      font-size: 32rpx;
    }

    .line {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background: #1a5f8e;
      border-radius: 4rpx;
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  
  .lock-icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    background: rgba(246, 211, 101, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
  }

  .lock-text {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 40rpx;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%) !important;
    color: #f6d365 !important;
    border: none !important;
    border-radius: 40rpx;
    width: 320rpx;
    height: 80rpx;
    font-size: 30rpx;
    box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.2);
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

// 错题集样式
.wrong-list {
  padding: 0 10rpx;
}

.wrong-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  
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

// 错题推送 (SVIP专区) 样式
.svip-content {
  position: relative;
  padding: 10rpx;
  min-height: 400rpx;
}

.svip-lock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;

  .lock-icon-wrapper {
    width: 120rpx;
    height: 120rpx;
    background: rgba(246, 211, 101, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
  }

  .lock-text {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    margin-bottom: 40rpx;
  }

  .upgrade-btn {
    background: linear-gradient(135deg, #333333 0%, #1a1a1a 100%) !important;
    color: #f6d365 !important;
    border: none !important;
    border-radius: 40rpx;
    width: 320rpx;
    height: 80rpx;
    font-size: 30rpx;
    box-shadow: 0 8rpx 16rpx rgba(0,0,0,0.2);
  }
}

.svip-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);
  border-left: 8rpx solid #333 !important;

  .card-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
    display: flex;
    align-items: center;
    .icon { color: #f6d365; margin-right: 10rpx; }
  }

  .desc {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 30rpx;
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
