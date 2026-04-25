<template>
  <view class="score-container">
    <view class="filter-bar" v-if="!showPrintDialog">
      <!-- 使用 wd-picker 实现学期和考试的联动选择 -->
      <wd-picker 
        :columns="pickerColumns" 
        v-model="pickerValue" 
        title="请选择学期和考试" 
        @confirm="onPickerConfirm"
        :column-change="onPickerColumnChange"
        v-if="pickerColumns[0].length > 0"
      >
        <view class="picker-inner">
          <text class="picker-label">选择考试</text>
          <view class="picker-right">
            <text class="picker-text">{{ currentDisplayLabel }}</text>
            <wd-icon name="arrow-right" size="14px" color="#94a3b8" />
          </view>
        </view>
      </wd-picker>
      <view v-else class="loading-placeholder">
        <text class="picker-label">选择考试</text>
        <text class="picker-text">{{ currentDisplayLabel }}</text>
      </view>
    </view>

    <scroll-view scroll-y class="content" v-if="scoreData" :show-scrollbar="false" :enhanced="true">
      <!-- 考试概览 -->
      <view class="overview-card">
        <view class="exam-info">
          <text class="exam-name">考试名称：{{ scoreData.examName }}</text>
          <text class="exam-date">更新时间：{{ scoreData.examDate }}</text>
        </view>
        <view class="score-main">
          <text class="score-text">总分：{{ scoreData.totalScore }}分</text>
          <text class="score-text">综合等级：{{ scoreData.totalLevel }}</text>
        </view>
      </view>

      <!-- 各科成绩 -->
      <view class="section subject-section">
        <view class="section-title">
          <view class="blue-bar"></view>
          <text>各科成绩</text>
        </view>
        <view class="subject-grid">
          <view 
            class="subject-card" 
            v-for="(sub, index) in scoreData.subjects" 
            :key="index" 
            @click="goToPaperDetail(sub)"
            :class="getSubjectThemeClass(index)"
          >
            <view class="sub-left">
              <text class="sub-name">{{ sub.name }}</text>
              <text class="sub-score">{{ sub.score }}/{{ sub.fullScore }}</text>
            </view>
            <view class="sub-right">
              <view class="sub-level-wrap">
                <text class="sub-level">{{ sub.level }}</text>
              </view>
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
            错题整理
            <view class="line" v-if="currentMainTab === 'wrong_book'"></view>
          </view>
          <view 
            class="tab-item" 
            :class="{ active: currentMainTab === 'wrong_push' }"
            @click="currentMainTab = 'wrong_push'"
          >
            AI成绩分析
            <view class="line" v-if="currentMainTab === 'wrong_push'"></view>
          </view>
        </view>

        <!-- 成绩分析内容 (原 VIP 数据分析卡片) -->
        <view v-if="currentMainTab === 'analysis'">
          <view class="vip-analysis-section">
            <!-- VIP 权限判断遮罩 -->
            <view class="vip-lock-mask" v-if="!isVIPUser">
              <view class="lock-icon-wrapper">
                <text class="vip-badge-text">VIP</text>
              </view>
              <view class="lock-text">开通 VIP 解锁深度分析</view>
              <wd-button custom-class="upgrade-btn" @click="goToRecharge('VIP')">立即开通 VIP</wd-button>
            </view>

            <view class="vip-analysis-content" :class="{ 'blurred': !isVIPUser }">
              
              <!-- 详细的成绩构成分析 -->
              <view class="analysis-card detail-card" v-if="analysisData && analysisData.composition" @click="goToDetail('composition')">
                <view class="card-header">
                  <view class="header-left">
                    <view class="blue-bar"></view>
                    <text class="card-title">成绩构成分析</text>
                  </view>
                  <wd-icon name="arrow-right" size="16px" color="#ccc" />
                </view>
              </view>

              <!-- 详细的成绩分布统计 -->
              <view class="analysis-card detail-card" v-if="analysisData && analysisData.distribution" @click="goToDetail('distribution')">
                <view class="card-header">
                  <view class="header-left">
                    <view class="blue-bar"></view>
                    <text class="card-title">分数分布统计</text>
                  </view>
                  <wd-icon name="arrow-right" size="16px" color="#ccc" />
                </view>
              </view>

              <!-- 近6次考试趋势分析 -->
              <view class="analysis-card detail-card" @click="goToDetail('trend')">
                <view class="card-header">
                  <view class="header-left">
                    <view class="blue-bar"></view>
                    <text class="card-title">近六次考试趋势分析</text>
                  </view>
                  <wd-icon name="arrow-right" size="16px" color="#ccc" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 错题集区域 -->
        <view v-if="currentMainTab === 'wrong_book'">
          <view class="tab-content locked-content">
            <!-- VIP 权限判断遮罩 -->
            <view class="vip-lock-mask" v-if="!isVIPUser">
              <view class="lock-icon-wrapper">
                <text class="vip-badge-text">VIP</text>
              </view>
              <view class="lock-text">开通 VIP 解锁错题集及打印功能</view>
              <wd-button custom-class="upgrade-btn" @click="goToRecharge('VIP')">立即开通 VIP</wd-button>
            </view>
            
            <view v-else>
              <WrongBookToolbar
                v-model="selectedWrongSubject"
                :source-label="wrongSourceLabel"
                :options="wrongBookFilterOptions"
                @export="handleExport"
                @print="showPrintDialog = true"
              />

              <view class="wrong-list">
                <WrongQuestionCard
                  v-for="item in filteredWrongBookData"
                  :key="item.id"
                  :item="item"
                  @preview="previewSliceImage"
                />
                <view v-if="!filteredWrongBookData.length" class="wrong-empty">
                  <text>当前筛选条件下暂无错题</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 错题推送区域（原有 AI 自习室 / 学习建议） -->
        <view v-if="currentMainTab === 'wrong_push'">
          <view class="tab-content svip-content">
            <AiReportPanel
              :loading="aiReportLoading"
              :has-access="isSVIPUser"
              :report-data="aiReportData"
              @upgrade="goToRecharge('SVIP')"
            />
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
import { ref, computed, watch } from 'vue'
import { onShow, onLoad } from '@dcloudio/uni-app'
import { useToast } from 'wot-design-uni'
import { getStudentScoresApi, getSemesterListApi, getAiExamReportApi, exportWrongBookApi } from '@/subpkg_analysis/api/score'
import { submitPrintOrderApi, getPrintConfigApi } from '@/api/vip'
import { getUserInfoApi } from '@/api/mine'
import AiReportPanel from '@/subpkg_analysis/components/AiReportPanel.vue'
import WrongBookToolbar from '@/subpkg_analysis/components/WrongBookToolbar.vue'
import WrongQuestionCard from '@/subpkg_analysis/components/WrongQuestionCard.vue'

