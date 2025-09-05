import { useState, useContext } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";
import { format } from "date-fns";

interface LoginLog {
    id: string;
    loginTime: string;
    username: string;
    account: string;
    device: string;
    location: string;
    ip: string;
    status: "success" | "failed";
}

interface OperationLog {
    id: string;
    operationTime: string;
    operator: string;
    account: string;
    operationType: string;
    operationContent: string;
    ip: string;
    result: "success" | "failed";
    details?: string;
}

const LogManagement = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [activeTab, setActiveTab] = useState<"login" | "operation">("login");
    const [searchTerm, setSearchTerm] = useState("");

    const [dateRange, setDateRange] = useState({
        start: "",
        end: ""
    });

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalLoginLogs, setTotalLoginLogs] = useState(0);
    const [totalOperationLogs, setTotalOperationLogs] = useState(0);
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [operationLogs, setOperationLogs] = useState<OperationLog[]>([]);
    const [filteredLoginLogs, setFilteredLoginLogs] = useState<LoginLog[]>([]);
    const [filteredOperationLogs, setFilteredOperationLogs] = useState<OperationLog[]>([]);
    const [isExporting, setIsExporting] = useState(false);

    useState(() => {
        const mockLoginLogs: LoginLog[] = [];

        for (let i = 0; i < 56; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 720));

            mockLoginLogs.push({
                id: `login_${i}`,
                loginTime: date.toISOString(),
                username: `用户${i % 10 + 1}`,
                account: `user${i % 10 + 1}`,

                device: [
                    "Windows Chrome",
                    "macOS Safari",
                    "iOS Safari",
                    "Android Chrome",
                    "Linux Firefox"
                ][Math.floor(Math.random() * 5)],

                location: [
                    "北京市 电信",
                    "上海市 联通",
                    "广州市 移动",
                    "深圳市 电信",
                    "杭州市 联通",
                    "南京市 移动",
                    "武汉市 电信",
                    "成都市 联通"
                ][Math.floor(Math.random() * 8)],

                ip: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
                status: Math.random() > 0.1 ? "success" : "failed"
            });
        }

        setLoginLogs(mockLoginLogs);
        setFilteredLoginLogs(mockLoginLogs);
        setTotalLoginLogs(mockLoginLogs.length);
        const mockOperationLogs: OperationLog[] = [];

        const operations = [{
            type: "新增",
            content: "新增了用户信息"
        }, {
            type: "编辑",
            content: "修改了角色权限"
        }, {
            type: "删除",
            content: "删除了部门数据"
        }, {
            type: "查询",
            content: "查看了系统参数"
        }, {
            type: "导入",
            content: "导入了员工数据"
        }, {
            type: "导出",
            content: "导出了销售报表"
        }, {
            type: "登录",
            content: "系统登录"
        }, {
            type: "登出",
            content: "系统登出"
        }];

        for (let i = 0; i < 89; i++) {
            const date = new Date();
            date.setHours(date.getHours() - Math.floor(Math.random() * 720));
            const op = operations[Math.floor(Math.random() * operations.length)];

            mockOperationLogs.push({
                id: `op_${i}`,
                operationTime: date.toISOString(),
                operator: `用户${i % 10 + 1}`,
                account: `user${i % 10 + 1}`,
                operationType: op.type,
                operationContent: op.content,
                ip: `192.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
                result: Math.random() > 0.05 ? "success" : "failed",
                details: Math.random() > 0.5 ? `详细操作: ${op.content} #${i}` : undefined
            });
        }

        setOperationLogs(mockOperationLogs);
        setFilteredOperationLogs(mockOperationLogs);
        setTotalOperationLogs(mockOperationLogs.length);
    }, []);

    useState(() => {
        const filterLogs = () => {
            let filteredLogin = [...loginLogs];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();

                filteredLogin = filteredLogin.filter(
                    log => log.username.toLowerCase().includes(term) || log.account.toLowerCase().includes(term) || log.ip.includes(term) || log.location.toLowerCase().includes(term)
                );
            }

            if (dateRange.start) {
                filteredLogin = filteredLogin.filter(log => new Date(log.loginTime) >= new Date(dateRange.start));
            }

            if (dateRange.end) {
                filteredLogin = filteredLogin.filter(log => new Date(log.loginTime) <= new Date(dateRange.end));
            }

            setFilteredLoginLogs(filteredLogin);
            setTotalLoginLogs(filteredLogin.length);
            setCurrentPage(1);
            let filteredOp = [...operationLogs];

            if (searchTerm) {
                const term = searchTerm.toLowerCase();

                filteredOp = filteredOp.filter(
                    log => log.operator.toLowerCase().includes(term) || log.account.toLowerCase().includes(term) || log.operationType.toLowerCase().includes(term) || log.operationContent.toLowerCase().includes(term) || log.ip.includes(term)
                );
            }

            if (dateRange.start) {
                filteredOp = filteredOp.filter(log => new Date(log.operationTime) >= new Date(dateRange.start));
            }

            if (dateRange.end) {
                filteredOp = filteredOp.filter(log => new Date(log.operationTime) <= new Date(dateRange.end));
            }

            setFilteredOperationLogs(filteredOp);
            setTotalOperationLogs(filteredOp.length);
        };

        filterLogs();
    }, [searchTerm, dateRange, loginLogs, operationLogs]);

    const getCurrentPageData = () => {
        const startIndex = (currentPage - 1) * pageSize;

        if (activeTab === "login") {
            return filteredLoginLogs.slice(startIndex, startIndex + pageSize);
        } else {
            return filteredOperationLogs.slice(startIndex, startIndex + pageSize);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleDateChange = (type: "start" | "end", value: string) => {
        setDateRange(prev => ({
            ...prev,
            [type]: value
        }));
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const exportLogs = () => {
        setIsExporting(true);

        setTimeout(() => {
            toast.success(`${activeTab === "login" ? "登录" : "操作"}日志导出成功`);
            setIsExporting(false);
        }, 800);
    };

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">日志管理</h1>
                    <p className="text-gray-500 dark:text-gray-400">查看和管理系统登录日志与操作日志，追踪系统使用情况
                                  </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={exportLogs} disabled={isExporting} className="btn btn-secondary">
                        {isExporting ? <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>导出中...</span>
                        </> : <>
                            <i className="fa-solid fa-download"></i>
                            <span>导出日志</span>
                        </>}
                    </button>
                </div>
            </div>
            {}
            <div className={`card ${config.bgSecondary} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">关键词搜索</label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`搜索${activeTab === "login" ? "账号、IP、位置" : "操作人、内容、IP"}`}
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className={`input ${config.borderColor} pr-10`} />
                            <i
                                className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">开始日期</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => handleDateChange("start", e.target.value)}
                            className={`input ${config.borderColor}`} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">结束日期</label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => handleDateChange("end", e.target.value)}
                            className={`input ${config.borderColor}`} />
                    </div>
                </div>
            </div>
            {}
            <div className={`card ${config.bgSecondary} p-0`}>
                {}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === "login" ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"}`}>登录日志
                                        </button>
                        <button
                            onClick={() => setActiveTab("operation")}
                            className={`px-6 py-4 text-sm font-medium border-b-2 ${activeTab === "operation" ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400" : "text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-300"}`}>操作日志
                                        </button>
                    </div>
                </div>
                {}
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                {activeTab === "login" ? <>
                                    <th>登录时间</th>
                                    <th>登录账号</th>
                                    <th>用户名称</th>
                                    <th>登录设备</th>
                                    <th>登录地址</th>
                                    <th>登录IP</th>
                                    <th>登录状态</th>
                                </> : <>
                                    <th>操作时间</th>
                                    <th>操作人</th>
                                    <th>账号</th>
                                    <th>操作类型</th>
                                    <th>操作内容</th>
                                    <th>IP地址</th>
                                    <th>操作结果</th>
                                </>}
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageData().map(log => <tr
                                key={log.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                {activeTab === "login" ? <>
                                    <td>{format(new Date(log.loginTime), "yyyy-MM-dd HH:mm:ss")}</td>
                                    <td>{log.account}</td>
                                    <td>{log.username}</td>
                                    <td>{log.device}</td>
                                    <td>{log.location}</td>
                                    <td>{log.ip}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${log.status === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                            {log.status === "success" ? "成功" : "失败"}
                                        </span>
                                    </td>
                                </> : <>
                                    <td>{format(new Date(log.operationTime), "yyyy-MM-dd HH:mm:ss")}</td>
                                    <td>{log.operator}</td>
                                    <td>{log.account}</td>
                                    <td>{log.operationType}</td>
                                    <td>
                                        <div className="max-w-xs truncate">{log.operationContent}</div>
                                        {log.details && <div className="text-xs text-gray-500 mt-1">{log.details}</div>}
                                    </td>
                                    <td>{log.ip}</td>
                                    <td>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs ${log.result === "success" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                            {log.result === "success" ? "成功" : "失败"}
                                        </span>
                                    </td>
                                </>}
                            </tr>)}
                            {getCurrentPageData().length === 0 && <tr>
                                <td colSpan={activeTab === "login" ? 7 : 7} className="text-center py-12">
                                    <i
                                        className="fa-solid fa-file-alt text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                                    <p className="text-gray-500 dark:text-gray-400">未找到匹配的日志记录</p>
                                </td>
                            </tr>}
                        </tbody>
                    </table>
                    <div className="pb-24"></div>
                </div>
                {}
                <></>
            </div>
        </div>
    );
};

export default LogManagement;