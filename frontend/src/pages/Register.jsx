import React from "react";
import LoginRegistrationForm from "../components/LoginRegistrationForm";

function Register() {
    return <LoginRegistrationForm route="/api/user/register/" method="register" />;
}

export default Register;
