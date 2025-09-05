import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/themeContext';

const AuthLayout = () => {
  const { config } = useContext(ThemeContext);
  
  return (
    <div className={`min-h-screen ${config.bgPrimary} flex items-center justify-center p-4`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
            <i className="fa-solid fa-building text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold">企业管理平台</h1>
          <p className="text-gray-500 dark:text-gray-400">登录您的账户以继续</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;