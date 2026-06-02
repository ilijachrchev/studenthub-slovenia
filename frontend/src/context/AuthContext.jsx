import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch ("/api/auth/me", { credentials: "include" });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
            setLoading(false);
            }
        } 
        loadUser();
    }, []);


    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}