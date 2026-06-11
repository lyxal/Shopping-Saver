import { createContext, useContext, useState } from "react";

type AuthContextType = {
  userID: string | null;
  setUserID: React.Dispatch<React.SetStateAction<string>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const userIDStorageKey = "shopping-saver-user-id";

const getStoredUserID = () => {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(userIDStorageKey) ?? "";
  } catch {
    return "";
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userID, setUserIDState] = useState(getStoredUserID);

  const setUserID: React.Dispatch<React.SetStateAction<string>> = (value) => {
    setUserIDState((currentValue) => {
      const nextValue =
        typeof value === "function" ? value(currentValue) : value;

      if (typeof window !== "undefined") {
        try {
          if (nextValue) {
            window.localStorage.setItem(userIDStorageKey, nextValue);
          } else {
            window.localStorage.removeItem(userIDStorageKey);
          }
        } catch {
          // Local storage is best-effort only.
        }
      }

      return nextValue;
    });
  };

  return (
    <AuthContext.Provider value={{ userID, setUserID }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
