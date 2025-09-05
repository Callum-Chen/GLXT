import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '@/contexts/themeContext';

const NotFound = () => {
  const { config } = useContext(ThemeContext);
  
  return (
    <div className={`min-h-screen ${config.bgPrimary} flex flex-col items-center justify-center p-4 text-center`}>
      <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
        <i className="fa-solid fa-exclamation-triangle text-5xl"></i>
      </div>
      
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">页面未找到</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        抱歉，您访问的页面不存在或已被移动。请检查URL或返回首页。
      </p>
      
      <div className="flex gap-4">
        <Link to="/" className="btn btn-primary">
          <i className="fa-solid fa-home mr-2"></i>返回首页
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="btn btn-secondary"
        >
          <i className="fa-solid fa-arrow-left mr-2"></i>返回上一页
        </button>
      </div>
    </div>
  );
};

export default NotFound;