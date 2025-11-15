// @ts-nocheck
import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableRow, TableContainer, Paper } from "@mui/material";

export default function FeatureImportanceTab() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [consistencyScore, setConsistencyScore] = useState(null);
  const [consistencyDetails, setConsistencyDetails] = useState(null);

  const url = `${import.meta.env.VITE_API_BASE_URL}/artifacts/feature_importances.json`;

  useEffect(() => {
    const ac = new AbortController();
    console.log("Fetching Feature Importance JSON from:", url);

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
      .then((json) => {
        setData(json);

        // --- Feature Importance Consistency Score ---
        const models = Object.entries(json || {}); // [ [modelName, feats], ... ]
        if (models.length > 0) {
          const featureNames = Object.keys(models[0][1]);

          // normalized importance per model
          const normalized = models.map(([modelName, feats]) => {
            const values = featureNames.map(f => Number(feats[f]) || 0);
            const max = Math.max(...values, 1);
            return { modelName, normalized: values.map(v => v / max) };
          });

          // calculate variance per feature
          const variances = featureNames.map((_, i) => {
            const vals = normalized.map(m => m.normalized[i]);
            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            const varSum = vals.reduce((a, b) => a + (b - mean) ** 2, 0);
            return { feature: featureNames[i], mean, variance: varSum / vals.length };
          });

          // Consistency Score
          const avgVariance = variances.reduce((a, v) => a + v.variance, 0) / variances.length;
          const score = Math.max(0, 100 - avgVariance * 100);

          setConsistencyScore(score.toFixed(2));
          setConsistencyDetails({ normalized, variances });
        }
      })
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
      {/* Feature Importance Consistency Score Box */}
      <Box sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h6" gutterBottom>
          Feature Importance Consistency Score: {consistencyScore} / 100
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Calculated based on variance of normalized feature importance across models.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Formula: Consistency = 100 - (average variance of normalized feature importance × 100)
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          Lower variance → higher consistency → score closer to 100
        </Typography>

        {/* Step-by-step table */}
        {consistencyDetails && (
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
            <Table size="small">
              <TableBody>
                {/* Header */}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Feature</TableCell>
                  {consistencyDetails.normalized.map(m => (
                    <TableCell key={m.modelName} sx={{ fontWeight: "bold" }}>{m.modelName}</TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: "bold" }}>Mean</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Variance</TableCell>
                </TableRow>

                {/* Rows */}
                {consistencyDetails.variances.map((v, i) => (
                  <TableRow key={v.feature}>
                    <TableCell>{v.feature}</TableCell>
                    {consistencyDetails.normalized.map(m => (
                      <TableCell key={m.modelName}>{m.normalized[i].toFixed(4)}</TableCell>
                    ))}
                    <TableCell>{v.mean.toFixed(4)}</TableCell>
                    <TableCell>{v.variance.toFixed(4)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {consistencyScore && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Final Consistency Score = 100 - (average variance × 100) = {consistencyScore}
          </Typography>
        )}
      </Box>

      {/* Feature Importance Table */}
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
