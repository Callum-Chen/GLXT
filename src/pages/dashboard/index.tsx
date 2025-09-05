import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "@/contexts/themeContext";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

type DashboardWidget = {
    id: string;
    title: string;
    type: "stats" | "performance" | "tasks" | "activities" | "taskCompletion";
};

const performanceData = [{
    name: "1月",
    value: 4000
}, {
    name: "2月",
    value: 3000
}, {
    name: "3月",
    value: 5000
}, {
    name: "4月",
    value: 4500
}, {
    name: "5月",
    value: 6000
}, {
    name: "6月",
    value: 5500
}];

const taskStatusData = [{
    name: "已完成",
    value: 65,
    color: "#10b981"
}, {
    name: "进行中",
    value: 25,
    color: "#3b82f6"
}, {
    name: "待处理",
    value: 10,
    color: "#6b7280"
}];

const recentActivities = [{
    id: 1,
    title: "请假申请已批准",
    time: "今天 09:23",
    user: "张三",
    type: "success"
}, {
    id: 2,
    title: "新的报销单需要您审批",
    time: "昨天 15:47",
    user: "李四",
    type: "info"
}, {
    id: 3,
    title: "系统参数已更新",
    time: "昨天 10:12",
    user: "系统管理员",
    type: "system"
}, {
    id: 4,
    title: "采购申请已拒绝",
    time: "2023-06-15",
    user: "王五",
    type: "warning"
}, {
    id: 5,
    title: "新员工加入部门",
    time: "2023-06-14",
    user: "人力资源",
    type: "info"
}];

const pendingTasks = [{
    id: 1,
    title: "审批市场部预算申请",
    due: "今天 18:00",
    priority: "high"
}, {
    id: 2,
    title: "完成季度工作报告",
    due: "明天 12:00",
    priority: "medium"
}, {
    id: 3,
    title: "参加产品规划会议",
    due: "明天 14:30",
    priority: "medium"
}, {
    id: 4,
    title: "审核新员工入职资料",
    due: "2023-06-20",
    priority: "low"
}];

const DEFAULT_WIDGETS: DashboardWidget[] = [{
    id: "stats",
    title: "统计卡片",
    type: "stats"
}, {
    id: "performance",
    title: "业绩趋势",
    type: "performance"
}, {
    id: "taskCompletion",
    title: "任务完成情况",
    type: "taskCompletion"
}, {
    id: "tasks",
    title: "待处理任务",
    type: "tasks"
}, {
    id: "activities",
    title: "最近活动",
    type: "activities"
}];

