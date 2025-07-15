import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const SocialLoginHandler = ({ setToken, setRole }) => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    console.log("Received token:", token); 
    console.log("Full URL:", window.location.href);

    if (error) {
      alert("Social login failed.");
      navigate("/auth");
      return;
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const role = payload.role;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setToken(token);
        setRole(role);
        console.log("Login successful. Redirecting...");

        navigate(role === "admin" ? "/admin/dashboard" : "/user/home");
      } catch (err) {
        console.error("Token parse failed", err);
        alert("Login failed. Invalid token.");
        navigate("/auth");
      }
    } else {
      console.error("Token not found in URL");
      alert("Login failed. No token found.");
      navigate("/auth");
    }
  }, [navigate, setToken, setRole]);

  return <div>Redirecting after login...</div>;
};

export default SocialLoginHandler;
