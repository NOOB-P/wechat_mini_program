<template>
  <div class="page-container">
    <el-card shadow="never">
      <template #header>
        <div class="flex justify-between items-center">
          <span>学校架构管理</span>
          <el-button type="primary" @click="handleAddClass">新增班级</el-button>
        </div>
      </template>
      <el-tree
        :data="treeData"
        :props="defaultProps"
        default-expand-all
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span v-if="!data.children">
              <el-button type="primary" link size="small" @click.stop="editNode(data)">编辑</el-button>
              <el-button type="danger" link size="small" @click.stop="deleteNode(data)">删除</el-button>
            </span>
          </span>
        </template>
      </el-tree>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增班级">
      <el-form :model="form" label-width="80px">
        <el-form-item label="所属年级">
          <el-select v-model="form.grade" placeholder="请选择年级">
            <el-option label="高一年级" value="g1" />
            <el-option label="高二年级" value="g2" />
          </el-select>
        </el-form-item>
        <el-form-item label="班级名称">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchGetSchoolTree, fetchAddClass } from '@/api/core-business/school/index'
import { ElMessage } from 'element-plus'

const treeData = ref([])
const defaultProps = {
  children: 'children',
  label: 'name'
}

const dialogVisible = ref(false)
const form = ref({
  grade: '',
  className: ''
})

const loadData = async () => {
  const res = await fetchGetSchoolTree()
  if (res.code === 200) {
    treeData.value = res.data
  }
}

const handleAddClass = () => {
  dialogVisible.value = true
}

const submitAdd = async () => {
  const res = await fetchAddClass(form.value)
  if (res.code === 200) {
    ElMessage.success('添加成功')
    dialogVisible.value = false
    loadData()
  }
}

const editNode = (data: any) => {
  ElMessage.info(`编辑: ${data.name}`)
}

const deleteNode = (data: any) => {
  ElMessage.info(`删除: ${data.name}`)
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-container {
  padding: 20px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
