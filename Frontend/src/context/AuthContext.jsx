import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/authApi";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);


  // ==========================================
  // RESTORE SESSION ON APP LOAD
  // ==========================================

  useEffect(() => {
    const restoreSession = async () => {
      const token =
        localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await getCurrentUser();

        const currentUser =
          response?.user || response;

        setUser(currentUser);

        localStorage.setItem(
          "user",
          JSON.stringify(currentUser)
        );

      } catch (error) {
        console.error(
          "Session restore failed:",
          error
        );

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = async ({
    email,
    password,
  }) => {
    const response =
      await loginUser({
        email,
        password,
      });

    const token =
      response?.token;

    const loggedInUser =
      response?.user;

    if (!token) {
      throw new Error(
        "Authentication token was not returned"
      );
    }

    localStorage.setItem(
      "token",
      token
    );

    if (loggedInUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );
    }

    setUser(
      loggedInUser || null
    );

    return response;
  };


  // ==========================================
  // REGISTER
  // ==========================================

  const register = async ({
    name,
    email,
    password,
  }) => {
    const response =
      await registerUser({
        name,
        email,
        password,
      });

    /*
      Backend register response may or may not
      return a token.

      If token exists → immediately login.
      If not → caller can redirect to /login.
    */

    const token =
      response?.token;

    const registeredUser =
      response?.user;

    if (token) {
      localStorage.setItem(
        "token",
        token
      );

      if (registeredUser) {
        localStorage.setItem(
          "user",
          JSON.stringify(
            registeredUser
          )
        );
      }

      setUser(
        registeredUser || null
      );
    }

    return response;
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
  };


  const value = {
    user,
    loading,

    isAuthenticated:
      Boolean(user),

    login,
    register,
    logout,
  };


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


// ==========================================
// AUTH HOOK
// ==========================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}