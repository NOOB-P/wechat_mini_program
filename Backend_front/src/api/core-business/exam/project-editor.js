import api from '@/utils/http';
import { normalizeQuestionNo } from '@/utils/exam-utils';
export function normalizePaperRegion(region, index) {
    const sortOrder = Number(region?.sortOrder ?? index + 1) || index + 1;
    return {
        id: String(region?.id || ''),
        questionNo: normalizeQuestionNo(region?.questionNo, sortOrder),
        questionType: String(region?.questionType || '').trim(),
        knowledgePoint: String(region?.knowledgePoint || '').trim(),
        score: region?.score ?? null,
        remark: String(region?.remark || '').trim(),
        sortOrder,
        x: Number(region?.x ?? 0),
        y: Number(region?.y ?? 0),
        width: Number(region?.width ?? 0),
        height: Number(region?.height ?? 0)
    };
}
export function normalizePaperRegions(regions) {
    return (regions || []).map((region, index) => normalizePaperRegion(region, index));
}
export function fetchProjectStudents(params) {
    return api.get({
        url: '/api/system/exam-project/students',
        params
    });
}
export function fetchProjectScoreSummary(projectId) {
    return api.get({
        url: '/api/system/exam-project/scores/summary',
        params: { projectId }
    });
}
export function fetchProjectScoreList(params) {
    return api.get({
        url: '/api/system/exam-project/scores/list',
        params
    });
}
/**
 * 下载成绩导入模板
 */
export function fetchDownloadScoreTemplate() {
    return api.get({
        url: '/api/system/exam-project/scores/template',
        responseType: 'blob'
    });
}
/**
 * 导入成绩
 */
export function fetchImportScore(params) {
    const formData = new FormData();
    formData.append('projectId', params.projectId);
    formData.append('subjectName', params.subjectName);
    formData.append('file', params.file);
    return api.post({
        url: '/api/system/exam-project/scores/import',
        data: formData,
        showSuccessMessage: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
/**
 * 保存单个学生成绩
 */
export function fetchSaveStudentScore(params) {
    return api.post({
        url: '/api/system/exam-project/scores/save',
        params: {
            projectId: params.projectId,
            subjectName: params.subjectName,
            studentNo: params.studentNo
        },
        data: params.questionScores
    });
}
export function fetchImportAnswerSheetZip(params) {
    const formData = new FormData();
    formData.append('projectId', params.projectId);
    formData.append('subjectName', params.subjectName);
    formData.append('file', params.file);
    return api.post({
        url: '/api/system/exam-project/papers/import',
        data: formData,
        showSuccessMessage: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
export function fetchUploadStudentAnswerSheet(params) {
    const formData = new FormData();
    formData.append('projectId', params.projectId);
    formData.append('subjectName', params.subjectName);
    formData.append('studentNo', params.studentNo);
    formData.append('file', params.file);
    return api.post({
        url: '/api/system/exam-project/papers/upload',
        data: formData,
        showSuccessMessage: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
/**
 * 上传公共试卷(样板/原卷)
 */
export function fetchUploadPublicPaper(params) {
    const formData = new FormData();
    formData.append('projectId', params.projectId);
    formData.append('subjectName', params.subjectName);
    formData.append('type', params.type);
    formData.append('file', params.file);
    return api.post({
        url: '/api/system/exam-project/papers/upload-public',
        data: formData,
        showSuccessMessage: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}
/**
 * 获取试卷配置
 */
export function fetchPaperConfig(params) {
    return api
        .get({
        url: '/api/system/exam-project/papers/config',
        params
    })
        .then((res) => ({
        ...res,
        templateRegions: normalizePaperRegions(res.templateRegions),
        originalRegions: normalizePaperRegions(res.originalRegions)
    }));
}
export function fetchSavePaperLayout(params) {
    return api.post({
        url: '/api/system/exam-project/papers/layout/save',
        data: {
            ...params,
            regions: normalizePaperRegions(params.regions)
        }
    });
}
//# sourceMappingURL=project-editor.js.map