const toast = useToast()
const scoreData = ref<any>(null)
const currentSubject = ref('总分')
const currentMainTab = ref('analysis')
const userPhone = ref('') // 存储传入的手机号

const getSubjectThemeClass = (index: number) => {
  const themes = ['bg-theme-blue', 'bg-theme-green', 'bg-theme-yellow', 'bg-theme-yellow', 'bg-theme-blue', 'bg-theme-green']
  return themes[index % 6]
}

// VIP 数据与权限
const isVIPUser = ref(false)
const isSVIPUser = ref(false)

const checkVipStatus = async () => {
  try {
    const res = await getUserInfoApi()
    if (res.code === 200) {
      // 1. 判断是否绑定学生
      if (res.data.isBoundStudent === 0) {
        toast.show('请先绑定学生')
        const phone = res.data.phone || userPhone.value
        setTimeout(() => {
          uni.redirectTo({ url: `/pages/auth/bind-student?phone=${phone || ''}` })
        }, 1500)
        return
      }
      
      // 2. 更新 VIP 状态
      isVIPUser.value = Number(res.data.vipType || 0) >= 1
      isSVIPUser.value = Number(res.data.vipType || 0) >= 2
      uni.setStorageSync('userInfo', res.data)
    }
  } catch (error) {
    console.error('获取VIP状态失败:', error)
  }
}

const getDifficultyClass = (diff: string) => {
  switch (diff) {
    case '简单': return 'diff-easy'
    case '中等': return 'diff-medium'
    case '困难': return 'diff-hard'
    default: return ''
  }
}

const getMasteryColor = (val: number) => {
  if (val >= 80) return '#07c160'
  if (val >= 40) return '#fa9d3b'
  return '#ee0a24'
}


const analysisData = ref<any>(null)
const wrongBookData = ref<any[]>([])
const selectedWrongSubject = ref('all')
const aiReportLoading = ref(false)
const aiReportData = ref<any>(null)
const aiReportExamId = ref('')

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

