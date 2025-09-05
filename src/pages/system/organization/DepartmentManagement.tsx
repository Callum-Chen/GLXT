/* 
 * 部门管理页面
 * 提供企业组织架构和部门管理功能
 * 支持部门层级调整和部门信息维护
 */
import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/themeContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// 部门数据模型
interface Department {
  id: string;
  name: string;
  code: string;
  englishName?: string;
  sortOrder: number;
  parentId?: string;
  children?: Department[];
}

// 模拟部门数据
const mockDepartments: Department[] = [
  {
    id: '1',
    name: '总公司',
    code: 'HQ',
    englishName: 'Headquarters',
    sortOrder: 1,
    children: [
      {
        id: '2',
        name: '技术部',
        code: 'TECH',
        englishName: 'Technology',
        sortOrder: 1,
        parentId: '1',
        children: [
          {
            id: '3',
            name: '前端团队',
            code: 'FRONTEND',
            sortOrder: 1,
            parentId: '2'
          },
          {
            id: '4',
            name: '后端团队',
            code: 'BACKEND',
            sortOrder: 2,
            parentId: '2'
          },
          {
            id: '5',
            name: '测试团队',
            code: 'TEST',
            sortOrder: 3,
            parentId: '2'
          }
        ]
      },
      {
        id: '6',
        name: '市场部',
        code: 'MARKETING',
        englishName: 'Marketing',
        sortOrder: 2,
        parentId: '1'
      },
      {
        id: '7',
        name: '人力资源部',
        code: 'HR',
        englishName: 'Human Resources',
        sortOrder: 3,
        parentId: '1'
      },
      {
        id: '8',
        name: '财务部',
        code: 'FINANCE',
        englishName: 'Finance',
        sortOrder: 4,
        parentId: '1'
      }
    ]
  }
];

// 部门表单数据
interface DepartmentFormData extends Omit<Department, 'id' | 'children' | 'parentId'> {
  parentId?: string;
}

