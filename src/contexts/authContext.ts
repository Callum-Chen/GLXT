/* 
 * 认证上下文
 * 提供用户认证状态管理，包括登录、注销功能
 * 允许应用程序各组件访问和修改认证状态
 */
import { createContext } from "react";

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  avatar: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user?: User;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});