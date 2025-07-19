// @ts-nocheck

import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  InputBase,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  alpha,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// ✅ Style de la barre de recherche
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(2),
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    width: "400px",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
  },
}));

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <AppBar position="static" sx={{ background: "#1976d2" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Bouton menu mobile */}
          <IconButton
            color="inherit"
            edge="start"
            sx={{ display: { xs: "flex", md: "none" } }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo ou Titre */}
          <Typography variant="h6" noWrap>
            Sougi
          </Typography>

          {/* Barre de recherche */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "search" }}
              />
            </Search>
          </Box>

          {/* Boutons Desktop */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
            <IconButton color="inherit">
              <ShoppingCartIcon />
            </IconButton>
            <Button color="inherit">Login</Button>
            <IconButton color="inherit">
              <AccountCircleIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menu Mobile */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
          <List>
            <ListItem>
              <Search sx={{ width: "100%" }}>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Search…" />
              </Search>
            </ListItem>
            <ListItem button>
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <ListItemText primary="Cart" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Profile" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
