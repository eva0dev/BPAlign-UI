import React from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function SystemStabilityTab() {
  // === Component Scores ===
  const scores = {
    dataQuality: 98.95,
    featureConsistency: 99.31,
    modelReliability: 92.78,
    aucStability: 94.09,
    disagreementStability: 73.17,
  };

  // === Weights ===
  const weights = {
    dataQuality: 0.20,
    featureConsistency: 0.20,
    modelReliability: 0.25,
    aucStability: 0.20,
    disagreementStability: 0.15,
  };

  // === Overall DSS Stability Score ===
  const overall =
    scores.dataQuality * weights.dataQuality +
    scores.featureConsistency * weights.featureConsistency +
    scores.modelReliability * weights.modelReliability +
    scores.aucStability * weights.aucStability +
    scores.disagreementStability * weights.disagreementStability;

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        System Stability Overview
      </Typography>

      <Typography variant="body1" color="text.secondary" mb={2}>
        The Overall DSS Stability Score combines five key performance metrics to
        reflect the robustness and consistency of the Decision Support System.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 3, background: "#fafafa" }}>
        <Typography variant="h6" gutterBottom>
          🧭 Overall DSS Stability Score:{" "}
          <strong>{overall.toFixed(2)} / 100</strong>
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Calculated as a weighted composite of Data Quality (20%), Feature
          Consistency (20%), Model Reliability (25%), AUC Stability (20%), and
          Model Disagreement Stability (15%).
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Metric Breakdown */}
        {[
          ["Overall Data Quality Score", scores.dataQuality, weights.dataQuality],
          [
            "Feature Importance Consistency Score",
            scores.featureConsistency,
            weights.featureConsistency,
          ],
          ["Model Reliability Score (MRS)", scores.modelReliability, weights.modelReliability],
          ["AUC Stability Score", scores.aucStability, weights.aucStability],
          ["Model Disagreement Stability Score (MDSS)", scores.disagreementStability, weights.disagreementStability],
        ].map(([label, value, weight], i) => (
          <Box key={i} mb={2}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2">
                {label} ({(weight * 100).toFixed(0)}%)
              </Typography>
              <Tooltip title={`Score: ${value.toFixed(2)} / 100`}>
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "gray" }} />
              </Tooltip>
            </Box>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 8,
                borderRadius: 5,
                mt: 0.5,
                backgroundColor: "#eee",
                "& .MuiLinearProgress-bar": {
                  backgroundColor:
                    value >= 90
                      ? "#4caf50"
                      : value >= 80
                      ? "#ffb300"
                      : "#f44336",
                },
              }}
            />
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          📊 A score above 90 indicates high DSS stability, ensuring consistent
          data quality, reliable model predictions, and stable performance across
          updates. The slightly lower MDSS (73.17) suggests occasional model
          disagreement that may benefit from ensemble calibration.
        </Typography>
      </Paper>
    </Box>
  );
}
