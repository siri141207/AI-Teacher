const API_URL = "http://localhost:8000/api";

// ==========================================
// SIGNUP
// ==========================================

export async function signupUser(full_name, email, password) {
    const response = await fetch(
        `${API_URL}/auth/signup`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                full_name,
                email,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Signup failed"
        );
    }

    return data;
}

// ==========================================
// LOGIN
// ==========================================

export async function loginUser(email, password) {
    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Login failed"
        );
    }

    return data;
}

// ==========================================
// LOGOUT
// ==========================================

export async function logoutUser() {
    const response = await fetch(
        `${API_URL}/auth/logout`,
        {
            method: "POST",
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Logout failed"
        );
    }

    return data;
}