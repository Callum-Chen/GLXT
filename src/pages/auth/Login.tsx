import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/contexts/authContext";
import { ThemeContext } from "@/contexts/themeContext";
import { toast } from "sonner";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        login
    } = useContext(AuthContext);

    const {
        config
    } = useContext(ThemeContext);

    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error("请输入用户名和密码");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const success = login(username, password);
            setLoading(false);

            if (success) {
                toast.success("登录成功");
                navigate("/dashboard");
            } else {
                toast.error("用户名或密码错误");
            }
        }, 800);
    };

    return (
        <div className={`card ${config.bgSecondary} p-6`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium mb-1">用户名</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <></>
                        </span>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入用户名"
                            autoComplete="username"
                            required />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium mb-1">密码</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <></>
                        </span>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={`input ${config.borderColor}`}
                            placeholder="请输入密码"
                            autoComplete="current-password"
                            required />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm">记住我
                                        </label>
                    </div>
                    <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-500"
                        onClick={() => toast.info("请联系管理员重置密码")}>忘记密码?
                                  </button>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`btn btn-primary w-full ${loading ? "opacity-80 cursor-not-allowed" : ""}`}>
                    {loading ? <>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                        <span>登录中...</span>
                    </> : "登录"}
                </button>
            </form>
            <div className="mt-6 text-center text-sm">
                <p>还没有账户?{" "}
                    <button
                        className="text-blue-600 hover:text-blue-500"
                        onClick={() => toast.info("请联系管理员创建账户")}>联系管理员
                                  </button>
                </p>
            </div>
        </div>
    );
};

export default Login;