/* 
 * 系统设置页面容器
 * 作为系统设置相关页面的父容器
 * 提供统一的系统设置页面布局和导航
 */
import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/themeContext';

const SystemSettings = () => {
  const { config } = useContext(ThemeContext);
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">系统设置</h1>
        <p className="text-gray-500 dark:text-gray-400">
          管理组织架构、菜单权限、系统参数等全局设置
        </p>
      </div>
      
      {/* System settings content */}
      <div className={`card ${config.bgSecondary} p-6`}>
        <Outlet />
      </div>
    </div>
  );
};

export default SystemSettings;