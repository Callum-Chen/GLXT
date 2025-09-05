import { useContext, useState, useEffect } from 'react';
import { ThemeContext } from '@/contexts/themeContext';
import { toast } from 'sonner';

const CustomerCheck = () => {
  const { config } = useContext(ThemeContext);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    searchType: 'all'
  });
  const [searchResult, setSearchResult] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [checkedOptions, setCheckedOptions] = useState({
    emailSearch: true,
    phoneSearch: true,
    domainSearch: true
  });
  const [isMobile, setIsMobile] = useState(false);
 
 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCheckedOptions(prev => ({ ...prev, [name]: checked }));
  };
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 初始化检查
    checkMobile();
    // 监听窗口大小变化
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    
    // 模拟搜索过程
    setTimeout(() => {
      // 模拟搜索结果
      setSearchResult([
        {
          id: '812测试',
          country: '中国',
          type: '意向客户',
          owner: '王双',
          department: '管理部',
          createTime: '2025-08-12 12:03',
          status: '登记',
          matchField: '【客户联系人.客户名...'
        },
        {
          id: '测试客户2025',
          country: '中国',
          type: '潜在客户',
          owner: '测试人员',
          department: '市场部',
          createTime: '2025-08-30 09:22',
          status: '待审核',
          matchField: '【客户名称】字段匹配'
        }
      ]);
        setIsSearching(false);
      }, 800);
  };
  
  const handleViewCustomer = (customerId: string) => {
    toast.info(`查看客户: ${customerId}`);
    // 在实际应用中，这里应该导航到客户详情页
  };
  
  const handleMergeCustomers = () => {
    toast.info("合并客户功能将在后续版本中推出");
  };
  
  return (
    <div className={`card ${config.bgSecondary} p-6`}>
      <h2 className="text-xl font-bold mb-6">客户查重</h2>
      
      {/* 搜索区域 */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-1 gap-2">
          <select
            name="searchType"
            value={searchParams.searchType}
            onChange={handleSelectChange}
            className={`input ${config.borderColor} max-w-[120px]`}
          >
            <option value="all">全部</option>
            <option value="name">客户名称</option>
            <option value="email">电子邮箱</option>
            <option value="phone">手机号码</option>
            <option value="idcard">身份证号</option>
          </select>
          <input
            type="text"
            name="keyword"
            value={searchParams.keyword}
            onChange={handleInputChange}
            className={`input ${config.borderColor} flex-1`}
            placeholder="输入公司名称关键词、联系人、电话、手机、邮箱、网址、域名"
          />
          <button 
            onClick={handleSearch}
            disabled={isSearching}
            className="btn btn-primary px-6 py-2 rounded-lg font-medium flex items-center"
          >
            {isSearching ? (
              <>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                <span>查重中...</span>
              </>
            ) : (
              <span>查重</span>
            )}
          </button>
        </div>
      </div>
      
      {/* 搜索选项 */}
      <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="emailSearch"
              checked={checkedOptions.emailSearch}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm">邮箱查询时，同时查询邮箱后缀相同的客户（不含平台邮箱，如gmail.com）</span>
            <button className="ml-1 text-gray-400 hover:text-gray-500">
              <i className="fa-solid fa-circle-question text-xs"></i>
            </button>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="phoneSearch"
              checked={checkedOptions.phoneSearch}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm">查询电话号码类字段，开启后后八位数字匹配</span>
            <button className="ml-1 text-gray-400 hover:text-gray-500">
              <i className="fa-solid fa-circle-question text-xs"></i>
            </button>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="domainSearch"
              checked={checkedOptions.domainSearch}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-red-600 focus:ring-red-500"
            />
            <span className="ml-2 text-sm">按网址、邮箱查询时，同时查询其他顶级域名的客户（不含平台域名主体）</span>
            <button className="ml-1 text-gray-400 hover:text-gray-500">
              <i className="fa-solid fa-circle-question text-xs"></i>
            </button>
          </label>
        </div>
      </div>
      
      {/* 结果区域 */}
      {searchResult.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              找到以下 106 条查重结果，当前仅展示前 6 条
            </p>
            <button 
              onClick={handleMergeCustomers}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
            >
              合并客户
            </button>
          </div>
          
          {/* 客户卡片网格 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResult.map((customer, index) => (
              <div 
                key={index} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      <span className="text-yellow-500">{customer.id}</span>
                    </h3>
                    <button 
                      onClick={() => handleViewCustomer(customer.id)}
                      className="btn btn-primary text-sm px-3 py-1 rounded"
                    >
                      查看
                    </button>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">国家:</span>
                      <span>{customer.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">客户类别:</span>
                      <span>{customer.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">所属人:</span>
                      <span>{customer.owner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">所属部门:</span>
                      <span>{customer.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">创建时间:</span>
                      <span>{customer.createTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">单据状态:</span>
                      <span>{customer.status}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <span>字段匹配:</span>
                      <span>{customer.matchField}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {searchResult.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <i className="fa-solid fa-check-circle text-4xl text-green-500 mb-4"></i>
          <h3 className="text-lg font-medium mb-2">未找到相似客户</h3>
          <p className="text-gray-500 dark:text-gray-400">可以创建新客户记录</p>
          <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            <i className="fa-solid fa-plus mr-2"></i>创建新客户
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerCheck;