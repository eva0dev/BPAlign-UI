import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function ROCChartTab() {
  // Example AUC scores — replace with real backend values
  const aucScores = [
    { model: "Random Forest", auc: 0.964 },
    { model: "Decision Tree", auc: 0.881 },
    { model: "Logistic Regression", auc: 0.952 },
    { model: "Gradient Boosting", auc: 0.971 },
    { model: "SVM", auc: 0.955 },
  ];

  // Compute mean, std, and stability
  const aucValues = aucScores.map((d) => d.auc);
  const meanAUC = aucValues.reduce((a, b) => a + b, 0) / aucValues.length;
  const stdAUC = Math.sqrt(
    aucValues.reduce((sum, a) => sum + Math.pow(a - meanAUC, 2), 0) /
      aucValues.length
  );
  const stabilityScore = (100 - stdAUC * 100).toFixed(2);

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

      {/* AUC Score Table */}
      <Box mt={4} width="100%" maxWidth="700px">
        <Typography variant="h6" mb={1} fontWeight="bold" align="center">
          Model-wise AUC Scores
        </Typography>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Model</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  AUC Score
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aucScores.map((row) => (
                <TableRow key={row.model}>
                  <TableCell>{row.model}</TableCell>
                  <TableCell align="right">{row.auc.toFixed(3)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* AUC Stability Explanation */}
        <Typography
          variant="body2"
          mt={2}
          color="text.secondary"
          align="center"
        >
          <strong>AUC Stability Score:</strong> {stabilityScore} / 100 <br />
          <strong>Standard Deviation of AUCs:</strong> {stdAUC.toFixed(4)} <br />
          Calculated as 100 - (standard deviation of AUC × 100). Lower deviation
          across models indicates higher reliability in classification
          performance.
        </Typography>
      </Box>
    </Box>
  );
}
