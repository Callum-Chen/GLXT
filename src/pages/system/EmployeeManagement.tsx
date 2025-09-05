import { useState, useEffect, useContext, useRef } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { Role } from "./RoleManagement";

interface Employee {
    id: string;
    username: string;
    realName: string;
    englishName?: string;
    phone: string;
    email: string;
    departmentIds: string[];
    status: "active" | "inactive";
    hireDate: string;
}

interface Department {
    id: string;
    name: string;
    code: string;
    children?: Department[];
}

interface EmployeeFormData extends Omit<Employee, "id" | "departmentId"> {
    confirmPassword?: string;
    englishName?: string;
    departmentIds: string[];
}

const EmployeeManagement = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [modalShowDepartmentDropdown, setModalShowDepartmentDropdown] = useState(false);
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
    const [modalDepartmentSearchTerm, setModalDepartmentSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [allDepartmentIds, setAllDepartmentIds] = useState<string[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const modalDropdownRef = useRef<HTMLDivElement>(null);
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleFilter, setRoleFilter] = useState<string[]>([]);
    const [modalType, setModalType] = useState<"add" | "edit">("add");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
        setDeletingEmployeeId(null);
    };

    const handleDeleteConfirm = () => {
        if (deletingEmployeeId) {
            deleteEmployee(deletingEmployeeId);
            setShowDeleteModal(false);
            setDeletingEmployeeId(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDepartmentDropdown(false);
            }

            if (modalDropdownRef.current && !modalDropdownRef.current.contains(event.target as Node)) {
                setModalShowDepartmentDropdown(false);
            }

            setSelectedDepartments(selectedDepartments);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [selectedDepartments]);

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState<EmployeeFormData>({
        username: "",
        realName: "",
        phone: "",
        email: "",
        departmentIds: [],
        status: "active",
        hireDate: "",
        roleIds: [],
        confirmPassword: ""
    });

    const [sortConfig, setSortConfig] = useState<{
        key: keyof Employee | null;
        direction: "asc" | "desc";
    }>({
        key: null,
        direction: "asc"
    });

    useEffect(() => {
        const savedDepartments = localStorage.getItem("departments");

        if (savedDepartments) {
            setDepartments(JSON.parse(savedDepartments));
        }
    }, []);

    useEffect(() => {
        const savedEmployees = localStorage.getItem("employees");

        if (savedEmployees) {
            const parsedEmployees = JSON.parse(savedEmployees);
            setEmployees(parsedEmployees);
            setFilteredEmployees(parsedEmployees);
            setTotalEmployees(parsedEmployees.length);
        } else {
            const mockEmployees: Employee[] = [{
                id: "1",
                username: "zhang_san",
                realName: "张三",
                englishName: "Zhang San",
                phone: "13800138000",
                email: "zhang.san@example.com",
                departmentId: "3",
                status: "active",
                hireDate: "2023-01-15"
            }, {
                id: "2",
                username: "li_si",
                realName: "李四",
                englishName: "Li Si",
                phone: "13900139000",
                email: "li.si@example.com",
                departmentId: "4",
                status: "active",
                hireDate: "2023-02-20"
            }, {
                id: "3",
                username: "wang_wu",
                realName: "王五",
                englishName: "Wang Wu",
                phone: "13700137000",
                email: "wang.wu@example.com",
                departmentId: "5",
                status: "inactive",
                hireDate: "2023-03-10"
            }, {
                id: "4",
                username: "zhao_liu",
                realName: "赵六",
                englishName: "Zhao Liu",
                phone: "13600136000",
                email: "zhao.liu@example.com",
                departmentId: "6",
                status: "active",
                hireDate: "2023-04-05"
            }, {
                id: "5",
                username: "qian_qi",
                realName: "钱七",
                englishName: "Qian Qi",
                phone: "13500135000",
                email: "qian.qi@example.com",
                departmentId: "7",
                status: "active",
                hireDate: "2023-05-22"
            }];

            setEmployees(mockEmployees);
            setFilteredEmployees(mockEmployees);
            setTotalEmployees(mockEmployees.length);
            localStorage.setItem("employees", JSON.stringify(mockEmployees));
        }
    }, []);

    useEffect(() => {
        let result = [...employees];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();

            result = result.filter(
                emp => emp.username.toLowerCase().includes(term) || emp.realName.toLowerCase().includes(term) || emp.email.toLowerCase().includes(term) || emp.phone.includes(term)
            );
        }

        if (statusFilter !== "all")
            {}

        if (roleFilter.length > 0) {
            result = result.filter(emp => {
                const empRoles = JSON.parse(localStorage.getItem(`employee_${emp.id}_roles`) || "[]");
                return roleFilter.some(roleId => empRoles.includes(roleId));
            });
        }

        if (statusFilter !== "all") {
            result = result.filter(emp => emp.status === statusFilter);
        }

        if (selectedDepartments.length > 0) {
            const getAllSubDepartmentIds = (deptId: string, departments: Department[]): string[] => {
                const ids: string[] = [deptId];

                const findSubDepartments = (departments: Department[]) => {
                    for (const dept of departments) {
                        if (dept.parentId === deptId) {
                            ids.push(dept.id);
                            findSubDepartments(dept.children || []);
                        } else if (dept.children && dept.children.length > 0) {
                            findSubDepartments(dept.children);
                        }
                    }
                };

                findSubDepartments(departments);
                return ids;
            };

            const collectAllDepartmentIds = (departments: Department[]): string[] => {
                let ids: string[] = [];

                departments.forEach(dept => {
                    ids.push(dept.id);

                    if (dept.children && dept.children.length > 0) {
                        ids = [...ids, ...collectAllDepartmentIds(dept.children)];
                    }
                });

                return ids;
            };

            const allIds = collectAllDepartmentIds(departments);
            setAllDepartmentIds(allIds);

            if (selectedDepartments.length > 0) {
                let departmentIds: string[] = [];

                selectedDepartments.forEach(deptId => {
                    departmentIds = [...departmentIds, ...getAllSubDepartmentIds(deptId, departments)];
                });

                departmentIds = [...new Set(departmentIds)];
                result = result.filter(emp => departmentIds.includes(emp.departmentId));
            }
        }

        if (sortConfig.key) {
            result.sort((a, b) => {
                if (a[sortConfig.key!] < b[sortConfig.key!]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }

                if (a[sortConfig.key!] > b[sortConfig.key!]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }

                return 0;
            });
        }

        setFilteredEmployees(result);
        setTotalEmployees(result.length);

        if (currentPage > 1) {
            setCurrentPage(1);
        }
    }, [
        employees,
        searchTerm,
        statusFilter,
        sortConfig,
        selectedDepartments,
        roleFilter
    ]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    const renderDepartmentCheckboxes = (departments: Department[] = [], level = 0) => {
        return departments.filter(dept => {
            if (!departmentSearchTerm)
                return true;

            const term = departmentSearchTerm.toLowerCase();
            return dept.name.toLowerCase().includes(term) || dept.code.toLowerCase().includes(term);
        }).map(dept => <div key={dept.id} className="mb-2">
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={e => {
                        const getAllSubDepartmentIds = (dept: Department): string[] => {
                            let ids: string[] = [];

                            if (dept.children && dept.children.length > 0) {
                                dept.children.forEach(child => {
                                    ids.push(child.id);
                                    ids.push(...getAllSubDepartmentIds(child));
                                });
                            }

                            return ids;
                        };

                        const subDeptIds = getAllSubDepartmentIds(dept);

                        if (e.target.checked) {
                            setSelectedDepartments(prev => [...new Set([...prev, dept.id, ...subDeptIds])]);
                        } else {
                            setSelectedDepartments(prev => prev.filter(id => id !== dept.id && !subDeptIds.includes(id)));
                        }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm">{dept.name}</span>
                <span className="ml-2 text-xs text-gray-500">{dept.code}</span>
            </label>
            {dept.children && dept.children.length > 0 && <div className="ml-6 mt-1">
                {renderDepartmentCheckboxes(dept.children, level + 1)}
            </div>}
        </div>);
    };

    const handleSort = (key: keyof Employee) => {
        let direction: "asc" | "desc" = "asc";

        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }

        setSortConfig({
            key,
            direction
        });
    };

    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [roleSearchTerm, setRoleSearchTerm] = useState("");
    const roleDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const savedRoles = localStorage.getItem("roles");

        if (savedRoles) {
            setAllRoles(JSON.parse(savedRoles));
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
                setShowRoleDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const handleEmployeeSelect = (id: string) => {
        setSelectedEmployees(
            prev => prev.includes(id) ? prev.filter(empId => empId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentPageEmployees = getCurrentPageEmployees();

        if (e.target.checked) {
            setSelectedEmployees(currentPageEmployees.map(emp => emp.id));
        } else {
            setSelectedEmployees([]);
        }
    };

    const getCurrentPageEmployees = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredEmployees.slice(startIndex, startIndex + pageSize);
    };

    const openModal = (type: "add" | "edit", employee?: Employee) => {
        setModalType(type);
        setIsModalOpen(true);

        if (type === "edit" && employee) {
            setSelectedEmployee(employee);

            setFormData({
                username: employee.username,
                realName: employee.realName,
                phone: employee.phone,
                email: employee.email,
                departmentIds: employee.departmentIds ? [...employee.departmentIds] : employee.departmentId ? [employee.departmentId] : [],
                status: employee.status,
                hireDate: employee.hireDate,
                roleIds: JSON.parse(localStorage.getItem(`employee_${employee.id}_roles`) || "[]"),
                confirmPassword: ""
            });
        } else {
            setFormData({
                username: "",
                realName: "",
                phone: "",
                email: "",
                departmentIds: [],
                status: "active",
                hireDate: format(new Date(), "yyyy-MM-dd"),
                roleIds: [],
                confirmPassword: "123456"
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEmployee(null);

        setFormData({
            username: "",
            realName: "",
            phone: "",
            email: "",
            departmentId: "",
            roleIds: [],
            status: "active",
            hireDate: "",
            confirmPassword: ""
        });
    };

    const handleRoleChange = (roleId: string) => {
        setFormData(prev => {
            const roleIds = [...prev.roleIds];
            const index = roleIds.indexOf(roleId);

            if (index === -1) {
                roleIds.push(roleId);
            } else {
                roleIds.splice(index, 1);
            }

            return {
                ...prev,
                roleIds
            };
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {
            name,
            value
        } = e.target;

        if (name === "departmentIds" && e.target instanceof HTMLSelectElement && e.target.multiple) {
            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);

            setFormData(prev => ({
                ...prev,
                departmentIds: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        if (!formData.username || !formData.realName || !formData.phone || !formData.email || formData.departmentIds.length === 0 || formData.roleIds.length === 0 || !formData.hireDate) {
            if (formData.departmentIds.length === 0) {
                toast.error("请选择部门");
            } else if (formData.roleIds.length === 0) {
                toast.error("请选择角色");
            } else {
                toast.error("请填写所有必填字段");
            }

            return false;
        }

        const phoneRegex = /^1[3-9]\d{9}$/;

        if (!phoneRegex.test(formData.phone)) {
            toast.error("请输入有效的手机号码");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            toast.error("请输入有效的邮箱地址");
            return false;
        }

        if (modalType === "add" && !formData.confirmPassword) {
            toast.error("请设置初始密码");
            return false;
        }

        if (modalType === "add" || modalType === "edit" && selectedEmployee && formData.username !== selectedEmployee.username) {
            const usernameExists = employees.some(emp => emp.username === formData.username);

            if (usernameExists) {
                toast.error("用户名已存在");
                return false;
            }
        }

        return true;
    };

    const saveEmployee = () => {
        if (!validateForm()) {
            return;
        }

        const updatedEmployees = [...employees];

        if (modalType === "add") {
            const newEmployee: Employee = {
                id: Date.now().toString(),
                ...formData,
                departmentIds: formData.departmentIds,
                confirmPassword: undefined as any,
                roleIds: formData.roleIds
            };

            updatedEmployees.push(newEmployee);
            localStorage.setItem(`employee_${newEmployee.id}_roles`, JSON.stringify(formData.roleIds));
            toast.success("员工添加成功");
        } else if (modalType === "edit" && selectedEmployee) {
            const index = updatedEmployees.findIndex(emp => emp.id === selectedEmployee.id);

            if (index !== -1) {
                updatedEmployees[index] = {
                    ...selectedEmployee,
                    ...formData,
                    departmentIds: formData.departmentIds,
                    roleIds: formData.roleIds,
                    confirmPassword: undefined as any
                };

                localStorage.setItem(`employee_${selectedEmployee.id}_roles`, JSON.stringify(formData.roleIds));
                toast.success("员工信息更新成功");
            }
        }

        setEmployees(updatedEmployees);
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        closeModal();
    };

    const deleteEmployee = (id: string) => {
        const updatedEmployees = employees.filter(emp => emp.id !== id);
        setEmployees(updatedEmployees);
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        toast.success("员工已删除");
    };

    const batchUpdateStatus = (status: "active" | "inactive") => {
        if (selectedEmployees.length === 0) {
            toast.error("请选择要操作的员工");
            return;
        }

        const updatedEmployees = employees.map(emp => selectedEmployees.includes(emp.id) ? {
            ...emp,
            status
        } : emp);

        setEmployees(updatedEmployees);
        localStorage.setItem("employees", JSON.stringify(updatedEmployees));
        setSelectedEmployees([]);
        toast.success(`已${status === "active" ? "启用" : "禁用"} ${selectedEmployees.length} 名员工`);
    };

    const resetPassword = (id: string) => {
        toast.success("密码已重置为默认密码：123456");
    };

    const exportEmployees = () => {
        toast.success("员工数据导出成功");
    };

    const getDepartmentName = (id: string): string => {
        const findDept = (depts: Department[]): Department | null => {
            for (const dept of depts) {
                if (dept.id === id) {
                    return dept;
                }

                if (dept.children && dept.children.length > 0) {
                    const found = findDept(dept.children);

                    if (found)
                        return found;
                }
            }

            return null;
        };

        const dept = findDept(departments);
        return dept ? dept.name : "未知部门";
    };

    const renderDepartmentOptions = (depts: Department[] = [], level = 0) => {
        return depts.flatMap(dept => [<option key={dept.id} value={dept.id}>
            {dept.name}
        </option>, ...(dept.children ? renderDepartmentOptions(dept.children, level + 1) : [])]);
    };

    const getEmployeeRoles = (employeeId: string): Role[] => {
        try {
            const rolesStr = localStorage.getItem("roles");
            const roles: Role[] = rolesStr ? JSON.parse(rolesStr) : [];
            const empRolesStr = localStorage.getItem(`employee_${employeeId}_roles`);
            const parsedEmpRoles = empRolesStr ? JSON.parse(empRolesStr) : [];
            const empRoleIds: string[] = Array.isArray(parsedEmpRoles) ? parsedEmpRoles : [];
            return roles.filter(role => empRoleIds.includes(role.id));
        } catch (error) {
            console.error("Error getting employee roles:", error);
            return [];
        }
    };

    const renderMultiSelectDepartmentOptions = (depts: Department[], level = 0) => {
        return depts.filter(dept => {
            if (!departmentSearchTerm)
                return true;

            const term = departmentSearchTerm.toLowerCase();
            return dept.name.toLowerCase().includes(term) || dept.code.toLowerCase().includes(term);
        }).map(dept => <div key={dept.id} className="mb-1">
            <label
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.departmentIds.includes(dept.id)}
                    onChange={e => {
                        if (e.target.checked) {
                            setFormData(prev => ({
                                ...prev,
                                departmentIds: [...prev.departmentIds, dept.id]
                            }));
                        } else {
                            setFormData(prev => ({
                                ...prev,
                                departmentIds: prev.departmentIds.filter(id => id !== dept.id)
                            }));
                        }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm">{dept.name}</span>
                <span className="ml-2 text-xs text-gray-500">{dept.code}</span>
            </label>
            {dept.children && dept.children.length > 0 && <div className="ml-6 mt-1">
                {renderMultiSelectDepartmentOptions(dept.children, level + 1)}
            </div>}
        </div>);
    };

    const renderModalMultiSelectDepartmentOptions = (depts: Department[], level = 0) => {
        return depts.filter((item): item is Department => {
            if (!item || typeof item !== "object" || !("name" in item) || !("code" in item)) {
                return false;
            }

            if (!modalDepartmentSearchTerm)
                return true;

            const term = modalDepartmentSearchTerm.toLowerCase();
            const name = (item.name || "").toLowerCase();
            const code = (item.code || "").toLowerCase();
            return name.includes(term) || code.includes(term);
        }).map(dept => <div key={dept.id} className="mb-1">
            <label
                className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                <input
                    type="checkbox"
                    checked={formData.departmentIds.includes(dept.id)}
                    onChange={e => {
                        if (e.target.checked) {
                            setFormData(prev => ({
                                ...prev,
                                departmentIds: [...prev.departmentIds, dept.id]
                            }));
                        } else {
                            setFormData(prev => ({
                                ...prev,
                                departmentIds: prev.departmentIds.filter(id => id !== dept.id)
                            }));
                        }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm">{dept.name}</span>
                <span className="ml-2 text-xs text-gray-500">{dept.code}</span>
            </label>
            {dept.children && dept.children.length > 0 && <div className="ml-6 mt-1">
                {renderModalMultiSelectDepartmentOptions(dept.children, level + 1)}
            </div>}
        </div>);
    };

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">员工管理</h1>
                    <p className="text-gray-500 dark:text-gray-400">管理公司员工信息，包括基本资料、部门分配和状态管理
                                                                                                          </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索姓名、用户名或邮箱..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`input ${config.borderColor} pr-10 w-64`} />
                        <i
                            className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button
                        onClick={() => {
                            setShowDepartmentDropdown(false);
                            openModal("add");
                        }}
                        className="btn btn-primary">
                        <i className="fa-solid fa-plus"></i>
                        <span>新增员工</span>
                    </button>
                </div>
            </div>
            <></>
            {}
            <div className={`card ${config.bgSecondary} p-4`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">部门</label>
                                <div
                                    ref={dropdownRef}
                                    className={`relative ${config.borderColor} border rounded-lg p-2 bg-white dark:bg-gray-800 min-h-[40px]`}>
                                    <input
                                        type="text"
                                        placeholder="选择部门"
                                        onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                                        className="w-full focus:outline-none"
                                        readOnly
                                        value={selectedDepartments.length > 0 ? selectedDepartments.map(id => getDepartmentName(id)).join(", ") : ""} />
                                    <i
                                        className={`fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 ${showDepartmentDropdown ? "rotate-180" : ""}`}></i>
                                    {showDepartmentDropdown && <div
                                        className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                placeholder="搜索部门..."
                                                value={departmentSearchTerm}
                                                onChange={e => setDepartmentSearchTerm(e.target.value)}
                                                className="w-full p-2 border rounded" />
                                        </div>
                                        <div className="p-2">
                                            <label className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDepartments.length > 0 && selectedDepartments.length === allDepartmentIds.length && allDepartmentIds.length > 0}
                                                    indeterminate={selectedDepartments.length > 0 && selectedDepartments.length < allDepartmentIds.length}
                                                    onChange={e => {
                                                        if (e.target.checked) {
                                                            setSelectedDepartments(allDepartmentIds);
                                                        } else {
                                                            setSelectedDepartments([]);
                                                        }
                                                    }}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                <span className="ml-2">全选</span>
                                            </label>
                                            {renderDepartmentCheckboxes(departments)}
                                        </div>
                                    </div>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">角色 <></></label>
                                <div
                                    ref={roleDropdownRef}
                                    className={`relative ${config.borderColor} border rounded-lg p-2 min-h-[40px] bg-white dark:bg-gray-800 flex flex-wrap gap-1 items-center`}>
                                    {(roleFilter.length ?? 0) > 0 ? <>
                                        {allRoles.filter(role => roleFilter.includes(role.id)).map(role => <span
                                            key={role.id}
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mr-1 mb-1">
                                            {role.name}
                                            <button
                                                onClick={() => {
                                                    setRoleFilter(prev => prev.filter(id => id !== role.id));
                                                }}
                                                className="ml-1 text-blue-600 dark:text-blue-300">
                                                <i className="fa-solid fa-times-circle text-xs"></i>
                                            </button>
                                        </span>)}
                                        <input
                                            type="text"
                                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                            className="flex-1 min-w-[100px] focus:outline-none text-sm"
                                            readOnly
                                            placeholder="添加角色..." />
                                    </> : <input
                                        type="text"
                                        placeholder="选择角色"
                                        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                        className="w-full focus:outline-none"
                                        readOnly />}
                                    <i
                                        className={`fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 ${showRoleDropdown ? "rotate-180" : ""}`}></i>
                                    {showRoleDropdown && <div
                                        className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                placeholder="搜索角色..."
                                                value={roleSearchTerm}
                                                onChange={e => setRoleSearchTerm(e.target.value)}
                                                className="w-full p-2 border rounded" />
                                        </div>
                                        <div className="p-2">
                                            {allRoles.filter(role => {
                                                if (!roleSearchTerm)
                                                    return true;

                                                const term = roleSearchTerm.toLowerCase();
                                                return role.name.toLowerCase().includes(term) || role.code.toLowerCase().includes(term);
                                            }).map(role => <div key={role.id} className="mb-1">
                                                <label
                                                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={roleFilter.includes(role.id)}
                                                        onChange={e => {
                                                            if (e.target.checked) {
                                                                setRoleFilter(prev => [...prev, role.id]);
                                                            } else {
                                                                setRoleFilter(prev => prev.filter(id => id !== role.id));
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                    <span className="ml-2 text-sm">{role.name}</span>
                                                    <span className="ml-2 text-xs text-gray-500">{role.code}</span>
                                                </label>
                                            </div>)}
                                        </div>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">状态</label>
                        <select
                            value={statusFilter}
                            onChange={handleStatusFilterChange}
                            className={`input ${config.borderColor}`}>
                            <option value="all">所有状态</option>
                            <option value="active">启用</option>
                            <option value="inactive">禁用</option>
                        </select>
                    </div>
                    {selectedEmployees.length > 0 && <div className="flex items-end">
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => batchUpdateStatus("active")}
                                className="btn btn-secondary flex-1">
                                <i className="fa-solid fa-check"></i>
                                <span>批量启用</span>
                            </button>
                            <button
                                onClick={() => batchUpdateStatus("inactive")}
                                className="btn btn-secondary flex-1">
                                <i className="fa-solid fa-ban"></i>
                                <span>批量禁用</span>
                            </button>
                        </div>
                    </div>}
                </div>
            </div>
            {}
            <div className={`card ${config.bgSecondary} p-0`}>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.length > 0 && selectedEmployees.length === getCurrentPageEmployees().length}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleSort("realName")}>
                                    <div className="flex items-center gap-1">
                                        <span>姓名</span>
                                        {sortConfig.key === "realName" && <i
                                            className={`fa-solid ${sortConfig.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`}></i>}
                                    </div>
                                </th>
                                <th>英文名</th>
                                <th
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleSort("username")}>
                                    <div className="flex items-center gap-1">
                                        <span>用户名</span>
                                        {sortConfig.key === "username" && <i
                                            className={`fa-solid ${sortConfig.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`}></i>}
                                    </div>
                                </th>
                                <th>联系方式</th>
                                <th
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleSort("departmentId")}>
                                    <div className="flex items-center gap-1">
                                        <span>部门</span>
                                        {sortConfig.key === "departmentId" && <i
                                            className={`fa-solid ${sortConfig.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`}></i>}
                                    </div>
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleSort("hireDate")}>
                                    <div className="flex items-center gap-1">
                                        <span>入职日期</span>
                                        {sortConfig.key === "hireDate" && <i
                                            className={`fa-solid ${sortConfig.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`}></i>}
                                    </div>
                                </th>
                                <th
                                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handleSort("status")}>
                                    <div className="flex items-center gap-1">
                                        <span>角色</span>
                                        {sortConfig.key === "status" && <i
                                            className={`fa-solid ${sortConfig.direction === "asc" ? "fa-sort-asc" : "fa-sort-desc"}`}></i>}
                                    </div>
                                </th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageEmployees().map(employee => <tr
                                key={employee.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedEmployees.includes(employee.id)}
                                        onChange={() => handleEmployeeSelect(employee.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                </td>
                                <td>{employee.realName}</td>
                                <td>{employee.englishName || "-"}</td>
                                <td>{employee.username}</td>
                                <td>
                                    <div className="flex flex-col">
                                        <span>{employee.phone}</span>
                                        <span className="text-sm text-gray-500">{employee.email}</span>
                                    </div>
                                </td>
                                <td>{employee.departmentIds?.map(id => getDepartmentName(id)).join(", ") || "-"}</td>
                                <td>{employee.hireDate}</td>
                                <td>
                                    <div className="flex flex-wrap gap-1">
                                        {getEmployeeRoles(employee.id).map(role => <span
                                            key={role.id}
                                            className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs">
                                            {role.name}
                                        </span>)}
                                    </div>
                                </td>
                                <td>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${employee.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                                        {employee.status === "active" ? "启用" : "禁用"}
                                    </span>
                                </td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal("edit", employee)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                            title="编辑">
                                            <i className="fa-solid fa-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => resetPassword(employee.id)}
                                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-1"
                                            title="重置密码">
                                            <i className="fa-solid fa-key"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setDeletingEmployeeId(employee.id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                                            title="删除">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>)}
                            {getCurrentPageEmployees().length === 0 && <tr>
                                <td colSpan={8} className="text-center py-12">
                                    <i
                                        className="fa-solid fa-user-search text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                                    <p className="text-gray-500 dark:text-gray-400">未找到匹配的员工</p>
                                </td>
                            </tr>}
                        </tbody>
                    </table>
                    <></>
                </div>
                {}
                <></>
            </div>
            {}
            {isModalOpen && <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`card ${config.bgSecondary} w-full max-w-2xl`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {modalType === "add" ? "新增员工" : "编辑员工"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">用户名 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}
                                        placeholder="请输入登录用户名"
                                        disabled={modalType === "edit"} />
                                    {modalType === "edit" && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">用户名不可修改</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">姓名 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="realName"
                                        value={formData.realName}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}
                                        placeholder="请输入真实姓名" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">英文名</label>
                                    <input
                                        type="text"
                                        name="englishName"
                                        value={formData.englishName}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}
                                        placeholder="请输入英文名" /></div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">手机号 <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}
                                        placeholder="请输入手机号码" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">邮箱 <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}
                                        placeholder="请输入邮箱地址" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">所属部门 <span className="text-red-500">*</span></label>
                                    <div
                                        ref={modalDropdownRef}
                                        className={`relative ${config.borderColor} border rounded-lg p-2 min-h-[40px] bg-white dark:bg-gray-800 flex flex-wrap gap-1 items-center`}>
                                        {(formData.departmentIds?.length ?? 0) > 0 ? <>
                                            {(formData.departmentIds || []).map(id => <span
                                                key={id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mr-1 mb-1">
                                                {getDepartmentName(id)}
                                                <button
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            departmentIds: prev.departmentIds.filter(departmentId => departmentId !== id)
                                                        }));
                                                    }}
                                                    className="ml-1 text-blue-600 dark:text-blue-300">
                                                    <i className="fa-solid fa-times-circle text-xs"></i>
                                                </button>
                                            </span>)}
                                            <input
                                                type="text"
                                                onClick={() => setModalShowDepartmentDropdown(!modalShowDepartmentDropdown)}
                                                className="flex-1 min-w-[100px] focus:outline-none text-sm"
                                                readOnly
                                                placeholder="添加部门..." />
                                        </> : <input
                                            type="text"
                                            placeholder="选择部门"
                                            onClick={() => setModalShowDepartmentDropdown(!modalShowDepartmentDropdown)}
                                            className="w-full focus:outline-none"
                                            readOnly />}
                                        <i
                                            className={`fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 ${modalShowDepartmentDropdown ? "rotate-180" : ""}`}></i>
                                        {modalShowDepartmentDropdown && <div
                                            className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
                                            <div className="p-2 border-b">
                                                <input
                                                    type="text"
                                                    placeholder="搜索部门..."
                                                    value={modalDepartmentSearchTerm}
                                                    onChange={e => setModalDepartmentSearchTerm(e.target.value)}
                                                    className="w-full p-2 border rounded" />
                                            </div>
                                            <div className="p-2">
                                                {renderModalMultiSelectDepartmentOptions(departments)}
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">角色权限 <span className="text-red-500">*</span></label>
                                    <div
                                        ref={roleDropdownRef}
                                        className={`relative ${config.borderColor} border rounded-lg p-2 min-h-[40px] bg-white dark:bg-gray-800 flex flex-wrap gap-1 items-center`}>
                                        {(formData.roleIds?.length ?? 0) > 0 ? <>
                                            {allRoles.filter(role => formData.roleIds.includes(role.id)).map(role => <span
                                                key={role.id}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mr-1 mb-1">
                                                {role.name}
                                                <button
                                                    onClick={() => handleRoleChange(role.id)}
                                                    className="ml-1 text-blue-600 dark:text-blue-300">
                                                    <i className="fa-solid fa-times-circle text-xs"></i>
                                                </button>
                                            </span>)}
                                            <input
                                                type="text"
                                                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                                className="flex-1 min-w-[100px] focus:outline-none text-sm"
                                                readOnly
                                                placeholder="添加角色..." />
                                        </> : <input
                                            type="text"
                                            placeholder="选择角色"
                                            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                                            className="w-full focus:outline-none"
                                            readOnly />}
                                        <i
                                            className={`fa-solid fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 ${showRoleDropdown ? "rotate-180" : ""}`}></i>
                                        {showRoleDropdown && <div
                                            className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-white dark:bg-gray-800 border rounded-lg shadow-lg">
                                            <div className="p-2 border-b">
                                                <input
                                                    type="text"
                                                    placeholder="搜索角色..."
                                                    value={roleSearchTerm}
                                                    onChange={e => setRoleSearchTerm(e.target.value)}
                                                    className="w-full p-2 border rounded" />
                                            </div>
                                            <div className="p-2">
                                                {allRoles.filter(role => {
                                                    if (!roleSearchTerm)
                                                        return true;

                                                    const term = roleSearchTerm.toLowerCase();
                                                    return role.name.toLowerCase().includes(term) || role.code.toLowerCase().includes(term);
                                                }).map(role => <div key={role.id} className="mb-1">
                                                    <label
                                                        className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.roleIds.includes(role.id)}
                                                            onChange={() => handleRoleChange(role.id)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                        <span className="ml-2 text-sm">{role.name}</span>
                                                        <span className="ml-2 text-xs text-gray-500">{role.code}</span>
                                                    </label>
                                                </div>)}
                                            </div>
                                        </div>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">入职日期 <span className="text-red-500">*</span></label>
                                    <input
                                        type="date"
                                        name="hireDate"
                                        value={formData.hireDate}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">状态 <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`}>
                                        <option value="active">启用</option>
                                        <option value="inactive">禁用</option>
                                    </select>
                                </div>
                                {modalType === "add" && <div>
                                    <label className="block text-sm font-medium mb-1">初始密码 <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className={`input ${config.borderColor}`}
                                            placeholder="请设置初始密码" />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                                            title={showPassword ? "隐藏密码" : "显示密码"}>
                                            <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                    <></>
                                </div>}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">取消
                                                                                                                                                                  </button>
                                <button type="button" onClick={saveEmployee} className="btn btn-primary">保存
                                                                                                                                                                  </button>
                            </div>
                        </form>
                    </div>
                    {}
                    {showDeleteModal && <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
                        <div
                            className={`card ${config.bgSecondary} w-full max-w-md mx-auto my-8 shadow-xl transform transition-all duration-300 scale-100`}>
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">确认删除</h2>
                                    <button
                                        onClick={handleDeleteCancel}
                                        className="text-gray-400 hover:text-gray-500">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                                <div className="text-center py-4">
                                    <div
                                        className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mx-auto mb-4">
                                        <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6">确定要删除这个员工吗？此操作不可撤销。
                                                                                                                                                                                 </p>
                                    <div className="flex justify-center gap-3">
                                        <button onClick={handleDeleteCancel} className="btn btn-secondary">取消
                                                                                                                                                                                                   </button>
                                        <button onClick={handleDeleteConfirm} className="btn btn-danger">
                                            <i className="fa-solid fa-trash"></i>
                                            <span>确认删除</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                </div>
            </div>}
        </div>
    );
};

export default EmployeeManagement;