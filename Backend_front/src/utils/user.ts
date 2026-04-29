
/**
 * 用户相关工具函数
 */

// 导入所有备选头像
import avatar0 from '@/assets/images/avatar/avatar.webp'
import avatar1 from '@/assets/images/avatar/avatar1.webp'
import avatar2 from '@/assets/images/avatar/avatar2.webp'
import avatar3 from '@/assets/images/avatar/avatar3.webp'
import avatar4 from '@/assets/images/avatar/avatar4.webp'
import avatar5 from '@/assets/images/avatar/avatar5.webp'
import avatar6 from '@/assets/images/avatar/avatar6.webp'
import avatar7 from '@/assets/images/avatar/avatar7.webp'
import avatar8 from '@/assets/images/avatar/avatar8.webp'
import avatar9 from '@/assets/images/avatar/avatar9.webp'
import avatar10 from '@/assets/images/avatar/avatar10.webp'

const defaultAvatars = [avatar0, avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8, avatar9, avatar10]

/**
 * 获取用户头像
 * @param avatar 用户原始头像地址
 * @param id 用户ID，用于确定性随机选择默认头像
 * @returns 头像地址
 */
export const getUserAvatar = (avatar?: string, id?: string | number): string => {
  if (avatar && avatar.trim() !== '') {
    return avatar
  }
  
  // 使用 ID 作为种子，确保同一个用户显示的默认头像一致
  const seed = Number(id || 0)
  return defaultAvatars[seed % defaultAvatars.length]
}
