import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  // Redirect to login if no token, or to appropriate dashboard based on role if token exists but route doesn't match
  if (!token) {
    return <Navigate to="/" />;
  }

  // Optionally, you can add role-based route protection here
  const location = window.location.pathname;
  if (role === "super admin" && !location.startsWith("/dashboard")) {
    return <Navigate to="/dashboard" />;
  }
  if (role === "admin" && !location.startsWith("/admin-dashboard")) {
    return <Navigate to="/admin-dashboard" />;
  }
  if (role === "employee" && !location.startsWith("/employee-dashboard")) {
    return <Navigate to="/employee-dashboard" />;
  }

  return children;
};

export default PrivateRoute;