import { useContext } from 'react';
import { ThemeContext } from '@/contexts/themeContext';

const Customer = () => {
  const { config } = useContext(ThemeContext);
  
  return (
    <div className={`card ${config.bgSecondary} p-6 min-h-[400px]`}>
      <h2 className="text-xl font-bold mb-4">客户管理</h2>
      <p className="text-gray-500 dark:text-gray-400">
        欢迎使用客户管理模块，请从左侧菜单选择具体功能。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className={`p-6 rounded-xl border ${config.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <i className="fa-solid fa-search text-xl"></i>
          </div>
          <h3 className="font-semibold text-lg mb-2">客户查重</h3>
          <p className="text-gray-500 dark:text-gray-400">
            检查潜在客户是否存在重复记录，避免客户信息重复录入
          </p>
        </div>
        
        <div className={`p-6 rounded-xl border ${config.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
            <i className="fa-solid fa-users text-xl"></i>
          </div>
          <h3 className="font-semibold text-lg mb-2">客户管理</h3>
          <p className="text-gray-500 dark:text-gray-400">
            全面管理客户信息，包括基本资料、交易记录和客户分类
          </p>
        </div>
        
        <div className={`p-6 rounded-xl border ${config.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
            <i className="fa-solid fa-address-book text-xl"></i>
          </div>
          <h3 className="font-semibold text-lg mb-2">客户联系人</h3>
          <p className="text-gray-500 dark:text-gray-400">
            管理客户的联系人信息，包括主要联系人及其他相关人员
          </p>
        </div>
        
        <div className={`p-6 rounded-xl border ${config.borderColor} hover:shadow-md transition-shadow cursor-pointer`}>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
            <i className="fa-solid fa-tasks text-xl"></i>
          </div>
          <h3 className="font-semibold text-lg mb-2">客户跟进</h3>
          <p className="text-gray-500 dark:text-gray-400">
            记录和管理客户跟进情况，设置跟进任务和提醒
          </p>
        </div>
      </div>
    </div>
  );
};

export default Customer;