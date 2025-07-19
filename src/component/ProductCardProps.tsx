// @ts-nocheck

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Button,
  Rating,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";

interface ProductCardProps {
  title: string;
  price: string;
  image: string;
  category?: string;
  shopName?: string;
  ratingValue?: number;
  ratingCount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  image,
  category,
  shopName,
  ratingValue = 0,
  ratingCount = 0,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transition: "0.3s",
        "&:hover": { boxShadow: 6 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image + bouton favoris */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={image || "/placeholder.svg"}
          alt={title}
          sx={{
            objectFit: "cover",
            height: 180,
            width: "100%",
          }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.8)",
            "&:hover": { bgcolor: "white" },
          }}
        >
          <FavoriteBorderIcon />
        </IconButton>
      </Box>

      {/* Infos produit */}
      <CardContent sx={{ p: 2, flexGrow: 1 }}>
        {/* Shop name */}
        {shopName && (
          <Typography variant="caption" color="text.secondary">
            {shopName}
          </Typography>
        )}

        {/* Titre */}
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "3em",
          }}
        >
          {title}
        </Typography>

        {/* Catégorie */}
        {category && (
          <Typography variant="caption" color="primary" sx={{ mt: 0.5 }}>
            {category}
          </Typography>
        )}

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 1 }}>
          <Rating
            value={ratingValue}
            precision={0.5}
            readOnly
            size="small"
            icon={<StarIcon fontSize="inherit" />}
            emptyIcon={
              <StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />
            }
          />
          <Typography variant="caption" color="text.secondary">
            ({ratingCount})
          </Typography>
        </Box>

        {/* Price */}
        <Typography variant="h6" fontWeight="bold" sx={{ mt: "auto" }}>
          {price}
        </Typography>
      </CardContent>
    </Card>
  );
};
