// @ts-nocheck

import { useEffect, useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Container,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  Chip,
  TextField,
  Alert,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import StoreIcon from "@mui/icons-material/Store";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { User } from "lucide-react";

export default function Settings() {
  const [isShopOpen, setIsShopOpen] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        return user.open ?? false; // false par défaut si non défini
      } catch {
        return false;
      }
    }
    return false;
  });

  const [userData, setUserData] = useState(null);
  const [openPersonalInfoDialog, setOpenPersonalInfoDialog] = useState(false);
  const [openSecurityDialog, setOpenSecurityDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordError, setPasswordError] = useState("");

  const toggleShopStatus = async () => {
    const newStatus = !isShopOpen;

    try {
      const response = await fetch(
        `http://localhost:5000/sellers/${userData._id}/shop-status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ open: newStatus }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setIsShopOpen(newStatus);
        // Mise à jour locale si nécessaire
        const updatedUser = { ...userData, open: newStatus };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = () => {
    // Validation
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas");
      return;
    }
    if (passwordData.new.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Ici vous ajouterez la logique pour envoyer au backend
    console.log("Changement de mot de passe:", passwordData);

    // Réinitialiser après soumission
    setPasswordData({
      current: "",
      new: "",
      confirm: "",
    });
    setPasswordError("");
    setOpenSecurityDialog(false);
  };

  if (!userData) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Typography variant="h6">
          Chargement des données utilisateur...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Title */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Paramètres
      </Typography>

      {userData?.Role === "seller" && (
        <Card sx={{ p: 2, mt: 2, display: "flex", alignItems: "center" }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">Statut de la boutique</Typography>
            <Typography color="text.secondary">
              {isShopOpen ? "Actuellement ouverte" : "Actuellement fermée"}
            </Typography>
          </Box>
          <Button
            startIcon={isShopOpen ? <StorefrontIcon /> : <StoreIcon />}
            onClick={toggleShopStatus}
            color={isShopOpen ? "success" : "error"}
            variant="outlined"
          >
            {isShopOpen ? "Fermer boutique" : "Ouvrir boutique"}
          </Button>
        </Card>
      )}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 3 }}>
        {/* Profile Section */}
        <Card
          sx={{
            p: 3,
            textAlign: "center",
            position: "relative",
            borderRadius: 3,
            boxShadow: 2,
          }}
        >
          {/* Avatar */}
          <User className="width-96 height-96 mx-auto mb-2" />

          {/* Camera Button */}
          <IconButton
            color="primary"
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "background.paper",
              boxShadow: 2,
              "&:hover": { bgcolor: "grey.100" },
            }}
          >
            <CameraAltIcon />
          </IconButton>

          {/* User Info */}
          <Typography variant="h6" fontWeight="600">
            {userData.FullName}
          </Typography>
          <Chip
            label={userData.Role === "seller" ? "Vendeur" : "Client"}
            color={userData.Role === "seller" ? "primary" : "secondary"}
            sx={{ mt: 1 }}
          />
        </Card>

        {/* Settings List */}
        <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
          <List disablePadding>
            <ListItem
              button
              divider
              onClick={() => setOpenPersonalInfoDialog(true)}
            >
              <ListItemIcon>
                <PersonIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Informations personnelles"
                secondary={
                  userData.Role === "seller"
                    ? "Voir les détails du compte"
                    : "Voir vos informations"
                }
              />
              <ChevronRightIcon color="action" />
            </ListItem>

            <ListItem
              button
              divider
              onClick={() => setOpenSecurityDialog(true)}
            >
              <ListItemIcon>
                <SecurityIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Sécurité"
                secondary="Modifier le mot de passe"
              />
              <ChevronRightIcon color="action" />
            </ListItem>

            <ListItem button>
              <ListItemIcon>
                <NotificationsActiveIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Notifications"
                secondary="Préférences de notification"
              />
              <ChevronRightIcon color="action" />
            </ListItem>
          </List>
        </Card>
      </Box>
      {/* Personal Information Dialog */}
      <Dialog
        open={openPersonalInfoDialog}
        onClose={() => setOpenPersonalInfoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            Informations personnelles
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" mt={2}>
                <PersonIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="h6">{userData.FullName}</Typography>
              </Box>
              <Divider />
            </Grid>

            {userData.Role === "seller" && (
              <>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <StoreIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">
                        Nom de la boutique
                      </Typography>
                      <Typography>
                        {userData.ShopName || "Non spécifié"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">Email</Typography>
                      <Typography>{userData.Email}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">Téléphone</Typography>
                      <Typography>{userData.PhoneNumber}</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle2">Localisation</Typography>
                      <Typography>{userData.Place}</Typography>
                    </Box>
                  </Box>
                </Grid>

                {userData.description && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="flex-start">
                      <DescriptionIcon color="primary" sx={{ mr: 2, mt: 1 }} />
                      <Box>
                        <Typography variant="subtitle2">Description</Typography>
                        <Typography>{userData.description}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={14}>
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  width: "100%",
                }}
              >
                <SecurityIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="subtitle2">Rôle</Typography>
                  <Chip
                    label={userData.Role === "seller" ? "Vendeur" : "Client"}
                    color={userData.Role === "seller" ? "primary" : "secondary"}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPersonalInfoDialog(false)}
            color="primary"
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      {/* Security Dialog - Password Change */}
      <Dialog
        open={openSecurityDialog}
        onClose={() => setOpenSecurityDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <TextField
              label="Ancien mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              name="current"
              value={passwordData.current}
              onChange={handlePasswordChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              name="new"
              value={passwordData.new}
              onChange={handlePasswordChange}
              margin="normal"
            />

            <TextField
              label="Confirmer le nouveau mot de passe"
              type={showPassword ? "text" : "password"}
              fullWidth
              name="confirm"
              value={passwordData.confirm}
              onChange={handlePasswordChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSecurityDialog(false)}>Annuler</Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={
              !passwordData.current ||
              !passwordData.new ||
              !passwordData.confirm
            }
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
