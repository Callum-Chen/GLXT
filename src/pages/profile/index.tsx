import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '@/contexts/themeContext';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Mock user data
const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : {
    id: '1',
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    department: '信息技术部',
    position: '技术总监',
    joinDate: '2020-01-15',
    avatar: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=User%20Avatar%20Silhouette&sign=f1da528b3f12b2d0f4f0b71fc2000572',
    preferences: {
      theme: 'light',
      notifications: {
        email: true,
        system: true,
        approval: true,
        meeting: true
      },
      dashboardLayout: 'default'
    }
  };
};

const Profile = () => {
  const { config } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [user, setUser] = useState(getCurrentUser());
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState(user.preferences || {
    theme: 'light',
    notifications: {
      email: true,
      system: true,
      approval: true,
      meeting: true
    },
    dashboardLayout: 'default'
  });
  
  // Update form data when user changes
  useEffect(() => {
    setFormData({ ...user });
    setPreferences(user.preferences || {
      theme: 'light',
      notifications: {
        email: true,
        system: true,
        approval: true,
        meeting: true
      },
      dashboardLayout: 'default'
    });
  }, [user]);
  
  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle password form change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle preference change
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, checked, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setPreferences(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Save basic information
  const saveBasicInfo = () => {
    // In a real application, this would call an API
    setUser({ ...user, ...formData });
    
    // Update localStorage
    const updatedUser = { ...user, ...formData };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    setEditing(false);
    toast.success('基本信息保存成功');
  };
  
  // Save password
  const savePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordForm.currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度不能少于6位');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }
    
    // In a real application, this would call an API to change password
    toast.success('密码修改成功，请重新登录');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Auto logout after password change
    setTimeout(() => {
      logout();
      navigate('/login');
    }, 1500);
  };
  
  // Save preferences
  const savePreferences = () => {
    // In a real application, this would call an API
    const updatedUser = {
      ...user,
      preferences: { ...preferences }
    };
    
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update theme preference
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(preferences.theme);
    localStorage.setItem('theme', preferences.theme);
    
    toast.success('偏好设置保存成功');
  };
  
  // Tabs configuration
  const tabs = [
    { key: 'basic', label: '基本信息', icon: 'fa-user' },
    { key: 'password', label: '密码修改', icon: 'fa-lock' },
    { key: 'preferences', label: '偏好设置', icon: 'fa-sliders-h' },
    { key: 'security', label: '安全设置', icon: 'fa-shield-alt' }
  ];
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">个人设置</h1>
          <p className="text-gray-500 dark:text-gray-400">
            管理您的个人信息、密码和偏好设置
          </p>
        </div>
        
        <button 
          onClick={() => logout()}
          className="btn btn-secondary"
        >
          <i className="fa-solid fa-sign-out-alt"></i>
          <span>退出登录</span>
        </button>
      </div>
      
      {/* Profile card */}
      <div className={`card ${config.bgSecondary} p-6`}>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="relative">
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-md"
            />
            <button className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-md hover:bg-blue-700 transition-all">
              <i className="fa-solid fa-camera"></i>
            </button>
          </div>
          
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user.position} · {user.department}</p>
            <div className="flex flex-wrap gap-4 mt-3 justify-center md:justify-start">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">入职日期</p>
                <p className="font-medium">{user.joinDate}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">用户ID</p>
                <p className="font-medium">{user.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Settings tabs */}
      <div className={`card ${config.bgSecondary} overflow-hidden`}>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                  activeTab === tab.key 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Basic info tab */}
        {activeTab === 'basic' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">基本信息</h3>
              <button 
                onClick={() => {
                  if (editing) {
                    // Cancel edit
                    setFormData({ ...user });
                  }
                  setEditing(!editing);
                }}
                className="btn btn-secondary"
              >
                {editing ? (
                  <>
                    <i className="fa-solid fa-times"></i>
                    <span>取消</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-pencil"></i>
                    <span>编辑</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">用户名不可修改</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">姓名</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">电子邮箱</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">手机号码</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">所属部门</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">职位</label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`input ${config.borderColor} ${!editing ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>
            
            {editing && (
              <div className="flex justify-end mt-6">
                <button 
                  onClick={saveBasicInfo}
                  className="btn btn-primary"
                >
                  <i className="fa-solid fa-save"></i>
                  <span>保存信息</span>
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Password tab */}
        {activeTab === 'password' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">密码修改</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              savePassword(e);
            }} className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">当前密码</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className={`input ${config.borderColor}`}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">新密码</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className={`input ${config.borderColor}`}
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">密码长度至少6位字符</p>
              </div>
              
              <div className="mb-6"><label className="block text-sm font-medium mb-1">确认新密码</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`input ${config.borderColor}`}
                  minLength={6}
                  required
                />
                {passwordForm.newPassword && passwordForm.confirmPassword && 
                 passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">两次输入的密码不一致</p>
                )}
              </div>
              
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="btn btn-primary"
                >
                  <i className="fa-solid fa-key"></i>
                  <span>修改密码</span>
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Preferences tab */}
        {activeTab === 'preferences' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">偏好设置</h3>
              <button 
                onClick={savePreferences}
                className="btn btn-primary"
              >
                <i className="fa-solid fa-save"></i>
                <span>保存设置</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">界面设置</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">主题模式</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          checked={preferences.theme === 'light'}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>浅色模式</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          checked={preferences.theme === 'dark'}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>深色模式</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="auto"
                          checked={preferences.theme === 'auto'}
                          onChange={handlePreferenceChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span>跟随系统</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">仪表盘布局</label>
                    <select
                      name="dashboardLayout"
                      value={preferences.dashboardLayout}
                      onChange={handlePreferenceChange}
                      className={`input ${config.borderColor}`}
                    >
                      <option value="default">默认布局</option>
                      <option value="analytics">数据分析优先</option>
                      <option value="tasks">任务优先</option>
                      <option value="minimal">极简布局</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">通知设置</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-envelope text-gray-400"></i>
                      <span>邮件通知</span>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.email"
                      checked={preferences.notifications?.email}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-cog text-gray-400"></i>
                      <span>系统通知</span>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.system"
                      checked={preferences.notifications?.system}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-gavel text-gray-400"></i>
                      <span>审批通知</span>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.approval"
                      checked={preferences.notifications?.approval}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-calendar text-gray-400"></i>
                      <span>会议提醒</span>
                    </div>
                    <input
                      type="checkbox"
                      name="notifications.meeting"
                      checked={preferences.notifications?.meeting}
                      onChange={handlePreferenceChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Security tab */}
        {activeTab === 'security' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">安全设置</h3>
            
            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${config.borderColor} bg-blue-50 dark:bg-blue-900/20`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <i className="fa-solid fa-shield text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div>
                    <h4 className="font-medium">双重认证</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      启用双重认证可提高您账户的安全性，登录时需要额外的验证码
                    </p>
                    <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      启用双重认证
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">登录安全</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">登录密码有效期</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">90天后需要更换密码</p>
                    </div>
                    <span className="text-sm text-green-500">
                      <i className="fa-solid fa-check-circle"></i>
                      <span>已启用</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">异常登录检测</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">检测到陌生设备登录时通知您</p>
                    </div>
                    <span className="text-sm text-green-500">
                      <i className="fa-solid fa-check-circle"></i>
                      <span>已启用</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-4">最近登录记录</h4>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>时间</th>
                        <th>地点</th>
                        <th>设备</th>
                        <th>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>今天 09:23</td>
                        <td>北京市</td>
                        <td>Chrome · Windows</td>
                        <td><span className="text-green-500 text-sm">正常</span></td>
                      </tr>
                      <tr>
                        <td>昨天 18:45</td>
                        <td>北京市</td>
                        <td>Safari · macOS</td>
                        <td><span className="text-green-500 text-sm">正常</span></td>
                      </tr>
                      <tr>
                        <td>2023-06-15 14:30</td>
                        <td>上海市</td>
                        <td>Edge · Windows</td>
                        <td><span className="text-yellow-500 text-sm">异地登录</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  查看更多登录记录
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;