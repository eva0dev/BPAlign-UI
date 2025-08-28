import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper } from "@mui/material";

export default function DisagreementTab() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/artifacts/model_disagreements.json")
      .then(res => res.json())
      .then(json => setCases(json))
      .catch(console.error);
  }, []);

  if (!cases.length) return <Typography>No disagreement cases found.</Typography>;

  return (
    <Box>
      <Typography variant="h6" mb={2}>Disagreement Cases</Typography>
      {cases.slice(0, 20).map((c, i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Row ID: {c.row_id}, True Label: {c.true_label}</Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {Object.entries(c.features).map(([k, v]) => (
                  <TableRow key={k}>
                    <TableCell>{k}</TableCell>
                    <TableCell>{v}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2}><pre>{JSON.stringify(c.predictions, null, 2)}</pre></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
      {cases.length > 20 && <Typography>Showing first 20 of {cases.length} cases.</Typography>}
    </Box>
  );
}