const Dashboard = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [currentTime, setCurrentTime] = useState(new Date());
    const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);

    useEffect(() => {
        const savedWidgets = localStorage.getItem("dashboardWidgets");

        if (savedWidgets) {
            try {
                setWidgets(JSON.parse(savedWidgets));
            } catch (error) {
                console.error("Failed to parse saved widgets", error);
                localStorage.removeItem("dashboardWidgets");
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("dashboardWidgets", JSON.stringify(widgets));
    }, [widgets]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const onDragEnd = (result: DropResult) => {
        const {
            destination,
            source
        } = result;

        if (!destination || destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newWidgets = Array.from(widgets);
        const [removed] = newWidgets.splice(source.index, 1);
        newWidgets.splice(destination.index, 0, removed);
        setWidgets(newWidgets);
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();

        if (hour < 12)
            return "早上好";

        if (hour < 18)
            return "下午好";

        return "晚上好";
    };

    const getCurrentUser = () => {
        const userStr = localStorage.getItem("currentUser");

        return userStr ? JSON.parse(userStr) : {
            name: "用户"
        };
    };

    const currentUser = getCurrentUser();

    const renderWidget = (widget: DashboardWidget) => {
        switch (widget.type) {
        case "stats":
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className={`card ${config.bgSecondary} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">待办任务</p>
                                <h3 className="text-2xl font-bold mt-1">12</h3>
                                <p className="text-xs text-green-500 mt-1">
                                    <i className="fa-solid fa-arrow-down"></i>较上周减少 3 项
                                                                                                                              </p>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <i className="fa-solid fa-tasks"></i>
                            </div>
                        </div>
                    </div>
                    <div className={`card ${config.bgSecondary} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">待审批事项</p>
                                <h3 className="text-2xl font-bold mt-1">8</h3>
                                <p className="text-xs text-red-500 mt-1">
                                    <i className="fa-solid fa-arrow-up"></i>较上周增加 2 项
                                                                                                                              </p>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                <i className="fa-solid fa-gavel"></i>
                            </div>
                        </div>
                    </div>
                    <div className={`card ${config.bgSecondary} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">进行中项目</p>
                                <h3 className="text-2xl font-bold mt-1">5</h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    <i className="fa-solid fa-minus"></i>与上周持平
                                                                                                                              </p>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                                <i className="fa-solid fa-project-diagram"></i>
                            </div>
                        </div>
                    </div>
                    <div className={`card ${config.bgSecondary} p-4`}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">未读消息</p>
                                <h3 className="text-2xl font-bold mt-1">15</h3>
                                <p className="text-xs text-orange-500 mt-1">
                                    <i className="fa-solid fa-bell"></i>包含 3 条重要消息
                                                                                                                              </p>
                            </div>
                            <div
                                className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <i className="fa-solid fa-envelope"></i>
                            </div>
                        </div>
                    </div>
                </div>
            );
        case "performance":
            return (
                <div className={`card ${config.bgSecondary} p-4 lg:col-span-2`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">业绩趋势</h3>
                        <div className="flex gap-2">
                            <button
                                className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">月度</button>
                            <button
                                className="px-3 py-1 text-xs rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">季度</button>
                            <button
                                className="px-3 py-1 text-xs rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">年度</button>
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        case "taskCompletion":
            return (
                <div className={`card ${config.bgSecondary} p-4`}>
                    <h3 className="font-semibold mb-4">任务完成情况</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={(
                                        {
                                            name,
                                            percent
                                        }
                                    ) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                    {taskStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                        {taskStatusData.map((item, index) => <div key={index} className="text-sm">
                            <div className="flex items-center justify-center gap-1">
                                <span
                                    className="w-3 h-3 rounded-full"
                                    style={{
                                        backgroundColor: item.color
                                    }}></span>
                                <span>{item.name}</span>
                            </div>
                            <div className="font-medium">{item.value}%</div>
                        </div>)}
                    </div>
                </div>
            );
        case "tasks":
            return (
                <div className={`card ${config.bgSecondary} p-4`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">待处理任务</h3>
                        <button className="text-sm text-blue-600 dark:text-blue-400">查看全部</button>
                    </div>
                    <div className="space-y-3">
                        {pendingTasks.map(task => <div
                            key={task.id}
                            className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-medium">{task.title}</h4>
                                    <div
                                        className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <i className="fa-solid fa-clock-o"></i>
                                            <span>{task.due}</span>
                                        </span>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-xs ${task.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : task.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>
                                            {task.priority === "high" ? "高优先级" : task.priority === "medium" ? "中优先级" : "低优先级"}
                                        </span>
                                    </div>
                                </div>
                                <button className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                                    <i className="fa-solid fa-ellipsis-v"></i>
                                </button>
                            </div>
                            <div className="mt-3 flex justify-end gap-2">
                                <button
                                    className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">推迟
                                                                                                                                </button>
                                <button
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">处理
                                                                                                                                </button>
                            </div>
                        </div>)}
                    </div>
                </div>
            );
        case "activities":
            return (
                <div className={`card ${config.bgSecondary} p-4`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">最近活动</h3>
                        <button className="text-sm text-blue-600 dark:text-blue-400">更多</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivities.map(activity => <div key={activity.id} className="flex gap-3">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.type === "success" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : activity.type === "info" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : activity.type === "warning" ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
                                <i
                                    className={`fa-solid ${activity.type === "success" ? "fa-check" : activity.type === "info" ? "fa-info" : activity.type === "warning" ? "fa-exclamation" : "fa-cog"}`}></i>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    <span className="font-medium">{activity.user}</span>
                                    <span className="ml-1">{activity.title}</span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activity.time}</p>
                            </div>
                        </div>)}
                    </div>
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
                    <h1 className="text-2xl font-bold">{getGreeting()}, {currentUser.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {currentTime.toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long"
                        })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="btn btn-secondary">
                        <i className="fa-solid fa-refresh"></i>
                        <span>刷新数据</span>
                    </button>
                    <></>
                </div>
            </div>
            {}
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="dashboard">
                    {provided => <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="space-y-6">
                        {widgets.map(
                            (widget, index) => <Draggable key={widget.id} draggableId={widget.id} index={index}>
                                {(provided, snapshot) => <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`transition-all ${snapshot.isDragging ? "shadow-lg bg-white/80 dark:bg-gray-800/80" : ""}`}>
                                    {}
                                    <></>
                                    {}
                                    {renderWidget(widget)}
                                </div>}
                            </Draggable>
                        )}
                        {provided.placeholder}
                    </div>}
                </Droppable>
            </DragDropContext>
        </div>
    );
};

export default Dashboard;