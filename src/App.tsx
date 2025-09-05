/* 
 * 应用程序根组件
 * 负责路由配置和全局状态管理
 * 包含路由定义、认证检查和主题上下文提供
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthContext } from '@/contexts/authContext';
import { ThemeContext } from '@/contexts/themeContext';
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import Dashboard from '@/pages/dashboard';
import Notifications from '@/pages/notifications';
import DepartmentManagement from '@/pages/system/organization/DepartmentManagement';
import EmployeeManagement from '@/pages/system/EmployeeManagement';
import RoleManagement from '@/pages/system/RoleManagement';
import DictionaryManagement from '@/pages/system/DictionaryManagement';
import ParameterManagement from '@/pages/system/ParameterManagement';
import LogManagement from '@/pages/system/LogManagement';
import Schedule from '@/pages/schedule';
import Profile from '@/pages/profile';
import Customer from '@/pages/customer';
import CustomerCheck from '@/pages/customer/CheckDuplicate';
import CustomerManagement from '@/pages/customer/Management';
import CustomerContacts from '@/pages/customer/Contacts';
import CustomerFollow from '@/pages/customer/FollowUp';

import Login from '@/pages/auth/Login';
import NotFound from '@/pages/NotFound';
import { useTheme } from '@/hooks/useTheme';
import BusinessFieldManagement from '@/pages/system/BusinessFieldManagement';

// Mock authentication check
const checkAuth = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(checkAuth());
  const { theme, toggleTheme, isDark, config } = useTheme();
  
  const login = (username: string, password: string) => {
    // Mock login - in real app, this would call an API
    if (username && password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', JSON.stringify({
        id: '1',
        username,
        name: 'Admin User',
        role: 'admin',
        avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=User%20Avatar%20Silhouette&sign=f1da528b3f12b2d0f4f0b71fc2000572'
      }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUser');
    setIsAuthenticated(false);
  };

  // Private route wrapper
  const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, config }}>
      <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          </Route>
          
          {/* Main application routes */}
          <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/notifications" element={<Notifications />} />
            <Route path="/customer" element={<Customer />} />
            <Route path="/customer/check" element={<CustomerCheck />} />
            <Route path="/customer/management" element={<CustomerManagement />} />
            <Route path="/customer/contacts" element={<CustomerContacts />} />
            <Route path="/customer/follow" element={<CustomerFollow />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/system/organization/department" element={<DepartmentManagement />} />
            <Route path="/system/organization/employee" element={<EmployeeManagement />} />
            <Route path="/system/organization/role" element={<RoleManagement />} />
            <Route path="/system/dictionary" element={<DictionaryManagement />} />
            <Route path="/system/parameters" element={<ParameterManagement />} />
            <Route path="/system/business-fields" element={<BusinessFieldManagement />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/system/logs" element={<LogManagement />} />
          </Route>
          
          {/* Other routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}