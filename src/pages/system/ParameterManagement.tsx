/* 
 * 系统参数管理页面
 * 提供系统全局参数的配置功能
 * 包括企业信息、安全策略、本地化设置等
 */
import { useState, useEffect, useContext } from 'react';
import { useSystemParameters } from '@/hooks/useSystemParameters';
import { ThemeContext } from '@/contexts/themeContext';
import { toast } from 'sonner';
import { AuthContext } from '@/contexts/authContext';

// 系统参数数据模型
interface SystemParameters {
  enterprise: {
    systemName: string;
    logoUrl: string;
  };
  domain: {
    domainName: string;
    httpsCertificate: string;
    customPath: string;
  };
  localization: {
    language: string;
    dateTimeFormat: string;
    currencyUnit: string;
  };
  security: {
    loginFailureLock: number; // 失败次数
    loginFailureLockDuration: number; // 锁定分钟数
    captchaEnabled: boolean;
    ipWhitelist: string;
  };
  emailWhitelist: string;
  wechatMiniProgram: {
    appId: string;
    appSecret: string;
    authRedirectUrl: string;
  };
  thirdPartyAuth: {
    dingtalkEnabled: boolean;
    feishuEnabled: boolean;
    oauthEnabled: boolean;
    oauthConfig: string;
  };
}

// 默认系统参数
const DEFAULT_PARAMETERS: SystemParameters = {
  enterprise: {
    systemName: "企业管理平台",
    logoUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Company%20Logo&sign=e1e47500e1f20618befb6ea4922c6320"
  },
  domain: {
    domainName: "",
    httpsCertificate: "",
    customPath: ""
  },
  localization: {
    language: "zh-CN",
    dateTimeFormat: "YYYY-MM-DD HH:mm:ss",
    currencyUnit: "CNY"
  },
  security: {
    loginFailureLock: 5,
    loginFailureLockDuration: 15,
    captchaEnabled: true,
    ipWhitelist: ""
  },
  emailWhitelist: "",
  wechatMiniProgram: {
    appId: "",
    appSecret: "",
    authRedirectUrl: ""
  },
  thirdPartyAuth: {
    dingtalkEnabled: false,
    feishuEnabled: false,
    oauthEnabled: false,
    oauthConfig: ""
  }
};

