<template>
  <div v-loading="loading" class="subject-score-page">
    <div class="header-section">
      <div class="back-link" @click="goBack">
        <el-icon><Back /></el-icon>
        返回项目详情
      </div>
    </div>

    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form" @submit.prevent>
        <el-form-item label="学校">
          <el-select v-model="searchForm.schoolId" clearable placeholder="全部学校" style="width: 200px">
            <el-option v-for="item in schoolOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级">
          <el-select v-model="searchForm.classId" clearable placeholder="全部班级" style="width: 200px">
            <el-option v-for="item in classOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" clearable placeholder="姓名 / 考号" @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="list-card">
      <div class="list-header">
        <div class="list-header__left">
          <h2 class="list-title">{{ subjectName }} 成绩管理</h2>
          <span class="list-count">项目ID: {{ projectId }}</span>
        </div>
        <div class="list-header__right">
          <el-button type="success" :icon="Upload" @click="handleBatchUpload">批量上传答题卡</el-button>
          <el-button type="primary" :icon="Download" @click="handleExport">导出成绩单</el-button>
        </div>
      </div>

      <el-table :data="tableData" stripe class="custom-table">
        <el-table-column prop="studentNo" label="考号" width="140" fixed="left" />
        <el-table-column prop="studentName" label="姓名" width="120" fixed="left" />
        <el-table-column prop="school" label="学校" min-width="180" />
        <el-table-column prop="className" label="班级" width="150" />
        <el-table-column prop="totalScore" label="总分" width="120" align="center">
          <template #default="{ row }">
            <el-input-number
              v-model="row.totalScore"
              :min="0"
              :max="150"
              size="small"
              controls-position="right"
              @change="handleScoreChange(row)"
            />
          </template>
        </el-table-column>
        
        <!-- 小题分动态列 -->
        <el-table-column
          v-for="(score, index) in maxQuestionCount"
          :key="index"
          :label="`第${index + 1}题`"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-input
              v-model="row.questionScores[index]"
              size="small"
              class="score-input"
              @change="handleSubScoreChange(row, index)"
            />
          </template>
        </el-table-column>

        <el-table-column label="答题卡" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-upload
                action="#"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="(file) => handleUploadAnswerSheet(row, file)"
              >
                <el-button type="primary" link :icon="Picture">
                  {{ row.hasAnswerSheet ? '更新' : '上传' }}
                </el-button>
              </el-upload>
              <el-button v-if="row.hasAnswerSheet" type="success" link :icon="View" @click="handlePreview(row)">
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleSave(row)">保存</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <!-- 答题卡预览弹窗 -->
    <el-dialog v-model="previewVisible" title="答题卡预览" width="800px">
      <div class="answer-sheet-preview">
        <img :src="previewUrl" alt="答题卡" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, reactive, ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { Back, Search, Refresh, Upload, Download, Picture, View } from '@element-plus/icons-vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { fetchProjectScoreList } from '@/api/core-business/exam/project-editor'
  import { fetchProjectOptions } from '@/api/core-business/exam/project'

  const route = useRoute()
  const router = useRouter()
  const loading = ref(false)
  const projectId = computed(() => String(route.query.projectId || ''))
  const subjectName = computed(() => String(route.query.subjectName || ''))

  const page = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const tableData = ref<any[]>([])
  const maxQuestionCount = ref(10) // 默认显示10道小题

  const schoolOptions = ref<any[]>([])
  const classOptions = ref<any[]>([])

  const searchForm = reactive({
    schoolId: '',
    classId: '',
    keyword: ''
  })

  const previewVisible = ref(false)
  const previewUrl = ref('')

  async function loadOptions() {
    try {
      const res = await fetchProjectOptions()
      schoolOptions.value = res.schools?.map(s => ({ id: s.id, name: s.label })) || []
      classOptions.value = res.classes?.map(c => ({ id: c.id, name: c.label })) || []
    } catch (error) {
      console.error('加载选项失败', error)
    }
  }

  async function loadData() {
    if (!projectId.value || !subjectName.value) return
    loading.value = true
    try {
      const res = await fetchProjectScoreList({
        projectId: projectId.value,
        subjectName: subjectName.value,
        current: page.value,
        size: pageSize.value,
        schoolId: searchForm.schoolId || undefined,
        classId: searchForm.classId || undefined,
        keyword: searchForm.keyword
      })
      
      // 模拟添加小题分数据
      tableData.value = (res.records || []).map(item => ({
        ...item,
        questionScores: Array.from({ length: maxQuestionCount.value }).map(() => Math.floor(Math.random() * 10)),
        hasAnswerSheet: Math.random() > 0.5
      }))
      total.value = res.total || 0
    } finally {
      loading.value = false
    }
  }

  function handleSearch() {
    page.value = 1
    loadData()
  }

  function handleReset() {
    searchForm.schoolId = ''
    searchForm.classId = ''
    searchForm.keyword = ''
    page.value = 1
    loadData()
  }

  function handleSizeChange() {
    page.value = 1
    loadData()
  }

  function handleScoreChange(row: any) {
    console.log('总分变更', row.totalScore)
  }

  function handleSubScoreChange(row: any, index: number) {
    // 重新计算总分
    const newTotal = row.questionScores.reduce((sum: number, s: any) => sum + (Number(s) || 0), 0)
    row.totalScore = newTotal
  }

  function handleUploadAnswerSheet(row: any, file: any) {
    ElMessage.success(`学生 ${row.studentName} 的答题卡上传成功`)
    row.hasAnswerSheet = true
  }

  function handlePreview(row: any) {
    previewUrl.value = 'https://img.zcool.cn/community/01f1145b34d700a80120b9595d2890.jpg@1280w_1l_2o_100sh.jpg' // 模拟预览图
    previewVisible.value = true
  }

  function handleSave(row: any) {
    ElMessage.success(`学生 ${row.studentName} 的成绩已保存`)
  }

  function handleBatchUpload() {
    ElMessage.info('批量上传功能开发中...')
  }

  function handleExport() {
    ElMessage.info('导出功能开发中...')
  }

  function goBack() {
    router.push({
      name: 'ExamProjectEditor',
      query: { projectId: projectId.value }
    })
  }

  onMounted(() => {
    loadOptions()
    loadData()
  })
</script>

<style scoped lang="scss">
  .subject-score-page {
    padding: 20px;
    background-color: #f5f7fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header-section {
    margin-bottom: -8px;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #606266;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.3s;

    &:hover {
      color: #409eff;
    }
  }

  .search-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.el-card__body) {
      padding: 20px 24px;
    }
  }

  .search-form {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;

      &:last-child {
        margin-right: 0;
        margin-left: auto;
      }

      .el-form-item__label {
        font-weight: 500;
        color: #606266;
      }
    }
  }

  .list-card {
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
    flex: 1;

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    &__left {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }
  }

  .list-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #303133;
  }

  .list-count {
    font-size: 13px;
    color: #909399;
  }

  .custom-table {
    margin-bottom: 20px;

    :deep(.el-table__header-wrapper) th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
      height: 50px;
    }

    :deep(.el-table__row) {
      height: 60px;
    }
  }

  .score-input {
    :deep(.el-input__inner) {
      text-align: center;
      padding: 0 4px;
    }
  }

  .action-buttons {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .pagination-wrap {
    display: flex;
    justify-content: flex-end;
  }

  .answer-sheet-preview {
    text-align: center;
    img {
      max-width: 100%;
      border-radius: 8px;
    }
  }
</style>
