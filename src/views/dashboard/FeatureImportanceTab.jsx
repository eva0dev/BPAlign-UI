// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper } from "@mui/material";

export default function FeatureImportanceTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Hardcoded backend URL for testing
 // const base = "http://127.0.0.1:5000";
 //const url = base + "/artifacts/feature_importances.json";
 const url = `${import.meta.env.VITE_API_BASE_URL}/artifacts/feature_importances.json`;

  useEffect(() => {
    console.log("Fetching Feature Importance JSON from:", url);
    const ac = new AbortController();

    fetch(url, { signal: ac.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`Response is not valid JSON:\n${text}`);
        }
      })
      .then((json) => setData(json))
      .catch((e) => setError(e.message || String(e)));

    return () => ac.abort();
  }, []);

  if (error) {
    return (
      <Typography color="error" sx={{ whiteSpace: "pre-wrap" }}>
        Failed to load feature importance: {error}
      </Typography>
    );
  }

  if (!data) return <Typography>Loading feature importance...</Typography>;

  const entries = Object.entries(data || {});
  if (entries.length === 0) return <Typography>No feature importance found.</Typography>;

  const toSortedList = (feats) => {
    return Object.entries(feats)
      .map(([name, value]) => ({ name, value: Number(value) }))
      .filter(({ value }) => !isNaN(value))
      .sort((a, b) => b.value - a.value);
  };

  return (
    <Box>
      <Typography variant="h6" mb={2}>
        Feature Importance
      </Typography>
      {entries.map(([model, feats]) => {
        const sorted = toSortedList(feats);
        const maxValue = sorted.length > 0 ? sorted[0].value : 1;

        return (
          <Box key={model} sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              {model}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableBody>
                  {sorted.map(({ name, value }) => {
                    const percent = (value / maxValue) * 100;

                    return (
                      <TableRow key={name}>
                        <TableCell sx={{ fontFamily: "monospace", width: "150px" }}>{name}</TableCell>
                        <TableCell align="right" sx={{ width: "80px" }}>{value.toFixed(4)}</TableCell>
                        <TableCell sx={{ width: "100%" }}>
                          <Box
                            sx={{
                              height: 12,
                              width: `${percent}%`,
                              backgroundColor: "primary.main",
                              borderRadius: 1,
                              transition: "width 0.3s",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      })}
    </Box>
  );
}
