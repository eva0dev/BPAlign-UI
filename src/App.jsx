import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PredictionForm from "./PredictionForm";
import Dashboard from "./views/dashboard/Dashboard";
import PredictFile from "./views/dashboard/PredictFile";

export default function App() {
  const [fileResult, setFileResult] = useState(null);
  const [trainingResult, setTrainingResult] = useState(null);

  // ===== Handle Prediction File Upload =====
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/predict_file", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) setFileResult(result);
      else alert(`❌ Error: ${result.status}`);
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("❌ Upload failed: " + err.message);
    }
  };

  // ===== Handle Training Dataset Upload =====
  const handleTrainingUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/upload_training_file", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) setTrainingResult(result);
      else alert(`❌ Error: ${result.status}`);
    } catch (err) {
      console.error("Error uploading training file:", err);
      alert("❌ Upload failed: " + err.message);
    }
  };

  // ===== Helper to render result Accordion =====
 // ===== Helper to render result Accordion =====
const renderResultAccordion = (title, result, isTraining = false) => {
  if (!result) return null;
  const summary = result.summary || {};
  return (
    <Accordion sx={{ mt: 3 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {result ? (
          <>
            <Typography><strong>Input File:</strong> {result.input_file}</Typography>
            <Typography><strong>Output File:</strong> {result.output_file || "N/A"}</Typography>
            <Typography><strong>Status:</strong> {result.status} ({result.statusCode})</Typography>
            {/* Summary */}
        {summary.total_samples && (
          <>
            <Typography><strong>Total Samples:</strong> {summary.total_samples}</Typography>
            { !isTraining && summary.count_0 && (
              <>
                <Typography><strong>Count 0:</strong> {summary.count_0} ({summary.percentage_0})</Typography>
                <Typography><strong>Count 1:</strong> {summary.count_1} ({summary.percentage_1})</Typography>
                <Typography><strong>Average Confidence:</strong> {summary.avg_confidence}</Typography>
              </>
            )}
          </>
        )}

            {result.preview && result.preview.length > 0 && (
              <Box mt={2} sx={{ maxHeight: 200, overflowY: "auto" }}>
                <Typography variant="subtitle2">Preview:</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        {Object.keys(result.preview[0]).map((col) => (
                          <TableCell key={col}><strong>{col}</strong></TableCell>
                        ))}
                      </TableRow>
                      {result.preview.map((row, i) => (
                        <TableRow key={i}>
                          {Object.keys(row).map((col) => (
                            <TableCell key={col}>{row[col]}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Download button if output_file exists */}
            {result.output_file && (
              <Box mt={2}>
                <a
                  href={`http://localhost:5000/download/${result.output_file}`}
                  download
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="contained" color="primary">
                    Download Output CSV
                  </Button>
                </a>
              </Box>
            )}
          </>
        ) : (
          <Typography>No result yet.</Typography>
        )}

        {/* TRAIN button for training dataset */}
        {isTraining && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                try {
                  const res = await fetch("http://localhost:5000/train_model", {
                    method: "POST",
                  });
                  const data = await res.json();
                  alert(`✅ Training started: ${data.status}`);
                } catch (err) {
                  console.error(err);
                  alert("❌ Training failed: " + err.message);
                }
              }}
            >
              TRAIN
            </Button>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};



  return (
    <Router>
      {/* ===== AppBar / Navigation ===== */}
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            Prediction
          </Button>
          <Button color="inherit" component={Link} to="/dashboard">
            Dashboard
          </Button>

          {/* Upload Prediction File */}
          <Button component="label" color="inherit" sx={{ ml: 2 }}>
            Upload Prediction File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>

          {/* Upload Training File */}
          <Button component="label" color="inherit" sx={{ ml: 2 }}>
            Upload Training Dataset
            <input type="file" hidden onChange={handleTrainingUpload} />
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Routes>
          <Route path="/" element={<PredictionForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/predict_file" element={<PredictFile />} />
        </Routes>

        {/* Display Results */}
        {renderResultAccordion("Prediction File Result", fileResult)}
        {renderResultAccordion("Training Dataset Result", trainingResult, true)}

      </Box>
    </Router>
  );
}