const ParameterManagement = () => {
  const { config } = useContext(ThemeContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("enterprise");
  const { parameters, saveParameters } = useSystemParameters();
  const [tempParameters, setTempParameters] = useState<SystemParameters>(parameters);
  const [logoPreview, setLogoPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [certificateFile, setCertificateFile] = useState<File | null>(null);

  // 检查是否为管理员
  const isAdmin = () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    }
    return false;
  };

  // 从本地存储加载参数
  useEffect(() => {
    setTempParameters(parameters);
    setLogoPreview(parameters.enterprise.logoUrl);
  }, [parameters]);

  // 非管理员无权访问
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fa-solid fa-lock text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium mb-2">权限不足</h3>
          <p className="text-gray-500 dark:text-gray-400">系统参数管理功能仅限管理员访问</p>
        </div>
      </div>
    );
  }

  // 处理输入变化
  const handleInputChange = (
    section: keyof SystemParameters,
    field: string,
    value: string | number | boolean
  ) => {
    setTempParameters(prev => ({
      ...prev,
      [section]: {
        ...prev[section] as Record<string, any>,
        [field]: value
      }
    }));
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'certificate') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setLogoPreview(url);
        handleInputChange('enterprise', 'logoUrl', url);
      };
      reader.readAsDataURL(file);
    } else if (type === 'certificate') {
      setCertificateFile(file);
      // 在实际应用中，这里应该上传文件并获取证书路径
      // 这里简化处理，直接存储文件名
      handleInputChange('domain', 'httpsCertificate', file.name);
    }
  };

  // 保存参数
  const handleSaveParameters = () => {
    setIsSaving(true);
    
    // 模拟保存延迟
    setTimeout(() => {
      try {
       // 使用自定义hook保存参数
       saveParameters(tempParameters);
       
       // 记录操作日志
       const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
       logs.push({
         id: Date.now().toString(),
         user: JSON.parse(localStorage.getItem('currentUser') || '{}').name || '未知用户',
         action: '更新系统参数',
         time: new Date().toISOString()
       });
       localStorage.setItem('operationLogs', JSON.stringify(logs));
        
        toast.success('系统参数保存成功');
      } catch (error) {
        console.error('Failed to save system parameters', error);
        toast.error('保存系统参数失败');
      } finally {
        setIsSaving(false);
      }
    }, 800);
  };

  // 恢复默认参数
  const restoreDefaults = () => {
    setTempParameters(DEFAULT_PARAMETERS);
    setLogoPreview(DEFAULT_PARAMETERS.enterprise.logoUrl);
    setCertificateFile(null);
    setShowRestoreConfirm(false);
    toast.info('已恢复默认参数，请点击保存生效');
  };

  // 验证IP白名单格式
  const validateIpWhitelist = (ipList: string): boolean => {
    if (!ipList) return true;
    
    const ipRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?)(,\s*\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(\/\d{1,2})?)*$/;
    return ipRegex.test(ipList);
  };

  // 验证邮箱白名单格式
  const validateEmailWhitelist = (emailList: string): boolean => {
    if (!emailList) return true;
    
    const emailRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(,\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})*$/;
    return emailRegex.test(emailList);
  };

  // 验证OAuth配置JSON格式
  const validateJsonFormat = (jsonString: string): boolean => {
    if (!jsonString) return true;
    
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">系统参数管理</h1>
          <p className="text-gray-500 dark:text-gray-400">
            配置系统全局参数，包括企业信息、域名设置、安全策略等
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRestoreConfirm(true)}
            className="btn btn-secondary"
          >
            <i className="fa-solid fa-rotate-left"></i>
            <span>恢复默认</span>
          </button>
          <button
            onClick={handleSaveParameters}
            disabled={isSaving}
            className="btn btn-primary"
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>保存中...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-save"></i>
                <span>保存设置</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 设置选项卡 */}
      <div className={`card ${config.bgSecondary} p-0`}>
        {/* 选项卡导航 */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              key="enterprise"
              onClick={() => setActiveTab("enterprise")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "enterprise"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-building"></i>
              <span>企业设置</span>
            </button>
            <button
              key="domain"
              onClick={() => setActiveTab("domain")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "domain"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-globe"></i>
              <span>域名设置</span>
            </button>
            <button
              key="localization"
              onClick={() => setActiveTab("localization")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "localization"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-language"></i>
              <span>本地化设置</span>
            </button>
            <button
              key="security"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "security"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-shield"></i>
              <span>安全设置</span>
            </button>
            <button
              key="email"
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "email"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-envelope"></i>
              <span>邮箱白名单</span>
            </button>
            <button
              key="wechat"
              onClick={() => setActiveTab("wechat")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "wechat"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-brands fa-weixin"></i>
              <span>微信小程序</span>
            </button>
            <button
              key="thirdparty"
              onClick={() => setActiveTab("thirdparty")}
              className={`flex items-center gap-2 px-6 py-4 text-sm whitespace-nowrap ${
                activeTab === "thirdparty"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <i className="fa-solid fa-plug"></i>
              <span>第三方授权</span>
            </button>
          </div>
        </div>

        {/* 选项卡内容 */}
        <div className="p-6">
          {activeTab === "enterprise" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">企业信息配置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">系统名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={tempParameters.enterprise.systemName}
                    onChange={(e) => handleInputChange("enterprise", "systemName", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="请输入系统名称"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">显示在浏览器标题和登录页面的系统名称</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">系统Logo</label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg border border-dashed flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                      ) : (
                        <i className="fa-solid fa-image text-gray-400 text-2xl"></i>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <i className="fa-solid fa-upload mr-2"></i>
                        上传图片
                      </label>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">支持PNG、JPG格式，建议尺寸200x200px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "domain" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">域名与访问配置</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">访问域名 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={tempParameters.domain.domainName}
                    onChange={(e) => handleInputChange("domain", "domainName", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="例如：system.company.com"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">系统访问的主域名，不包含http://或https://</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">HTTPS证书</label>
                  <div className="mt-1 flex items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={tempParameters.domain.httpsCertificate}
                        readOnly
                        className={`input ${config.borderColor} bg-gray-50 dark:bg-gray-800`}
                        placeholder="未上传证书"
                      />
                    </div>
                    <input
                      type="file"
                      accept=".pem,.cer,.crt"
                      onChange={(e) => handleFileUpload(e, "certificate")}
                      className="hidden"
                      id="certificate-upload"
                    />
                    <label
                      htmlFor="certificate-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <i className="fa-solid fa-upload mr-2"></i>
                      上传证书
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">上传SSL证书文件，支持PEM、CER、CRT格式</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">自定义访问路径</label>
                  <input
                    type="text"
                    value={tempParameters.domain.customPath}
                    onChange={(e) => handleInputChange("domain", "customPath", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="例如：/admin (留空表示根路径)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">系统访问的自定义路径，以/开头</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "localization" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">本地化与国际化配置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">系统语言 <span className="text-red-500">*</span></label>
                  <select
                    value={tempParameters.localization.language}
                    onChange={(e) => handleInputChange("localization", "language", e.target.value)}
                    className={`input ${config.borderColor}`}
                    required
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                    <option value="ko-KR">한국어</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">系统界面显示的语言</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">日期时间格式 <span className="text-red-500">*</span></label>
                  <select
                    value={tempParameters.localization.dateTimeFormat}
                    onChange={(e) => handleInputChange("localization", "dateTimeFormat", e.target.value)}
                    className={`input ${config.borderColor}`}
                    required
                  >
                    <option value="YYYY-MM-DD HH:mm:ss">2023-12-31 23:59:59</option>
                    <option value="DD/MM/YYYY HH:mm">31/12/2023 23:59</option>
                    <option value="MM/DD/YYYY hh:mm A">12/31/2023 11:59 PM</option>
                    <option value="YYYY年MM月DD日 HH:mm">2023年12月31日 23:59</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">系统中日期时间的显示格式</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">货币单位 <span className="text-red-500">*</span></label>
                  <select
                    value={tempParameters.localization.currencyUnit}
                    onChange={(e) => handleInputChange("localization", "currencyUnit", e.target.value)}
                    className={`input ${config.borderColor}`}
                    required
                  >
                    <option value="CNY">人民币 (¥)</option>
                    <option value="USD">美元 ($)</option>
                    <option value="EUR">欧元 (€)</option>
                    <option value="GBP">英镑 (£)</option>
                    <option value="JPY">日元 (¥)</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">系统中货币的显示单位</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">安全策略配置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">登录失败锁定次数 <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={tempParameters.security.loginFailureLock}
                    onChange={(e) => handleInputChange("security", "loginFailureLock", parseInt(e.target.value) || 0)}
                    className={`input ${config.borderColor}`}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">连续登录失败多少次后锁定账户，0表示不锁定</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">锁定持续时间(分钟) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={tempParameters.security.loginFailureLockDuration}
                    onChange={(e) => handleInputChange("security", "loginFailureLockDuration", parseInt(e.target.value) || 0)}
                    className={`input ${config.borderColor}`}
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">账户锁定持续时间，单位：分钟</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={tempParameters.security.captchaEnabled}
                      onChange={(e) => handleInputChange("security", "captchaEnabled", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium">启用登录验证码</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">登录时需要输入验证码，增强账户安全性</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">IP访问白名单</label>
                  <textarea
                    value={tempParameters.security.ipWhitelist}
                    onChange={(e) => handleInputChange("security", "ipWhitelist", e.target.value)}
                    className={`input ${config.borderColor} min-h-[100px]`}
                    placeholder="每行一个IP地址或网段，例如：192.168.1.0/24&#10;10.0.0.1&#10;留空表示允许所有IP访问"
                  ></textarea>
                  {tempParameters.security.ipWhitelist && !validateIpWhitelist(tempParameters.security.ipWhitelist) && (
                    <p className="text-xs text-red-500 mt-1">IP格式不正确，请使用正确的IP或CIDR格式，多个IP用逗号分隔</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    限制仅允许白名单中的IP地址访问系统，支持CIDR格式（如192.168.1.0/24）
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">员工邮箱白名单配置</h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">允许注册的邮箱域名</label>
                <textarea
                  value={tempParameters.emailWhitelist}
                  onChange={(e) => handleInputChange("emailWhitelist", "", e.target.value)}
                  className={`input ${config.borderColor} min-h-[120px]`}
                  placeholder="输入允许注册的邮箱域名，多个域名用逗号分隔，例如：company.com,example.com&#10;留空表示不限制邮箱域名"
                ></textarea>
                {tempParameters.emailWhitelist && !validateEmailWhitelist(tempParameters.emailWhitelist) && (
                  <p className="text-xs text-red-500 mt-1">邮箱格式不正确，请输入正确的邮箱域名，多个邮箱用逗号分隔</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  限制仅允许指定域名的邮箱注册系统账户，留空表示不限制
                </p>
              </div>
            </div>
          )}

          {activeTab === "wechat" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">微信小程序配置</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-1">AppID <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={tempParameters.wechatMiniProgram.appId}
                    onChange={(e) => handleInputChange("wechatMiniProgram", "appId", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="微信小程序的AppID"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">微信公众平台申请的小程序AppID</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">AppSecret <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={tempParameters.wechatMiniProgram.appSecret}
                    onChange={(e) => handleInputChange("wechatMiniProgram", "appSecret", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="微信小程序的AppSecret"
                    required
                  />
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">注意：AppSecret属于敏感信息，请妥善保管</p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">授权回调地址 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={tempParameters.wechatMiniProgram.authRedirectUrl}
                    onChange={(e) => handleInputChange("wechatMiniProgram", "authRedirectUrl", e.target.value)}
                    className={`input ${config.borderColor}`}
                    placeholder="例如：https://system.company.com/api/wechat/callback"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">微信授权后的回调处理地址，需在微信公众平台配置</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "thirdparty" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">第三方登录授权配置</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={tempParameters.thirdPartyAuth.dingtalkEnabled}
                      onChange={(e) => handleInputChange("thirdPartyAuth", "dingtalkEnabled", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium">启用钉钉登录</span>
                  </label>
                  
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={tempParameters.thirdPartyAuth.feishuEnabled}
                      onChange={(e) => handleInputChange("thirdPartyAuth", "feishuEnabled", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium">启用飞书登录</span>
                  </label>
                  
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={tempParameters.thirdPartyAuth.oauthEnabled}
                      onChange={(e) => handleInputChange("thirdPartyAuth", "oauthEnabled", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium">启用OAuth登录</span>
                  </label>
                </div>
                
                {tempParameters.thirdPartyAuth.oauthEnabled && (
                  <div>
                    <label className="block text-sm font-medium mb-1">OAuth配置 (JSON)</label>
                    <textarea
                      value={tempParameters.thirdPartyAuth.oauthConfig}
                      onChange={(e) => handleInputChange("thirdPartyAuth", "oauthConfig", e.target.value)}
                      className={`input ${config.borderColor} min-h-[150px] font-mono text-sm`}
                      placeholder='例如：{"clientId":"your_client_id","clientSecret":"your_client_secret","authorizationEndpoint":"https://provider.com/auth","tokenEndpoint":"https://provider.com/token","userInfoEndpoint":"https://provider.com/userinfo"}'
                    ></textarea>
                    {tempParameters.thirdPartyAuth.oauthConfig && !validateJsonFormat(tempParameters.thirdPartyAuth.oauthConfig) && (
                      <p className="text-xs text-red-500 mt-1">JSON格式不正确，请检查配置</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      OAuth服务提供商的配置信息，包含clientId、clientSecret、授权和令牌端点等
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 恢复默认确认模态框 */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`card ${config.bgSecondary} w-full max-w-md`}>
            <div className="p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500 dark:text-yellow-400 mx-auto mb-4">
                  <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">确认恢复默认设置</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  确定要将所有系统参数恢复为默认值吗？此操作不可撤销，当前设置将丢失。
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowRestoreConfirm(false)}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                  <button onClick={restoreDefaults} className="btn btn-danger">
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>确认恢复</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParameterManagement;