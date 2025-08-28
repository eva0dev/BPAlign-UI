import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";

const baseurl = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  gender: "",
  age: "",
  smoking: "",
  diabetes: "",
  sysBP: "",
  diaBP: "",
  BMI: "",
  heartRate: "",
  glucose: "",
};

const selectFields = {
  gender: ["male", "female"],
  smoking: ["yes", "no"],
  diabetes: ["yes", "no"],
};

// Define realistic min/max for numeric fields
const constraints = {
  age: [0, 120],
  sysBP: [70, 250],
  diaBP: [40, 150],
  BMI: [10, 60],
  heartRate: [30, 200],
  glucose: [50, 300],
};

// Define units for numeric fields
const units = {
  age: "years",
  sysBP: "mmHg",
  diaBP: "mmHg",
  BMI: "kg/m²",
  heartRate: "bpm",
  glucose: "mg/dL",
};

export default function PredictionForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" }); // clear error on change
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(constraints).forEach(([key, [min, max]]) => {
      const val = parseFloat(form[key]);
      if (isNaN(val)) {
        newErrors[key] = "Required";
      } else if (val < min || val > max) {
        newErrors[key] = `Must be between ${min} and ${max} ${units[key] || ""}`;
      }
    });

    Object.entries(selectFields).forEach(([key, options]) => {
      if (!form[key] || !options.includes(form[key].toLowerCase())) {
        newErrors[key] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await fetch(baseurl + "/prediction/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      const predictionText =
        data.prediction === 1 || data.prediction === "1" ? "YES" :
        data.prediction === 0 || data.prediction === "0" ? "NO" :
        data.prediction;

      setResult({
        prediction: predictionText,
        confidence: data.confidence ? (data.confidence * 100).toFixed(1) + "%" : "N/A",
      });
    } catch (error) {
      setResult({ prediction: "Error", confidence: "N/A" });
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
      <Typography variant="h5" mb={2}>
        Hypertension Risk Assessment
      </Typography>

      {result ? (
        <Box mt={2}>
          <Typography variant="h6">Prediction Summary</Typography>

          <TableContainer component={Paper} sx={{ my: 2 }}>
            <Table size="small">
              <TableBody>
                {Object.entries(form).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </TableCell>
                    <TableCell>{value} {units[key] || ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ textAlign: "center", my: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color:
                  result.prediction === "YES" ? "green" :
                  result.prediction === "NO" ? "red" : "inherit",
              }}
            >
              {result.prediction}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              {result.prediction === "YES"
                ? "High risk of hypertension"
                : result.prediction === "NO"
                ? "Low risk of hypertension"
                : ""}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mt: 1 }}>
              Confidence: {result.confidence}
            </Typography>
          </Box>

          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              setResult(null);
              setForm(initialState);
              setErrors({});
            }}
          >
            New Prediction
          </Button>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          {Object.entries(initialState).map(([key]) =>
            selectFields[key] ? (
              <TextField
                key={key}
                select
                fullWidth
                label={`${key.charAt(0).toUpperCase() + key.slice(1)}`}
                name={key}
                value={form[key]}
                onChange={handleChange}
                margin="normal"
                error={!!errors[key]}
                helperText={errors[key]}
              >
                {selectFields[key].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={key}
                fullWidth
                label={`${key.charAt(0).toUpperCase() + key.slice(1)} (${units[key] || ""})`}
                placeholder={`Enter ${key} in ${units[key] || ""}`}
                name={key}
                type="number"
                value={form[key]}
                onChange={handleChange}
                margin="normal"
                error={!!errors[key]}
                helperText={errors[key]}
              />
            )
          )}

          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Submit
          </Button>
        </form>
      )}
    </Box>
  );
}
