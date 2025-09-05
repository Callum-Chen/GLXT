import { useState, useEffect, useContext, useRef } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

export interface Role {
    id: string;
    name: string;
    code: string;
    description: string;
    permissions: string[];
}

interface Permission {
    id: string;
    name: string;
    code: string;
    description?: string;
    children?: Permission[];
}

interface Department {
    id: string;
    name: string;
    code: string;
    children?: Department[];
}

interface Employee {
    id: string;
    username: string;
    realName: string;
    departmentId: string;
}

interface RoleFormData extends Omit<Role, "id" | "permissions"> {
    permissions: string[];
}

const RoleManagement = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [roleEmployees, setRoleEmployees] = useState<Employee[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"add" | "edit" | "permissions" | "employees">("add");

    const [formData, setFormData] = useState<RoleFormData>({
        name: "",
        code: "",
        description: "",
        permissions: []
    });

    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
    const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState("");
    const [allDepartmentIds, setAllDepartmentIds] = useState<string[]>([]);
    const [assignEmployees, setAssignEmployees] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalRoles, setTotalRoles] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getDepartmentName = (id: string): string => {
        const findDept = (depts: Department[]): Department | null => {
            for (const dept of depts) {
                if (dept.id === id) {
                    return dept;
                }

                if (dept.children) {
                    const found = findDept(dept.children);

                    if (found)
                        return found;
                }
            }

            return null;
        };

        const dept = findDept(departments);
        return dept ? dept.name : "";
    };

    const renderDepartmentCheckboxes = (depts: Department[], level = 0) => {
        return depts.filter(dept => {
            if (!departmentSearchTerm)
                return true;

            const term = departmentSearchTerm.toLowerCase();
            return dept.name.toLowerCase().includes(term) || dept.code.toLowerCase().includes(term);
        }).map(dept => <div key={dept.id} className="mb-1">
            <label className="flex items-center">
                <input
                    type="checkbox"
                    checked={selectedDepartmentIds.includes(dept.id)}
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
                            setSelectedDepartmentIds(prev => [...new Set([...prev, dept.id, ...subDeptIds])]);
                        } else {
                            setSelectedDepartmentIds(prev => prev.filter(id => id !== dept.id && !subDeptIds.includes(id)));
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

    useEffect(() => {
        const savedRoles = localStorage.getItem("roles");

        if (savedRoles) {
            setRoles(JSON.parse(savedRoles));
            setFilteredRoles(JSON.parse(savedRoles));
            setTotalRoles(JSON.parse(savedRoles).length);
        } else {
            const mockRoles: Role[] = [{
                id: "1",
                name: "系统管理员",
                code: "admin",
                description: "拥有系统全部权限",

                permissions: [
                    "dashboard",
                    "users",
                    "departments",
                    "roles",
                    "settings",
                    "logs",
                    "forms",
                    "processes"
                ]
            }, {
                id: "2",
                name: "部门经理",
                code: "department_manager",
                description: "拥有部门管理权限",
                permissions: ["dashboard", "users", "departments", "forms", "processes"]
            }, {
                id: "3",
                name: "普通员工",
                code: "employee",
                description: "拥有基础操作权限",
                permissions: ["dashboard", "forms"]
            }];

            setRoles(mockRoles);
            setFilteredRoles(mockRoles);
            setTotalRoles(mockRoles.length);
            localStorage.setItem("roles", JSON.stringify(mockRoles));
        }
    }, []);

    useEffect(() => {
        const mockPermissions: Permission[] = [{
            id: "dashboard",
            name: "工作台",
            code: "dashboard",
            description: "访问工作台页面"
        }, {
            id: "users",
            name: "员工管理",
            code: "users",
            description: "管理员工信息",

            children: [{
                id: "users_view",
                name: "查看员工",
                code: "users:view"
            }, {
                id: "users_create",
                name: "新增员工",
                code: "users:create"
            }, {
                id: "users_edit",
                name: "编辑员工",
                code: "users:edit"
            }, {
                id: "users_delete",
                name: "删除员工",
                code: "users:delete"
            }, {
                id: "users_export",
                name: "导出员工",
                code: "users:export"
            }]
        }, {
            id: "departments",
            name: "部门管理",
            code: "departments",
            description: "管理部门信息",

            children: [{
                id: "departments_view",
                name: "查看部门",
                code: "departments:view"
            }, {
                id: "departments_create",
                name: "新增部门",
                code: "departments:create"
            }, {
                id: "departments_edit",
                name: "编辑部门",
                code: "departments:edit"
            }, {
                id: "departments_delete",
                name: "删除部门",
                code: "departments:delete"
            }]
        }, {
            id: "roles",
            name: "角色管理",
            code: "roles",
            description: "管理角色和权限",

            children: [{
                id: "roles_view",
                name: "查看角色",
                code: "roles:view"
            }, {
                id: "roles_create",
                name: "新增角色",
                code: "roles:create"
            }, {
                id: "roles_edit",
                name: "编辑角色",
                code: "roles:edit"
            }, {
                id: "roles_delete",
                name: "删除角色",
                code: "roles:delete"
            }, {
                id: "roles_assign",
                name: "分配权限",
                code: "roles:assign"
            }]
        }, {
            id: "forms",
            name: "表单管理",
            code: "forms",
            description: "管理业务表单",

            children: [{
                id: "forms_view",
                name: "查看表单",
                code: "forms:view"
            }, {
                id: "forms_create",
                name: "创建表单",
                code: "forms:create"
            }, {
                id: "forms_submit",
                name: "提交表单",
                code: "forms:submit"
            }]
        }, {
            id: "processes",
            name: "流程管理",
            code: "processes",
            description: "管理审批流程",

            children: [{
                id: "processes_view",
                name: "查看流程",
                code: "processes:view"
            }, {
                id: "processes_approve",
                name: "审批流程",
                code: "processes:approve"
            }]
        }, {
            id: "logs",
            name: "日志管理",
            code: "logs",
            description: "查看系统日志",

            children: [{
                id: "logs_login",
                name: "登录日志",
                code: "logs:login"
            }, {
                id: "logs_operation",
                name: "操作日志",
                code: "logs:operation"
            }]
        }, {
            id: "settings",
            name: "系统设置",
            code: "settings",
            description: "配置系统参数"
        }];

        setPermissions(mockPermissions);
    }, []);

    useEffect(() => {
        const savedEmployees = localStorage.getItem("employees");

        if (savedEmployees) {
            setEmployees(JSON.parse(savedEmployees));
        }
    }, []);

    useEffect(() => {
        let result = [...roles];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();

            result = result.filter(
                role => role.name.toLowerCase().includes(term) || role.code.toLowerCase().includes(term) || role.description && role.description.toLowerCase().includes(term)
            );
        }

        setFilteredRoles(result);
        setTotalRoles(result.length);

        if (currentPage > 1) {
            setCurrentPage(1);
        }
    }, [roles, searchTerm]);

    const getCurrentPageRoles = () => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredRoles.slice(startIndex, startIndex + pageSize);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPageSize(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && showDepartmentDropdown) {
                setShowDepartmentDropdown(false);
                setDepartmentFilter(selectedDepartmentIds);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDepartmentDropdown, selectedDepartmentIds]);

    useEffect(() => {
        if (departmentFilter.length > 0) {
            const employeesInDepartments = employees.filter(emp => departmentFilter.includes(emp.departmentId));
            const employeeIds = employeesInDepartments.map(emp => emp.id);
            setAssignEmployees(prev => [...new Set([...prev, ...employeeIds])]);
        } else {
            setAssignEmployees([]);
        }
    }, [departmentFilter, employees]);

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRole(null);

        setFormData({
            name: "",
            code: "",
            description: "",
            permissions: []
        });

        setAssignEmployees([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (permissionId: string, checked: boolean) => {
        setFormData(prev => {
            const newPermissions = [...prev.permissions];

            if (checked) {
                if (!newPermissions.includes(permissionId)) {
                    newPermissions.push(permissionId);
                }

                const permission = findPermission(permissions, permissionId);

                if (permission && permission.children && permission.children.length > 0) {
                    permission.children.forEach(child => {
                        if (!newPermissions.includes(child.id)) {
                            newPermissions.push(child.id);
                        }
                    });
                }
            } else {
                const index = newPermissions.indexOf(permissionId);

                if (index !== -1) {
                    newPermissions.splice(index, 1);
                }

                const parentPermission = findParentPermission(permissions, permissionId);

                if (parentPermission) {
                    const hasChildPermissions = parentPermission.children?.some(child => newPermissions.includes(child.id));

                    if (!hasChildPermissions) {
                        const parentIndex = newPermissions.indexOf(parentPermission.id);

                        if (parentIndex !== -1) {
                            newPermissions.splice(parentIndex, 1);
                        }
                    }
                }
            }

            return {
                ...prev,
                permissions: newPermissions
            };
        });
    };

    const findPermission = (permissions: Permission[], id: string): Permission | null => {
        for (const permission of permissions) {
            if (permission.id === id) {
                return permission;
            }

            if (permission.children && permission.children.length > 0) {
                const found = findPermission(permission.children, id);

                if (found)
                    return found;
            }
        }

        return null;
    };

    const findParentPermission = (permissions: Permission[], childId: string): Permission | null => {
        for (const permission of permissions) {
            if (permission.children && permission.children.some(child => child.id === childId)) {
                return permission;
            }

            if (permission.children && permission.children.length > 0) {
                const found = findParentPermission(permission.children, childId);

                if (found)
                    return found;
            }
        }

        return null;
    };

    const isPermissionChecked = (permissionId: string): boolean => {
        return formData.permissions.includes(permissionId);
    };

    const isPermissionIndeterminate = (permissionId: string): boolean => {
        const permission = findPermission(permissions, permissionId);

        if (!permission || !permission.children || permission.children.length === 0) {
            return false;
        }

        const checkedCount = permission.children.filter(child => formData.permissions.includes(child.id)).length;
        return checkedCount > 0 && checkedCount < permission.children.length;
    };

    const handleEmployeeChange = (employeeId: string, checked: boolean) => {
        setAssignEmployees(prev => {
            if (checked) {
                return [...prev, employeeId];
            } else {
                return prev.filter(id => id !== employeeId);
            }
        });
    };

    const validateRoleForm = () => {
        if (!formData.name || !formData.code) {
            toast.error("请填写角色名称和编码");
            return false;
        }

        if (modalType === "add" || modalType === "edit" && selectedRole && formData.code !== selectedRole.code) {
            const codeExists = roles.some(role => role.code === formData.code);

            if (codeExists) {
                toast.error("角色编码已存在");
                return false;
            }
        }

        return true;
    };

    const saveRole = () => {
        if (!validateRoleForm()) {
            return;
        }

        const updatedRoles = [...roles];

        if (modalType === "add") {
            const newRole: Role = {
                id: Date.now().toString(),
                ...formData
            };

            updatedRoles.push(newRole);
            toast.success("角色添加成功");
        } else if ((modalType === "edit" || modalType === "permissions") && selectedRole) {
            const index = updatedRoles.findIndex(role => role.id === selectedRole.id);

            if (index !== -1) {
                updatedRoles[index] = {
                    ...selectedRole,
                    ...formData
                };

                if (modalType === "edit") {
                    toast.success("角色信息更新成功");
                } else {
                    toast.success("角色权限更新成功");
                }
            }
        }

        setRoles(updatedRoles);
        localStorage.setItem("roles", JSON.stringify(updatedRoles));
        closeModal();
    };

    const saveEmployeeRoles = () => {
        if (!selectedRole)
            return;

        employees.forEach(emp => {
            const hasRole = assignEmployees.includes(emp.id);
            const currentRoles = JSON.parse(localStorage.getItem(`employee_${emp.id}_roles`) || "[]");

            if (hasRole && !currentRoles.includes(selectedRole.id)) {
                localStorage.setItem(
                    `employee_${emp.id}_roles`,
                    JSON.stringify([...currentRoles, selectedRole.id])
                );
            } else if (!hasRole && currentRoles.includes(selectedRole.id)) {
                localStorage.setItem(
                    `employee_${emp.id}_roles`,
                    JSON.stringify(currentRoles.filter((id: string) => id !== selectedRole.id))
                );
            }
        });

        toast.success("员工角色分配成功");
        closeModal();
    };

    const deleteRole = (id: string) => {
        let hasAssignedEmployees = false;

        employees.forEach(emp => {
            const empRoles = JSON.parse(localStorage.getItem(`employee_${emp.id}_roles`) || "[]");

            if (empRoles.includes(id)) {
                hasAssignedEmployees = true;
            }
        });

        if (hasAssignedEmployees) {
            toast.error("无法删除已分配给员工的角色");
            return;
        }

        const updatedRoles = roles.filter(role => role.id !== id);
        setRoles(updatedRoles);
        localStorage.setItem("roles", JSON.stringify(updatedRoles));
        toast.success("角色已删除");
    };

    const renderPermissionTree = (permissions: Permission[], level = 0) => {
        return permissions.map(permission => <div key={permission.id} className="mb-2">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isPermissionChecked(permission.id)}
                    indeterminate={isPermissionIndeterminate(permission.id)}
                    onChange={e => handlePermissionChange(permission.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                <label className="ml-2 text-sm font-medium cursor-pointer">{permission.name}</label>
                <span className="ml-2 text-xs text-gray-500">{permission.code}</span>
            </div>
            {permission.description && <p className="ml-6 text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>}
            {permission.children && permission.children.length > 0 && <div
                className="ml-6 mt-1 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {renderPermissionTree(permission.children, level + 1)}
            </div>}
        </div>);
    };

    const openModal = (type: "add" | "edit" | "permissions" | "employees", role?: Role) => {
        setModalType(type);
        setIsModalOpen(true);

        if (role) {
            setSelectedRole(role);

            if (type === "edit") {
                setFormData({
                    name: role.name,
                    code: role.code,
                    description: role.description,
                    permissions: [...role.permissions]
                });
            } else if (type === "permissions") {
                setFormData({
                    name: role.name,
                    code: role.code,
                    description: role.description,
                    permissions: [...role.permissions]
                });
            } else if (type === "employees") {
                const savedDepartments = localStorage.getItem("departments");
                const departments = savedDepartments ? JSON.parse(savedDepartments) : [];

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
                setDepartments(departments);

                const assignedEmployees = employees.filter(emp => {
                    const empRoles = JSON.parse(localStorage.getItem(`employee_${emp.id}_roles`) || "[]");
                    return empRoles.includes(role.id);
                }).map(emp => emp.id);

                setAssignEmployees(assignedEmployees);
            }
        } else {
            setSelectedRole(null);

            setFormData({
                name: "",
                code: "",
                description: "",
                permissions: []
            });

            setAssignEmployees([]);
            setDepartments([]);
            setSelectedDepartmentId("");
            setDepartmentFilter([]);
        }
    };

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">角色与权限管理</h1>
                    <p className="text-gray-500 dark:text-gray-400">创建和管理角色，分配细粒度权限，实现RBAC权限控制
                                  </p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索角色名称或编码..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className={`input ${config.borderColor} pr-10 w-64`} />
                        <i
                            className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button onClick={() => openModal("add")} className="btn btn-primary">
                        <i className="fa-solid fa-plus"></i>
                        <span>新增角色</span>
                    </button>
                </div>
            </div>
            {}
            <div className={`card ${config.bgSecondary} p-0`}>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>角色名称</th>
                                <th>角色编码</th>
                                <th>描述</th>
                                <th>权限数量</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageRoles().map(role => <tr
                                key={role.id}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <td>{role.name}</td>
                                <td>{role.code}</td>
                                <td className="max-w-xs truncate">{role.description || "-"}</td>
                                <td>{role.permissions.length}</td>
                                <td>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal("edit", role)}
                                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                                            title="编辑">
                                            <i className="fa-solid fa-pencil"></i>
                                        </button>
                                        <button
                                            onClick={() => openModal("permissions", role)}
                                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 p-1"
                                            title="权限配置">
                                            <i className="fa-solid fa-key"></i>
                                        </button>
                                        <button
                                            onClick={() => openModal("employees", role)}
                                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                                            title="分配用户">
                                            <i className="fa-solid fa-user-plus"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setItemToDelete(role.id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                                            title="删除">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>)}
                            {getCurrentPageRoles().length === 0 && <tr>
                                <td colSpan={5} className="text-center py-12">
                                    <i
                                        className="fa-solid fa-user-tag text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                                    <p className="text-gray-500 dark:text-gray-400">未找到匹配的角色</p>
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
                <div
                    className={`card ${config.bgSecondary} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {modalType === "add" && "新增角色"}
                                {modalType === "edit" && "编辑角色"}
                                {modalType === "permissions" && `配置 "${selectedRole?.name}" 权限`}
                                {modalType === "employees" && `分配 "${selectedRole?.name}" 角色`}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        {modalType === "add" || modalType === "edit" ? <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">角色名称 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入角色名称" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">角色编码 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入角色编码（英文/数字）"
                                    disabled={modalType === "edit"} />
                                {modalType === "edit" && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">角色编码不可修改</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">角色描述</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor} min-h-[100px]`}
                                    placeholder="请输入角色描述信息"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">取消
                                                        </button>
                                <button type="button" onClick={saveRole} className="btn btn-primary">保存
                                                        </button>
                            </div>
                        </form> : modalType === "permissions" ? <div className="space-y-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="font-medium mb-2">{selectedRole?.name}({selectedRole?.code})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedRole?.description || "无描述"}</p>
                            </div>
                            <div>
                                <h3 className="font-medium mb-4">权限配置</h3>
                                <div className="border rounded-lg p-4 max-h-[400px] overflow-y-auto">
                                    {renderPermissionTree(permissions)}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">取消
                                                        </button>
                                <button type="button" onClick={saveRole} className="btn btn-primary">保存权限
                                                        </button>
                            </div>
                        </div> : <div className="space-y-4" ref={dropdownRef}>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="font-medium mb-2">{selectedRole?.name}({selectedRole?.code})</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedRole?.description || "无描述"}</p>
                            </div>
                            <div>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">部门筛选</label>
                                    <div
                                        className={`relative ${config.borderColor} border rounded-lg p-2 bg-white dark:bg-gray-800`}>
                                        <input
                                            type="text"
                                            placeholder="选择部门"
                                            onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                                            className="w-full focus:outline-none"
                                            readOnly
                                            value={selectedDepartmentIds.length > 0 ? selectedDepartmentIds.map(id => getDepartmentName(id)).join(", ") : ""} />
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
                                                        checked={selectedDepartmentIds.length > 0 && selectedDepartmentIds.length === allDepartmentIds.length && allDepartmentIds.length > 0}
                                                        indeterminate={selectedDepartmentIds.length > 0 && selectedDepartmentIds.length < allDepartmentIds.length}
                                                        onChange={e => {
                                                            if (e.target.checked) {
                                                                setSelectedDepartmentIds(allDepartmentIds);
                                                            } else {
                                                                setSelectedDepartmentIds([]);
                                                            }
                                                        }}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                    <span className="ml-2">全选</span>
                                                </label>
                                                {renderDepartmentCheckboxes(departments)}
                                            </div>
                                        </div>}
                                    </div>
                                    {}
                                </div>
                                {}
                                <div className="border rounded-lg max-h-[400px] overflow-y-auto mt-4">
                                    {departmentFilter.length > 0 ? <div className="divide-y">
                                        {employees.filter(emp => departmentFilter.includes(emp.departmentId)).map(emp => <div
                                            key={emp.id}
                                            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={assignEmployees.includes(emp.id)}
                                                onChange={e => handleEmployeeChange(emp.id, e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                            <div className="ml-3">
                                                <div className="font-medium">{emp.realName}</div>
                                                <div className="text-sm text-gray-500">{emp.username}- {getDepartmentName(emp.departmentId)}</div>
                                            </div>
                                        </div>)}
                                    </div> : null}
                                    {departmentFilter.length > 0 && employees.filter(emp => departmentFilter.includes(emp.departmentId)).length === 0 && <div className="text-center py-12">
                                        <i
                                            className="fa-solid fa-info-circle text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                                    </div>}
                                </div>
                                {}
                                <div className="border rounded-lg max-h-[400px] overflow-y-auto">
                                    {departmentFilter.length > 0 && departments.length > 0 ? <div>
                                        {departments.map(dept => {
                                            const isDeptSelected = departmentFilter.includes(dept.id);
                                            const deptEmployees = employees.filter(emp => emp.departmentId === dept.id);

                                            if ((departmentFilter.length === 0 || isDeptSelected) && deptEmployees.length > 0) {
                                                return (
                                                    <div key={dept.id} className="mb-4">
                                                        <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800">
                                                            <input
                                                                type="checkbox"
                                                                checked={assignEmployees.filter(id => deptEmployees.some(emp => emp.id === id)).length === deptEmployees.length && deptEmployees.length > 0}
                                                                indeterminate={deptEmployees.some(emp => assignEmployees.includes(emp.id)) && !(assignEmployees.filter(id => deptEmployees.some(emp => emp.id === id)).length === deptEmployees.length)}
                                                                onChange={e => {
                                                                    if (e.target.checked) {
                                                                        const newAssignments = [...assignEmployees];

                                                                        deptEmployees.forEach(emp => {
                                                                            if (!newAssignments.includes(emp.id)) {
                                                                                newAssignments.push(emp.id);
                                                                            }
                                                                        });

                                                                        setAssignEmployees(newAssignments);
                                                                    } else {
                                                                        setAssignEmployees(prev => prev.filter(id => !deptEmployees.some(emp => emp.id === id)));
                                                                    }
                                                                }}
                                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                            <label className="ml-2 font-medium">{dept.name}</label>
                                                            <span className="ml-2 text-sm text-gray-500">({deptEmployees.length}人)</span>
                                                        </div>
                                                        <div className="pl-6 divide-y">
                                                            {deptEmployees.map(
                                                                emp => <div key={emp.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                    <label className="flex items-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={assignEmployees.includes(emp.id)}
                                                                            onChange={e => handleEmployeeChange(emp.id, e.target.checked)}
                                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                                                        <div className="ml-3">
                                                                            <div className="font-medium">{emp.realName}</div>
                                                                            <div className="text-sm text-gray-500">{emp.username}</div>
                                                                        </div>
                                                                    </label>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            return null;
                                        })}
                                    </div> : <div className="text-center py-12">
                                        <i
                                            className="fa-solid fa-info-circle text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                                        <p className="text-gray-500 dark:text-gray-400">请先选择部门</p>
                                    </div>}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">取消
                                                        </button>
                                <button type="button" onClick={saveEmployeeRoles} className="btn btn-primary">保存分配
                                                        </button>
                            </div>
                        </div>}
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default RoleManagement;