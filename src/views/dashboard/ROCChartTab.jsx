import React from "react";
import { Box, Typography, Paper } from "@mui/material";

export default function ROCChartTab() {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      <Typography variant="h6" mb={2} fontWeight="bold">
        ROC Curves
      </Typography>

      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: 3,
          maxWidth: "800px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#fafafa",
        }}
      >
        <img
          src={`${import.meta.env.VITE_API_BASE_URL}/artifacts/roc_comparison.png`}
          alt="ROC Curves"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "12px",
          }}
        />
      </Paper>

      <Typography variant="body2" mt={1} color="text.secondary" align="center">
        Comparison of ROC curves across models
      </Typography>
    </Box>
  );
}

