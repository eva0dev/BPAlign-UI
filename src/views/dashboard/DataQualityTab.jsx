import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Papa from "papaparse";

export default function DataQualityTab() {
  const [missingRows, setMissingRows] = useState([]);
  const [summaryRows, setSummaryRows] = useState([]);
  const [outlierRows, setOutlierRows] = useState([]);
  const [classComment, setClassComment] = useState("");
  const [dataQualityScore, setDataQualityScore] = useState(null);
  const [completenessScore, setCompletenessScore] = useState(null);
  const [integrityScore, setIntegrityScore] = useState(null);
  const [outlierScore, setOutlierScore] = useState(null);
  const [duplicatePct, setDuplicatePct] = useState(0);
  const [error, setError] = useState(null);

  const url = `${import.meta.env.VITE_API_BASE_URL}/artifacts/data_quality.csv`;

  const selectedCols = [
    "male",
    "age",
    "currentSmoker",
    "diabetes",
    "sysBP",
    "diaBP",
    "BMI",
    "heartRate",
    "glucose",
    "prevalentHyp",
  ];

  useEffect(() => {
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch " + url);
        return res.text();
      })
      .then((csvText) => {
        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });

        const totalRows = parsed.data.length;

        // --- Missing Values ---
        const missing = parsed.data.filter(
          (row) =>
            row.metric &&
            selectedCols.some((col) =>
              row.metric.includes(`Missing % in ${col}`)
            )
        );

        const missingPercentages = missing.map((row) =>
          parseFloat(row.value) || 0
        );
        const avgMissing =
          missingPercentages.reduce((a, b) => a + b, 0) /
          (missingPercentages.length || 1);
        const completeness = 100 - avgMissing;
        setCompletenessScore(completeness);

        // --- Integrity Summary ---
        const summary = parsed.data.filter(
          (row) =>
            row.metric &&
            (row.metric.includes("Duplicate Rows") ||
              row.metric.includes("Class 0 %") ||
              row.metric.includes("Class 1 %"))
        );

        // Duplicates
        const duplicateRow = summary.find((r) =>
          r.metric.includes("Duplicate Rows")
        );
        const duplicate = duplicateRow ? parseFloat(duplicateRow.value) : 0;
        let integrity = 100 - duplicate;

        // Minor penalty for mild class imbalance (~2:1)
        const c0 = summary.find((r) =>
          r.metric.includes("Class 0 % (prevalentHyp)")
        );
        const c1 = summary.find((r) =>
          r.metric.includes("Class 1 % (prevalentHyp)")
        );
        if (c0 && c1) {
          const c1v = parseFloat(c1.value);
          if (c1v < 30 || c1v > 70) integrity -= 2;
        }

        setIntegrityScore(integrity);
        setDuplicatePct(duplicate);

        // --- Outlier Summary ---
        // --- Outlier Summary ---
const outliers = parsed.data.filter(
  (row) =>
    row.metric &&
    selectedCols.some((col) => row.metric.includes(`Outliers in ${col}`))
);

// Parse count and percentage for each outlier row
const parsedOutliers = outliers.map((row) => {
  const metric = String(row.metric).trim();
  const value = String(row.value || "").trim();
  // Match either "count (percentage%)" or just percentage
  const match = value.match(/^(\d+)\s*\(?([\d.]*)%?\)?$/);
  const count = match ? parseInt(match[1], 10) : 0;
  const percentage = match && match[2] ? parseFloat(match[2]) : (count / totalRows) * 100;
  return { metric, count, percentage };
});

// Average outlier percentage
const avgOutlierPct =
  parsedOutliers.reduce((sum, r) => sum + r.percentage, 0) /
  (parsedOutliers.length || 1);

// Outlier Control Score
const outlierS = Math.max(0, 100 - avgOutlierPct);
setOutlierScore(outlierS.toFixed(2));
setOutlierRows(parsedOutliers);

        setOutlierScore(outlierS);

        // --- Overall Data Quality Score ---
        const DQS = 0.4 * completeness + 0.3 * integrity + 0.3 * outlierS;
        setDataQualityScore(DQS.toFixed(2));

        setMissingRows(missing);
        setSummaryRows(summary);
        setOutlierRows(outliers);

        // Class balance comment
        if (c0 && c1) {
          const c0v = parseFloat(c0.value);
          const c1v = parseFloat(c1.value);

          let comment = `Class distribution: ${c0v.toFixed(
            1
          )}% non-hypertensive vs ${c1v.toFixed(
            1
          )}% hypertensive. This is a moderately imbalanced dataset (~2:1).`;

          if (c1v < 30) {
            comment += " Models may bias toward predicting non-hypertension.";
          } else {
            comment += " The imbalance is mild but still worth addressing.";
          }

          setClassComment(comment);
        }
      })
      .catch((err) => setError(err.message));
  }, [url]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!missingRows.length && !summaryRows.length && !outlierRows.length)
    return <Typography>Loading data quality...</Typography>;

  return (
    <Box>
      {/* Enhanced Top Summary */}
      <Box sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2, backgroundColor: "#f9f9f9" }}>
        <Typography variant="h6" gutterBottom>
          Overall Data Quality Score: {dataQualityScore} / 100
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Calculated as weighted average of three components:
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          • Completeness(40% weight): {completenessScore?.toFixed(2)} / 100. Formula: 100 - average missing % across selected features.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          • Integrity(30% weight): {integrityScore?.toFixed(2)} / 100.Formula: 100 - duplicate rows % ({duplicatePct}%), adjusted for class imbalance.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          • Outlier Control(30% weight): {outlierScore?.toFixed(2)} / 100. Formula: 100- average outlier % across selected features.
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          Formula: DQS = 0.4 × Completeness + 0.3 × Integrity + 0.3 × Outlier Control
        </Typography>
      </Box>

      {/* Missing Values Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Missing Value Report (Selected Features) - Score: {completenessScore?.toFixed(2)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {missingRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.metric}</TableCell>
                    <TableCell>{r.value}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Integrity Summary Accordion */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Dataset Integrity Summary - Score: {integrityScore?.toFixed(2)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" mb={1}>
            Integrity Score = 100 - duplicate % ({duplicatePct}%) - class imbalance penalty = {integrityScore?.toFixed(2)}
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {summaryRows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.metric}</TableCell>
                    <TableCell>{r.value}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {classComment && (
            <Typography variant="body2" color="textSecondary" mt={2}>
              {classComment}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Outliers Accordion */}
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Outlier Summary (Selected Features) - Score: {outlierScore?.toFixed(2)}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" mb={1}>
            Outlier Score = 100 - average outlier % = {outlierScore?.toFixed(2)}
          </Typography>
          {outlierRows.length > 0 ? (
            <TableContainer component={Paper} sx={{ minWidth: 350 }}>
              <Table size="small">
                <TableBody>
                  {outlierRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.metric.trim()}</TableCell>
                      <TableCell>{r.value.trim()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No outlier data available for selected features.
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
