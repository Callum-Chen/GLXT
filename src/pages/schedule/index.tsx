/* 
 * 日程管理页面
 * 提供日历视图和日程管理功能
 * 支持日/周/月视图切换和日程的增删改查操作
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "@/contexts/themeContext";
import { useContext } from "react";
import { toast } from "sonner";

interface ScheduleItem {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
    repeat: "none" | "daily" | "weekly" | "monthly";
    reminder: number;
    isShared: boolean;
    sharedWith?: string[];
}

type CalendarView = "day" | "week" | "month";

const Schedule = () => {
    const {
        config
    } = useContext(ThemeContext);

    const navigate = useNavigate();
    const [view, setView] = useState<CalendarView>("month");
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);

    const [formData, setFormData] = useState<Partial<ScheduleItem>>({
        title: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        repeat: "none",
        reminder: 0,
        isShared: false,
        reminderMethods: ["system"],
        reminderConfig: {}
    });

    useEffect(() => {
        const savedSchedules = localStorage.getItem("schedules");

        if (savedSchedules) {
            setSchedules(JSON.parse(savedSchedules));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("schedules", JSON.stringify(schedules));
    }, [schedules]);

    const changeDate = (days: number) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        setCurrentDate(newDate);
    };

    const handleViewChange = (newView: CalendarView) => {
        setView(newView);
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    const openModal = (schedule?: ScheduleItem) => {
        setIsModalOpen(true);

        if (schedule) {
            setEditingSchedule(schedule);

            setFormData({
                title: schedule.title,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                location: schedule.location,
                description: schedule.description,
                repeat: schedule.repeat,
                reminder: schedule.reminder,
                isShared: schedule.isShared,
                sharedWith: schedule.sharedWith
            });
        } else {
            const now = new Date();
            const start = new Date(now);
            start.setHours(start.getHours() + 1);
            start.setMinutes(0);
            const end = new Date(start);
            end.setHours(end.getHours() + 1);
            setEditingSchedule(null);

            setFormData({
                title: "",
                startTime: start.toISOString().slice(0, 16),
                endTime: end.toISOString().slice(0, 16),
                location: "",
                description: "",
                repeat: "none",
                reminder: 15,
                isShared: false
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);

        setFormData({
            title: "",
            startTime: "",
            endTime: "",
            location: "",
            description: "",
            repeat: "none",
            reminder: 15,
            isShared: false
        });
    };

    const saveSchedule = () => {
        if (!formData.title || !formData.startTime || !formData.endTime) {
            toast.error("请填写标题和时间");
            return;
        }

        if (new Date(formData.startTime) >= new Date(formData.endTime)) {
            toast.error("开始时间必须早于结束时间");
            return;
        }

        if (formData.reminderMethods?.includes("dingtalk") && !formData.reminderConfig?.dingtalkWebhook) {
            toast.error("请配置钉钉机器人Webhook");
            return;
        }

        if (formData.reminderMethods?.includes("wechat_work") && !formData.reminderConfig?.wechatWorkWebhook) {
            toast.error("请配置企业微信机器人Webhook");
            return;
        }

        if (formData.reminderMethods?.includes("feishu") && !formData.reminderConfig?.feishuWebhook) {
            toast.error("请配置飞书机器人Webhook");
            return;
        }

        const schedule: ScheduleItem = {
            id: editingSchedule?.id || Date.now().toString(),
            title: formData.title as string,
            startTime: formData.startTime as string,
            endTime: formData.endTime as string,
            location: formData.location,
            description: formData.description,
            repeat: formData.repeat as "none" | "daily" | "weekly" | "monthly",
            reminder: formData.reminder as number,
            reminderMethods: formData.reminderMethods || ["system"],
            reminderConfig: formData.reminderConfig || {},
            isShared: formData.isShared as boolean,
            sharedWith: formData.sharedWith
        };

        if (editingSchedule) {
            setSchedules(prev => prev.map(item => item.id === schedule.id ? schedule : item));
            toast.success("日程更新成功");
        } else {
            setSchedules(prev => [...prev, schedule]);
            toast.success("日程创建成功");
        }

        closeModal();
    };

    const deleteSchedule = (id: string) => {
        if (window.confirm("确定要删除这个日程吗？")) {
            setSchedules(prev => prev.filter(item => item.id !== id));
            toast.success("日程已删除");
        }
    };

    const renderCalendarHeader = () => {
        const formatDate = (date: Date) => {
            return date.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long"
            });
        };

        return (
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">
                        {view === "month" && currentDate.toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long"
                        })}
                        {view === "week" && `第${Math.ceil(currentDate.getDate() / 7)}周`}
                        {view === "day" && formatDate(currentDate)}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex border rounded-lg overflow-hidden">
                        <button
                            onClick={() => handleViewChange("day")}
                            className={`px-3 py-1 text-sm ${view === "day" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>日
                                                                                                </button>
                        <></>
                        <button
                            onClick={() => handleViewChange("month")}
                            className={`px-3 py-1 text-sm ${view === "month" ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>月
                                                                                                </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => changeDate(view === "month" ? -30 : view === "week" ? -7 : -1)}
                            className="p-2 rounded-lg hover:bg-gray-100">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button
                            onClick={() => {
                                setCurrentDate(new Date());
                            }}
                            className="px-3 py-1 text-sm border rounded-lg hover:bg-gray-100">今天
                                                                                                </button>
                        <button
                            onClick={() => changeDate(view === "month" ? 30 : view === "week" ? 7 : 1)}
                            className="p-2 rounded-lg hover:bg-gray-100">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                    <button onClick={() => openModal()} className="btn btn-primary">
                        <i className="fa-solid fa-plus"></i>
                        <span>新建日程</span>
                    </button>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
        const calendarDays = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarDays.push(<div
                key={`empty-${i}`}
                className="h-24 border border-gray-200 dark:border-gray-700"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isToday = date.toDateString() === new Date().toDateString();

            const daySchedules = schedules.filter(s => {
                const sDate = new Date(s.startTime);
                return sDate.getDate() === day && sDate.getMonth() === currentDate.getMonth() && sDate.getFullYear() === currentDate.getFullYear();
            });

            calendarDays.push(<div
                key={day}
                className={`border border-gray-200 dark:border-gray-700 p-2 h-24 relative ${isToday ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}>
                <div
                    className={`absolute top-1 right-2 text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>
                    {day}
                </div>
                <div className="mt-6 space-y-1 overflow-y-auto max-h-[calc(100%-24px)]">
                    {daySchedules.map(schedule => <div
                        key={schedule.id}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 p-1 rounded truncate cursor-pointer hover:bg-blue-200"
                        onClick={() => openModal(schedule)}>
                        {schedule.title}
                    </div>)}
                </div>
            </div>);
        }

        return (
            <div className="grid grid-cols-7 gap-0">
                {["日", "一", "二", "三", "四", "五", "六"].map(day => <div
                    key={day}
                    className="text-center py-2 font-medium border border-gray-200 dark:border-gray-700">
                    {day}
                </div>)}
                {calendarDays}
            </div>
        );
    };

    const renderDayView = () => {
        const daySchedules = schedules.filter(s => {
            const sDate = new Date(s.startTime);
            return sDate.toDateString() === currentDate.toDateString();
        }).sort(
            (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return (
            <div className="space-y-4">
                {daySchedules.length > 0 ? daySchedules.map(schedule => <div
                    key={schedule.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-medium">{schedule.title}</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => openModal(schedule)}
                                className="text-blue-600 hover:text-blue-800">
                                <i className="fa-solid fa-pencil"></i>
                            </button>
                            <button
                                onClick={() => deleteSchedule(schedule.id)}
                                className="text-red-600 hover:text-red-800">
                                <i className="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <i className="fa-solid fa-clock"></i>
                            <span>
                                {new Date(schedule.startTime).toLocaleTimeString("zh-CN", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}- 
                                                                                                                    {new Date(schedule.endTime).toLocaleTimeString("zh-CN", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </span>
                        </div>
                        {schedule.location && <div className="flex items-center gap-2 mt-1">
                            <i className="fa-solid fa-map-marker-alt"></i>
                            <span>{schedule.location}</span>
                        </div>}
                        {schedule.repeat !== "none" && <div className="flex items-center gap-2 mt-1">
                            <i className="fa-solid fa-sync-alt"></i>
                            <span>
                                {schedule.repeat === "daily" && "每日重复"}
                                {schedule.repeat === "weekly" && "每周重复"}
                                {schedule.repeat === "monthly" && "每月重复"}
                            </span>
                        </div>}
                        {schedule.reminder > 0 && <div className="flex items-center gap-2 mt-1">
                            <i className="fa-solid fa-bell"></i>
                            <span>提前{schedule.reminder}分钟提醒</span>
                        </div>}
                    </div>
                    {schedule.description && <div className="mt-2 text-sm border-t pt-2">
                        {schedule.description}
                    </div>}
                </div>) : <div className="text-center py-12">
                    <i
                        className="fa-solid fa-calendar-check text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                    <p className="text-gray-500 dark:text-gray-400">今天没有日程安排</p>
                </div>}
            </div>
        );
    };

    const renderWeekView = () => {
        return (
            <div className="text-center py-12">
                <i
                    className="fa-solid fa-calendar-week text-4xl text-gray-300 dark:text-gray-600 mb-2"></i>
                <p className="text-gray-500 dark:text-gray-400">周视图功能正在开发中</p>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">日程提醒</h1>
                    <p className="text-gray-500 dark:text-gray-400">管理您的个人日程和提醒事项
                                                                                  </p>
                </div>
                <></>
            </div>
            {}
            {renderCalendarHeader()}
            {}
            <div className={`card ${config.bgSecondary} p-6`}>
                {view === "month" && renderMonthView()}
                {view === "week" && renderWeekView()}
                {view === "day" && renderDayView()}
            </div>
            {}
            {isModalOpen && <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className={`card ${config.bgSecondary} w-full max-w-md`}>
                     <div className="p-6 overflow-y-auto max-h-[70vh] md:max-h-[80vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">
                                {editingSchedule ? "编辑日程" : "新建日程"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">日程标题 <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title || ""}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入日程标题" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">开始时间 <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime || ""}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">结束时间 <span className="text-red-500">*</span></label>
                                    <input
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime || ""}
                                        onChange={handleInputChange}
                                        className={`input ${config.borderColor}`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">地点</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location || ""}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}
                                    placeholder="请输入地点" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">重复</label>
                                <select
                                    name="repeat"
                                    value={formData.repeat || "none"}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}>
                                    <option value="none">不重复</option>
                                    <option value="daily">每日重复</option>
                                    <option value="weekly">每周重复</option>
                                    <option value="monthly">每月重复</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">提醒时间</label>
                                <select
                                    name="reminder"
                                    value={formData.reminder || 0}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor}`}>
                                    <option value="0">不提醒</option>
                                    <option value="5">提前5分钟</option>
                                    <option value="15">提前15分钟</option>
                                    <option value="30">提前30分钟</option>
                                    <option value="60">提前1小时</option>
                                    <option value="1440">提前1天</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">提醒方式</label>
                                 <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={true}
                                            disabled
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2">系统通知</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.reminderMethods?.includes("dingtalk")}
                                            onChange={e => {
                                                const methods = [...(formData.reminderMethods || [])];

                                                if (e.target.checked) {
                                                    methods.push("dingtalk");
                                                } else {
                                                    methods.filter(m => m !== "dingtalk");
                                                }

                                                setFormData(prev => ({
                                                    ...prev,
                                                    reminderMethods: e.target.checked ? [...new Set([...methods, "dingtalk"])] : methods.filter(m => m !== "dingtalk")
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2">钉钉</span>
                                    </label>
                                    {formData.reminderMethods?.includes("dingtalk") && <div className="ml-6">
                                        <input
                                            type="text"
                                            name="dingtalkWebhook"
                                            placeholder="钉钉机器人Webhook"
                                            value={formData.reminderConfig?.dingtalkWebhook || ""}
                                            onChange={e => {
                                                setFormData(prev => ({
                                                    ...prev,

                                                    reminderConfig: {
                                                        ...prev.reminderConfig,
                                                        dingtalkWebhook: e.target.value
                                                    }
                                                }));
                                            }}
                                            className={`input ${config.borderColor}`} />
                                    </div>}
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.reminderMethods?.includes("wechat_work")}
                                            onChange={e => {
                                                const methods = [...(formData.reminderMethods || [])];

                                                setFormData(prev => ({
                                                    ...prev,
                                                    reminderMethods: e.target.checked ? [...new Set([...methods, "wechat_work"])] : methods.filter(m => m !== "wechat_work")
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2">企业微信</span>
                                    </label>
                                    {formData.reminderMethods?.includes("wechat_work") && <div className="ml-6">
                                        <input
                                            type="text"
                                            name="wechatWorkWebhook"
                                            placeholder="企业微信机器人Webhook"
                                            value={formData.reminderConfig?.wechatWorkWebhook || ""}
                                            onChange={e => {
                                                setFormData(prev => ({
                                                    ...prev,

                                                    reminderConfig: {
                                                        ...prev.reminderConfig,
                                                        wechatWorkWebhook: e.target.value
                                                    }
                                                }));
                                            }}
                                            className={`input ${config.borderColor}`} />
                                    </div>}
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.reminderMethods?.includes("feishu")}
                                            onChange={e => {
                                                const methods = [...(formData.reminderMethods || [])];

                                                setFormData(prev => ({
                                                    ...prev,
                                                    reminderMethods: e.target.checked ? [...new Set([...methods, "feishu"])] : methods.filter(m => m !== "feishu")
                                                }));
                                            }}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                                        <span className="ml-2">飞书</span>
                                    </label>
                                    {formData.reminderMethods?.includes("feishu") && <div className="ml-6">
                                        <input
                                            type="text"
                                            name="feishuWebhook"
                                            placeholder="飞书机器人Webhook"
                                            value={formData.reminderConfig?.feishuWebhook || ""}
                                            onChange={e => {
                                                setFormData(prev => ({
                                                    ...prev,

                                                    reminderConfig: {
                                                        ...prev.reminderConfig,
                                                        feishuWebhook: e.target.value
                                                    }
                                                }));
                                            }}
                                            className={`input ${config.borderColor}`} />
                                    </div>}
                                </div>
                            </div>
                            <></>
                            <div>
                                <label className="block text-sm font-medium mb-1">备注</label>
                                <textarea
                                    name="description"
                                    value={formData.description || ""}
                                    onChange={handleInputChange}
                                    className={`input ${config.borderColor} min-h-[100px]`}
                                    placeholder="请输入备注信息"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">取消
                                                                                                                              </button>
                                <button type="button" onClick={saveSchedule} className="btn btn-primary">
                                    {editingSchedule ? "更新" : "保存"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>}
        </div>
    );
};

export default Schedule;