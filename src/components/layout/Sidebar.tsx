import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { useLocation } from "react-router-dom";

interface NavItem {
    key: string;
    label: string;
    icon: string;
    path: string;
    permissions?: string[];
    children?: NavItem[];
}

interface SidebarProps {
    items: NavItem[];
    collapsed: boolean;
    onCollapseToggle: (collapsed: boolean) => void;
    currentPath: string;
    onNavigate: (path: string) => void;
}

const Sidebar = (
    {
        items,
        collapsed,
        onCollapseToggle,
        currentPath,
        onNavigate
    }: SidebarProps
) => {
    const {
        config
    } = useContext(ThemeContext);

    const [openKeys, setOpenKeys] = useState<string[]>([]);
    const location = useLocation();

    const isActive = (item: NavItem) => {
        if (currentPath === item.path)
            return true;

        if (item.children) {
            for (const child of item.children) {
                if (currentPath === child.path || child.children && isActive(child)) {
                    return true;
                }
            }
        }

        return false;
    };

    const toggleSubMenu = (key: string) => {
        setOpenKeys(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    useEffect(() => {
        const openKeys = findOpenKeys(items, currentPath);
        setOpenKeys(openKeys);
    }, [currentPath, items]);

    const findOpenKeys = (items: NavItem[], currentPath: string, openKeys: string[] = []): string[] => {
        for (const item of items) {
            if (currentPath.startsWith(item.path) && item.children) {
                openKeys.push(item.key);
                findOpenKeys(item.children, currentPath, openKeys);
            }
        }

        return openKeys;
    };

    const renderMenuItem = (item: NavItem) => {
        const hasChildren = !!item.children?.length;
        const isActive = currentPath === item.path;

        return (
            <div key={item.key} className="mb-1">
                <button
                    className={`flex items-center w-full p-2 text-left rounded-lg transition-colors ${isActive ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    onClick={() => {
                        if (!hasChildren) {
                            onNavigate(item.path);
                        } else {
                            toggleSubMenu(item.key);
                        }
                    }}>
                    <i className={`fa-solid ${item.icon} w-5 text-center mr-3`}></i>
                    <span
                        className={collapsed ? "hidden" : "block"}
                        style={{
                            fontSize: "18px"
                        }}>{item.label}</span>
                    {hasChildren && <i
                        className={`fa-solid fa-chevron-right ml-auto transition-transform ${openKeys.includes(item.key) ? "rotate-90" : ""}`}></i>}
                </button>
                {hasChildren && openKeys.includes(item.key) && <div
                    className={`pl-6 ${collapsed ? "hidden" : ""} border-l-2 border-gray-200 dark:border-gray-700 ml-2`}>
                    {item.children?.map(child => renderMenuItem(child))}
                </div>}
            </div>
        );
    };

    return (
        <div
            className={`sidebar ${config.bgSecondary} ${config.borderColor} border-r flex flex-col h-full`}>
            <div className="flex items-center justify-between p-2">
                <div className="flex-grow"></div>
                <button
                    onClick={() => onCollapseToggle(!collapsed)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    title={collapsed ? "展开菜单" : "收起菜单"}
                    style={{
                        backgroundColor: "#FED7AA",
                        boxShadow: "rgba(0, 0, 0, 0.15) 0px 2px 6px 0px"
                    }}>
                    <i
                        className={`fa-solid ${collapsed ? "fa-angle-right" : "fa-angle-left"} transition-transform ${collapsed ? "rotate-180" : ""}`}></i>
                </button>
            </div>
            <nav
                className="flex-1 overflow-y-auto py-4 bg-secondary rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300"
                style={{
                    padding: "0px",
                    borderWidth: "0px"
                }}>
                <div
                    className="px-2"
                    style={{
                        padding: "4px"
                    }}>
                    {items.map(item => renderMenuItem(item))}
                </div>
            </nav>
            {}
            {!collapsed && <div
                className={`p-4 text-center text-xs text-gray-500 border-t ${config.borderColor}`}>
                <p>© 2025 企业管理平台</p>
                <p>版本 v1.0.0</p>
            </div>}
        </div>
    );
};

export default Sidebar;