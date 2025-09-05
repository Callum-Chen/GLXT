/* 
 * 工具函数库
 * 提供通用工具函数和辅助方法
 * 包含类名合并、日期格式化等常用功能
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
