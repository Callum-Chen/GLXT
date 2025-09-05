/* 
 * 字典管理页面
 * 提供系统字典数据的管理功能
 * 支持字典分类和字典项的增删改查操作
 */
import { useState, useEffect, useContext, useRef } from 'react';
import { ThemeContext } from '@/contexts/themeContext';
import { AuthContext } from '@/contexts/authContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

// 字典分类接口
interface DictionaryCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  sortOrder: number;
  children?: DictionaryCategory[];
}

// 字典项接口
interface DictionaryItem {
  id: string;
  categoryId: string;
  name: string;
  englishName?: string;
  code: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  remarks?: string;
}

// 分类表单数据
interface CategoryFormData {
  name: string;
  code: string;
  parentId?: string;
  sortOrder: number;
}

// 字典项表单数据
interface ItemFormData {
  name: string;
  englishName?: string;
  code: string;
  sortOrder: number;
  status: 'active' | 'inactive';
  remarks?: string;
}

const DictionaryManagement = () => {
  const { config } = useContext(ThemeContext);
  const { isAuthenticated } = useContext(AuthContext);
  const [categories, setCategories] = useState<DictionaryCategory[]>([]);
  const [items, setItems] = useState<DictionaryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DictionaryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DictionaryCategory | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category-add' | 'category-edit' | 'item-add' | 'item-edit'>('category-add');
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    code: '',
    sortOrder: 1
  });
  const [itemFormData, setItemFormData] = useState<ItemFormData>({
    name: '',
    englishName: '',
    code: '',
    sortOrder: 1,
    status: 'active',
    remarks: ''
  });
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState<'category' | 'item'>('category');
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查是否为管理员
  const isAdmin = () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role === 'admin';
    }
    return false;
  };

  // 初始化数据
  useEffect(() => {
    if (!isAuthenticated || !isAdmin()) {
      return;
    }
    
    // 加载字典分类
    const savedCategories = localStorage.getItem('dictionaryCategories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
      setExpandedKeys(JSON.parse(savedCategories).map((cat: DictionaryCategory) => cat.id));
    } else {
      // 初始化默认分类
      const defaultCategories: DictionaryCategory[] = [
        {
          id: '1',
          name: '系统基础',
          code: 'SYSTEM',
          sortOrder: 1,
          children: [
            { id: '1-1', name: '用户状态', code: 'USER_STATUS', sortOrder: 1, parentId: '1' },
            { id: '1-2', name: '数据状态', code: 'DATA_STATUS', sortOrder: 2, parentId: '1' }
          ]
        },
        {
          id: '2',
          name: '业务字典',
          code: 'BUSINESS',
          sortOrder: 2,
          children: [
            { id: '2-1', name: '订单状态', code: 'ORDER_STATUS', sortOrder: 1, parentId: '2' },
            { id: '2-2', name: '支付方式', code: 'PAYMENT_METHOD', sortOrder: 2, parentId: '2' }
          ]
        }
      ];
      setCategories(defaultCategories);
      setExpandedKeys(defaultCategories.map(cat => cat.id));
      localStorage.setItem('dictionaryCategories', JSON.stringify(defaultCategories));
    }
    
    // 加载字典项
    const savedItems = localStorage.getItem('dictionaryItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      // 初始化默认字典项
      const defaultItems: DictionaryItem[] = [
        { id: '1', categoryId: '1-1', name: '启用', englishName: 'Active', code: 'ACTIVE', sortOrder: 1, status: 'active', remarks: '用户账号启用状态' },
        { id: '2', categoryId: '1-1', name: '禁用', englishName: 'Inactive', code: 'INACTIVE', sortOrder: 2, status: 'active', remarks: '用户账号禁用状态' },
        { id: '3', categoryId: '1-2', name: '草稿', englishName: 'Draft', code: 'DRAFT', sortOrder: 1, status: 'active' },
        { id: '4', categoryId: '1-2', name: '已提交', englishName: 'Submitted', code: 'SUBMITTED', sortOrder: 2, status: 'active' },
        { id: '5', categoryId: '1-2', name: '已审核', englishName: 'Approved', code: 'APPROVED', sortOrder: 3, status: 'active' },
        { id: '6', categoryId: '1-2', name: '已拒绝', englishName: 'Rejected', code: 'REJECTED', sortOrder: 4, status: 'active' },
        { id: '7', categoryId: '1-3', name: '钉钉Webhook', englishName: 'DingTalk Webhook', code: 'DINGTALK_WEBHOOK', sortOrder: 1, status: 'active', remarks: '用于配置钉钉机器人Webhook地址' },
        { id: '8', categoryId: '1-3', name: '企业微信Webhook', englishName: 'WeChat Work Webhook', code: 'WECHAT_WORK_WEBHOOK', sortOrder: 2, status: 'active', remarks: '用于配置企业微信机器人Webhook地址' },
        { id: '9', categoryId: '1-3', name: '飞书Webhook', englishName: 'Feishu Webhook', code: 'FEISHU_WEBHOOK', sortOrder: 3, status: 'active', remarks: '用于配置飞书机器人Webhook地址' }
      ];
      setItems(defaultItems);
      localStorage.setItem('dictionaryItems', JSON.stringify(defaultItems));
    }
  }, [isAuthenticated]);

  // 当选择分类变化时过滤字典项
  useEffect(() => {
    if (selectedCategory) {
      const filtered = items.filter(item => item.categoryId === selectedCategory.id);
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  }, [selectedCategory, items]);

  // 搜索过滤
  useEffect(() => {
    if (!selectedCategory) return;
    
    let result = items.filter(item => item.categoryId === selectedCategory.id);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.code.toLowerCase().includes(term) ||
        (item.englishName && item.englishName.toLowerCase().includes(term)) ||
        (item.remarks && item.remarks.toLowerCase().includes(term))
      );
    }
    
    setFilteredItems(result);
  }, [searchTerm, selectedCategory, items]);

  // 递归查找分类
  const findCategory = (categories: DictionaryCategory[], id: string): DictionaryCategory | null => {
    for (const category of categories) {
      if (category.id === id) {
        return category;
      }
      if (category.children && category.children.length > 0) {
        const found = findCategory(category.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 处理分类选择
  const handleCategorySelect = (category: DictionaryCategory) => {
    setSelectedCategory(category);
    setSelectedItem(null);
  };

  // 处理分类展开/折叠
  const handleToggleExpand = (id: string) => {
    setExpandedKeys(prev => 
      prev.includes(id) ? prev.filter(key => key !== id) : [...prev, id]
    );
  };

  // 打开模态框
  const openModal = (type: typeof modalType, data?: any) => {
    setModalType(type);
    setIsModalOpen(true);
    
    if (type === 'category-add') {
      setCategoryFormData({
        name: '',
        code: '',
        parentId: selectedCategory?.id,
        sortOrder: 1
      });
    } else if (type === 'category-edit' && data) {
      setCategoryFormData({
        name: data.name,
        code: data.code,
        parentId: data.parentId,
        sortOrder: data.sortOrder
      });
      setSelectedCategory(data);
    } else if (type === 'item-add' && selectedCategory) {
      setItemFormData({
        name: '',
        englishName: '',
        code: '',
        sortOrder: 1,
        status: 'active',
        remarks: ''
      });
    } else if (type === 'item-edit' && data) {
      setItemFormData({
        name: data.name,
        englishName: data.englishName,
        code: data.code,
        sortOrder: data.sortOrder,
        status: data.status,
        remarks: data.remarks
      });
      setSelectedItem(data);
    }
  };

  // 关闭模态框
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // 处理分类表单变化
  const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value, 10) : value
    }));
  };

  // 处理字典项表单变化
  const handleItemInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setItemFormData(prev => ({
      ...prev,
      [name]: name === 'sortOrder' ? parseInt(value, 10) : value
    }));
  };

  // 保存分类
  const saveCategory = () => {
    if (!categoryFormData.name || !categoryFormData.code) {
      toast.error('分类名称和编码为必填项');
      return;
    }

    // 检查编码唯一性
    const isCodeUnique = (categories: DictionaryCategory[], code: string, excludeId?: string): boolean => {
      for (const cat of categories) {
        if (cat.code === code && cat.id !== excludeId) return false;
        if (cat.children && cat.children.length > 0) {
          if (!isCodeUnique(cat.children, code, excludeId)) return false;
        }
      }
      return true;
    };

    if (!isCodeUnique(categories, categoryFormData.code, modalType === 'category-edit' ? selectedCategory?.id : undefined)) {
      toast.error('分类编码已存在');
      return;
    }

    const updatedCategories = [...categories];
    
    if (modalType === 'category-add') {
      // 添加新分类
      const newCategory: DictionaryCategory = {
        id: Date.now().toString(),
        ...categoryFormData,
        children: []
      };
      
      if (categoryFormData.parentId) {
        // 添加到父分类
        const addToParent = (cats: DictionaryCategory[]): DictionaryCategory[] => {
          return cats.map(cat => {
            if (cat.id === categoryFormData.parentId) {
              return {
                ...cat,
                children: cat.children ? [...cat.children, newCategory] : [newCategory]
              };
            }
            if (cat.children && cat.children.length > 0) {
              return {
                ...cat,
                children: addToParent(cat.children)
              };
            }
            return cat;
          });
        };
        
        setCategories(addToParent(updatedCategories));
        toast.success('分类添加成功');
      } else {
        // 添加为顶级分类
        updatedCategories.push(newCategory);
        setCategories(updatedCategories);
        toast.success('分类添加成功');
      }
    } else if (modalType === 'category-edit' && selectedCategory) {
      // 编辑分类
      const updateCategory = (cats: DictionaryCategory[]): DictionaryCategory[] => {
        return cats.map(cat => {
          if (cat.id === selectedCategory.id) {
            return {
              ...cat,
              ...categoryFormData
            };
          }
          if (cat.children && cat.children.length > 0) {
            return {
              ...cat,
              children: updateCategory(cat.children)
            };
          }
          return cat;
        });
      };
      
      setCategories(updateCategory(updatedCategories));
      toast.success('分类更新成功');
    }
    
    // 保存到本地存储
    const finalCategories = modalType === 'category-add' && categoryFormData.parentId 
      ? addToParent(updatedCategories) 
      : updatedCategories;
      
    localStorage.setItem('dictionaryCategories', JSON.stringify(
      modalType === 'category-add' && !categoryFormData.parentId 
        ? updatedCategories 
        : finalCategories
    ));
    
    closeModal();
  };

  // 添加到父分类的辅助函数
  const addToParent = (categories: DictionaryCategory[]): DictionaryCategory[] => {
    return categories.map(cat => {
      if (cat.id === categoryFormData.parentId) {
        return {
          ...cat,
          children: cat.children ? [...cat.children, {
            id: Date.now().toString(),
            ...categoryFormData,
            children: []
          }] : [{
            id: Date.now().toString(),
            ...categoryFormData,
            children: []
          }]
        };
      }
      if (cat.children && cat.children.length > 0) {
        return {
          ...cat,
          children: addToParent(cat.children)
        };
      }
      return cat;
    });
  };

  // 保存字典项
  const saveItem = () => {
    if (!itemFormData.name || !itemFormData.code) {
      toast.error('字典项名称和编码为必填项');
      return;
    }

    // 检查编码唯一性
    const isCodeUnique = items.every(item => 
      item.id === (selectedItem?.id || '') || 
      item.categoryId !== selectedCategory?.id || 
      item.code.toLowerCase() !== itemFormData.code.toLowerCase()
    );

    if (!isCodeUnique) {
      toast.error('字典项编码在当前分类下已存在');
      return;
    }

    const updatedItems = [...items];
    
    if (modalType === 'item-add' && selectedCategory) {
      // 添加新字典项
      const newItem: DictionaryItem = {
        id: Date.now().toString(),
        categoryId: selectedCategory.id,
        ...itemFormData
      };
      updatedItems.push(newItem);
      toast.success('字典项添加成功');
    } else if (modalType === 'item-edit' && selectedItem) {
      // 编辑字典项
      const index = updatedItems.findIndex(item => item.id === selectedItem.id);
      if (index !== -1) {
        updatedItems[index] = {
          ...selectedItem,
          ...itemFormData
        };
        toast.success('字典项更新成功');
      }
    }
    
    setItems(updatedItems);
    localStorage.setItem('dictionaryItems', JSON.stringify(updatedItems));
    closeModal();
  };

  // 准备删除
  const prepareDelete = (type: 'category' | 'item', id: string) => {
    setDeleteType(type);
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // 确认删除
  const confirmDelete = () => {
    if (!itemToDelete) return;
    
    if (deleteType === 'category') {
      // 删除分类
      const deleteCategory = (cats: DictionaryCategory[]): DictionaryCategory[] => {
        return cats.filter(cat => {
          if (cat.id === itemToDelete) {
            // 删除该分类下的所有字典项
            const updatedItems = items.filter(item => item.categoryId !== itemToDelete);
            setItems(updatedItems);
            localStorage.setItem('dictionaryItems', JSON.stringify(updatedItems));
            return false;
          }
          if (cat.children && cat.children.length > 0) {
            cat.children = deleteCategory(cat.children);
          }
          return true;
        });
      };
      
      const updatedCategories = deleteCategory(categories);
      setCategories(updatedCategories);
      localStorage.setItem('dictionaryCategories', JSON.stringify(updatedCategories));
      
      if (selectedCategory?.id === itemToDelete) {
        setSelectedCategory(null);
        setFilteredItems([]);
      }
      
      toast.success('分类删除成功');
    } else if (deleteType === 'item') {
      // 删除字典项
      const updatedItems = items.filter(item => item.id !== itemToDelete);
      setItems(updatedItems);
      localStorage.setItem('dictionaryItems', JSON.stringify(updatedItems));
      toast.success('字典项删除成功');
    }
    
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // 导出CSV
  const exportCSV = () => {
    if (!selectedCategory) {
      toast.error('请先选择一个分类');
      return;
    }
    
    setIsExporting(true);
    
    // 模拟导出延迟
    setTimeout(() => {
      const categoryItems = items.filter(item => item.categoryId === selectedCategory.id);
      
      // CSV内容
      let csvContent = "名称,英文名称,编码,排序,状态,备注\n";
      
      categoryItems.forEach(item => {
        csvContent += `"${item.name}","${item.englishName || ''}","${item.code}",${item.sortOrder},"${item.status === 'active' ? '启用' : '禁用'}","${item.remarks || ''}"\n`;
      });
      
      // 创建下载链接
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${selectedCategory.code}_${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 记录导出日志
      const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
      logs.push({
        id: Date.now().toString(),
        user: JSON.parse(localStorage.getItem('currentUser') || '{}').name || '未知用户',
        action: '导出字典',
        target: `${selectedCategory.name}(${selectedCategory.code})`,
        time: new Date().toISOString()
      });
      localStorage.setItem('operationLogs', JSON.stringify(logs));
      
      setIsExporting(false);
      toast.success('字典数据导出成功');
    }, 800);
  };

  // 导入CSV
  const importCSV = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.click();
  };

  // 处理文件导入
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategory) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          toast.error('CSV文件格式不正确，至少需要标题行和一行数据');
          return;
        }
        
        // 跳过标题行，处理数据行
        const newItems: DictionaryItem[] = [];
        const existingCodes = new Set(
          items.filter(item => item.categoryId === selectedCategory.id)
            .map(item => item.code.toLowerCase())
        );
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // 使用正则表达式处理带引号的字段
          const matches = line.match(/"([^"]*)"|([^,]+)/g);
          if (!matches || matches.length < 4) continue;
          
          // 清理匹配结果中的引号和逗号
          const values = matches.map(m => m.replace(/^[" ,]+|[" ,]+$/g, ''));
          
          // 检查编码是否已存在
          const code = values[2] || '';
          if (!code || existingCodes.has(code.toLowerCase())) continue;
          
          newItems.push({
            id: Date.now().toString() + '_' + i,
            categoryId: selectedCategory.id,
            name: values[0] || '',
            englishName: values[1] || '',
            code: code,
            sortOrder: parseInt(values[3] || '0', 10) || i,
            status: (values[4] || '').toLowerCase().includes('启用') ? 'active' : 'inactive',
            remarks: values[5] || ''
          });
        }
        
        if (newItems.length > 0) {
          const updatedItems = [...items, ...newItems];
          setItems(updatedItems);
          localStorage.setItem('dictionaryItems', JSON.stringify(updatedItems));
          
          // 记录导入日志
          const logs = JSON.parse(localStorage.getItem('operationLogs') || '[]');
          logs.push({
            id: Date.now().toString(),
            user: JSON.parse(localStorage.getItem('currentUser') || '{}').name || '未知用户',
            action: '导入字典',
            target: `${selectedCategory.name}(${selectedCategory.code})`,
            time: new Date().toISOString(),
            details: `导入了${newItems.length}条数据`
          });
          localStorage.setItem('operationLogs', JSON.stringify(logs));
          
          toast.success(`成功导入${newItems.length}条字典数据`);
        } else {
          toast.warning('没有导入新数据，可能所有数据已存在或格式不正确');
        }
      } catch (error) {
        toast.error('CSV导入失败：' + (error as Error).message);
      } finally {
        // 重置文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  // 渲染分类树节点
  const renderCategoryNode = (categories: DictionaryCategory[], level = 0) => {
    return categories.map(category => (
      <li key={category.id} className="mb-1">
        <div 
          className={`flex items-center p-2 rounded-lg cursor-pointer transition-all ${
            selectedCategory?.id === category.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 
            'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          onClick={() => handleCategorySelect(category)}
        >
          <div style={{ width: `${level * 20}px` }}></div>
          
          {category.children && category.children.length > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(category.id);
              }}
              className="mr-2 text-gray-500"
            >
              <i className={`fa-solid ${expandedKeys.includes(category.id) ? 'fa-chevron-down' : 'fa-chevron-right'} text-xs`}></i>
            </button>
          )}
          
          <i className="fa-solid fa-folder mr-2 text-gray-500"></i>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-medium truncate">{category.name}</span>
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                {category.code}
              </span>
            </div>
          </div>
          
          <div className="ml-2 flex items-center gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openModal('category-add');
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="添加子分类"
            >
              <i className="fa-solid fa-plus text-sm"></i>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                openModal('category-edit', category);
              }}
              className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="编辑分类"
            >
              <i className="fa-solid fa-pencil text-sm"></i>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                prepareDelete('category', category.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="删除分类"
            >
              <i className="fa-solid fa-trash text-sm"></i>
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && expandedKeys.includes(category.id) && (
          <ul className="mt-1">
            {renderCategoryNode(category.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  // 检查是否为管理员，非管理员无权访问
  if (!isAuthenticated || !isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="fa-solid fa-lock text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
          <h3 className="text-lg font-medium mb-2">权限不足</h3>
          <p className="text-gray-500 dark:text-gray-400">字典管理功能仅限管理员访问</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">字典管理</h1>
          <p className="text-gray-500 dark:text-gray-400">
            统一管理全系统枚举数据，实现一处维护、全局使用
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => openModal('category-add')}
            className="btn btn-primary"
          >
            <i className="fa-solid fa-plus"></i>
            <span>新增字典分类</span>
          </button>
        </div>
      </div>
      
      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧分类树 */}
        <div className="lg:col-span-1">
          <div className={`card ${config.bgSecondary} p-4 h-full`}>
            <div className="mb-4">
              <h2 className="font-semibold mb-2">字典分类</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">树形结构展示所有字典分类</p>
            </div>
            
            <div className="border rounded-lg p-2 h-[calc(100%-60px)] overflow-y-auto">
              <ul className="tree-view">
                {categories.length > 0 ? (
                  renderCategoryNode(categories)
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fa-solid fa-folder-open text-2xl mb-2"></i>
                    <p>暂无字典分类数据</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
        
        {/* 右侧字典项列表 */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className={`card ${config.bgSecondary} p-4 h-full flex flex-col`}>
              <div className="mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h2 className="font-semibold flex items-center">
                      <i className="fa-solid fa-list-ul mr-2 text-gray-500"></i>
                      {selectedCategory.name}
                      <span className="ml-2 text-sm bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                        {selectedCategory.code}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">管理该分类下的字典项数据</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="搜索字典项..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`input ${config.borderColor} pr-10 w-full md:w-64`}
                      />
                      <i className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    
                    <button 
                      onClick={() => openModal('item-add')}
                      className="btn btn-primary"
                    >
                      <i className="fa-solid fa-plus"></i>
                      <span>新增字典项</span>
                    </button>
                    
                    <div className="relative" style={{ display: 'none' }}>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={importCSV}
                        className="btn btn-secondary"
                        title="导入CSV"
                      >
                        <i className="fa-solid fa-upload"></i>
                      </button>
                      <button 
                        onClick={exportCSV}
                        disabled={isExporting}
                        className="btn btn-secondary"
                        title="导出CSV"
                      >
                        {isExporting ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                            <span>导出中...</span>
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-download"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 字典项表格 */}
              <div className="overflow-x-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        名称
                      </th>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        英文名称
                      </th>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        编码
                      </th>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        排序
                      </th>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredItems.length > 0 ? (
                      filteredItems.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                            {item.remarks && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {item.remarks}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                            {item.englishName || '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 rounded-full text-gray-800 dark:text-gray-200">
                              {item.code}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                            {item.sortOrder}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              item.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {item.status === 'active' ? '启用' : '禁用'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openModal('item-edit', item)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              >
                                <i className="fa-solid fa-pencil"></i>
                              </button>
                              <button 
                                onClick={() => prepareDelete('item', item.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                          <i className="fa-solid fa-file-text-o text-3xl mb-2"></i>
                          <p>当前分类下暂无字典项数据</p>
                          <button 
                            onClick={() => openModal('item-add')}
                            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            点击添加字典项
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className={`card ${config.bgSecondary} p-4 h-full flex items-center justify-center`}>
              <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                <i className="fa-solid fa-hand-pointer text-4xl mb-4"></i>
                <h3 className="text-lg font-medium mb-2">请选择一个字典分类</h3>
                <p>从左侧列表选择一个字典分类以查看和管理字典项</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* 模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`card ${config.bgSecondary} w-full max-w-md`}>
             <div className="p-6 h-[400px] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {modalType === 'category-add' && '新增字典分类'}
                  {modalType === 'category-edit' && '编辑字典分类'}
                  {modalType === 'item-add' && '新增字典项'}
                  {modalType === 'item-edit' && '编辑字典项'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
              
              {modalType === 'category-add' || modalType === 'category-edit' ? (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">分类名称 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={categoryFormData.name}
                      onChange={handleCategoryInputChange}
                      className={`input ${config.borderColor}`}
                      placeholder="请输入字典分类名称"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">分类编码 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="code"
                      value={categoryFormData.code}
                      onChange={handleCategoryInputChange}
                      className={`input ${config.borderColor}`}
                      placeholder="请输入字典分类编码（英文/数字）"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">编码全局唯一，用于系统内部标识</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">上级分类</label>
                    <select
                      name="parentId"
                      value={categoryFormData.parentId || ''}
                      onChange={handleCategoryInputChange}
                      className={`input ${config.borderColor}`}
                    >
                      <option value="">-- 无上级分类 --</option>
                      {renderCategoryOptions(categories)}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">排序号</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={categoryFormData.sortOrder}
                      onChange={handleCategoryInputChange}
                      className={`input ${config.borderColor}`}
                      min="1"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                    <button 
                      type="button"
                      onClick={saveCategory}
                      className="btn btn-primary"
                    >
                      保存
                    </button>
                  </div>
                </form>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">字典项名称 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={itemFormData.name}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor}`}
                      placeholder="请输入字典项名称"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">英文名称</label>
                    <input
                      type="text"
                      name="englishName"
                      value={itemFormData.englishName}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor}`}
                      placeholder="请输入英文名称（可选）"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">字典项编码 <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="code"
                      value={itemFormData.code}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor}`}
                      placeholder="请输入字典项编码"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">编码在当前分类下唯一</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">排序号</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={itemFormData.sortOrder}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor}`}
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">状态</label>
                    <select
                      name="status"
                      value={itemFormData.status}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor}`}
                    >
                      <option value="active">启用</option>
                      <option value="inactive">禁用</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">备注</label>
                    <textarea
                      name="remarks"
                      value={itemFormData.remarks}
                      onChange={handleItemInputChange}
                      className={`input ${config.borderColor} min-h-[80px]`}
                      placeholder="请输入备注信息（可选）"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      type="button"
                      onClick={closeModal}
                      className="btn btn-secondary"
                    >
                      取消
                    </button>
                    <button 
                      type="button"
                      onClick={saveItem}
                      className="btn btn-primary"
                    >
                      保存
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`card ${config.bgSecondary} w-full max-w-md`}>
            <div className="p-6">
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mx-auto mb-4">
                  <i className="fa-solid fa-exclamation-triangle text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">确认删除</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {deleteType === 'category' 
                    ? '确定要删除该字典分类及其所有子分类和字典项吗？此操作不可撤销。' 
                    : '确定要删除该字典项吗？此操作不可撤销。'}
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={cancelDelete}
                    className="btn btn-secondary"
                  >
                    取消
                  </button>
                  <button 
                    onClick={confirmDelete}
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

// 递归渲染分类选项
function renderCategoryOptions(categories: DictionaryCategory[], level = 0, excludeId?: string): React.ReactElement[] {
  const options: React.ReactElement[] = [];
  
  categories.forEach(category => {
    if (category.id !== excludeId) {
      options.push(
        <option key={category.id} value={category.id}>
          {level > 0 ? '└' + '─'.repeat(level) : ''} {category.name}
        </option>
      );
      
      if (category.children && category.children.length > 0) {
        options.push(...renderCategoryOptions(category.children, level + 1, excludeId));
      }
    }
  });
  
  return options;
}

export default DictionaryManagement;