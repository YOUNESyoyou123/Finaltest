// @ts-nocheck

import React from "react";
import { Link } from "react-router-dom";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CardActionArea,
  Box,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";

const RegisterChoice: React.FC = () => {
  const choices = [
    {
      title: "I am a Client",
      subtitle: "Sign up as a customer to access our services",
      icon: <PersonIcon sx={{ fontSize: 60, color: "#1976d2" }} />,
      route: "/loginclient", // ✅ route vers Login client
    },
    {
      title: "I am a Seller",
      subtitle: "Create a seller account to manage your shop",
      icon: <StorefrontIcon sx={{ fontSize: 60, color: "#388e3c" }} />,
      route: "/loginseller", // ✅ route vers Login seller
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center", // ✅ centre horizontalement
        alignItems: "center", // ✅ centre verticalement
        minHeight: "100vh", // ✅ prend toute la hauteur de l’écran
        backgroundColor: "#f5f5f5", // ✅ fond optionnel
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          boxShadow: 2,
          py: 4,
          bgcolor: "white",
          borderRadius: 3,
        }}
      >
        {/* Titre */}
        <Typography align="center" gutterBottom sx={{ fontWeight: "bold" }}>
          Choose Your Account Type
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          sx={{ mb: 5 }}
        >
          Please select the type of account you want to create
        </Typography>

        {/* Grid responsive */}
        <Grid
          container
          spacing={2}
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {choices.map((choice, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
                  },
                }}
              >
                <CardActionArea>
                  <Box sx={{ mt: 3 }}>{choice.icon}</Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {choice.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {choice.subtitle}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ pb: 3 }}>
                  {/* ✅ Le bouton redirige vers la bonne route */}
                  <Button
                    component={Link}
                    to={choice.route}
                    variant="contained"
                    color="primary"
                    sx={{
                      mt: 1,
                      px: 4,
                      py: 1,
                      textTransform: "none",
                      borderRadius: "8px",
                    }}
                  >
                    Select
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default RegisterChoice;
