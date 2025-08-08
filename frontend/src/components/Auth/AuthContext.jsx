import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../../services/auth";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 检查cookie中的认证信息
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const authInfo = authService.checkAuth();
      if (authInfo.isAuthenticated) {
        setUser({
          userType: authInfo.userType,
          staffId: authInfo.staffId,
          staffName: authInfo.staffName,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("检查认证状态失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData) => {
    const response = await authService.login(loginData);
    if (response.status) {
      // 登录成功后重新检查认证状态
      const authInfo = authService.checkAuth();
      if (authInfo.isAuthenticated) {
        setUser({
          userType: authInfo.userType,
          staffId: authInfo.staffId,
          staffName: authInfo.staffName,
          isAuthenticated: true,
        });
        return { success: true, message: response.message };
      }
    }
    return { success: false, message: response.message };
  };

  const logout = async () => {
    await authService.logout();
    // 无论API调用是否成功，都清除本地认证信息
    authService.clearAuth();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isAuthenticated: !!user?.isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
