// @ts-nocheck

import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Divider,
  Chip,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { Store, PhotoCamera, Add, Delete, Euro } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

interface ShopInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  image: string | null;
}

interface Product {
  _id: string;
  ProductName: string;
  Price: number; // S'assurer que c'est bien un number
  Description: string;
  ProductImage: string | null;
  category: string;
  IdresponsibleShop: string;
}

export default function GestionStore() {
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    image: null,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    ProductName: "",
    Price: 0,
    Description: "",
    ProductImage: null as File | null,
    category: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning" = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const getSellerFromStorage = () => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    return JSON.parse(stored);
  };

  useEffect(() => {
    const fetchSellerInfo = async () => {
      const seller = getSellerFromStorage();
      if (!seller) {
        showSnackbar("Aucun vendeur trouvé en localStorage", "error");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/sellers/${seller._id}`
        );
        const data = await response.json();

        if (response.ok) {
          setShopInfo({
            name: data.ShopName || "",
            address: data.Place || "",
            phone: data.PhoneNumber || "",
            email: data.Email || "",
            description: data.description || "",
            image: data.shopImage || null,
          });
          showSnackbar("✅ Données du magasin chargées", "success");
        }
      } catch (error) {
        console.error("Erreur fetch seller:", error);
        showSnackbar("Erreur de connexion au serveur", "error");
      }
    };

    fetchSellerInfo();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const seller = getSellerFromStorage();
    if (!seller) return;

    try {
      const response = await fetch(
        `http://localhost:5000/products/seller/${seller._id}`
      );
      const data = await response.json();

      if (response.ok) {
        setProducts(data);
      } else {
        showSnackbar(
          `❌ Erreur lors du chargement des produits: ${data.message}`,
          "error"
        );
      }
    } catch (error) {
      console.error("Erreur fetch products:", error);
      showSnackbar("Erreur de connexion au serveur", "error");
    }
  };

  const handleShopChange = (field: keyof ShopInfo, value: string) => {
    setShopInfo((prev) => ({ ...prev, [field]: value }));
  };

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "younes");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dx9sn5ugl/image/upload",
        { method: "POST", body: formData }
      );
      const data = await res.json();
      return res.ok ? data.secure_url : null;
    } catch (error) {
      console.error("Cloudinary error:", error);
      return null;
    }
  };

  const sauvgardershoinfo = async () => {
    const seller = getSellerFromStorage();
    if (!seller) {
      showSnackbar("⚠️ Aucun vendeur connecté", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/sellers/${seller._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ShopName: shopInfo.name,
            Place: shopInfo.address,
            PhoneNumber: shopInfo.phone,
            Email: shopInfo.email,
            description: shopInfo.description,
            shopImage: shopInfo.image,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSnackbar("✅ Magasin mis à jour avec succès", "success");
        localStorage.setItem("sellerInfo", JSON.stringify(data));
      } else {
        showSnackbar(`❌ Erreur : ${data.message}`, "error");
      }
    } catch (error) {
      console.error(error);
      showSnackbar("Erreur de connexion au serveur", "error");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.ProductName || newProduct.Price <= 0) {
      showSnackbar("Nom et prix valide obligatoires !", "error");
      return;
    }

    const seller = getSellerFromStorage();
    if (!seller?._id) {
      showSnackbar("⚠️ Aucun vendeur connecté", "error");
      return;
    }

    try {
      let productImageUrl = null;
      if (newProduct.ProductImage) {
        productImageUrl = await uploadToCloudinary(newProduct.ProductImage);
      }

      const response = await fetch("http://localhost:5000/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ProductName: newProduct.ProductName,
          Price: Number(newProduct.Price),
          Description: newProduct.Description,
          ProductImage: productImageUrl,
          IdresponsibleShop: seller._id,
          category: newProduct.category,
          ShopName: seller.ShopName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Produit ajouté avec succès ✅", "success");
        setNewProduct({
          ProductName: "",
          Price: 0,
          Description: "",
          ProductImage: null,
          category: "",
        });
        fetchProducts();
      } else {
        showSnackbar(`❌ Erreur : ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erreur ajout produit:", error);
      showSnackbar("Erreur de connexion au serveur", "error");
    }
  };

  const handleRemoveProduct = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Produit supprimé avec succès ❌", "info");
        fetchProducts();
      } else {
        const data = await response.json();
        showSnackbar(`❌ Erreur : ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erreur suppression produit:", error);
      showSnackbar("Erreur de connexion au serveur", "error");
    }
  };

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const handleEditClick = (product: Product) => {
    setEditingProduct({
      ...product,
      category: product.category || "", // Garantit une chaîne vide si category est undefined
    });
    setIsEditDialogOpen(true);
    setNewImageFile(null);
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      let imageUrl = editingProduct.ProductImage;

      // Upload nouvelle image si fournie
      if (newImageFile) {
        const uploadedUrl = await uploadToCloudinary(newImageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const response = await fetch(
        `http://localhost:5000/products/${editingProduct._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ProductName: editingProduct.ProductName,
            Price: editingProduct.Price,
            Description: editingProduct.Description,
            ProductImage: imageUrl,
            category: editingProduct.category,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Produit modifié avec succès ✅", "success");
        setProducts(
          products.map((p) => (p._id === editingProduct._id ? data.product : p))
        );
        setIsEditDialogOpen(false);
      } else {
        showSnackbar(`❌ Erreur : ${data.message}`, "error");
      }
    } catch (error) {
      console.error("Erreur modification produit:", error);
      showSnackbar("Erreur de connexion au serveur", "error");
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{ py: 4, px: { xs: 2, sm: 4 }, bgcolor: "#f9fafb", borderRadius: 2 }}
    >
      {/* HEADER */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 1,
          color: "primary.main",
        }}
      >
        <Store fontSize="large" />
        Gestion du Magasin
      </Typography>

      {/* SHOP INFO */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          ":hover": { boxShadow: 6 },
        }}
      >
        <CardHeader
          title="Informations du Magasin"
          subheader="Configurez les informations de base"
        />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom du magasin *"
              value={shopInfo.name}
              onChange={(e) => handleShopChange("name", e.target.value)}
            />
            <TextField
              label="Adresse *"
              value={shopInfo.address}
              onChange={(e) => handleShopChange("address", e.target.value)}
            />
            <TextField
              label="Téléphone"
              value={shopInfo.phone}
              onChange={(e) => handleShopChange("phone", e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              value={shopInfo.email}
              onChange={(e) => handleShopChange("email", e.target.value)}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              {shopInfo.image ? "Changer l'image" : "Télécharger une image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = await uploadToCloudinary(file);
                    if (url) setShopInfo((p) => ({ ...p, image: url }));
                  }
                }}
              />
            </Button>

            {shopInfo.image && (
              <img
                src={shopInfo.image}
                alt="Preview"
                style={{ width: "100%", marginTop: 8, borderRadius: 8 }}
              />
            )}

            <TextField
              label="Description"
              multiline
              rows={1}
              value={shopInfo.description}
              onChange={(e) => handleShopChange("description", e.target.value)}
            />
          </Box>

          <Button
            onClick={sauvgardershoinfo}
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Modifier / Sauvegarder
          </Button>
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }}>
        <Chip label="Produits" />
      </Divider>

      {/* ADD PRODUCT */}
      <Card
        sx={{
          mb: 4,
          borderRadius: 3,
          boxShadow: 3,
          transition: "0.3s",
          ":hover": { boxShadow: 6 },
        }}
      >
        <CardHeader title="Ajouter un produit" />
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Nom du produit *"
              value={newProduct.ProductName}
              onChange={(e) =>
                setNewProduct({ ...newProduct, ProductName: e.target.value })
              }
            />
            <TextField
              label="Prix (€) *"
              type="number"
              value={newProduct.Price || ""}
              onChange={(e) =>
                setNewProduct({
                  ...newProduct,
                  Price: parseFloat(e.target.value) || 0,
                })
              }
              InputProps={{ startAdornment: <Euro sx={{ mr: 1 }} /> }}
            />
            <TextField
              label="Catégorie"
              value={newProduct.category}
              onChange={(e) =>
                setNewProduct({ ...newProduct, category: e.target.value })
              }
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
            >
              {newProduct.ProductImage
                ? "Changer l'image"
                : "Télécharger une image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setNewProduct({ ...newProduct, ProductImage: file });
                }}
              />
            </Button>
            <TextField
              label="Description"
              multiline
              rows={1}
              value={newProduct.Description}
              onChange={(e) =>
                setNewProduct({ ...newProduct, Description: e.target.value })
              }
            />
          </Box>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            startIcon={<Add />}
            sx={{ mt: 2 }}
          >
            Ajouter le produit
          </Button>
        </CardContent>
      </Card>

      {/* PRODUCT LIST */}
      {products.length > 0 ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
          }}
        >
          {products.map((product) => (
            <Card key={product._id} sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {product.ProductName}
                </Typography>
                <Chip
                  label={`${
                    typeof product.Price === "number"
                      ? product.Price.toFixed(2)
                      : Number(product.Price).toFixed(2)
                  } €`}
                  color="primary"
                  sx={{ my: 1 }}
                />
                {product.category && (
                  <Typography variant="body2" color="text.secondary">
                    Catégorie: {product.category}
                  </Typography>
                )}
                {product.Description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {product.Description}
                  </Typography>
                )}
                {product.ProductImage && (
                  <img
                    src={product.ProductImage}
                    alt={product.ProductName}
                    style={{ width: "100%", marginTop: 8, borderRadius: 4 }}
                  />
                )}
              </CardContent>
              <Box
                textAlign="right"
                p={1}
                sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
              >
                <IconButton
                  color="primary"
                  onClick={() => handleEditClick(product)}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveProduct(product._id)}
                >
                  <Delete />
                </IconButton>
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography align="center" color="text.secondary" mt={4}>
          Aucun produit ajouté
        </Typography>
      )}

      {/* Dialogue de modification */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      >
        <DialogTitle>Modifier le produit</DialogTitle>
        <DialogContent>
          {editingProduct && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
            >
              <TextField
                label="Nom du produit *"
                value={editingProduct.ProductName}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    ProductName: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Prix (€) *"
                type="number"
                value={editingProduct.Price}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    Price: Number(e.target.value),
                  })
                }
                InputProps={{ startAdornment: <Euro sx={{ mr: 1 }} /> }}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Catégorie"
                value={editingProduct.category}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    category: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 1 }}
              >
                {newImageFile ? "Changer l'image" : "Modifier l'image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setNewImageFile(file);
                  }}
                />
              </Button>
              <TextField
                label="Description"
                multiline
                rows={4}
                value={editingProduct.Description}
                onChange={(e) =>
                  setEditingProduct({
                    ...editingProduct,
                    Description: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleUpdateProduct}
            variant="contained"
            color="primary"
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
