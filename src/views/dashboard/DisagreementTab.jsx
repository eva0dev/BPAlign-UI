// @ts-nocheck
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
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function DisagreementTab() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/artifacts/model_disagreements.json")
      .then((res) => res.json())
      .then((json) => setCases(json))
      .catch(console.error);
  }, []);

  if (!cases.length) return <Typography>No disagreement cases found.</Typography>;

  // --- Helpers ---
  function getDisagreement(c) {
    const votes = Object.values(c.predictions);
    const ones = votes.filter((v) => v === 1).length;
    return 1 - Math.max(ones, votes.length - ones) / votes.length;
  }

  function getRiskFlags(features) {
    const flags = [];
    if (features.sysBP >= 135 && features.sysBP <= 145) flags.push("Borderline SysBP");
    if (features.diaBP >= 85 && features.diaBP <= 95) flags.push("Borderline DiaBP");
    if (features.glucose < 65 || features.glucose > 200) flags.push("Abnormal Glucose");
    if (features.BMI > 30) flags.push("Obesity");
    return flags;
  }

  // --- Summary Stats ---
  const total = cases.length;
  const avgDisagreement =
    cases.reduce((sum, c) => sum + getDisagreement(c), 0) / total;

  const disagreementLevels = {
    low: cases.filter((c) => getDisagreement(c) < 0.2).length,
    medium: cases.filter((c) => getDisagreement(c) >= 0.2 && getDisagreement(c) < 0.5).length,
    high: cases.filter((c) => getDisagreement(c) >= 0.5).length,
  };

  // --- Model Disagreement Stability Score ---
  const MDSS = 100 - avgDisagreement * 100;

  // --- Histogram Buckets ---
  const bpBuckets = {
    "<120": { mild: 0, moderate: 0, severe: 0 },
    "120-129": { mild: 0, moderate: 0, severe: 0 },
    "130-139": { mild: 0, moderate: 0, severe: 0 },
    "140-149": { mild: 0, moderate: 0, severe: 0 },
    "150+": { mild: 0, moderate: 0, severe: 0 },
  };

  const glucoseBuckets = {
    "<65": { mild: 0, moderate: 0, severe: 0 },
    "65-110": { mild: 0, moderate: 0, severe: 0 },
    "111-200": { mild: 0, moderate: 0, severe: 0 },
    "200+": { mild: 0, moderate: 0, severe: 0 },
  };

  function getDisagreementCount(c) {
    const votes = Object.values(c.predictions);
    const ones = votes.filter((v) => v === 1).length;
    const zeros = votes.length - ones;
    return Math.min(ones, zeros);
  }

  function getDisagreementLevel(count) {
    if (count === 1) return "mild";
    if (count <= 2) return "moderate";
    return "severe";
  }

  cases.forEach((c) => {
    const disagreeCount = getDisagreementCount(c);
    if (disagreeCount > 0) {
      const level = getDisagreementLevel(disagreeCount);

      const sys = c.features.sysBP;
      if (sys < 120) bpBuckets["<120"][level]++;
      else if (sys < 130) bpBuckets["120-129"][level]++;
      else if (sys < 140) bpBuckets["130-139"][level]++;
      else if (sys < 150) bpBuckets["140-149"][level]++;
      else bpBuckets["150+"][level]++;

      const gl = c.features.glucose;
      if (gl < 65) glucoseBuckets["<65"][level]++;
      else if (gl <= 110) glucoseBuckets["65-110"][level]++;
      else if (gl <= 200) glucoseBuckets["111-200"][level]++;
      else glucoseBuckets["200+"][level]++;
    }
  });

  const pieData = {
    labels: ["Low", "Medium", "High"],
    datasets: [
      {
        data: [disagreementLevels.low, disagreementLevels.medium, disagreementLevels.high],
        backgroundColor: ["#4caf50", "#ff9800", "#f44336"],
      },
    ],
  };

  const bpChartData = {
    labels: Object.keys(bpBuckets),
    datasets: [
      {
        label: "Mild (1 model)",
        data: Object.values(bpBuckets).map((b) => b.mild),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Moderate (2 models)",
        data: Object.values(bpBuckets).map((b) => b.moderate),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
      {
        label: "Severe (2+ models)",
        data: Object.values(bpBuckets).map((b) => b.severe),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const glucoseChartData = {
    labels: Object.keys(glucoseBuckets),
    datasets: [
      {
        label: "Mild (1 model)",
        data: Object.values(glucoseBuckets).map((b) => b.mild),
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
      {
        label: "Moderate (2 models)",
        data: Object.values(glucoseBuckets).map((b) => b.moderate),
        backgroundColor: "rgba(255, 206, 86, 0.7)",
      },
      {
        label: "Severe (2+ models)",
        data: Object.values(glucoseBuckets).map((b) => b.severe),
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: "top" }, title: { display: true, text: "Disagreement Histogram" } },
    scales: { x: { stacked: true }, y: { stacked: true } },
  };

  // --- Render ---
  return (
    <Box>
      {/* ===== Stability Score Section ===== */}
      <Typography variant="h6" mb={1}>
        Model Disagreement Stability Score (MDSS): {MDSS.toFixed(2)} / 100
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Calculated as <b>100 - (Average Disagreement × 100)</b> <br />
        Total cases: {total}, Average Disagreement: {(avgDisagreement * 100).toFixed(2)}%
      </Typography>

      {/* ===== Summary Dashboard ===== */}
      <Typography variant="h6" mb={2}>
        Disagreement Summary
      </Typography>
      <Typography>Total Cases: {total}</Typography>
      <Typography>Average Disagreement Score: {(avgDisagreement * 100).toFixed(1)}%</Typography>

      <Box sx={{ maxWidth: 400, mt: 2 }}>
        <Pie
          data={pieData}
          options={{
            plugins: {
              legend: { position: "bottom" },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || "";
                    const value = context.raw || 0;
                    const percent = total ? ((value / total) * 100).toFixed(1) : 0;
                    return `${label}: ${value} (${percent}%)`;
                  },
                },
              },
            },
          }}
        />
      </Box>

      {/* Histograms */}
      <Accordion sx={{ mt: 3 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Disagreement Histograms</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle2" gutterBottom>
            By Systolic BP
          </Typography>
          <Bar data={bpChartData} options={options} />

          <Typography variant="subtitle2" gutterBottom mt={3}>
            By Glucose
          </Typography>
          <Bar data={glucoseChartData} options={options} />
        </AccordionDetails>
      </Accordion>

      {/* Per-Patient Disagreements */}
      <Accordion sx={{ mt: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Per-Patient Disagreements</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ maxHeight: "500px", overflowY: "auto" }}>
          {cases.slice(0, 50).map((c, i) => {
            const disagreement = getDisagreement(c);
            const riskFlags = getRiskFlags(c.features);

            return (
              <Box key={i} sx={{ mb: 3, p: 2, border: "1px solid #ddd", borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Row ID: {c.row_id}, True Label: {c.true_label}
                </Typography>

                <Typography variant="body2">Disagreement Score:</Typography>
                <LinearProgress
                  variant="determinate"
                  value={disagreement * 100}
                  sx={{ height: 8, borderRadius: 5, mb: 1 }}
                  color={
                    disagreement < 0.2 ? "success" : disagreement < 0.5 ? "warning" : "error"
                  }
                />
                <Typography variant="caption">{(disagreement * 100).toFixed(1)}%</Typography>

                <TableContainer component={Paper} sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableBody>
                      {Object.entries(c.predictions).map(([model, pred]) => (
                        <TableRow key={model}>
                          <TableCell>{model}</TableCell>
                          <TableCell>{pred === 1 ? "✅ Positive" : "❌ Negative"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {riskFlags.length > 0 && (
                  <Box mt={1}>
                    <Typography variant="body2">Risk Features:</Typography>
                    {riskFlags.map((f) => (
                      <Chip
                        key={f}
                        label={f}
                        size="small"
                        color="warning"
                        sx={{ mr: 1, mt: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