const normalizedWrongBookData = computed(() =>
  (wrongBookData.value || []).map((item: any) => ({
    ...item,
    displaySliceImageUrl: resolveAssetUrl(item.sliceImageUrl),
    subject: String(item.subject || ''),
    source: String(item.source || scoreData.value?.examName || ''),
    myScore: item.myScore ?? 0,
    highestScore: item.highestScore ?? 0
  }))
)

const wrongSourceLabel = computed(() => {
  return String(scoreData.value?.examName || currentDisplayLabel.value || '当前试卷')
})

const wrongBookFilterOptions = computed(() => {
  const groups = new Map<string, number>()
  for (const item of normalizedWrongBookData.value) {
    const subject = String(item.subject || '未分类')
    groups.set(subject, (groups.get(subject) || 0) + 1)
  }
  return [
    {
      label: '全部',
      value: 'all',
      count: normalizedWrongBookData.value.length
    },
    ...Array.from(groups.entries()).map(([label, count]) => ({
      label,
      value: label,
      count
    }))
  ]
})

const filteredWrongBookData = computed(() => {
  if (selectedWrongSubject.value === 'all') {
    return normalizedWrongBookData.value
  }
  return normalizedWrongBookData.value.filter((item: any) => item.subject === selectedWrongSubject.value)
})

// 动态计算预估费用
const estimatedPrice = computed(() => {
  // 基础纸张费用
  const paperConfig = printConfig.value.paperConfigs.find((p: any) => 
    p.size === printForm.value.paperSize && 
    p.side === printForm.value.printSide && 
    p.color === printForm.value.color
  )
  
  // 根据当前筛选的错题数量计算页数（假设两道错题占一页）
  const pageCount = Math.ceil(filteredWrongBookData.value.length / 2) || 1
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
  const examId = scoreData.value?.examId || pickerValue.value[1] || ''
  uni.navigateTo({
    url: `/subpkg_analysis/pages/paper/index?subject=${encodeURIComponent(subjectInfo.name || '')}&examId=${encodeURIComponent(examId)}`
  })
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  const staticBaseUrl = String(__VITE_STATIC_BASEURL__ || '')
  if (url.startsWith('/uploads/') && staticBaseUrl) {
    const cdnRoot = staticBaseUrl.replace(/\/static\/?$/i, '')
    if (cdnRoot) {
      return `${cdnRoot}${url}`
    }
  }
  const baseUrl = String(import.meta.env.VITE_SERVER_BASEURL || '')
  if (!baseUrl) return url
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return url.startsWith('/') ? `${normalizedBase}${url}` : `${normalizedBase}/${url}`
}

const previewSliceImage = (url?: string) => {
  const imageUrl = resolveAssetUrl(url)
  if (!imageUrl) return
  uni.previewImage({
    urls: [imageUrl],
    current: imageUrl
  })
}

const goToDetail = (type: string) => {
  uni.setStorageSync('currentAnalysisData', analysisData.value)
  uni.setStorageSync('currentScoreData', scoreData.value)
  uni.navigateTo({
    url: `/subpkg_analysis/pages/score/${type}?examId=${pickerValue.value[1] || ''}`
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
    uni.showLoading({ title: '初始化中...', mask: true })
    const [semesterRes, printRes] = await Promise.all([
      getSemesterListApi(),
      getPrintConfigApi()
    ])
    
    if (printRes.code === 200) {
      printConfig.value = printRes.data
    }
    
    if (semesterRes.code === 200) {
      semesters.value = semesterRes.data.semesters || []
      semesterData.value = semesterRes.data.semesterData || {}
      
      if (semesters.value.length > 0) {
        const firstSemester = semesters.value[0].value
        const exams = semesterData.value[firstSemester] || []
        
        if (exams.length > 0) {
          const firstExam = exams[0].value
          
          pickerColumns.value = [
            semesters.value,
            exams
          ]
          pickerValue.value = [firstSemester, firstExam]
          currentDisplayLabel.value = `${semesters.value[0].label} - ${exams[0].label}`
          
          loadData(firstSemester, firstExam)
        } else {
          currentDisplayLabel.value = '暂无考试数据'
          uni.hideLoading()
        }
      } else {
        currentDisplayLabel.value = '暂无学期数据'
        uni.hideLoading()
      }
    } else {
      uni.hideLoading()
      uni.showToast({ title: semesterRes.msg || '获取列表失败', icon: 'none' })
    }
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: '初始化失败', icon: 'none' })
  }
}

