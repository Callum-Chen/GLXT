import { useContext, useState } from "react";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

const notificationData = [{
    id: 1,
    title: "新的审批请求",
    content: "市场部提交了新的预算审批请求，需要您处理",
    time: "今天 09:23",
    read: false,
    type: "approval",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=User%20Avatar%201&sign=7cc5e5e9d261bde8ce5fccdb28c709aa"
}, {
    id: 2,
    title: "系统更新通知",
    content: "系统将于今晚23:00进行维护更新，预计持续1小时",
    time: "昨天 18:45",
    read: false,
    type: "system",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=System%20Notification%20Icon&sign=4071e052e89eae0d66ed01bb67c14301"
}, {
    id: 3,
    title: "会议提醒",
    content: "明天上午10:00将召开产品规划会议，请准时参加",
    time: "昨天 15:30",
    read: true,
    type: "meeting",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Calendar%20Icon&sign=6e8b3f11dc30a68f4c69823bf9949e02"
}, {
    id: 4,
    title: "报销已批准",
    content: "您提交的差旅费报销已批准，款项将在3个工作日内到账",
    time: "2023-06-15",
    read: true,
    type: "approval",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Finance%20Icon&sign=872d661a02778a8ade037ed5442cab0e"
}, {
    id: 5,
    title: "新员工加入",
    content: "欢迎新员工李四加入技术部，请大家互相认识",
    time: "2023-06-14",
    read: true,
    type: "personnel",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=HR%20Icon&sign=e0865e0b922dfb8c2bec7caa5a472d73"
}, {
    id: 6,
    title: "项目截止提醒",
    content: "客户管理系统项目将于本周五截止，请确保按时完成",
    time: "2023-06-12",
    read: true,
    type: "project",
    avatar: "https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Project%20Management%20Icon&sign=fa7ad8c2939025da307de26550d5a76e"
}];

const Notifications = () => {
    const {
        config
    } = useContext(ThemeContext);

    const [notifications, setNotifications] = useState(notificationData);
    const [activeTab, setActiveTab] = useState("all");
    const [showRead, setShowRead] = useState(true);
    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? {
            ...n,
            read: true
        } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({
            ...n,
            read: true
        })));

        toast.success("所有通知已标记为已读");
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        toast.success("通知已删除");
    };

    const filteredNotifications = notifications.filter(n => {
        if (activeTab !== "all" && n.type !== activeTab)
            return false;

        if (!showRead && n.read)
            return false;

        return true;
    });

    const notificationTypes = [{
        key: "all",
        label: "全部通知",
        icon: "fa-bell"
    }, {
        key: "approval",
        label: "审批通知",
        icon: "fa-gavel"
    }, {
        key: "meeting",
        label: "会议提醒",
        icon: "fa-calendar"
    }, {
        key: "project",
        label: "项目通知",
        icon: "fa-tasks"
    }, {
        key: "system",
        label: "系统通知",
        icon: "fa-cog"
    }, {
        key: "personnel",
        label: "人事通知",
        icon: "fa-user"
    }];

    return (
        <div className="space-y-6">
            {}
            <div
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">消息通知</h1>
                    <p className="text-gray-500 dark:text-gray-400">您有 {unreadCount}条未读消息
                                                          </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        className="btn btn-secondary"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}>
                        <i className="fa-solid fa-check"></i>
                        <span
                            style={{
                                fontSize: "14px"
                            }}>全部标为已读</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="show-read"
                            checked={showRead}
                            onChange={e => setShowRead(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="show-read" className="text-sm">显示已读消息</label>
                    </div>
                </div>
            </div>
            {}
            <div className={`card ${config.bgSecondary} p-0`}>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex overflow-x-auto pb-1 scrollbar-hide">
                        {notificationTypes.map(type => <button
                            key={type.key}
                            className={`flex items-center gap-2 px-4 py-3 text-sm whitespace-nowrap ${activeTab === type.key ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 font-medium" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
                            onClick={() => setActiveTab(type.key)}>
                            <i className={`fa-solid ${type.icon}`}></i>
                            <span>{type.label}</span>
                            {type.key === "all" && unreadCount > 0 && <span
                                className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>}
                        </button>)}
                    </div>
                </div>
                {}
                {filteredNotifications.length > 0 ? <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredNotifications.map(notification => <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all ${!notification.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}>
                        <div className="flex gap-4">
                            <img
                                src={notification.avatar}
                                alt={notification.title}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div
                                    className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div>
                                        <h3 className="font-medium">{notification.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{notification.content}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{notification.time}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>}
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                disabled={notification.read}
                                                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                                                title={notification.read ? "已读" : "标记为已读"}>
                                                <i
                                                    className={`fa-solid ${notification.read ? "fa-check-circle text-green-500" : "fa-circle"}`}></i>
                                            </button>
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
                                                title="删除通知">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>)}
                </div> : <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div
                        className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                        <i className="fa-solid fa-inbox text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium mb-1">暂无通知</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                        {showRead ? "没有找到通知" : "没有未读通知，显示已读通知查看历史消息"}
                    </p>
                    {!showRead && <button
                        onClick={() => setShowRead(true)}
                        className="mt-4 text-blue-600 dark:text-blue-400 hover:underline">显示已读通知
                                                              </button>}
                </div>}
            </div>
            {}
            {filteredNotifications.length > 0 && <div className="flex items-center justify-center pt-4">
                <></>
            </div>}
        </div>
    );
};

export default Notifications;