/* 
 * 日程管理自定义钩子
 * 提供日程数据的获取、添加、更新和删除功能
 * 包含日程提醒检查和本地存储持久化
 */
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// 日程数据模型
export type ReminderMethod = 'system' | 'dingtalk' | 'wechat_work' | 'feishu';

export interface ReminderConfig {
  [key: string]: any;
  dingtalkWebhook?: string;
  wechatWorkWebhook?: string;
  feishuWebhook?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly';
  reminder: number; // 提前提醒时间(分钟)，0表示不提醒
  reminderMethods: ReminderMethod[]; // 提醒方式
  reminderConfig: ReminderConfig; // 提醒配置
  isShared: boolean;
  sharedWith?: string[];
}

// 自定义Hook：管理日程数据
export function useSchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  
  // 从localStorage加载日程数据
  useEffect(() => {
    try {
      const savedSchedules = localStorage.getItem('schedules');
      if (savedSchedules) {
        setSchedules(JSON.parse(savedSchedules));
      }
      
      // 设置提醒检查定时器
      const reminderTimer = setInterval(checkReminders, 60000); // 每分钟检查一次
      return () => clearInterval(reminderTimer);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast.error('加载日程数据失败');
    }
  }, []);
  
  // 保存日程数据到localStorage
  useEffect(() => {
    try {
      localStorage.setItem('schedules', JSON.stringify(schedules));
    } catch (error) {
      console.error('Failed to save schedules:', error);
      toast.error('保存日程数据失败');
    }
  }, [schedules]);
  
  // 检查是否有需要提醒的日程
  const checkReminders = () => {
    const now = new Date();
    
    schedules.forEach(schedule => {
      if (schedule.reminder <= 0) return;
      
      const startTime = new Date(schedule.startTime);
      const reminderTime = new Date(startTime);
      reminderTime.setMinutes(reminderTime.getMinutes() - schedule.reminder);
      
      // 检查是否到了提醒时间（前后1分钟内）
      const timeDiff = Math.abs(now.getTime() - reminderTime.getTime());
      if (timeDiff <= 60000) {
        // 检查是否已经提醒过（使用sessionStorage避免重复提醒）
        const hasReminded = sessionStorage.getItem(`reminder_${schedule.id}`);
        if (!hasReminded) {
          toast.info(`日程提醒: ${schedule.title}`, {
            description: `将于${startTime.toLocaleTimeString()}开始`,
            duration: 10000
          });
          sessionStorage.setItem(`reminder_${schedule.id}`, 'true');
        }
      }
    });
  };
  
  // 添加新日程
  const addSchedule = (schedule: Omit<ScheduleItem, 'id'>) => {
    const newSchedule: ScheduleItem = {
      id: Date.now().toString(),
      reminderMethods: ['system'], // 默认系统提醒
      reminderConfig: {},
      ...schedule
    };
    
    setSchedules(prev => [...prev, newSchedule]);
    return newSchedule;
  };
  
  // 更新日程
  const updateSchedule = (id: string, updates: Partial<ScheduleItem>) => {
    setSchedules(prev => 
      prev.map(schedule => schedule.id === id ? { ...schedule, ...updates } : schedule)
    );
  };
  
  // 删除日程
  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
  };
  
  // 获取特定日期的日程
  const getSchedulesByDate = (date: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startTime);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };
  
  return {
    schedules,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesByDate,
    checkReminders
  };
}