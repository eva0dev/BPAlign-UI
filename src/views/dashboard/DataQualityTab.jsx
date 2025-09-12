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
  const [error, setError] = useState(null);

  const base = "http://127.0.0.1:5000";
  const url = base + "/artifacts/data_quality.csv";

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

        // Missing values
        const missing = parsed.data.filter(
          (row) =>
            row.metric &&
            selectedCols.some((col) =>
              row.metric.includes(`Missing % in ${col}`)
            )
        );

        // Integrity summary
        const summary = parsed.data.filter(
          (row) =>
            row.metric &&
            (row.metric.includes("Duplicate Rows") ||
              row.metric.includes("Class 0 %") ||
              row.metric.includes("Class 1 %"))
        );
const outliers = parsed.data.filter(
  (row) =>
    row.metric &&
    selectedCols.some((col) =>
      row.metric.includes(`Outliers in ${col}`)
    )
);
// const parsedOutliers = outliers.map((row) => {
//   const metric = String(row.metric).trim();
//   const value = String(row.value || "").trim();
//   const match = value.match(/^(\d+)\s*\(?([\d.]*)%?\)?$/);
//   return {
//     metric,
//     count: match ? parseInt(match[1], 10) : 0,
//     percentage: match && match[2] ? parseFloat(match[2]) : null
//   };
// });

console.log("Outliers:", outliers);
//setOutlierRows(outliers);

//setOutlierRows(outliers);

const totalRows = parsed.data.length; // or the actual number of rows in your dataset

const parsedOutliers = outliers.map((row) => {
  const metric = String(row.metric).trim();
  const count = parseFloat(row.value) || 0;
  const percentage = totalRows ? (count / totalRows) * 100 : null;

  return {
    metric,
    count,
    percentage: percentage !== null ? percentage.toFixed(2) : null
  };
});

        setMissingRows(missing);
        setSummaryRows(summary);
        setOutlierRows(outliers);

        // Class balance comment
        const c0 = summary.find((r) =>
          r.metric.includes("Class 0 % (prevalentHyp)")
        );
        const c1 = summary.find((r) =>
          r.metric.includes("Class 1 % (prevalentHyp)")
        );

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
      {/* Missing Values Accordion */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Missing Value Report (Selected Features)
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
          <Typography variant="h6">Dataset Integrity Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
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
    <Typography variant="h6">Outlier Summary (Selected Features)</Typography>
  </AccordionSummary>
  <AccordionDetails>
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
