import { useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LillyApp from "./pages/Home";

function App() {
    // =========================================
    // LOAD SAVED USER
    // =========================================

    const [user, setUser] = useState(() => {
        const savedUser =
            localStorage.getItem("lillyUser");

        if (!savedUser) {
            return null;
        }

        try {
            return JSON.parse(savedUser);
        } catch {
            localStorage.removeItem("lillyUser");
            return null;
        }
    });

    const [showSignup, setShowSignup] = useState(false);

    // =========================================
    // LOGIN
    // =========================================

    function handleLogin(userData) {
        localStorage.setItem(
            "lillyUser",
            JSON.stringify(userData)
        );

        setUser(userData);
    }

    // =========================================
    // LOGOUT
    // =========================================

    function handleLogout() {
        localStorage.removeItem("lillyUser");

        setUser(null);
        setShowSignup(false);
    }

    // =========================================
    // NOT LOGGED IN
    // =========================================

    if (!user) {
        if (showSignup) {
            return (
                <Signup
                    onLogin={handleLogin}
                    onSwitchToLogin={() => {
                        setShowSignup(false);
                    }}
                />
            );
        }

        return (
            <Login
                onLogin={handleLogin}
                onSwitchToSignup={() => {
                    setShowSignup(true);
                }}
            />
        );
    }

    // =========================================
    // LOGGED IN
    // =========================================

    return (
        <LillyApp
            user={user}
            onLogout={handleLogout}
        />
    );
}

export default App;