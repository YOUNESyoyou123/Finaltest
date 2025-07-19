// @ts-nocheck

import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const SearchHeader = () => {
  return (
    <Box sx={{ width: "100%", maxWidth: 400 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search products..."
        size="small"
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
  );
};
