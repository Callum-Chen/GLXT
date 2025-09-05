/* 
 * 头部导航组件
 * 包含应用程序标题、主题切换、通知和用户菜单
 * 负责显示用户信息和提供快速操作入口
 */
import { useContext, useState } from 'react';
import { ThemeContext } from '@/contexts/themeContext';
import { AuthContext } from '@/contexts/authContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
}

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onMenuToggle: () => void;
}

import { useSystemParameters } from '@/hooks/useSystemParameters';

const Header = ({ user, onLogout, onMenuToggle }: HeaderProps) => {
  const { parameters } = useSystemParameters();
  const systemName = parameters.enterprise.systemName;
  const { theme, toggleTheme, config, isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className={`header ${config.bgSecondary} ${config.borderColor} border-b flex items-center justify-between px-4 md:px-6`}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle} 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
       <div className="flex items-center gap-2">
  {parameters.enterprise.logoUrl ? (
    <img 
      src={parameters.enterprise.logoUrl} 
      alt="System Logo" 
      className="w-8 h-8 rounded object-contain"
    />
  ) : (
    <i className="fa-solid fa-building text-blue-600 text-xl"></i>
  )}
  <h1 className="text-xl font-semibold hidden sm:block">{systemName}</h1>
</div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
        >
          {isDark ? (
            <i className="fa-solid fa-sun"></i>
          ) : (
            <i className="fa-solid fa-moon"></i>
          )}
        </button>
        
        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all relative">
          <i className="fa-solid fa-bell"></i>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        {/* User menu */}
        {user && (
          <div className="relative" onClick={() => setDropdownOpen(!dropdownOpen)}>
            <button className="flex items-center gap-2 focus:outline-none">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
              />
              <span className="hidden md:inline-block text-sm font-medium">{user.name}</span>
              <i className="fa-solid fa-chevron-down text-xs"></i>
            </button>
            
            {dropdownOpen && (
              <div className={`absolute right-0 mt-2 w-48 ${config.bgSecondary} rounded-lg shadow-lg border ${config.borderColor} z-10`}>
                <div className="py-1">
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <i className="fa-solid fa-user mr-2"></i>个人资料
                  </button>
                  <button 
                    onClick={() => {
                      onLogout();
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-2"></i>退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;