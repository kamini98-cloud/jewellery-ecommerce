"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // ================= LOAD USER =================

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);

        // Keep existing users working
        // If no role exists, treat them as normal users
        const userWithRole = {
          ...parsedUser,
          role: parsedUser.role || "user",
        };

        setUser(userWithRole);
      }
    } catch (error) {
      console.error(
        "Failed to load user:",
        error
      );
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  // ================= SAVE USER =================

  useEffect(() => {
    if (!isAuthLoaded) return;

    try {
      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify(user)
        );
      } else {
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error(
        "Failed to save user:",
        error
      );
    }
  }, [user, isAuthLoaded]);

  // ================= LOGIN =================

  const login = (userData) => {
    const userWithRole = {
      ...userData,
      role: userData.role || "user",
    };

    setUser(userWithRole);

    // Save login immediately
    try {
      localStorage.setItem(
        "user",
        JSON.stringify(userWithRole)
      );
    } catch (error) {
      console.error(
        "Failed to save login:",
        error
      );
    }
  };

  // ================= UPDATE USER =================

  const updateUser = (updatedData) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      const updatedUser = {
        ...currentUser,
        ...updatedData,
      };

      // Save updated user immediately
      try {
        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );
      } catch (error) {
        console.error(
          "Failed to save updated user:",
          error
        );
      }

      return updatedUser;
    });
  };

  // ================= LOGOUT =================

  const logout = () => {
    setUser(null);

    try {
      localStorage.removeItem("user");
    } catch (error) {
      console.error(
        "Failed to remove user:",
        error
      );
    }
  };

  // ================= ROLE HELPERS =================

  const isAdmin = user?.role === "admin";
  const isUser = user?.role === "user";

  // ================= CONTEXT =================

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        updateUser,
        logout,
        isAuthLoaded,

        // Role information
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ================= USE AUTH =================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}