// @ts-nocheck

import React, { useEffect, useState } from "react";
import { SearchHeader } from "./SearchHeader";
import { ProductCard } from "./ProductCardProps";
import { CategoryFilter } from "./CategorieFilter";

import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import {
  Store, // Icône de magasin
  PhotoCamera,
  Add,
  Delete,
  Euro,
  Edit,
  Star,
  StarBorder,
  ShoppingCart,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  NotificationsActive as NotificationsActiveIcon,
  ChevronRight as ChevronRightIcon,
  CameraAlt as CameraAltIcon,
} from "@mui/icons-material";

import {
  Box, // Ajouté ici
  Avatar,
  Typography,
  IconButton,
  Container,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Chip,
  Rating,
  Paper,
} from "@mui/material";
import MobileFooter from "./Footer";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SellerMap from "./SellerMap";

const OPENCAGE_API_KEY = "5b93249038624a97bd48f83e49bea550";
interface Product {
  _id: string;
  ProductName: string;
  Description?: string;
  Price: string | number; // Selon votre schéma c'est string mais vous utilisez Number() dans le code
  ProductImage: string;
  ShopImage?: string;
  IdresponsibleShop: string;
  Etoile?: number; // Champ existant dans votre schéma (peut être utilisé pour le rating)
  numberEtoile?: number; // Champ existant dans votre schéma (peut être utilisé pour le rating)
  ShopName: string;
  category?: string;
  // Champs de rating que vous utilisez dans votre backend
  totalStars: number; // Somme de toutes les notes
  numberOfRatings: number; // Nombre de votes
  averageRating: number; // Note moyenne
  // Champs timestamp automatiques
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Seller {
  _id: string;
  ShopName: string;
  Place: string;
}

interface ProductCardProps {
  title: string;
  price: string;
  image: string;
  category?: string;
  shopName?: string;
  ratingValue?: number; // averageRating
  ratingCount?: number; // numberOfRatings
}
export default function Mainpage() {
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationName, setLocationName] = useState<string>("📡 Detecting...");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sellerInfo, setSellerInfo] = useState<Seller | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [userRating, setUserRating] = useState<number | null>(null);

  const submitRating = async (rating: number) => {
    try {
      if (!selectedProduct) return;

      const response = await fetch(
        `http://localhost:5000/products/${selectedProduct._id}/rate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Mise à jour avec la structure plate (sans objet ratings)
        setSelectedProduct({
          ...selectedProduct,
          totalStars: data.totalStars,
          numberOfRatings: data.numberOfRatings,
          averageRating: data.averageRating,
        });

        // Mise à jour de la liste des produits
        setProducts(
          products.map((p) =>
            p._id === selectedProduct._id
              ? {
                  ...p,
                  totalStars: data.totalStars,
                  numberOfRatings: data.numberOfRatings,
                  averageRating: data.averageRating,
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la note:", error);
    }
  };

  const filteredProducts =
    searchTerm === ""
      ? products
      : products.filter((product) =>
          product.ProductName.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleOpenDialog = async (product: Product) => {
    setSelectedProduct(product);
    setOpenDialog(true);

    try {
      const res = await fetch(
        `http://localhost:5000/sellers/${product.IdresponsibleShop}`
      );
      const data: Seller = await res.json();
      setSellerInfo(data);
    } catch (err) {
      console.error("❌ Erreur seller", err);
    }
  };

  /** ✅ Fetch produits en fonction de la ville détectée */
  const fetchProductsByLocation = async (place: string) => {
    try {
      setLoading(true);
      setErrorMsg("");

      // 🔹 1. Chercher les vendeurs qui ont Place ~ place
      const sellersResponse = await fetch(
        `http://localhost:5000/sellers/sell/nearby?place=${encodeURIComponent(
          place
        )}`
      );

      if (!sellersResponse.ok) {
        const errorData = await sellersResponse.json();
        throw new Error(errorData.message || "Failed to fetch sellers");
      }

      const sellers: Seller[] = await sellersResponse.json();
      if (!Array.isArray(sellers))
        throw new Error("Invalid sellers data format");

      if (sellers.length === 0) {
        setProducts([]);
        setErrorMsg("No sellers found in your area");
        return;
      }

      // 🔹 2. Charger les produits de ces vendeurs
      const sellerIds = sellers.map((seller) => seller._id);
      const productsResponse = await fetch(
        "http://localhost:5000/products/bysellers",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerIds }),
        }
      );

      if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }

      const products: Product[] = await productsResponse.json();
      if (!Array.isArray(products))
        throw new Error("Invalid products data format");

      setProducts(products);
    } catch (error: any) {
      console.error("Error:", error);
      setErrorMsg(error.message || "Failed to load data");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  /** ✅ 1er effet : Détecte la position et récupère le nom de la ville */
  useEffect(() => {
    if (!navigator.geolocation) {
      setErrorMsg("❌ Geolocation not supported.");
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });

        try {
          // Appel OpenCage pour récupérer la ville
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${OPENCAGE_API_KEY}`
          );
          const data = await response.json();

          if (data.results?.length > 0) {
            const comp = data.results[0].components;
            const city =
              comp.city || comp.town || comp.village || "Unknown city";
            const country = comp.country || "Unknown country";
            const placeName = `${city}, ${country}`;

            console.log("✅ Ville détectée :", placeName);
            setLocationName(placeName);
          } else {
            setLocationName("Unknown location");
          }
        } catch (err) {
          console.error("Error fetching location name:", err);
          setErrorMsg("Error fetching location data");
          setLoading(false);
        }
      },
      (error) => {
        setErrorMsg(`❌ ${error.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /** ✅ 2e effet : Lance la recherche des produits seulement quand on a une vraie ville */
  useEffect(() => {
    if (
      locationName !== "📡 Detecting..." &&
      !locationName.startsWith("Unknown")
    ) {
      fetchProductsByLocation(locationName);
    }
  }, [locationName]);

  return (
    <>
      {/* ✅ En-tête avec localisation */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>📍</span>
            {errorMsg ? errorMsg : locationName}
          </div>
        </div>
        <div className="flex   items-center justify-center">
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search products..."
              size="small"
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                backgroundColor: "background.paper",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </div>
      </div>

      {/* ✅ Section produits */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <p>Loading products near you...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div onClick={() => handleOpenDialog(product)} key={product._id}>
                <ProductCard
                  title={product.ProductName}
                  price={`$${Number(product.Price).toFixed(2)}`}
                  image={product.ProductImage || "/placeholder.svg"}
                  category={product.category || "Unknown"}
                  shopName={product.ShopName || "Unknown shop"}
                  ratingValue={product.averageRating} // Utilise averageRating directement
                  ratingCount={product.numberOfRatings} // Utilise numberOfRatings directement
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <p>
              {searchTerm
                ? "No matching products found"
                : errorMsg || "No products found in your area"}
            </p>
          </div>
        )}
      </div>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            py: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {selectedProduct?.ProductName || "Détails du produit"}
            </Typography>
            <Typography variant="subtitle1">
              {sellerInfo?.ShopName || "Chargement..."}
            </Typography>
          </Box>

          <Rating
            value={selectedProduct?.averageRating || 0}
            readOnly
            size="small"
          />
          <Typography variant="caption">
            ({selectedProduct?.numberOfRatings || 0})
          </Typography>
        </DialogTitle>

        <DialogContent>
          {selectedProduct && (
            <Grid container>
              <Grid item xs={12}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 2,
                    height: 250,
                    width: "300px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "grey.100",
                  }}
                >
                  <img
                    src={selectedProduct.ProductImage}
                    alt={selectedProduct.ProductName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                    }}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 4 }}>
                    {selectedProduct.Description ||
                      "Aucune description disponible"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={10} md={8}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    width: "300px",
                    minHeight: "650px",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    Informations du produit
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Note moyenne</Typography>
                    <Box display="flex" alignItems="center">
                      {/* Note moyenne */}
                      <Rating
                        value={selectedProduct?.averageRating || 0} // Changé ratings?.averageRating -> averageRating
                        precision={0.5}
                        readOnly
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({selectedProduct?.numberOfRatings || 0} avis)
                      </Typography>
                    </Box>
                  </Box>

                  {/* Ajoutez ceci pour permettre aux utilisateurs de noter */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Donnez votre avis
                    </Typography>
                    <Rating
                      value={userRating}
                      onChange={(event, newValue) => {
                        if (newValue) {
                          setUserRating(newValue);
                          submitRating(newValue);
                        }
                      }}
                    />
                  </Box>

                  {selectedProduct.category && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Catégorie</Typography>
                      <Chip
                        label={selectedProduct.category}
                        color="secondary"
                        size="small"
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {sellerInfo && (
                    <>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ fontWeight: "bold", mt: 2 }}
                      >
                        Informations du vendeur
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Store color="primary" sx={{ mr: 1 }} />
                        <Typography>{sellerInfo.ShopName}</Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <PhoneIcon color="primary" sx={{ mr: 1 }} />
                        <Typography>{sellerInfo.PhoneNumber}</Typography>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                        <Typography>{sellerInfo.Place}</Typography>
                      </Box>

                      <Box sx={{ mt: 3, height: 250 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Localisation du vendeur
                        </Typography>
                        <SellerMap
                          lat={sellerInfo.Latitude}
                          lng={sellerInfo.Longitude}
                          height="100%"
                        />
                      </Box>
                    </>
                  )}
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center", // ✅ équivalent Tailwind items-center
            justifyContent: "center", // ✅ équivalent Tailwind justify-center
          }}
        >
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ minWidth: "250px" }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
