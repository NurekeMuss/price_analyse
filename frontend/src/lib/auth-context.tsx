"use client";

import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthService, {
  type User,
  type LoginData,
  type RegisterData,
  type TwoFactorEnableResponse,
  type TwoFactorVerifyResponse,
} from "./auth-service";
import UserService from "./user-service";
import toast from "react-hot-toast";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<any>;
  verifyTwoFactorLogin: (temporaryToken: string, code: string) => Promise<any>;
  enableTwoFactor: (password: string) => Promise<TwoFactorEnableResponse>;
  verifyTwoFactorSetup: (code: string) => Promise<TwoFactorVerifyResponse>;
  disableTwoFactor: (password: string, code: string) => Promise<boolean>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Check if we have a token
        if (AuthService.isAuthenticated()) {
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // If we have a token but can't get user data, tokens might be invalid
            await AuthService.logout();
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
        // If there's an error, clear any invalid tokens
        await AuthService.logout();
      } finally {
        setLoading(false);
      }
    };

    // Only run on client side to prevent hydration mismatch
    if (typeof window !== "undefined") {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loginData: LoginData = {
        username: email, // API expects username field but uses email
        password,
      };

      const authResponse = await AuthService.login(loginData);

      // Check if 2FA is required
      if ("requires_2fa" in authResponse && authResponse.requires_2fa) {
        setLoading(false);
        return authResponse;
      }

      // If 2FA not required, we already have tokens, fetch user data
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setLoading(false);
        return authResponse;
      }

      throw new Error("Failed to get user data");
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      throw error;
    }
  };

  const verifyTwoFactorLogin = async (temporaryToken: string, code: string) => {
    setLoading(true);
    try {
      await AuthService.verifyTwoFactorLogin(temporaryToken, code);

      // After successful 2FA verification, we have tokens, fetch user data
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(userData);
        setLoading(false);
        return true;
      }

      throw new Error("Failed to get user data after 2FA verification");
    } catch (error) {
      console.error("2FA login verification error:", error);
      setLoading(false);
      throw error;
    }
  };

  const enableTwoFactor = async (password: string) => {
    try {
      const response = await AuthService.enableTwoFactor(password);
      return response;
    } catch (error) {
      console.error("Enable 2FA error:", error);
      throw error;
    }
  };

  const verifyTwoFactorSetup = async (code: string) => {
    try {
      const response = await AuthService.verifyTwoFactorSetup(code);

      // If verification successful, update user object
      if (response.is_verified && user) {
        setUser({
          ...user,
          is_2fa_enabled: true,
        });
      }

      return response;
    } catch (error) {
      console.error("Verify 2FA setup error:", error);
      throw error;
    }
  };

  const disableTwoFactor = async (password: string, code: string) => {
    try {
      const success = await AuthService.disableTwoFactor(password, code);

      // If disable successful, update user object
      if (success && user) {
        setUser({
          ...user,
          is_2fa_enabled: false,
        });
      }

      return success;
    } catch (error) {
      console.error("Disable 2FA error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const registerData: RegisterData = {
        email: data.email,
        password_hash: data.password, // API expects password_hash
        first_name: data.first_name,
        last_name: data.last_name,
        role: "user", // Default role
      };

      await AuthService.register(registerData);

      // After registration, log the user in
      try {
        await login(data.email, data.password);
        return true;
      } catch (loginError) {
        console.error("Auto-login after registration failed:", loginError);
        // Even if auto-login fails, registration was successful
        return true;
      }
    } catch (error) {
      console.error("Registration error:", error);
      setLoading(false);
      return false;
    }
  };

  // Modify the logout function to not clear user from localStorage
  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
  };

  // Check if the current user is an admin
  const isAdmin = () => {
    if (!user) return false;
    return user.role === "admin" || UserService.isAdmin();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        verifyTwoFactorLogin,
        enableTwoFactor,
        verifyTwoFactorSetup,
        disableTwoFactor,
        register,
        logout,
        loading,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
