import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";
import { AuthContext } from "@/contexts/authContext";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface BusinessModule {
    id: string;
    name: string;
    code: string;
    pathUrl?: string;
    tables: BusinessTable[];
}

interface BusinessTable {
    id: string;
    name: string;
    code: string;
    pathUrl?: string;
    isSubTable: boolean;
    parentTableId?: string;
    fields: BusinessField[];
}

interface DisplayRule {
    pageType: "add" | "edit" | "detail";
    conditions: Condition[];
    visible: boolean;
}

interface Condition {
    fieldId: string;
    operator: "equals" | "contains" | "greaterThan" | "lessThan" | "notEquals";
    value: string;
}

interface BusinessField {
    id: string;
    name: string;
    code: string;
    type: "text" | "number" | "date" | "select" | "multipleSelect" | "radio" | "textarea" | "switch";
    defaultValue?: string | string[];
    required: boolean;
    maxLength?: number;
    options?: {
        label: string;
        value: string;
    }[];
    description?: string;
    sortOrder: number;
    displayRules: DisplayRule[];
}

interface FormPreviewData {
    [key: string]: any;
}

type ModalType = "module-add" | "module-edit" | "table-add" | "table-edit" | "field-add" | "field-edit" | "rule-edit";

const BusinessFieldConfiguration = () => {
    const {
        config
    } = useContext(ThemeContext);

    const {
        isAuthenticated
    } = useContext(AuthContext);

    const [deleteType, setDeleteType] = useState<string | null>(null);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [activeTab, setActiveTab] = useState("module");
    const [businessModules, setBusinessModules] = useState<BusinessModule[]>([]);
    const [selectedModule, setSelectedModule] = useState<BusinessModule | null>(null);
    const [selectedTable, setSelectedTable] = useState<BusinessTable | null>(null);
  const [selectedField, setSelectedField] = useState<BusinessField | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [modalType, setModalType] = useState<ModalType>("module-add");
    const [formPreviewData, setFormPreviewData] = useState<FormPreviewData>({});
    const [previewPageType, setPreviewPageType] = useState<"add" | "edit" | "detail">("add");
    const [formData, setFormData] = useState<any>({});
    const previewRef = useRef<HTMLDivElement>(null);

    const isAdmin = () => {
        const userStr = localStorage.getItem("currentUser");

        if (userStr) {
            const user = JSON.parse(userStr);
            return user.role === "admin";
        }

        return false;
    };

    useEffect(() => {
        const savedModules = localStorage.getItem("businessModules");

        if (savedModules) {
            setBusinessModules(JSON.parse(savedModules));
        } else {
            const mockModules: BusinessModule[] = [{
                id: "1",
                name: "采购管理",
                code: "purchase",

                tables: [{
                    id: "1-1",
                    name: "采购订单",
                    code: "purchase_order",
                    isSubTable: false,

                    fields: [{
                        id: "1-1-1",
                        name: "订单编号",
                        code: "order_no",
                        type: "text",
                        required: true,
                        sortOrder: 1,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-1-2",
                        name: "供应商",
                        code: "supplier",
                        type: "select",
                        required: true,
                        sortOrder: 2,

                        options: [{
                            label: "供应商A",
                            value: "supplier_a"
                        }, {
                            label: "供应商B",
                            value: "supplier_b"
                        }, {
                            label: "供应商C",
                            value: "supplier_c"
                        }],

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-1-3",
                        name: "采购金额",
                        code: "amount",
                        type: "number",
                        required: true,
                        sortOrder: 3,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-1-4",
                        name: "采购日期",
                        code: "purchase_date",
                        type: "date",
                        required: true,
                        sortOrder: 4,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-1-5",
                        name: "紧急程度",
                        code: "urgency",
                        type: "radio",
                        required: true,
                        sortOrder: 5,

                        options: [{
                            label: "普通",
                            value: "normal"
                        }, {
                            label: "紧急",
                            value: "urgent"
                        }, {
                            label: "非常紧急",
                            value: "very_urgent"
                        }],

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-1-6",
                        name: "审批意见",
                        code: "approval_notes",
                        type: "textarea",
                        required: false,
                        sortOrder: 6,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: false
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: false
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }]
                }, {
                    id: "1-2",
                    name: "采购订单明细",
                    code: "purchase_order_item",
                    isSubTable: true,
                    parentTableId: "1-1",

                    fields: [{
                        id: "1-2-1",
                        name: "商品名称",
                        code: "product_name",
                        type: "text",
                        required: true,
                        sortOrder: 1,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-2-2",
                        name: "规格型号",
                        code: "specification",
                        type: "text",
                        required: false,
                        sortOrder: 2,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-2-3",
                        name: "单位",
                        code: "unit",
                        type: "text",
                        required: true,
                        sortOrder: 3,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-2-4",
                        name: "数量",
                        code: "quantity",
                        type: "number",
                        required: true,
                        sortOrder: 4,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-2-5",
                        name: "单价",
                        code: "unit_price",
                        type: "number",
                        required: true,
                        sortOrder: 5,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "1-2-6",
                        name: "金额",
                        code: "amount",
                        type: "number",
                        required: true,
                        sortOrder: 6,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }]
                }]
            }, {
                id: "2",
                name: "销售管理",
                code: "sales",

                tables: [{
                    id: "2-1",
                    name: "销售订单",
                    code: "sales_order",
                    isSubTable: false,

                    fields: [{
                        id: "2-1-1",
                        name: "订单编号",
                        code: "order_no",
                        type: "text",
                        required: true,
                        sortOrder: 1,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }, {
                        id: "2-1-2",
                        name: "客户名称",
                        code: "customer_name",
                        type: "text",
                        required: true,
                        sortOrder: 2,

                        displayRules: [{
                            pageType: "add",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "edit",
                            conditions: [],
                            visible: true
                        }, {
                            pageType: "detail",
                            conditions: [],
                            visible: true
                        }]
                    }]
                }]
            }];

            setBusinessModules(mockModules);
            localStorage.setItem("businessModules", JSON.stringify(mockModules));
        }
    }, []);

    useEffect(() => {
        if (selectedTable && selectedTable.fields && selectedTable.fields.length > 0) {
            const initialData: FormPreviewData = {};

            selectedTable.fields.forEach(field => {
                if (field.defaultValue) {
                    initialData[field.code] = field.defaultValue;
                } else if (field.type === "checkbox") {
                    initialData[field.code] = false;
                } else if (field.type === "select" && field.options && field.options.length > 0) {
                    initialData[field.code] = field.options[0].value;
                } else {
                    initialData[field.code] = "";
                }
            });

            setFormPreviewData(initialData);
        }
    }, [selectedTable]);

    if (!isAuthenticated || !isAdmin()) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <i
                        className="fa-solid fa-lock text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <h3 className="text-lg font-medium mb-2">权限不足</h3>
                    <p className="text-gray-500 dark:text-gray-400">业务字段配置功能仅限管理员访问</p>
                </div>
            </div>
        );
    }

    const openModal = (type: ModalType, data?: any) => {
        setModalType(type);
        setIsModalOpen(true);

        switch (type) {
        case "module-add":
            setFormData({
                name: "",
                code: ""
            });

            break;
        case "module-edit":
            setFormData({
                name: data.name,
                code: data.code
            });

            setSelectedModule(data);
            break;
        case "table-add":
            setFormData({
                name: "",
                code: "",
                isSubTable: false,
                parentTableId: selectedModule?.tables[0]?.id
            });

            break;
        case "table-edit":
            setFormData({
                name: data.name,
                code: data.code,
                isSubTable: data.isSubTable,
                parentTableId: data.parentTableId
            });

            setSelectedTable(data);
            break;
        case "field-add":
            setFormData({
                name: "",
                code: "",
                type: "text",
                required: false,
                maxLength: 255,
                defaultValue: "",
                placeholder: "",
                options: [],
                description: "",

                displayRules: [{
                    pageType: "add",
                    conditions: [],
                    visible: true
                }, {
                    pageType: "edit",
                    conditions: [],
                    visible: true
                }, {
                    pageType: "detail",
                    conditions: [],
                    visible: true
                }]
            });

            break;
        case "field-edit":
            setFormData({
                name: data.name,
                code: data.code,
                type: data.type,
                required: data.required,
                maxLength: data.maxLength || 255,
                defaultValue: data.defaultValue || "",
                placeholder: data.placeholder || "",
                options: data.options ? [...data.options] : [],
                description: data.description || "",
                displayRules: [...data.displayRules]
            });

            setSelectedField(data);
            break;
        case "rule-edit":
            setFormData({
                pageType: data.pageType,
                conditions: data.conditions ? [...data.conditions] : [],
                visible: data.visible
            });

            setSelectedField(data.field);
            break;
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedModule(null);
        setFormData({});
    };

    const saveBusinessModule = () => {
        if (!formData.name || !formData.code) {
            toast.error("名称和编码为必填项");
            return;
        }

        const updatedModules = [...businessModules];

        if (modalType === "module-add") {
            const newModule: BusinessModule = {
                id: Date.now().toString(),
                name: formData.name,
                code: formData.code,
                tables: []
            };

            updatedModules.push(newModule);
            toast.success("业务模块添加成功");
        } else if (modalType === "module-edit" && selectedModule) {
            const index = updatedModules.findIndex(m => m.id === selectedModule.id);

            if (index !== -1) {
                updatedModules[index] = {
                    ...selectedModule,
                    name: formData.name,
                    code: formData.code
                };

                toast.success("业务模块更新成功");
            }
        }

        setBusinessModules(updatedModules);
        localStorage.setItem("businessModules", JSON.stringify(updatedModules));
        closeModal();
    };

    const saveBusinessTable = () => {
        if (!formData.name || !formData.code || !selectedModule) {
            toast.error("名称和编码为必填项");
            return;
        }

        const updatedModules = [...businessModules];
        const moduleIndex = updatedModules.findIndex(m => m.id === selectedModule.id);

        if (moduleIndex !== -1) {
            const updatedModule = {
                ...updatedModules[moduleIndex]
            };

            const updatedTables = [...updatedModule.tables];

            if (modalType === "table-add") {
                const newTable: BusinessTable = {
                    id: Date.now().toString(),
                    name: formData.name,
                    code: formData.code,
                    isSubTable: formData.isSubTable,
                    parentTableId: formData.isSubTable ? formData.parentTableId : undefined,
                    fields: []
                };

                updatedTables.push(newTable);
                toast.success("业务表添加成功");
            } else if (modalType === "table-edit" && selectedTable) {
                const tableIndex = updatedTables.findIndex(t => t.id === selectedTable.id);

                if (tableIndex !== -1) {
                    updatedTables[tableIndex] = {
                        ...selectedTable,
                        name: formData.name,
                        code: formData.code,
                        isSubTable: formData.isSubTable,
                        parentTableId: formData.isSubTable ? formData.parentTableId : undefined
                    };

                    toast.success("业务表更新成功");
                }
            }

            updatedModule.tables = updatedTables;
            updatedModules[moduleIndex] = updatedModule;
            setBusinessModules(updatedModules);
            localStorage.setItem("businessModules", JSON.stringify(updatedModules));
            closeModal();
        }
    };

    const saveBusinessField = () => {
        if (!formData.name || !formData.code || !selectedModule || !selectedTable) {
            toast.error("名称和编码为必填项");
            return;
        }

        const updatedModules = [...businessModules];
        const moduleIndex = updatedModules.findIndex(m => m.id === selectedModule.id);

        if (moduleIndex !== -1) {
            const updatedModule = {
                ...updatedModules[moduleIndex]
            };

            const tableIndex = updatedModule.tables.findIndex(t => t.id === selectedTable.id);

            if (tableIndex !== -1) {
                const updatedTable = {
                    ...updatedModule.tables[tableIndex]
                };

                const updatedFields = [...updatedTable.fields];

                if (modalType === "field-add") {
                    const newField: BusinessField = {
                        id: Date.now().toString(),
                        name: formData.name,
                        code: formData.code,
                        type: formData.type,
                        required: formData.required,
                        maxLength: formData.maxLength,
                        defaultValue: formData.defaultValue,
                        options: formData.options,
                        description: formData.description,
                        sortOrder: updatedFields.length + 1,
                        displayRules: formData.displayRules
                    };

                    updatedFields.push(newField);
                    toast.success("业务字段添加成功");
                } else if (modalType === "field-edit" && selectedField) {
                    const fieldIndex = updatedFields.findIndex(f => f.id === selectedField.id);

                    if (fieldIndex !== -1) {
                        updatedFields[fieldIndex] = {
                            ...selectedField,
                            name: formData.name,
                            code: formData.code,
                            type: formData.type,
                            required: formData.required,
                            maxLength: formData.maxLength,
                            defaultValue: formData.defaultValue,
                            options: formData.options,
                            description: formData.description,
                            displayRules: formData.displayRules
                        };

                        toast.success("业务字段更新成功");
                    }
                }

                updatedTable.fields = updatedFields;
                updatedModule.tables[tableIndex] = updatedTable;
                updatedModules[moduleIndex] = updatedModule;
                setBusinessModules(updatedModules);
                localStorage.setItem("businessModules", JSON.stringify(updatedModules));
                closeModal();
            }
        }
    };

    const saveDisplayRule = () => {
        if (!selectedModule || !selectedTable || !selectedField) {
            toast.error("缺少必要参数");
            return;
        }

        const updatedModules = [...businessModules];
        const moduleIndex = updatedModules.findIndex(m => m.id === selectedModule.id);

        if (moduleIndex !== -1) {
            const updatedModule = {
                ...updatedModules[moduleIndex]
            };

            const tableIndex = updatedModule.tables.findIndex(t => t.id === selectedTable.id);

            if (tableIndex !== -1) {
                const updatedTable = {
                    ...updatedModule.tables[tableIndex]
                };

                const fieldIndex = updatedTable.fields.findIndex(f => f.id === selectedField.id);

                if (fieldIndex !== -1) {
                    const updatedField = {
                        ...updatedTable.fields[fieldIndex]
                    };

                    const ruleIndex = updatedField.displayRules.findIndex(r => r.pageType === formData.pageType);

                    if (ruleIndex !== -1) {
                        updatedField.displayRules[ruleIndex] = {
                            pageType: formData.pageType,
                            conditions: formData.conditions,
                            visible: formData.visible
                        };

                        updatedTable.fields[fieldIndex] = updatedField;
                        updatedModule.tables[tableIndex] = updatedTable;
                        updatedModules[moduleIndex] = updatedModule;
                        setBusinessModules(updatedModules);
                        localStorage.setItem("businessModules", JSON.stringify(updatedModules));
                        toast.success("显示规则更新成功");
                        closeModal();
                    }
                }
            }
        }
    };

    const deleteBusinessModule = (id: string) => {
        if (window.confirm("确定要删除此业务模块及其所有表和字段吗？此操作不可撤销。")) {
            const updatedModules = businessModules.filter(m => m.id !== id);
            setBusinessModules(updatedModules);
            localStorage.setItem("businessModules", JSON.stringify(updatedModules));

            if (selectedModule?.id === id) {
                setSelectedModule(null);
                setSelectedTable(null);
            }

            toast.success("业务模块删除成功");
        }
    };


    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleConditionChange = (index: number, field: keyof Condition, value: string) => {
        const updatedConditions = [...formData.conditions];

        updatedConditions[index] = {
            ...updatedConditions[index],
            [field]: value
        };

        setFormData(prev => ({
            ...prev,
            conditions: updatedConditions
        }));
    };

    const addCondition = () => {
        setFormData(prev => ({
            ...prev,

            conditions: [...prev.conditions, {
                fieldId: selectedTable?.fields[0]?.id || "",
                operator: "equals",
                value: ""
            }]
        }));
    };

    const removeCondition = (index: number) => {
        setFormData(prev => ({
            ...prev,
            conditions: prev.conditions.filter((_, i) => i !== index)
        }));
    };

    const handleOptionChange = (
        index: number,
        field: keyof {
            label: string;
            value: string;
        },
        value: string
    ) => {
        const updatedOptions = [...formData.options];

        updatedOptions[index] = {
            ...updatedOptions[index],
            [field]: value
        };

        setFormData(prev => ({
            ...prev,
            options: updatedOptions
        }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,

            options: [...prev.options, {
                label: "",
                value: ""
            }]
        }));
    };

    const removeOption = (index: number) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter((_, i) => i !== index)
        }));
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || result.source.index === result.destination.index || !selectedModule || !selectedTable) {
            return;
        }

        const updatedModules = [...businessModules];
        const moduleIndex = updatedModules.findIndex(m => m.id === selectedModule.id);

        if (moduleIndex !== -1) {
            const updatedModule = {
                ...updatedModules[moduleIndex]
            };

            const tableIndex = updatedModule.tables.findIndex(t => t.id === selectedTable.id);

            if (tableIndex !== -1) {
                const updatedTable = {
                    ...updatedModule.tables[tableIndex]
                };

                const updatedFields = [...updatedTable.fields];
                const [removed] = updatedFields.splice(result.source.index, 1);
                updatedFields.splice(result.destination.index, 0, removed);

                updatedFields.forEach((field, index) => {
                    field.sortOrder = index + 1;
                });

                updatedTable.fields = updatedFields;
                updatedModule.tables[tableIndex] = updatedTable;
                updatedModules[moduleIndex] = updatedModule;
                setBusinessModules(updatedModules);
                localStorage.setItem("businessModules", JSON.stringify(updatedModules));
            }
        }
    };

    const renderModuleList = () => {
        return businessModules.map(module => <div
            key={module.id}
            className={`p-4 border rounded-lg mb-3 cursor-pointer transition-all ${selectedModule?.id === module.id ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"}`}
            onClick={() => setSelectedModule(module)}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-medium">{module.name}</h3>
                    <p className="text-sm text-gray-500">{module.code}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            openModal("module-edit", module);
                        }}
                        className="p-1 text-gray-500 hover:text-blue-600">
                        <i className="fa-solid fa-edit"></i>
                    </button>
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            setDeleteType("module");
                            setItemToDelete(module.id);
                            setShowDeleteModal(true);
                        }}
                        className="p-1 text-gray-500 hover:text-red-600">
                        <i className="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
            {selectedModule?.id === module.id && <></>}
        </div>);
    };

    const getFieldTypeName = (type: string): string => {
        const typeMap: Record<string, string> = {
            "text": "文本",
            "number": "数字",
            "date": "日期",
            "select": "下拉选择",
            "checkbox": "复选框",
            "radio": "单选框",
            "textarea": "多行文本",
            "switch": "开关"
        };

        return typeMap[type] || type;
    };

    const renderFormPreview = () => {
        if (!selectedTable || !selectedTable.fields || selectedTable.fields.length === 0) {
            return <div className="text-center py-8 text-gray-500">请选择一个包含字段的表</div>;
        }

        const filteredFields = selectedTable.fields.filter(field => {
            const rule = field.displayRules.find(r => r.pageType === previewPageType);

            if (!rule || rule.visible) {
                return true;
            }

            return false;
        });

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">表单预览 - {getPageTypeName(previewPageType)}</h3>
                    <div className="flex gap-2">
                        {["add", "edit", "detail"].map(pageType => <button
                            key={pageType}
                            onClick={() => setPreviewPageType(pageType as "add" | "edit" | "detail")}
                            className={`px-3 py-1 rounded text-sm ${previewPageType === pageType ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"}`}>
                            {getPageTypeName(pageType as "add" | "edit" | "detail")}
                        </button>)}
                    </div>
                </div>
                <div className="space-y-4">
                    {filteredFields.map(field => renderFieldPreview(field))}
                </div>
            </div>
        );
    };

    const getPageTypeName = (pageType: "add" | "edit" | "detail"): string => {
        const typeMap = {
            add: "新增页",
            edit: "编辑页",
            detail: "详情页"
        };

        return typeMap[pageType];
    };

    const renderFieldPreview = (field: BusinessField) => {
        const isDetailMode = previewPageType === "detail";
        const value = formPreviewData[field.code] || "";

        switch (field.type) {
        case "text":
        case "number":
        case "date":
            return (
                <input
                    type={field.type}
                    value={value}
                    disabled={isDetailMode}
                    className={`input ${config.borderColor}`}
                    onChange={e => {
                        setFormPreviewData(prev => ({
                            ...prev,
                            [field.code]: e.target.value
                        }));
                    }} />
            );
        case "select":
            return (
                <select
                    value={value}
                    disabled={isDetailMode}
                    className={`input ${config.borderColor}`}
                    onChange={e => {
                        setFormPreviewData(prev => ({
                            ...prev,
                            [field.code]: e.target.value
                        }));
                    }}>
                    {field.options?.map(option => <option key={option.value} value={option.value}>
                        {option.label}
                    </option>)}
                </select>
            );
        case "multipleSelect":
            const selectedValues = Array.isArray(value) ? value : [];

            return (
                <div
                    className={`border rounded-lg p-3 ${config.borderColor} bg-white dark:bg-gray-800 shadow-sm transition-all hover:shadow-md`}>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {field.options?.map(option => <label
                            key={option.value}
                            className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option.value)}
                                    onChange={e => {
                                        let newValues = [...selectedValues];

                                        if (e.target.checked) {
                                            newValues.push(option.value);
                                        } else {
                                            newValues = newValues.filter(v => v !== option.value);
                                        }

                                        setFormPreviewData(prev => ({
                                            ...prev,
                                            [field.code]: newValues
                                        }));
                                    }}
                                    className="sr-only peer" />
                                <div
                                    className={`w-5 h-5 rounded border ${config.borderColor} flex items-center justify-center transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600`}>
                                    <i
                                        className={`fa-solid fa-check text-white text-xs scale-0 peer-checked:scale-100 transition-transform`}></i>
                                </div>
                            </div>
                            <span className="ml-3 text-sm">{option.label}</span>
                        </label>)}
                    </div>
                    {selectedValues.length > 0 && <div
                        className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                        {selectedValues.map(value => {
                            const option = field.options?.find(opt => opt.value === value);

                            return option ? <span
                                key={value}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                {option.label}
                                <button
                                    className="ml-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                                    onClick={e => {
                                        e.stopPropagation();

                                        setFormPreviewData(prev => ({
                                            ...prev,
                                            [field.code]: selectedValues.filter(v => v !== value)
                                        }));
                                    }}>
                                    <i className="fa-solid fa-times-circle text-xs"></i>
                                </button>
                            </span> : null;
                        })}
                    </div>}
                </div>
            );
        case "radio":
            return (
                <div className="flex gap-4">
                    {field.options?.map(option => <label key={option.value} className="flex items-center gap-1">
                        <input
                            type="radio"
                            name={field.code}
                            value={option.value}
                            checked={value === option.value}
                            disabled={isDetailMode}
                            onChange={e => {
                                setFormPreviewData(prev => ({
                                    ...prev,
                                    [field.code]: e.target.value
                                }));
                            }} />
                        {option.label}
                    </label>)}
                </div>
            );
        case "checkbox":
            return (
                <div className="flex items-center">
                    <div className="relative">
                        <input
                            type="checkbox"
                            checked={value === "true" || value === true}
                            disabled={isDetailMode}
                            onChange={e => {
                                setFormPreviewData(prev => ({
                                    ...prev,
                                    [field.code]: e.target.checked
                                }));
                            }}
                            className="sr-only peer" />
                        <div
                            className={`w-5 h-5 rounded border ${config.borderColor} bg-white dark:bg-gray-800 flex items-center justify-center transition-colors duration-200 cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-600`}>
                            <i
                                className={`fa-solid fa-check text-white text-xs scale-0 peer-checked:scale-100 transition-transform duration-200`}></i>
                        </div>
                    </div>
                    <span className="ml-3 text-sm font-medium">{field.name}</span>
                </div>
            );
        case "textarea":
            return (
                <textarea
                    value={value}
                    disabled={isDetailMode}
                    className={`input ${config.borderColor} min-h-[100px]`}
                    onChange={e => {
                        setFormPreviewData(prev => ({
                            ...prev,
                            [field.code]: e.target.value
                        }));
                    }}></textarea>
            );
        case "switch":
            return (
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={value === "true" || value === true}
                        disabled={isDetailMode}
                        onChange={e => {
                            setFormPreviewData(prev => ({
                                ...prev,
                                [field.code]: e.target.checked
                            }));
                        }}
                        className="sr-only peer" />
                    <div
                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            );
        default:
            return <div>不支持的字段类型</div>;
        }
    };

    const handleSave = () => {
        switch (modalType) {
        case "module-add":
        case "module-edit":
            saveBusinessModule();
            break;
        case "table-add":
        case "table-edit":
            saveBusinessTable();
            break;
        case "field-add":
        case "field-edit":
            saveBusinessField();
            break;
        case "rule-edit":
            saveDisplayRule();
            break;
        }
    };

    const getModalTitle = (): string => {
        switch (modalType) {
        case "module-add":
            return "新增业务模块";
        case "module-edit":
            return "编辑业务模块";
        case "table-add":
            return "新增业务表";
        case "table-edit":
            return "编辑业务表";
        case "field-add":
            return "新增业务字段";
        case "field-edit":
            return "编辑业务字段";
        case "rule-edit":
            return "配置显示规则";
        default:
            return "业务配置";
        }
    };

    const renderModalContent = (): React.ReactNode => {
        switch (modalType) {
        case "module-add":
        case "module-edit":
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">模块名称 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入业务模块名称" />
                    </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">模块编码 <span className="text-red-500">*</span></label>
                         <input
                             type="text"
                             name="code"
                             value={formData.code}
                             onChange={handleInputChange}
                             className={`input ${config.borderColor}`}
                             placeholder="请输入业务模块编码（英文/数字）"
                             disabled={modalType === "module-edit"} />
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">路径URL</label>
                         <input
                             type="text"
                             name="pathUrl"
                             value={formData.pathUrl || ""}
                             onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入业务模块编码（英文/数字）"
                            disabled={modalType === "module-edit"} />
                    </div>
                </div>
            );
        case "table-add":
        case "table-edit":
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">表名称 <span className="text-red-500">*</span></label><input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入业务表名称" />
                    </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">表编码 <span className="text-red-500">*</span></label>
                         <input
                             type="text"
                             name="code"
                             value={formData.code}
                             onChange={handleInputChange}
                             className={`input ${config.borderColor}`}
                             placeholder="请输入业务表编码（英文/数字）"
                             disabled={modalType === "table-edit"} />
                     </div>
                     <div>
                         <label className="block text-sm font-medium mb-1">路径URL</label>
                         <input
                             type="text"
                             name="pathUrl"
                             value={formData.pathUrl || ""}
                             onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入业务表编码（英文/数字）"
                            disabled={modalType === "table-edit"} />
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="isSubTable"
                            name="isSubTable"
                            checked={formData.isSubTable}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="isSubTable" className="ml-2 text-sm">子表</label>
                    </div>
                    {formData.isSubTable && selectedModule?.tables && selectedModule.tables.length > 0 && <div>
                        <label className="block text-sm font-medium mb-1">父表</label>
                        <select
                            name="parentTableId"
                            value={formData.parentTableId || ""}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}>
                            {selectedModule.tables.filter(table => !table.isSubTable).map(table => <option key={table.id} value={table.id}>
                                {table.name}
                            </option>)}
                        </select>
                    </div>}
                </div>
            );
        case "field-add":
        case "field-edit":
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">字段名称 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入字段名称" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">字段编码 <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入字段编码（英文/数字）"
                            disabled={modalType === "field-edit"} /></div>

                    <div>
                        <label className="block text-sm font-medium mb-1">字段类型 <span className="text-red-500">*</span></label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}>
                            <option value="text">文本</option>
                            <option value="number">数字</option>
                            <option value="date">日期</option>
                            <option value="select">下拉选择</option>
                            <option value="multipleSelect">多项下拉选择</option>
                            <option value="radio">单选框</option>
                            <option value="textarea">多行文本</option>
                            <option value="switch">开关</option>
                        </select>
                    </div>
                    {["text", "textarea"].includes(formData.type) && <div className="mt-4">
                        <label className="block text-sm font-medium mb-1">占位符提示文本</label>
                        <input
                            type="text"
                            name="placeholder"
                            value={formData.placeholder || ""}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入占位符文本" />
                    </div>}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="required"
                            name="required"
                            checked={formData.required}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="required" className="ml-2 text-sm">必填字段</label>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">最大长度</label>
                        <input
                            type="number"
                            name="maxLength"
                            value={formData.maxLength}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            min="1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">默认值</label>
                        <input
                            type="text"
                            name="defaultValue"
                            value={formData.defaultValue}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入默认值" />
                    </div>
                        {(formData.type === "radio" || formData.type === "checkbox") && <div>
                            <label className="block text-sm font-medium mb-2">选项配置</label>
                            {formData.options?.map((option, index) => <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    placeholder="选项标签"
                                    value={option.label}
                                    onChange={e => {
                                        const updatedOptions = [...formData.options];
                                        updatedOptions[index].label = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            options: updatedOptions
                                        }));
                                    }}
                                    className={`input ${config.borderColor} flex-1`} />
                                <input
                                    type="text"
                                    placeholder="选项值"
                                    value={option.value}
                                    onChange={e => {
                                        const updatedOptions = [...formData.options];
                                        updatedOptions[index].value = e.target.value;

                                        setFormData(prev => ({
                                            ...prev,
                                            options: updatedOptions
                                        }));
                                    }}
                                    className={`input ${config.borderColor} flex-1`} />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const updatedOptions = [...formData.options];
                                        updatedOptions.splice(index, 1);

                                        setFormData(prev => ({
                                            ...prev,
                                            options: updatedOptions
                                        }));
                                    }}
                                    className="btn btn-secondary px-2">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>)}
                            <button
                                type="button"
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,

                                        options: [...(prev.options || []), {
                                            label: "",
                                            value: ""
                                        }]
                                    }));
                                }}
                                className="btn btn-secondary mt-2">
                                <i className="fa-solid fa-plus"></i>添加选项
                            </button>
                        </div>}
                        {(formData.type === "select" || formData.type === "multipleSelect") && <div>
                            <label className="block text-sm font-medium mb-2">字典选择</label>
                            <select
                                className={`input ${config.borderColor}`}
                                value={formData.dictionaryId || ""}
                                onChange={(e) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        dictionaryId: e.target.value
                                    }));
                                    // 这里应该从字典管理加载选项数据
                                    const mockOptions = [
                                        { label: "选项1", value: "1" },
                                        { label: "选项2", value: "2" },
                                        { label: "选项3", value: "3" }
                                    ];
                                    setFormData(prev => ({
                                        ...prev,
                                        options: mockOptions
                                    }));
                                }}>
                                <option value="">-- 选择字典 --</option>
                                <option value="1">用户状态</option>
                                <option value="2">订单类型</option>
                                <option value="3">产品分类</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">从字典管理中选择预定义的选项集</p>
                        </div>}
                    <div>
                        <label className="block text-sm font-medium mb-1">描述</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={`input ${config.borderColor} min-h-[80px]`}
                            placeholder="请输入字段描述信息"></textarea>
                    </div>
                </div>
            );
        case "rule-edit":
            return (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">页面类型</label>
                        <select
                            name="pageType"
                            value={formData.pageType}
                            onChange={e => {
                                const newPageType = e.target.value as "add" | "edit" | "detail";
                                const currentRuleIndex = formData.field?.displayRules.findIndex(r => r.pageType === formData.pageType);

                                if (currentRuleIndex !== -1 && formData.field) {
                                    const updatedRules = [...formData.field.displayRules];

                                    updatedRules[currentRuleIndex] = {
                                        pageType: formData.pageType,
                                        conditions: formData.conditions,
                                        visible: formData.visible
                                    };

                                    setFormData(prev => ({
                                        ...prev,

                                        field: {
                                            ...prev.field!,
                                            displayRules: updatedRules
                                        }
                                    }));
                                }

                                const newRule = formData.field?.displayRules.find(r => r.pageType === newPageType);

                                setFormData(prev => ({
                                    ...prev,
                                    pageType: newPageType,
                                    conditions: newRule?.conditions || [],
                                    visible: newRule?.visible !== undefined ? newRule.visible : true
                                }));
                            }}
                            className={`input ${config.borderColor}`}>
                            <option value="add">新增页</option>
                            <option value="edit">编辑页</option>
                            <option value="detail">详情页</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="visible"
                            name="visible"
                            checked={formData.visible}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="visible" className="ml-2 text-sm">是否显示此字段</label>
                    </div>
                    {formData.visible && <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium">显示条件</label>
                            <button type="button" onClick={addCondition} className="text-sm text-blue-600">
                                <i className="fa-solid fa-plus"></i>添加条件
                            </button>
                        </div>
                        {formData.conditions.length > 0 ? <div className="space-y-3">
                            {formData.conditions.map((condition, index) => <React.Fragment key={index}>
                                {index > 0 && <div className="text-center w-full text-gray-500">且</div>}
                                <div className="flex items-center gap-2 p-3 border rounded-lg w-full">
                                    <select
                                        value={condition.fieldId}
                                        onChange={e => handleConditionChange(index, "fieldId", e.target.value)}
                                        className={`input ${config.borderColor} w-[120px]`}>
                                        {selectedTable?.fields.map(field => <option key={field.id} value={field.id}>
                                            {field.name}
                                        </option>)}
                                    </select>
                                    <select
                                        value={condition.operator}
                                        onChange={e => handleConditionChange(index, "operator", e.target.value)}
                                        className={`input ${config.borderColor} w-[100px]`}>
                                        <option value="equals">等于</option>
                                        <option value="notEquals">不等于</option>
                                        <option value="contains">包含</option>
                                        <option value="greaterThan">大于</option>
                                        <option value="lessThan">小于</option>
                                    </select>
                                    <input
                                        type="text"
                                        value={condition.value}
                                        onChange={e => handleConditionChange(index, "value", e.target.value)}
                                        className={`input ${config.borderColor} flex-1 min-w-[200px]`}
                                        placeholder="值" />
                                    <button
                                        type="button"
                                        onClick={() => removeCondition(index)}
                                        className="text-red-500 hover:text-red-700">
                                        <i className="fa-solid fa-times"></i>
                                    </button>
                                </div>
                            </React.Fragment>)}
                        </div> : <div
                            className="text-center py-4 text-gray-500 border border-dashed rounded-lg">无显示条件，将始终显示此字段
                        </div>}
                    </div>}
                </div>
            );
        default:
            return null;
        }
    };

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">业务字段</h1>
                    <p className="text-gray-500 dark:text-gray-400">按业务模块和表配置自定义字段，设置显示规则和条件逻辑</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="搜索模块、表或字段..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className={`input ${config.borderColor} pr-10 w-64`} />
                        <i
                            className="fa-solid fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                    </div>
                    <button onClick={() => openModal("module-add")} className="btn btn-primary">
                        <i className="fa-solid fa-plus"></i>
                        <span>新增业务模块</span>
                    </button>
                </div>
            </div>
            {}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {}
                <div
                    className={`card ${config.bgSecondary} p-6 md:col-span-3 transition-all duration-300 hover:shadow-md h-full`}>
                    <h2 className="text-lg font-semibold mb-4 flex items-center">
                        <i className="fa-solid fa-cubes mr-2 text-blue-600 dark:text-blue-400"></i>业务模块配置
                    </h2>
                    {businessModules.length > 0 ? renderModuleList() : <div className="text-center py-12">
                        <i
                            className="fa-solid fa-cubes text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                        <h3 className="text-lg font-medium mb-2">暂无业务模块</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">请先创建业务模块</p>
                        <button onClick={() => openModal("module-add")} className="btn btn-primary">
                            <i className="fa-solid fa-plus"></i>
                            <span>创建业务模块</span>
                        </button>
                    </div>}
                </div>
                {}
                {}
                <div
                    className={`card ${config.bgSecondary} p-6 md:col-span-9 transition-all duration-300 hover:shadow-md h-full flex flex-col`}>
                    {selectedModule ? <>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold flex items-center">
                                <i className="fa-solid fa-table mr-2 text-blue-600 dark:text-blue-400"></i>
                                {selectedModule.name}- 业务表管理
                            </h2>
                            <button onClick={() => openModal("table-add")} className="btn btn-primary">
                                <i className="fa-solid fa-plus"></i>
                                <span>新增业务表</span>
                            </button>
                        </div>
                        {selectedModule.tables.length > 0 ? <div className="space-y-6">
                             {selectedModule.tables.map(table => <div
                                key={table.id}
                                onClick={() => {
                                  setSelectedTable(table);
                                  setExpandedKeys(prev => 
                                    prev.includes(table.id)? prev.filter(key => key !== table.id) 
                                      : [...prev, table.id]
                                  );
                                }}
                                className="p-4 border rounded-lg hover:shadow-md transition-all duration-300 opacity-100 cursor-pointer"
>
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="font-medium">{table.name}</h3>
                        <p className="text-sm text-gray-500">{table.code} {table.isSubTable ? "(子表)" : ""}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => openModal("table-edit", table)}
                            className="text-sm text-blue-600 hover:text-blue-800 p-1"
                            title="编辑表"
                        >
                            <i className="fa-solid fa-edit"></i>
                        </button>
                        <button 
                            onClick={() => {
                                setDeleteType("table");
                                setItemToDelete(table.id);
                                setShowDeleteModal(true);
                            }}
                            className="text-sm text-red-600 hover:text-red-800 p-1"
                            title="删除表"
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (expandedKeys.includes(table.id)) {
                                // 收起逻辑
                                setExpandedKeys(prev => prev.filter(key => key !== table.id));
                              } else {
                                // 展开逻辑
                                setExpandedKeys(prev => [...prev, table.id]);
                              }
                            }}
                            className="text-sm text-gray-600 hover:text-gray-800 p-1 transition-colors"
                            title={expandedKeys.includes(table.id) ? "收起" : "展开"}
                        >
                            <i className={`fa-solid ${expandedKeys.includes(table.id) ? "fa-chevron-up" : "fa-chevron-down"}`}></i>
                        </button>
                    </div>
                </div>
                                 {expandedKeys.includes(table.id) && <div className="mt-4 pl-4 border-l-2 border-blue-200">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">业务字段</h4>
                                         <button onClick={(e) => {
                                             e.stopPropagation();
                                             openModal("field-add");
                                             // 保持当前表格展开状态
                                             if (selectedTable) {
                                               setExpandedKeys(prev => [...prev, selectedTable.id]);
                                             }
                                           }} className="text-sm text-blue-600">
                                             <i className="fa-solid fa-plus"></i>添加字段
                                        </button>
                                    </div>
                                    <DragDropContext onDragEnd={onDragEnd}>
                                        <Droppable droppableId="fields">
                                            {provided => <div ref={provided.innerRef} {...provided.droppableProps}>
                                                {table.fields.map(
                                                    (field, index) => <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {provided => <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="p-3 border rounded-lg mb-2 flex justify-between items-center">
                                                            <div>
                                                                <div className="flex items-center">
                                                                    <i className="fa-solid fa-grip-vertical text-gray-400 mr-2"></i>
                                                                    <h5 className="font-medium">{field.name}</h5>
                                                                    {field.required && <span className="ml-1 text-red-500">*</span>}
                                                                </div>
                                                                <p className="text-sm text-gray-500">
                                                                    {field.code}({getFieldTypeName(field.type)})
                                                                </p>
                                                            </div>
                                                               <div className="flex gap-2">
                                         <button
                                             onClick={(e) => {
                                                 e.stopPropagation();
                                                 setSelectedField(field);
                                                 const initialRule = field.displayRules.find(r => r.pageType === "add");

                                                 setFormData({
                                                     pageType: "add",
                                                     conditions: initialRule?.conditions || [],
                                                     visible: initialRule?.visible !== undefined ? initialRule.visible : true,
                                                     field
                                                 });

                                                 setModalType("rule-edit");
                                                 setIsModalOpen(true);
                                                 
                                                 // 保持当前表格展开状态
                                                 if (selectedTable) {
                                                     setExpandedKeys(prev => 
                                                         prev.includes(selectedTable.id) 
                                                             ? prev 
                                                             : [...prev, selectedTable.id]
                                                     );
                                                 }
                                             }}
                                             className="p-1 text-gray-500 hover:text-blue-600">
                                             <i className="fa-solid fa-eye"></i>
                                          </button>
                                                                 <button
                                                                     onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         // 保持当前表格展开状态
                                                                         if (selectedTable) {
                                                                             setExpandedKeys(prev => [...prev, selectedTable.id]);
                                                                         }
                                                                        e.stopPropagation();
                                                                        openModal("field-edit", field);
                                                                        // 保持当前表格展开状态
                                                                        if (selectedTable) {
                                                                            setExpandedKeys(prev => [...prev, selectedTable.id]);
                                                                        }
                                                                    }}
                                                                    className="p-1 text-gray-500 hover:text-blue-600">
                                                                    <i className="fa-solid fa-edit"></i>
                                                                 </button>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              // 保持当前表格展开状态
                                              if (selectedTable) {
                                                  setExpandedKeys(prev => [...prev, selectedTable.id]);
                                              }
                                             setDeleteType("field");
                                             setItemToDelete(field.id);
                                             setShowDeleteModal(true);
                                         }}
                                         className="p-1.5 text-gray-500 hover:text-red-600 transition-colors hover:bg-red-50 rounded-full">
                                         <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </div>}
                                                    </Draggable>
                                                )}
                                                {provided.placeholder}
                                            </div>}
                                        </Droppable>
                                    </DragDropContext>
                                </div>}
                            </div>)}
                        </div> : <div className="text-center py-12">
                            <i
                                className="fa-solid fa-file-alt text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                            <h3 className="text-lg font-medium mb-2">暂无业务表</h3>

                         </div>}
                    </> : <div
                        className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                        <i
                            className="fa-solid fa-hand-pointer text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                        <h3 className="text-lg font-medium mb-2">请选择业务模块</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md">从左侧列表中选择一个业务模块，查看和管理相关的业务表和字段
                        </p>
                    </div>}
                </div>
            </div>
            {}
             {isModalOpen && <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
                <div
                    className={`card ${config.bgSecondary} w-full max-w-2xl max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {getModalTitle()}
                            </h2>
                             <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors hover:bg-gray-100 p-1 rounded-full">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {renderModalContent()}
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                             <button onClick={() => setIsModalOpen(false)} className="btn btn-secondary">取消</button>
                            <button
                                 onClick={async (e) => {
                                     e.stopPropagation();
                                     // 先保存数据
                                     const saveSuccess = await handleSave();
                                     // 只有保存成功才关闭模态框
                                     if (saveSuccess !== false) {
                                         setIsModalOpen(false);
                                         // 确保保存后保持当前选择的模块和表格状态
                                         if (selectedModule) {
                                             setSelectedModule({...selectedModule});
                                         }
                                         if (selectedTable) {
                                             setSelectedTable({...selectedTable});
                                         }
                                     }
                                 }}
                                className="btn btn-primary">保存</button>
                        </div>
                    </div>
                </div>
            </div>}

            {/* 删除确认模态框 */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`card ${config.bgSecondary} w-full max-w-md`}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">确认删除</h2>
                                <button 
                                    onClick={() => setShowDeleteModal(false)}
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
                                    确定要删除此字段吗？此操作不可撤销。
                                </p>
                                
                                <div className="flex justify-center gap-3">
                                    <button 
                                        onClick={() => setShowDeleteModal(false)}
                                        className="btn btn-secondary"
                                    >
                                        取消
                                    </button>
                                    <button 
                     onClick={() => {
                        if (itemToDelete) {
                            const updatedModules = [...businessModules];
                            const moduleIndex = updatedModules.findIndex(m => m.id === selectedModule?.id);
                            
                            if (moduleIndex !== -1) {
                      if (deleteType === "module") {
                          // 删除模块
                          updatedModules.splice(moduleIndex, 1);
                          
                          // 确保完全移除模块及其所有引用
                          const filtered = updatedModules.filter(m => m.id !== itemToDelete);
                          setBusinessModules(filtered);
                          
                          // 更新本地存储
                          localStorage.setItem('businessModules', JSON.stringify(filtered));
                          
                          // 重置相关状态
                           setSelectedModule(null);
                          
                          toast.success('业务模块删除成功');
                                } else {
                                    const updatedModule = { ...updatedModules[moduleIndex] };
                                    const tableIndex = updatedModule.tables.findIndex(t => t.id === selectedTable?.id);
                                    
                                    if (tableIndex !== -1) {
                                        if (deleteType === "table") {
                                            // 删除表
                                            updatedModule.tables.splice(tableIndex, 1);
                                            updatedModules[moduleIndex] = updatedModule;
                                            setBusinessModules(updatedModules);
                                            localStorage.setItem('businessModules', JSON.stringify(updatedModules));
                                            toast.success('业务表删除成功');
                                        } else {
                                            // 删除字段
                                            const updatedTable = { ...updatedModule.tables[tableIndex] };
                                            updatedTable.fields = updatedTable.fields.filter(f => f.id !== itemToDelete);
                                            updatedModule.tables[tableIndex] = updatedTable;
                                            updatedModules[moduleIndex] = updatedModule;
                                            
                                            setBusinessModules(updatedModules);
                                            localStorage.setItem('businessModules', JSON.stringify(updatedModules));
                                            toast.success('业务字段删除成功');
                                        }
                                    }
                                }
                            }
                            
                            setShowDeleteModal(false);
                        }
                    }}
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

export default BusinessFieldConfiguration;