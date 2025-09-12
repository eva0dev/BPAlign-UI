import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function ModelReportsTab() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const models = [
      "randomforest",
      "decisiontree",
      "logisticregression",
      "gradientboosting",
      "svm",
    ];
    Promise.all(
      models.map((m) =>
        fetch(`${import.meta.env.VITE_API_BASE_URL}/artifacts/${m}_report.json`)
          .then((res) => res.json())
          .then((json) => ({ model: m, content: json }))
          .catch(() => null)
      )
    ).then((res) => setReports(res.filter(Boolean)));
  }, []);

  if (!reports.length)
    return <Typography>Loading model reports...</Typography>;

  // Render summary comparison table across models
  const renderSummaryTable = () => (
    <TableContainer component={Paper} sx={{ my: 2 }}>
      <Typography variant="h6" sx={{ p: 1 }}>
        Model Comparison Summary
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell align="right">Accuracy</TableCell>
            <TableCell align="right">Macro Precision</TableCell>
            <TableCell align="right">Macro Recall</TableCell>
            <TableCell align="right">Macro F1</TableCell>
            <TableCell align="right">Weighted Precision</TableCell>
            <TableCell align="right">Weighted Recall</TableCell>
            <TableCell align="right">Weighted F1</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reports.map((r) => {
            const rep = r.content.report;
            const macro = rep["macro avg"] || {};
            const weighted = rep["weighted avg"] || {};
            return (
              <TableRow key={r.model}>
                <TableCell sx={{ textTransform: "capitalize" }}>
                  {r.model}
                </TableCell>
                <TableCell align="right">
                  {rep["accuracy"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {macro["precision"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {macro["recall"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {macro["f1-score"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {weighted["precision"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {weighted["recall"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {weighted["f1-score"]?.toFixed(3)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render classification report for a single model
  const renderClassificationReport = (report) => {
    const rows = Object.entries(report).filter(
      ([key]) => typeof report[key] === "object"
    );

    return (
      <TableContainer component={Paper} sx={{ my: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Class</TableCell>
              <TableCell align="right">Precision</TableCell>
              <TableCell align="right">Recall</TableCell>
              <TableCell align="right">F1-Score</TableCell>
              <TableCell align="right">Support</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(([label, metrics]) => (
              <TableRow key={label}>
                <TableCell>{label}</TableCell>
                <TableCell align="right">
                  {metrics["precision"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {metrics["recall"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">
                  {metrics["f1-score"]?.toFixed(3)}
                </TableCell>
                <TableCell align="right">{metrics["support"]}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={5}>
                <strong>Accuracy: {report["accuracy"]?.toFixed(3)}</strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render confusion matrix with heatmap
  const renderConfusionMatrix = (matrix) => {
    const maxVal = Math.max(...matrix.flat());

    return (
      <TableContainer component={Paper} sx={{ my: 2, width: "fit-content" }}>
        <Typography sx={{ p: 1 }}>Confusion Matrix</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {matrix[0].map((_, j) => (
                <TableCell key={j} align="center">
                  Pred {j}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {matrix.map((row, i) => (
              <TableRow key={i}>
                <TableCell>
                  <strong>Actual {i}</strong>
                </TableCell>
                {row.map((val, j) => {
                  const intensity = maxVal ? val / maxVal : 0;
                  const bgColor = `rgba(33, 150, 243, ${intensity * 0.6})`; // blue heatmap
                  const textColor = intensity > 0.4 ? "white" : "black";

                  return (
                    <TableCell
                      key={j}
                      align="center"
                      sx={{
                        backgroundColor: bgColor,
                        color: textColor,
                        fontWeight: "bold",
                        width: 60,
                        height: 40,
                      }}
                    >
                      {val}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {/* Summary comparison table at top */}
      {renderSummaryTable()}

      {/* Detailed per-model reports */}
      {reports.map((r) => {
        const { report, confusion_matrix, comment } = r.content;
        return (
          <Accordion key={r.model}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ textTransform: "capitalize" }}>
                {r.model}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="h6">Classification Report</Typography>
              {renderClassificationReport(report)}

              {confusion_matrix && renderConfusionMatrix(confusion_matrix)}

              {comment && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body1">
                    <strong>Comment: </strong>
                    {comment}
                  </Typography>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