const loadData = async (semesterVal: string, examIdVal: string) => {
  try {
    uni.showLoading({ title: '加载中...', mask: true })
    aiReportData.value = null
    aiReportExamId.value = ''
    aiReportLoading.value = false
    
    // VIP 权限已在 onShow 中通过 checkVipStatus 更新

    const p1 = getStudentScoresApi({ semester: semesterVal, examId: examIdVal })
    const p2 = Promise.resolve({ code: 200, data: null })

    const [res, anaRes] = await Promise.all([p1, p2])
    
    if (res.code === 200) {
      scoreData.value = res.data
      currentSubject.value = '总分'
    } else {
      uni.hideLoading()
      uni.showToast({ title: res.msg || '获取数据失败', icon: 'none' })
      return // 发生错误时停止后续逻辑
    }

    if (anaRes.code === 200 && isVIPUser.value) {
      analysisData.value = {
        composition: true,
        distribution: true,
        trend: true,
        subjects: res.data?.subjects || []
      }
    }

    wrongBookData.value = isVIPUser.value ? (res.data?.wrongQuestions || []) : []
    selectedWrongSubject.value = 'all'

    uni.hideLoading()
    tryLoadAiReport()
  } catch (error: any) {
    uni.hideLoading()
    uni.showToast({ title: error.msg || '网络错误', icon: 'none' })
  }
}

const loadAiReport = async (examId: string) => {
  if (!examId || aiReportLoading.value || aiReportExamId.value === examId) return
  aiReportLoading.value = true
  try {
    const res = await getAiExamReportApi({ examId })
    if (res.code === 200) {
      aiReportData.value = res.data
      aiReportExamId.value = examId
    } else {
      aiReportData.value = null
      uni.showToast({ title: res.msg || 'AI报告获取失败', icon: 'none' })
    }
  } catch (error: any) {
    aiReportData.value = null
    uni.showToast({ title: error.msg || 'AI报告获取失败', icon: 'none' })
  } finally {
    aiReportLoading.value = false
  }
}

const tryLoadAiReport = () => {
  const examId = scoreData.value?.examId || pickerValue.value?.[1]
  if (currentMainTab.value === 'wrong_push' && isSVIPUser.value && examId) {
    loadAiReport(examId)
  }
}

const goToRecharge = (type: string = 'VIP') => {
  uni.navigateTo({ url: `/subpkg_course/pages/vip/recharge?type=${type}&redirect=score` })
}

const handleExport = async () => {
  const examId = scoreData.value?.examId || pickerValue.value?.[1]
  if (!examId) return toast.show('未选择考试')

  try {
    uni.showLoading({ title: '正在生成PDF...', mask: true })
    const res = await exportWrongBookApi({
      examId,
      subject: selectedWrongSubject.value
    })

    if (res.code === 200 && res.data) {
      uni.hideLoading()
      toast.success('生成成功')
      
      // 使用下载并打开文档的方式
      uni.downloadFile({
        url: res.data,
        success: (downloadRes) => {
          if (downloadRes.statusCode === 200) {
            uni.openDocument({
              filePath: downloadRes.tempFilePath,
              showMenu: true,
              success: () => console.log('打开文档成功'),
              fail: () => toast.error('打开文档失败')
            })
          }
        },
        fail: () => toast.error('下载文件失败')
      })
    } else {
      uni.hideLoading()
      toast.error(res.msg || '生成失败')
    }
  } catch (e) {
    uni.hideLoading()
    console.error('导出错题失败:', e)
    toast.error('网络错误，导出失败')
  }
}

// 监听 scoreData 变化，预填手机号
watch(scoreData, (newVal) => {
  if (newVal?.userInfo?.phone && !printForm.value.phone) {
    printForm.value.phone = newVal.userInfo.phone
  }
}, { immediate: true })

