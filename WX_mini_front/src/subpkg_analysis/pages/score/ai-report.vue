<template>
  <view class="ai-report-page">
    <scroll-view scroll-y class="content-scroll">
      <AiReportPanel
        :loading="loading"
        :has-access="isSVIP"
        :report-data="reportData"
        :score-data="scoreData"
        @upgrade="goToRecharge"
        @export="handleExport"
      />
    </scroll-view>
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import AiReportPanel from '@/subpkg_analysis/components/AiReportPanel.vue'
import { getAiExamReportApi, exportAiExamReportApi } from '@/subpkg_analysis/api/score'
import { useToast } from 'wot-design-uni'

const toast = useToast()
const loading = ref(false)
const isSVIP = ref(true) // 能进到这个页面通常已经是 SVIP
const reportData = ref<any>(null)
const scoreData = ref<any>(null)
const examId = ref('')

onLoad((options: any) => {
  if (options.examId) {
    examId.value = options.examId
  }
  
  // 从缓存获取数据
  const cachedReport = uni.getStorageSync('currentAiReportData')
  const cachedScore = uni.getStorageSync('currentScoreData')
  
  if (cachedReport) reportData.value = cachedReport
  if (cachedScore) scoreData.value = cachedScore
  
  if (!reportData.value && examId.value) {
    fetchReport()
  }
})

const fetchReport = async () => {
  if (!examId.value) return
  loading.value = true
  try {
    const res = await getAiExamReportApi({ examId: examId.value })
    if (res.code === 200) {
      reportData.value = res.data
    } else {
      toast.error(res.msg || '获取报告失败')
    }
  } catch (e) {
    toast.error('网络错误')
  } finally {
    loading.value = false
  }
}

const goToRecharge = () => {
  uni.navigateTo({ url: '/subpkg_course/pages/vip/recharge?type=SVIP&redirect=score' })
}

const resolveAssetUrl = (url?: string) => {
  if (!url) return ''
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  const baseUrl = String(import.meta.env.VITE_SERVER_BASEURL || '')
  if (!baseUrl) return url
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  return url.startsWith('/') ? `${normalizedBase}${url}` : `${normalizedBase}/${url}`
}

const handleExport = async () => {
  if (!examId.value) return
  try {
    uni.showLoading({ title: '正在生成报告...', mask: true })
    const res = await exportAiExamReportApi({ examId: examId.value })
    uni.hideLoading()
    if (res.code === 200 && res.data) {
      toast.success('导出成功')
      const downloadUrl = resolveAssetUrl(res.data)
      uni.downloadFile({
        url: downloadUrl,
        success: (downloadRes) => {
          if (downloadRes.statusCode === 200) {
            uni.openDocument({
              filePath: downloadRes.tempFilePath,
              showMenu: true,
              fileType: 'pdf'
            })
          }
        }
      })
    } else {
      toast.error(res.msg || '导出失败')
    }
  } catch (e) {
    uni.hideLoading()
    toast.error('网络错误')
  }
}
</script>

<style lang="scss" scoped>
.ai-report-page {
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
  padding: 30rpx;
  box-sizing: border-box;
}
</style>
