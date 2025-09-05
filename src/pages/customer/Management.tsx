import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

interface Customer {
    id: string;
    serialNumber: number;
    customerNumber: string;
    name: string;
    abbreviation: string;
    sapCode: string;
    status: "通过" | "待审核" | "驳回";
    contactInfo: string;
    uploadInfo: string;
    createTime: string;
}

interface QueryCondition {
    field: string;
    operator: string;
    value: string;
}

const CustomerManagement = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
    const [showFieldConfig, setShowFieldConfig] = useState(false);

    const [tableFields, setTableFields] = useState([{
        key: "serialNumber",
        label: "序号",
        visible: true
    }, {
        key: "customerNumber",
        label: "客户编号",
        visible: true
    }, {
        key: "name",
        label: "客户名称",
        visible: true
    }, {
        key: "abbreviation",
        label: "客户简称",
        visible: true
    }, {
        key: "sapCode",
        label: "SAP客户编码",
        visible: true
    }, {
        key: "status",
        label: "单据状态",
        visible: true
    }, {
        key: "contactInfo",
        label: "联系方式",
        visible: true
    }, {
        key: "uploadInfo",
        label: "上传信息",
        visible: true
    }, {
        key: "operation",
        label: "操作",
        visible: true
    }]);

    const defaultTableFields = [{
        key: "serialNumber",
        label: "序号",
        visible: true
    }, {
        key: "customerNumber",
        label: "客户编号",
        visible: true
    }, {
        key: "name",
        label: "客户名称",
        visible: true
    }, {
        key: "abbreviation",
        label: "客户简称",
        visible: true
    }, {
        key: "sapCode",
        label: "SAP客户编码",
        visible: true
    }, {
        key: "status",
        label: "单据状态",
        visible: true
    }, {
        key: "contactInfo",
        label: "联系方式",
        visible: true
    }, {
        key: "uploadInfo",
        label: "上传信息",
        visible: true
    }, {
        key: "operation",
        label: "操作",
        visible: true
    }];

    const saveFieldConfig = (fields: any[]) => {
        localStorage.setItem("customerTableFields", JSON.stringify(fields));
        toast.success("字段配置保存成功");
    };

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(291);
    const [pageSize, setPageSize] = useState(200);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const [savedQueries, setSavedQueries] = useState<{
        name: string;
        conditions: QueryCondition[];
    }[]>(() => {
        const saved = localStorage.getItem("savedQueries");
        return saved ? JSON.parse(saved) : [];
    });

    const [queryConditions, setQueryConditions] = useState<QueryCondition[]>([{
        field: "customerName",
        operator: "contains",
        value: ""
    }]);

    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

    useEffect(() => {
        const mockCustomers: Customer[] = [];

        for (let i = 1; i <= 20; i++) {
            mockCustomers.push({
                id: `CUST${i}`,
                serialNumber: i,
                customerNumber: `08300${i}`,
                name: `客户名称${i}`,
                abbreviation: `客户简称${i}`,
                sapCode: `103000${1800 + i}`,
                status: i % 3 === 0 ? "待审核" : i % 5 === 0 ? "驳回" : "通过",
                contactInfo: `联系人${i}`,
                uploadInfo: `上传信息${i}`,
                createTime: `2025-09-${i < 10 ? "0" + i : i}`
            });
        }

        setCustomers(mockCustomers);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const addQueryCondition = () => {
        setQueryConditions([...queryConditions, {
            field: "customerName",
            operator: "contains",
            value: ""
        }]);
    };

    const removeQueryCondition = (index: number) => {
        if (queryConditions.length > 1) {
            setQueryConditions(queryConditions.filter((_, i) => i !== index));
        }
    };

    const handleConditionChange = (index: number, field: keyof QueryCondition, value: string) => {
        const newConditions = [...queryConditions];

        newConditions[index] = {
            ...newConditions[index],
            [field]: value
        };

        setQueryConditions(newConditions);
    };

    const saveQuery = () => {
        const queryName = prompt("请输入查询条件名称:", "我的查询");

        if (queryName && queryName.trim()) {
            const clones = queryConditions.map(c => ({
                ...c
            }));

            const updatedQueries = [...savedQueries];

            updatedQueries.push({
                name: queryName.trim(),
                conditions: clones
            });

            setSavedQueries(updatedQueries);
            localStorage.setItem("savedQueries", JSON.stringify(updatedQueries));
            toast.success("查询条件已保存");
        }
    };

    const loadQuery = (index: number) => {
        if (savedQueries[index]) {
            setQueryConditions([...savedQueries[index].conditions]);
            toast.success(`已加载查询条件: ${savedQueries[index].name}`);
        }
    };

    const deleteQuery = (index: number) => {
        if (window.confirm(`确定删除查询条件: ${savedQueries[index].name}吗?`)) {
            const updatedQueries = [...savedQueries];
            updatedQueries.splice(index, 1);
            setSavedQueries(updatedQueries);
            localStorage.setItem("savedQueries", JSON.stringify(updatedQueries));
        }
    };

    const executeQuery = () => {
        toast.info("执行查询操作");
    };

    const resetQuery = () => {
        setQueryConditions([{
            field: "customerName",
            operator: "contains",
            value: ""
        }]);

        setSearchTerm("");
    };

    const toggleAdvancedFilter = () => {
        setShowAdvancedFilter(!showAdvancedFilter);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const handleCustomerAction = (action: string, customer: Customer) => {
        setSelectedCustomer(customer);

        switch (action) {
        case "view":
            toast.info(`查看客户 ${customer.id} 详情`);
            break;
        case "edit":
            toast.info(`编辑客户 ${customer.id}`);
            setIsModalOpen(true);
            break;
        case "delete":
            if (window.confirm("确定要删除这个客户吗？")) {
                setCustomers(prev => prev.filter(c => c.id !== customer.id));
                toast.success("客户已删除");
            }

            break;
        default:
            toast.info(`执行 ${action} 操作`);
        }
    };

    const handleBatchAction = (action: string) => {
        toast.info(`执行批量 ${action} 操作`);
    };

    return (
        <div className={`card ${config.bgSecondary} p-0`}>
            <div className="py-3 px-4 sm:px-3 border-b">
                <div>
                    <div
                        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto flex-nowrap">
                            <select
                                className={`input ${config.borderColor} w-full md:w-auto whitespace-nowrap`}>
                                <option value="all">全部</option>
                                <option value="individual">个人</option>
                                <option value="enterprise">企业</option>
                            </select>
                            <input
                                type="text"
                                placeholder="搜索联系人姓名、联系手机、联系人邮箱..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className={`input ${config.borderColor} flex-grow min-w-0`} />
                            <button className="btn btn-secondary w-full md:w-auto whitespace-nowrap">搜索</button>
                            <button
                                className="btn btn-secondary w-full md:w-auto whitespace-nowrap"
                                onClick={toggleAdvancedFilter}>高级筛选</button>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <button className="btn btn-primary w-full md:w-auto whitespace-nowrap">
                                <i className="fa-solid fa-plus"></i>
                                <span>新建</span>
                            </button>
                            <button className="btn btn-secondary w-full md:w-auto whitespace-nowrap">导入</button>
                            <button className="btn btn-secondary w-full md:w-auto whitespace-nowrap">回收站</button>
                        </div>
                    </div>
                </div>
            </div>
            {showAdvancedFilter && <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <></>
                        <span
                            className="text-xs text-gray-500"
                            style={{
                                fontWeight: "bold",
                                fontFamily: "\"Noto Serif SC\", serif",
                                fontSize: "14px"
                            }}>已选条件：高级筛选</span>
                        <button
                            className="text-xs text-gray-500 hover:text-gray-700"
                            onClick={toggleAdvancedFilter}>
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {queryConditions.map(
                        (condition, index) => <div key={index} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm">
                                    {index === 0 ? "且" : "或"}
                                </span>
                                <select
                                    className={`input ${config.borderColor} w-32`}
                                    value={condition.field}
                                    onChange={e => handleConditionChange(index, "field", e.target.value)}>
                                    <option value="customerName">客户名称</option>
                                    <option value="customerNumber">客户编号</option>
                                    <option value="contactPerson">联系人</option>
                                    <option value="contactPhone">联系电话</option>
                                </select>
                                <select
                                    className={`input ${config.borderColor} w-24`}
                                    value={condition.operator}
                                    onChange={e => handleConditionChange(index, "operator", e.target.value)}>
                                    <option value="equals">等于</option>
                                    <option value="contains">包含</option>
                                    <option value="startsWith">开始于</option>
                                    <option value="endsWith">结束于</option>
                                    <option value="notEquals">不等于</option>
                                </select>
                                <input
                                    type="text"
                                    className={`input ${config.borderColor} flex-grow`}
                                    value={condition.value}
                                    onChange={e => handleConditionChange(index, "value", e.target.value)}
                                    placeholder="请输入值" />
                                <button
                                    onClick={() => removeQueryCondition(index)}
                                    className="text-gray-500 hover:text-red-500 p-2">
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={addQueryCondition}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <i className="fa-solid fa-plus"></i>
                            <span>添加条件</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 mt-4">
                        <button onClick={executeQuery} className="btn btn-secondary">查询
                                                                                                                                                                                                                                                                                         </button>
                        <button onClick={resetQuery} className="btn btn-secondary">重置
                                                                                                                                                                                                                                                                                         </button>
                        <div className="flex items-center gap-2">
                            <button onClick={saveQuery} className="btn btn-secondary">保存查询条件</button>
                            <></>
                            <></>
                        </div>
                    </div>
                </div>
            </div>}
            {}
            <div
                className="p-4 border-b flex flex-col gap-4"
                style={{
                    borderWidth: "0px",
                    padding: "0px"
                }}>
                {}
                {savedQueries.length > 0 && <></>}
                {}
                <></>
            </div>
            {}
            <div className="overflow-x-auto">
                <></>
                <></>
            </div>
            {}
            <></>
            {}
            {isModalOpen && <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`card ${config.bgSecondary} w-full max-w-md`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">新增客户</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">客户名称 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入客户名称" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">客户编号 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入客户编号" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">客户类型 <span className="text-red-500">*</span></label>
                                <select className={`input ${config.borderColor}`}>
                                    <option value="individual">个人</option>
                                    <option value="enterprise">企业</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">SAP客户编码</label>
                                <input
                                    type="text"
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入SAP客户编码" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">联系人</label>
                                <input
                                    type="text"
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入联系人" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">联系电话</label>
                                <input
                                    type="tel"
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入联系电话" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn btn-secondary">取消
                                                                                                                                                                                                                                                                                                                                                                                                                              </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        toast.success("客户创建成功");
                                        setIsModalOpen(false);
                                    }}>保存客户
                                                                                                                                                                                                                                                                                                                                                                                                                              </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>}
            {}
            {showFieldConfig && <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div
                    className={`card ${config.bgSecondary} w-full max-w-md max-h-[80vh] overflow-y-auto`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">字段配置</h2>
                            <button
                                onClick={() => setShowFieldConfig(false)}
                                className="text-gray-400 hover:text-gray-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">拖拽调整顺序</h3>
                                <div className="border rounded-lg p-4 max-h-[300px] overflow-y-auto">
                                    {tableFields.map(field => <div
                                        key={field.key}
                                        className="p-3 mb-2 bg-gray-50 dark:bg-gray-800 rounded cursor-move flex items-center justify-between">
                                        <div className="flex items-center">
                                            <i className="fa-solid fa-grip-vertical mr-3 text-gray-400"></i>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={field.visible}
                                                    onChange={e => {
                                                        const updatedFields = [...tableFields];
                                                        const index = updatedFields.findIndex(f => f.key === field.key);

                                                        if (index !== -1) {
                                                            updatedFields[index] = {
                                                                ...updatedFields[index],
                                                                visible: e.target.checked
                                                            };

                                                            setTableFields(updatedFields);
                                                            saveFieldConfig(updatedFields);
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 mr-2" />
                                                {field.label}
                                            </label>
                                        </div>
                                    </div>)}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        const resetFields = defaultTableFields.map(field => ({
                                            ...field,
                                            visible: true
                                        }));

                                        setTableFields(resetFields);
                                        saveFieldConfig(resetFields);
                                    }}
                                    className="btn btn-secondary">重置默认
                                                                                                                                                                                                                                                                                                                                    </button>
                                <button onClick={() => setShowFieldConfig(false)} className="btn btn-primary">保存设置
                                                                                                                                                                                                                                                                                                                                    </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default CustomerManagement;