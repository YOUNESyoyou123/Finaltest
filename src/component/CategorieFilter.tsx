// @ts-nocheck

import React, { useState } from "react";
import { Button, Box } from "@mui/material";

const categories = ["All", "Electronics", "Fashion", "Home", "Books", "Sports"];

export const CategoryFilter = () => {
  const [active, setActive] = useState("All");

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        overflowX: "auto",
        pb: 1,
        "&::-webkit-scrollbar": { display: "none" }, // cacher scrollbar
      }}
    >
      {categories.map((category) => (
        <Button
          key={category}
          variant={active === category ? "contained" : "outlined"} // ✅ highlight selected
          size="small"
          onClick={() => setActive(category)}
          sx={{
            whiteSpace: "nowrap",
            textTransform: "capitalize",
            borderRadius: 20,
            flexShrink: 0,
          }}
        >
          {category}
        </Button>
      ))}
    </Box>
  );
};
