import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper } from "@mui/material";

export default function FeatureImportanceTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/artifacts/feature_importances.json")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(console.error);
  }, []);

  if (!data) return <Typography>Loading feature importance...</Typography>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Feature Importance</Typography>
      {Object.entries(data).map(([model, feats]) => (
        <Box key={model} sx={{ mb: 3 }}>
          <Typography variant="subtitle1">{model}</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {Object.entries(feats).map(([feat, val]) => (
                  <TableRow key={feat}>
                    <TableCell>{feat}</TableCell>
                    <TableCell>{val.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}
