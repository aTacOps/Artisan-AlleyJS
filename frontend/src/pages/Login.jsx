import React from "react";
import LoginRegistrationForm from "../components/LoginRegistrationForm";

function Login() {
    return (
        <div>
            <h1>Login</h1>
            <LoginRegistrationForm route="/api/token/" method="login" />
        </div>
    );
}

export default Login;