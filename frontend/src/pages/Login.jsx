import { useState } from "react";
import { loginUser } from "../api";
import "./Auth.css";

function Login({ onLogin, onSwitchToSignup }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    async function handleSubmit(e) {

        e.preventDefault();

        setError("");


        if (!email || !password) {

            setError(
                "Please enter your email and password."
            );

            return;
        }


        try {

            setLoading(true);

            const data = await loginUser(
                email,
                password
            );

            onLogin(data.user);

        } catch (err) {

            setError(
                err.message || "Login failed."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <div className="auth-page">

            <div className="auth-card">

                <div className="auth-logo">
                    L
                </div>


                <h1>
                    Welcome back
                </h1>


                <p className="auth-subtitle">
                    Login to continue learning with Lilly
                </p>


                <form onSubmit={handleSubmit}>

                    {/* EMAIL */}

                    <div className="input-group">

                        <label>
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>


                    {/* PASSWORD */}

                    <div className="input-group">

                        <label>
                            Password
                        </label>

                        <div className="password-field">

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                            />

                            <button
                                type="button"
                                className="eye-button"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword ? "◉" : "◌"}
                            </button>

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div className="auth-error">
                            {error}
                        </div>

                    )}


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="auth-button"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"
                        }

                    </button>

                </form>


                {/* SWITCH */}

                <div className="auth-switch">

                    <span>
                        Don't have an account?
                    </span>

                    <button
                        onClick={onSwitchToSignup}
                        className="link-button"
                    >
                        Create account
                    </button>

                </div>

            </div>

        </div>

    );

}


export default Login;