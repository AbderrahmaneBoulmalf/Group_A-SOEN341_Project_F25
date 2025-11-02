import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";

interface Props {
  role: string;
}

const ProtectedRoutes: React.FC<Props> = ({ role }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8787/verify-session",
          { withCredentials: true }
        );
        if (
          response.data.success &&
          response.data.role.toLowerCase() === role.toLowerCase()
        ) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, [role]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/unauthorized" />;
};

export default ProtectedRoutes;
