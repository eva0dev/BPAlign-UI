import React from "react";
import { Box, Typography } from "@mui/material";

export default function ROCChartTab() {
  return (
    <Box>
      <Typography variant="h6" mb={2}>ROC Curves</Typography>
      <img
        src={import.meta.env.VITE_API_BASE_URL + "/artifacts/roc_comparison.png"}
        alt="ROC Curves"
        style={{ maxWidth: "100%", borderRadius: 8 }}
      />
    </Box>
  );
}