const submitPrint = async () => {
  if (!printForm.value.address || !printForm.value.phone) {
    return toast.show('请填写完整信息')
  }
  try {
    uni.showLoading({ title: '提交中...', mask: true })
    
    // 获取当前用户信息
    const userInfo = uni.getStorageSync('userInfo')
    
    // 构造更真实的订单数据
    const orderData = {
      ...printForm.value,
      userName: userInfo?.name || userInfo?.nickname || '微信用户',
      userPhone: printForm.value.phone || userInfo?.phone,
      documentName: `${scoreData.value?.examName || '错题集'}-${selectedWrongSubject.value === 'all' ? '全部科目' : selectedWrongSubject.value}`,
      pages: Math.ceil(filteredWrongBookData.value.length / 2) || 1 // 假设两道错题占一页
    }
    
    const res = await submitPrintOrderApi(orderData)
    uni.hideLoading()
    if (res.code === 200) {
      toast.success(res.msg || '下单成功')
      showPrintDialog.value = false
    } else {
      toast.error('下单失败')
    }
  } catch (e: any) {
    uni.hideLoading()
    toast.error('下单失败')
  }
}

onLoad(async (options: any) => {
  if (options && options.phone) {
    userPhone.value = options.phone
    printForm.value.phone = options.phone
  }
  await checkVipStatus()
  loadInitData()
})

onShow(async () => {
  // 每次进入页面可以再次刷新状态，但 onLoad 里的那次保证了首次加载逻辑正确
  const oldVip = isVIPUser.value
  const oldSvip = isSVIPUser.value
  
  await checkVipStatus()
  
  // 如果权限发生了变化（开通了会员），则重新加载当前选中的考试数据
  if ((isVIPUser.value && !oldVip) || (isSVIPUser.value && !oldSvip)) {
    if (pickerValue.value[0] && pickerValue.value[1]) {
      loadData(pickerValue.value[0], pickerValue.value[1])
    }
  }
})

watch(
  () => [currentMainTab.value, isSVIPUser.value, scoreData.value?.examId],
  () => {
    tryLoadAiReport()
  }
)
</script>

<style lang="scss" scoped>
.score-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #e0effe 0%, #f7f8fa 500rpx, #f7f8fa 100%);
  display: flex;
  flex-direction: column;
}

.filter-bar {
  background: #e0effe;
  padding: 20rpx 30rpx 24rpx;
  position: sticky;
  top: 0;
  z-index: 99; // 降低层级，确保低于弹窗的遮罩层（通常为1000+）
  display: flex;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .picker-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(680rpx, 100%);
    min-height: 96rpx;
    background: #fff;
    padding: 0 28rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08); // 阴影稍微重一点，更显眼
    border: 1px solid rgba(67, 100, 247, 0.1); // 增加淡蓝色边框
    margin: 0 auto;

    .picker-label {
      flex-shrink: 0;
      font-size: 28rpx;
      color: #475569;
      font-weight: 600;
      margin-right: 20rpx;
    }

    .picker-right {
      min-width: 0;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
    }
    
    .picker-text {
      font-size: 28rpx;
      color: #333;
      font-weight: 500;
      max-width: 100%;
      white-space: normal;
      text-align: center;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: min(680rpx, 100%);
    min-height: 96rpx;
    background: #fff;
    padding: 0 28rpx;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
    border: 1px solid rgba(67, 100, 247, 0.1);
    margin: 0 auto;

    .picker-label {
      flex-shrink: 0;
      font-size: 28rpx;
      color: #475569;
      font-weight: 600;
      margin-right: 20rpx;
    }

    .picker-text {
      flex: 1;
      font-size: 28rpx;
      color: #999;
      font-weight: 500;
      text-align: center;
    }
  }
}

.content {
  flex: 1;
  min-height: 0;
  padding: 30rpx;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    display: none;
    width: 0 !important;
    height: 0 !important;
    -webkit-appearance: none;
    background: transparent;
    color: transparent;
  }
}

.overview-card {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

  .exam-info {
    margin-bottom: 30rpx;
    .exam-name {
      display: block;
      font-size: 32rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 12rpx;
    }
    .exam-date {
      font-size: 26rpx;
      color: #999;
    }
  }

  .score-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #eaf4fe;
    border-radius: 16rpx;
    padding: 24rpx 40rpx;

    .score-text {
      font-size: 30rpx;
      color: #1a5f8e;
      font-weight: bold;
    }
  }
}

.subject-section {
  background: #ffffff;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.02);

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    
    .blue-bar {
      width: 8rpx;
      height: 32rpx;
      background: #1a5f8e;
      border-radius: 4rpx;
      margin-right: 12rpx;
    }
  }
}

