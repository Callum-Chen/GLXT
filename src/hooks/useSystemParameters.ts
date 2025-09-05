import { useState, useEffect } from 'react';

// 系统参数数据模型
export interface SystemParameters {
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
    loginFailureLock: number;
    loginFailureLockDuration: number;
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
export const DEFAULT_PARAMETERS: SystemParameters = {
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

// 自定义Hook：获取和更新系统参数
export function useSystemParameters() {
  const [parameters, setParameters] = useState<SystemParameters>(DEFAULT_PARAMETERS);
  
  // 从localStorage加载参数
  useEffect(() => {
    const loadParameters = () => {
      try {
        const savedParams = localStorage.getItem('systemParameters');
        if (savedParams) {
          const parsedParams = JSON.parse(savedParams);
          setParameters({...DEFAULT_PARAMETERS, ...parsedParams});
        }
        
        // 设置页面标题
        document.title = parameters.enterprise.systemName || DEFAULT_PARAMETERS.enterprise.systemName;
      } catch (error) {
        console.error('Failed to load system parameters', error);
        setParameters(DEFAULT_PARAMETERS);
      }
    };
    
    loadParameters();
    
    // 监听storage变化，在其他标签页修改参数时同步更新
    window.addEventListener('storage', loadParameters);
    return () => window.removeEventListener('storage', loadParameters);
  }, []);
  
  // 保存参数到localStorage
  const saveParameters = (newParameters: SystemParameters) => {
    try {
      setParameters(newParameters);
      localStorage.setItem('systemParameters', JSON.stringify(newParameters));
      
      // 更新页面标题
      document.title = newParameters.enterprise.systemName || DEFAULT_PARAMETERS.enterprise.systemName;
      
      // 触发storage事件，通知其他标签页
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (error) {
      console.error('Failed to save system parameters', error);
      return false;
    }
  };
  
  return { parameters, saveParameters };
}