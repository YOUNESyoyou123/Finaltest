// @ts-nocheck

import React, { useState, useEffect } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useNavigate } from "react-router-dom";

const MobileFooter = () => {
  const [value, setValue] = useState(0);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setRole(user.Role);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleNavigation = (newValue) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate("/market");
        break;
      case 1:
        navigate("/GestionStore");
        break;
      case 2:
        navigate("/Settings");
        break;
      case 3:
        navigate(role === "seller" ? "/Settings" : "/Settings");
        break;
      default:
        navigate("/market");
    }
  };

  // Don't display footer if no role in localStorage
  if (!role) {
    return null;
  }

  return (
    <Paper
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: { xs: "block", md: "none" },
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        zIndex: 1000,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => handleNavigation(newValue)}
      >
        <BottomNavigationAction label="Main" icon={<HomeIcon />} />
        {role === "seller" && (
          <BottomNavigationAction
            label="Add"
            icon={<AddCircleIcon sx={{ fontSize: 35 }} />}
          />
        )}

        <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileFooter;
