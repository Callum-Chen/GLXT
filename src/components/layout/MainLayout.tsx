/* 
 * 主布局组件
 * 提供应用程序的主要布局结构，包含侧边栏、头部和主内容区域
 * 负责布局响应式调整和导航状态管理
 */
import { useState, useContext, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ThemeContext } from '@/contexts/themeContext';
import { AuthContext } from '@/contexts/authContext';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);
  
  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Get current user from localStorage
  const getCurrentUser = () => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  };
  
  const currentUser = getCurrentUser();

  // Navigation items
  const navItems = [
  { 
      key: 'dashboard', 
      label: '工作台', 
      icon: 'fa-tachometer-alt', 
      path: '/dashboard',
      permissions: ['admin', 'user']
    },
		    { 
      key: 'customer', 
      label: '客户', 
      icon: 'fa-users', 
      path: '/customer',
      permissions: ['admin', 'user'],
      children: [
        { key: 'customer-check', label: '客户查重', path: '/customer/check', permissions: ['admin', 'user'] },
        { key: 'customer-management', label: '客户管理', path: '/customer/management', permissions: ['admin', 'user'] },
        { key: 'customer-contacts', label: '客户联系人', path: '/customer/contacts', permissions: ['admin', 'user'] },
        { key: 'customer-follow', label: '客户跟进', path: '/customer/follow', permissions: ['admin', 'user'] },
        { key: 'customer-public', label: '公海客户', path: '/customer/public', permissions: ['admin', 'user'] }
       ]
    },
    { 
      key: 'products', 
      label: '产品', 
      icon: 'fa-box', 
      path: '/products',
      permissions: ['admin', 'user'],
      children: [
        { key: 'product-management', label: '产品管理', path: '/products/management', permissions: ['admin', 'user'] },
        { key: 'product-category', label: '产品分类', path: '/products/category', permissions: ['admin', 'user'] },
        { key: 'product-specification', label: '规格属性', path: '/products/specification', permissions: ['admin', 'user'] },
                        { key: 'product-packaging', label: '包装方式', path: '/products/packaging', permissions: ['admin', 'user'] },
                        { key: 'product-bom', label: '产品BOM', path: '/products/bom', permissions: ['admin', 'user'] }
      ]
    },
    { 
      key: 'transaction', 
      label: '交易', 
      icon: 'fa-exchange', 
      path: '/transaction',
      permissions: ['admin', 'user'],
      children: [
        { key: 'transaction-leads', label: '线索', path: '/transaction/leads', permissions: ['admin', 'user'] },
        { key: 'transaction-opportunities', label: '商机', path: '/transaction/opportunities', permissions: ['admin', 'user'] },
        { key: 'transaction-quotes', label: '报价单', path: '/transaction/quotes', permissions: ['admin', 'user'] },
        { key: 'transaction-sample', label: '寄样管理', path: '/transaction/sample', permissions: ['admin', 'user'] },
        { key: 'transaction-sales-order', label: '销售订单', path: '/transaction/sales-order', permissions: ['admin', 'user'] },
        { key: 'transaction-sales-target', label: '销售目标', path: '/transaction/sales-target', permissions: ['admin', 'user'] },
        { key: 'transaction-insurance', label: '信保订单', path: '/transaction/insurance', permissions: ['admin', 'user'] },
        { key: 'transaction-logistics', label: '物流服务', path: '/transaction/logistics', permissions: ['admin', 'user'] },
        { key: 'transaction-follow', label: '销售跟单', path: '/transaction/follow', permissions: ['admin', 'user'] },
        { key: 'transaction-complaint', label: '客诉单', path: '/transaction/complaint', permissions: ['admin', 'user'] }
      ]
    },
    { 
      key: 'finance', 
      label: '财务', 
      icon: 'fa-money-bill', 
      path: '/finance',
      permissions: ['admin', 'user'],
      children: [
        { key: 'finance-record', label: '入账登记', path: '/finance/record', permissions: ['admin', 'user'] },
        { key: 'finance-limit', label: '限额申请', path: '/finance/limit', permissions: ['admin', 'user'] },
        { key: 'finance-verification', label: '收款核销', path: '/finance/verification', permissions: ['admin', 'user'] },
        { key: 'finance-insurance', label: '投保单', path: '/finance/insurance', permissions: ['admin', 'user'] },
        { key: 'finance-special', label: '额度特批', path: '/finance/special', permissions: ['admin'] }
      ]
    },
     { 
      key: 'email', 
      label: '邮件', 
      icon: 'fa-envelope', 
      path: '/email',
      permissions: ['admin', 'user'],
      children: [
        { key: 'email-send-receive', label: '邮件收发', path: '/email/send-receive', permissions: ['admin', 'user'] },
        { key: 'email-account', label: '邮件账号', path: '/email/account', permissions: ['admin', 'user'] },
        { key: 'email-template', label: '模板管理', path: '/email/template', permissions: ['admin', 'user'] },
        { key: 'email-auto-reply', label: '个人假期自动回复', path: '/email/auto-reply', permissions: ['admin', 'user'] }
      ]
    },
    { 
      key: 'schedule', 
      label: '日程提醒', 
      icon: 'fa-calendar-alt', 
      path: '/schedule',
      permissions: ['admin', 'user']
    },
     { 
       key: 'notifications', 
       label: '消息通知', 
       icon: 'fa-bell', 
       path: '/notifications',
       permissions: ['admin', 'user']
     },
    { 
      key: 'profile', 
      label: '个人设置', 
      icon: 'fa-user', 
      path: '/profile',
      permissions: ['admin', 'user']
    },
		    { 
      key: 'system', 
      label: '系统设置', 
      icon: 'fa-cog', 
      path: '/system',
      permissions: ['admin'],
      children: [
        { 
          key: 'org', 
          label: '组织架构', 
          icon: 'fa-sitemap',
          path: '/system/organization',
          permissions: ['admin'],
          children: [
            { key: 'department', label: '部门管理', path: '/system/organization/department' },
            { key: 'employee', label: '员工管理', path: '/system/organization/employee' },
            { key: 'role', label: '角色权限', path: '/system/organization/role' }
          ]
        },
  { key: 'dict', label: '字典管理', path: '/system/dictionary', permissions: ['admin'] },
  { key: 'systemParams', label: '系统参数', path: '/system/parameters' },
  { key: 'businessFields', label: '业务字段', path: '/system/business-fields', permissions: ['admin'] },
  { key: 'customerConflict', label: '客户冲突配置', path: '/system/customer-conflict', permissions: ['admin'] },
  { key: 'publicPool', label: '公海配置', path: '/system/public-pool', permissions: ['admin'] },
  { key: 'regionConfig', label: '区域配置', path: '/system/region-config', permissions: ['admin'] },
  { key: 'dataFlow', label: '数据流转配置', path: '/system/data-flow', permissions: ['admin'] },
  { key: 'tagManagement', label: '标签管理', path: '/system/tag-management', permissions: ['admin'] },
  { key: 'printConfig', label: '打印配置', path: '/system/print-config', permissions: ['admin'] },
  { key: 'approvalConfig', label: '审批配置', path: '/system/approval-config', permissions: ['admin'] },
  { key: 'attachmentGroup', label: '附件分组', path: '/system/attachment-group', permissions: ['admin'] },
  { key: 'logManagement', label: '日志管理', path: '/system/logs', permissions: ['admin'] },
  { key: 'menuManagement', label: '菜单管理', path: '/system/menu', permissions: ['admin'] }
      ]
             }
  ];

  // Check if user has permission for an item
  const hasPermission = (item: any) => {
    if (!item.permissions || item.permissions.length === 0) return true;
    return currentUser?.role && item.permissions.includes(currentUser.role);
  };

  // Filter navigation items based on permissions
  const filteredNavItems = navItems.filter(hasPermission);

  return (
    <div className={`layout-container ${config.bgPrimary} ${config.textPrimary} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Header 
        user={currentUser} 
        onLogout={logout} 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      
      <aside 
        className={`sidebar ${config.bgSecondary} ${config.borderColor} border-r transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static h-[calc(100vh-64px)] z-20`}
      >
        <Sidebar 
          items={filteredNavItems} 
          collapsed={sidebarCollapsed} 
          onCollapseToggle={setSidebarCollapsed}
          currentPath={location.pathname}
          onNavigate={navigate}
        />
      </aside>
       
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;