/**
 * @Description: 请求返回结构
 */
export type resultData<T> = {
  code: number;
  msg: string;
  data?: T;
};

/**
 * @Description: uni.uploadFile文件上传参数
 */
export type uploadFileOptions = {
  file?: File;
  files?: UniApp.UploadFileOptionFiles[];
  filePath?: string;
  name?: string;
  formData?: any;
};

/**
 * @Description: request方法传参类型
 */
export type requestOptions = UniApp.RequestOptions &
  uploadFileOptions & {
    silent?: boolean;
  };