.subject-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;

  .subject-card {
    border-radius: 16rpx;
    padding: 24rpx 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    overflow: hidden;

    .sub-left {
      display: flex;
      flex-direction: column;
      gap: 12rpx;
      position: relative;
      z-index: 2;

      .sub-name {
        font-size: 30rpx;
        font-weight: bold;
        color: #333;
      }

      .sub-score {
        font-size: 24rpx;
        font-weight: bold;
      }
    }

    .sub-right {
      position: relative;
      z-index: 2;
      
      .sub-level-wrap {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.6);
        backdrop-filter: blur(4px);
        
        .sub-level {
          font-size: 22rpx;
          font-weight: bold;
        }
      }
    }

    /* 蓝色主题 */
    &.bg-theme-blue {
      background: linear-gradient(135deg, #eaf4fe 0%, #dcecfe 100%);
      .sub-score { color: #4a90e2; }
      .sub-level-wrap {
        color: #fff;
        background: #89c4f4;
        box-shadow: 0 4rpx 12rpx rgba(137, 196, 244, 0.6);
      }
    }

    /* 绿色主题 */
    &.bg-theme-green {
      background: linear-gradient(135deg, #eaf8f0 0%, #dcf1e4 100%);
      .sub-score { color: #43a047; }
      .sub-level-wrap {
        color: #fff;
        background: #81c784;
        box-shadow: 0 4rpx 12rpx rgba(129, 199, 132, 0.6);
      }
    }

    /* 黄色主题 */
    &.bg-theme-yellow {
      background: linear-gradient(135deg, #fdf5e6 0%, #fbead2 100%);
      .sub-score { color: #d4a017; }
      .sub-level-wrap {
        color: #fff;
        background: #e6c27a;
        box-shadow: 0 4rpx 12rpx rgba(230, 194, 122, 0.6);
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
  background: transparent;
  padding: 0 40rpx;
  margin-bottom: 30rpx;

  .tab-item {
    position: relative;
    padding: 30rpx 0;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s;

    &.active {
      font-weight: bold;
      color: #1a5f8e;
      font-size: 32rpx;
    }

    .line {
      position: absolute;
      bottom: 10rpx;
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
.vip-analysis-section, .locked-content {
  position: relative;
  overflow: hidden;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  min-height: 650rpx; // 统一高度，防止切换跳动
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

.vip-lock-mask, .svip-lock {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(4px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  
  .lock-icon-wrapper {
    width: 160rpx;
    height: 160rpx;
    background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(246, 211, 101, 0.3);
    border: 4rpx solid #fff;

    &.svip-badge {
      background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
      box-shadow: 0 4rpx 16rpx rgba(92, 107, 192, 0.25);
    }

    .vip-badge-text {
      font-size: 36rpx;
      font-weight: 900;
      background: linear-gradient(135deg, #f6a623 0%, #f7c948 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 2rpx;
    }

    &.svip-badge .vip-badge-text {
      background: linear-gradient(135deg, #5c6bc0 0%, #7986cb 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 32rpx;
    }
  }

  .lock-text {
    font-size: 32rpx;
    color: #333;
    font-weight: 600;
    margin-bottom: 40rpx;
    letter-spacing: 2rpx;
  }

  .upgrade-btn {
    width: 320rpx !important;
    height: 88rpx !important;
    background: linear-gradient(135deg, #4d80f0 0%, #6a9df8 100%) !important;
    color: #ffffff !important;
    border: none !important;
    border-radius: 44rpx !important;
    font-size: 30rpx !important;
    font-weight: bold !important;
    box-shadow: 0 8rpx 20rpx rgba(77, 128, 240, 0.3) !important;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.8;
      transform: scale(0.98);
    }
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
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);

  &.detail-card {
    display: block;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;

      .header-left {
        display: flex;
        align-items: center;

        .blue-bar {
          width: 11rpx;
          height: 34rpx;
          background: linear-gradient(180deg, #72C0FD 0%, #77CCFF 100%);
          border-radius: 20rpx;
          margin-right: 16rpx;
        }
        .card-title {
          font-size: 32rpx;
          font-weight: bold;
          color: #333;
        }
      }

      .header-icon {
        width: 32rpx;
        height: 32rpx;
      }
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
  padding: 0 4rpx 12rpx;
  box-sizing: border-box;
}

.wrong-empty {
  min-height: 320rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #98a6b8;
  font-size: 26rpx;
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

.tab-content, .svip-content {
  position: relative;
  min-height: 650rpx;
}

.vip-analysis-section {
  position: relative;
  overflow: hidden;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  min-height: 650rpx;
  background: #fff;
  border-radius: 24rpx;
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