const DepartmentManagement = () => {
  const { config } = useContext(ThemeContext);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['1']);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    englishName: '',
    sortOrder: 1
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (deptToDelete) {
      deleteDepartment(deptToDelete);
      setShowDeleteModal(false);
      setDeptToDelete(null);
    }
  };

  // 处理删除取消
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeptToDelete(null);
  };

  // 初始化部门数据
  useEffect(() => {
    // 从本地存储获取部门数据，如果没有则使用模拟数据
    const savedDepartments = localStorage.getItem('departments');
    if (savedDepartments) {
      setDepartments(JSON.parse(savedDepartments));
      setFilteredDepartments(JSON.parse(savedDepartments));
    } else {
      setDepartments(mockDepartments);
      setFilteredDepartments(mockDepartments);
      localStorage.setItem('departments', JSON.stringify(mockDepartments));
    }
  }, []);

  // 搜索部门
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDepartments(departments);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const filterDepartment = (depts: Department[]): Department[] => {
      return depts.reduce((result, dept) => {
        // 检查当前部门是否匹配搜索条件
        const matches = dept.name.toLowerCase().includes(term) || 
                        dept.code.toLowerCase().includes(term) ||
                        (dept.englishName && dept.englishName.toLowerCase().includes(term));
        
        // 递归检查子部门
        const filteredChildren = filterDepartment(dept.children || []);
        
        // 如果当前部门匹配或有匹配的子部门，添加到结果中
        if (matches || filteredChildren.length > 0) {
          result.push({
            ...dept,
            children: filteredChildren,
            // 如果有匹配的子部门，自动展开该节点
            ...(filteredChildren.length > 0 && !expandedKeys.includes(dept.id) 
              ? { expanded: true } 
              : {})
          });
          
          // 如果有匹配的子部门，将当前部门ID添加到展开的节点中
          if (filteredChildren.length > 0 && !expandedKeys.includes(dept.id)) {
            setExpandedKeys(prev => [...prev, dept.id]);
          }
        }
        
        return result;
      }, [] as Department[]);
    };
    
    setFilteredDepartments(filterDepartment(departments));
  }, [searchTerm, departments, expandedKeys]);

  // 处理节点展开/折叠
  const handleToggleExpand = (id: string) => {
    setExpandedKeys(prev => 
      prev.includes(id) 
        ? prev.filter(key => key !== id) 
        : [...prev, id]
    );
  };

  // 处理部门选择
  const handleSelectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
  };

  // 打开添加/编辑模态框
  const openModal = (type: 'add' | 'edit', dept?: Department) => {
    setModalType(type);
    setIsModalOpen(true);
    
    if (type === 'edit' && dept) {
      setSelectedDepartment(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        englishName: dept.englishName || '',
        sortOrder: dept.sortOrder,
        parentId: dept.parentId
      });
    } else {
      setFormData({
        name: '',
        code: '',
        englishName: '',
        sortOrder: 1,
        parentId: selectedDepartment?.id
      });
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      name: '',
      code: '',
      englishName: '',
      sortOrder: 1
    });
  };

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value, 10) : value
    }));
  };

  // 保存部门数据
  const saveDepartment = () => {
    if (!formData.name || !formData.code) {
      toast.error('部门名称和编码为必填项');
      return;
    }

    const updatedDepartments = [...departments];
    
     if (modalType === 'add') {
       // 添加新部门
       const newDept: Department = {
         id: Date.now().toString(),
         ...formData,
         children: []
       };
       
       if (formData.parentId) {
         // 添加到指定父部门
         addDepartmentToParent(updatedDepartments, newDept);
       } else {
         // 添加为顶级部门
         updatedDepartments.push(newDept);
       }
       
       toast.success('部门添加成功');
     } else if (modalType === 'edit' && selectedDepartment) {
       // 编辑现有部门
       const updatedDept = {
         ...selectedDepartment,
         ...formData
       };
       
       // 检查父部门是否变更
       if (updatedDept.parentId !== selectedDepartment.parentId) {
         // 从原父部门移除
         removeDepartmentFromParent(updatedDepartments, selectedDepartment.id);
         
         // 添加到新父部门
         if (updatedDept.parentId) {
           addDepartmentToParent(updatedDepartments, updatedDept);
         } else {
           // 添加为顶级部门
           updatedDepartments.push(updatedDept);
         }
       } else {
         // 更新部门信息
         updateDepartment(updatedDepartments, updatedDept);
       }
       
       toast.success('部门更新成功');
     }
    
    // 保存到本地存储
    setDepartments(updatedDepartments);
    localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    closeModal();
  };

  // 递归添加部门到父部门
  const addDepartmentToParent = (depts: Department[], newDept: Department) => {
    for (let i = 0; i < depts.length; i++) {
      if (depts[i].id === newDept.parentId) {
        if (!depts[i].children) {
          depts[i].children = [];
        }
        depts[i].children.push(newDept);
        // 按排序号排序
        depts[i].children.sort((a, b) => a.sortOrder - b.sortOrder);
        return true;
      }
      
      if (depts[i].children && depts[i].children.length > 0) {
        if (addDepartmentToParent(depts[i].children, newDept)) {
          return true;
        }
      }
    }
    return false;
  };

  // 递归更新部门
  const updateDepartment = (depts: Department[], updatedDept: Department) => {
    for (let i = 0; i < depts.length; i++) {
      if (depts[i].id === updatedDept.id) {
        depts[i] = { ...depts[i], ...updatedDept };
        return true;
      }
      
      if (depts[i].children && depts[i].children.length > 0) {
        if (updateDepartment(depts[i].children, updatedDept)) {
          return true;
        }
      }
    }
    return false;
  };

  // 删除部门
  const deleteDepartment = (id: string) => {
    // 检查是否有子部门
    const hasChildren = checkForChildren(departments, id);
    if (hasChildren) {
      toast.error('无法删除包含子部门的部门');
      return;
    }
    
    // 检查是否有关联员工
    const hasEmployees = checkForEmployees(id);
    if (hasEmployees) {
      toast.error('无法删除关联了员工的部门');
      return;
    }
    
    // 执行删除
    const updatedDepartments = removeDepartment(departments, id);
    setDepartments(updatedDepartments);
    localStorage.setItem('departments', JSON.stringify(updatedDepartments));
    setSelectedDepartment(null);
    toast.success('部门删除成功');
  };

  // 递归检查是否有子部门
  const checkForChildren = (depts: Department[], id: string): boolean => {
    for (const dept of depts) {
      if (dept.id === id) {
        return !!(dept.children && dept.children.length > 0);
      }
      
      if (dept.children && dept.children.length > 0) {
        const result = checkForChildren(dept.children, id);
        if (result) return true;
      }
    }
    return false;
  };

  // 检查是否有关联员工
  const checkForEmployees = (deptId: string): boolean => {
    // 在实际应用中，这里应该检查员工数据
    // 这里使用模拟检查
    const mockEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
    return mockEmployees.some((emp: any) => emp.departmentId === deptId);
  };

  // 递归删除部门
   const removeDepartment = (depts: Department[], id: string): Department[] => {
     return depts.filter(dept => {
       if (dept.id === id) {
         return false;
       }
       
       if (dept.children && dept.children.length > 0) {
         dept.children = removeDepartment(dept.children, id);
       }
       
       return true;
     });
   };

   // 从父部门中移除指定部门
   const removeDepartmentFromParent = (depts: Department[], id: string) => {
     for (let i = 0; i < depts.length; i++) {
       if (depts[i].children && depts[i].children.some(child => child.id === id)) {
         depts[i].children = depts[i].children.filter(child => child.id !== id);
         return true;
       }
       
       if (depts[i].children && depts[i].children.length > 0) {
         if (removeDepartmentFromParent(depts[i].children, id)) {
           return true;
         }
       }
     }
     return false;
   };

  // 处理拖拽开始
  const handleDragStart = (id: string) => {
    setDraggingNode(id);
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    if (draggingNode && dropTarget && draggingNode !== dropTarget) {
      // 执行拖拽后的部门移动
      const updatedDepartments = [...departments];
      const draggedDept = findDepartment(updatedDepartments, draggingNode);
      
      if (draggedDept) {
        // 从原位置移除
        const deptsWithoutDragged = removeDepartment(updatedDepartments, draggingNode);
        
        // 添加到新位置
        draggedDept.parentId = dropTarget;
        addDepartmentToParent(deptsWithoutDragged, draggedDept);
        
        // 更新状态
        setDepartments(deptsWithoutDragged);
        localStorage.setItem('departments', JSON.stringify(deptsWithoutDragged));
        toast.success('部门位置已更新');
      }
    }
    
    setDraggingNode(null);
    setDropTarget(null);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    
    // 不能拖到自己下面
    if (draggingNode !== id) {
      setDropTarget(id);
    }
  };

  // 查找部门
  const findDepartment = (depts: Department[], id: string): Department | null => {
    for (const dept of depts) {
      if (dept.id === id) {
        return dept;
      }
      
      if (dept.children && dept.children.length > 0) {
        const found = findDepartment(dept.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 渲染部门树节点
   const renderTreeNodes = (nodes: Department[], level = 0) => {
    // 按sortOrder排序节点
    const sortedNodes = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);
    
    return sortedNodes.map(node => (
       <li key={node.id} className="mb-1">
        <div 
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${
            selectedDepartment?.id === node.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          } ${draggingNode === node.id ? 'opacity-50' : ''} ${dropTarget === node.id ? 'border-2 border-dashed border-blue-500' : ''}`}
          onClick={(e) => {
            // 只有点击非按钮区域才触发选择
            if (!e.target.closest('.action-buttons')) {
              handleSelectDepartment(node);
            }
          }}
          draggable
          onDragStart={() => handleDragStart(node.id)}
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragEnd={handleDragEnd}
        >
          {/* 缩进 */}
          <div style={{ width: `${level * 20}px` }}></div>
          
          {/* 展开/折叠按钮 */}
          {node.children && node.children.length > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setExpandedKeys(prev => 
                  prev.includes(node.id) 
                    ? prev.filter(key => key !== node.id) 
                    : [...prev, node.id]
                );
              }}
              className="mr-2 text-gray-500"
            >
              {expandedKeys.includes(node.id) ? (
                <i className="fa-solid fa-chevron-down text-xs"></i>
              ) : (
                <i className="fa-solid fa-chevron-right text-xs"></i>
              )}
            </button>
          )}
          
          {/* 部门图标 */}
          <i className="fa-solid fa-building-o mr-2 text-gray-500"></i>
          
          {/* 部门信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-medium truncate">{node.name}</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {node.code}
              </span>
            </div>
            {node.englishName && (
              <div className="text-xs text-gray-500 truncate">{node.englishName}</div>
            )}
          </div>
          
          {/* 操作按钮 */}
          <div className="ml-4 flex items-center gap-2 action-buttons">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openModal('edit', node);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="编辑部门"
            >
              <i className="fa-solid fa-pencil text-sm"></i>
            </button>
            <button 
               onClick={(e) => {
                 e.stopPropagation();
                 setDeptToDelete(node.id);
                 setShowDeleteModal(true);
               }}
              className="p-1.5 text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="删除部门"
            >
              <i className="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        
        {/* 子部门 */}
        {node.children && node.children.length > 0 && expandedKeys.includes(node.id) && (
          <ul className="mt-1">
            {renderTreeNodes(node.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">部门管理</h1>
          <p className="text-gray-500 dark:text-gray-400">
            管理公司组织架构，维护部门信息和层级关系
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="搜索部门名称或编码..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`input ${config.borderColor} pr-10 w-64`}
            />
            <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          
          <button 
            onClick={() => openModal('add')}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-plus"></i>
            <span>新增部门</span>
          </button>
        </div>
      </div>
      
      {/* Department tree */}
      <div className={`card ${config.bgSecondary} p-6`}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">组织架构</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            拖拽部门可调整层级关系，点击部门可查看详情
          </p>
        </div>
        
        {filteredDepartments.length > 0 ? (
          <ul className="tree-container">
            {renderTreeNodes(filteredDepartments)}
          </ul>
        ) : (
          <div className="text-center py-12">
            <i className="fa-solid fa-search text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
            <p className="text-gray-500 dark:text-gray-400">未找到匹配的部门</p>
          </div>
        )}
      </div>
      
      {/* Selected department details */}
      {selectedDepartment && (
        <div className={`card ${config.bgSecondary} p-6`}>
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">部门详情</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => openModal('add', selectedDepartment)}
                className="btn btn-primary"
              >
                <i className="fa-solid fa-plus"></i>
                <span>新增子部门</span>
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">基本信息</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">部门名称</p>
                  <p className="font-medium">{selectedDepartment.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">部门编码</p>
                  <p className="font-medium">{selectedDepartment.code}</p>
                </div>
                {selectedDepartment.englishName && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">英文名称</p>
                    <p className="font-medium">{selectedDepartment.englishName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">排序号</p>
                  <p className="font-medium">{selectedDepartment.sortOrder}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">层级关系</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">上级部门</p>
                  <p className="font-medium">
                    {selectedDepartment.parentId 
                      ? findDepartmentName(departments, selectedDepartment.parentId) 
                      : '无'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">子部门数量</p>
                  <p className="font-medium">
                    {selectedDepartment.children?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">员工数量</p>
                  <p className="font-medium">
                    {/* 在实际应用中，这里应该显示真实员工数量 */}
                    {Math.floor(Math.random() * 20) + 1}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add/edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`card ${config.bgSecondary} w-full max-w-md`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {modalType === 'add' ? '新增部门' : '编辑部门'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">部门名称 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`input ${config.borderColor}`}
                    placeholder="请输入部门名称"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">部门编码 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className={`input ${config.borderColor}`}
                    placeholder="请输入部门编码"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">英文名称</label>
                  <input
                    type="text"
                    name="englishName"
                    value={formData.englishName}
                    onChange={handleInputChange}
                    className={`input ${config.borderColor}`}
                    placeholder="请输入英文名称（可选）"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">排序号</label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    className={`input ${config.borderColor}`}
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">上级部门</label>
                  <select
                    name="parentId"
                    value={formData.parentId || ''}
                    onChange={handleInputChange}
                    className={`input ${config.borderColor}`}
                  >
                    <option value="">-- 无上级部门 --</option>
                    {renderDepartmentOptions(departments)}
                  </select>
                </div>
              </form>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={closeModal}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button 
                  onClick={saveDepartment}
                  className="btn btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className={`card ${config.bgSecondary} w-full max-w-md mx-auto my-8 shadow-xl transform transition-all duration-300 scale-100`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">确认删除</h2>
                <button 
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mx-auto mb-4">
                  <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  确定要删除这个部门吗？此操作不可撤销。
                </p>
                
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleDeleteCancel}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                  <button 
                    onClick={handleDeleteConfirm}
                    className="btn btn-danger"
                  >
                    <i className="fa-solid fa-trash"></i>
                    <span>确认删除</span>
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

// 递归查找部门名称
function findDepartmentName(depts: Department[], id: string): string {
  for (const dept of depts) {
    if (dept.id === id) {
      return dept.name;
    }
    
    if (dept.children && dept.children.length > 0) {
      const name = findDepartmentName(dept.children, id);
      if (name) return name;
    }
  }
  return '未知部门';
}

// 递归渲染部门选择下拉框选项
function renderDepartmentOptions(depts: Department[], level = 0): React.ReactElement[] {
  const options: React.ReactElement[] = [];
  
  depts.forEach(dept => {
    options.push(
      <option key={dept.id} value={dept.id}>
        {level > 0 ? '└' + '─'.repeat(level) : ''} {dept.name}
      </option>
    );
    
    if (dept.children && dept.children.length > 0) {
      options.push(...renderDepartmentOptions(dept.children, level + 1));
    }
  });
  
   return options;
 }

export default DepartmentManagement;