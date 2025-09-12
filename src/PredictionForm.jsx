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

const constraints = {
  age: [0, 120],
  sysBP: [70, 250],
  diaBP: [40, 150],
  BMI: [10, 60],
  heartRate: [30, 200],
  glucose: [50, 300],
};

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
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    Object.entries(constraints).forEach(([key, [min, max]]) => {
      const val = parseFloat(form[key]);
      if (isNaN(val)) newErrors[key] = "Required";
      else if (val < min || val > max)
        newErrors[key] = `Must be between ${min} and ${max} ${units[key] || ""}`;
    });

    Object.entries(selectFields).forEach(([key, options]) => {
      if (!form[key] || !options.includes(form[key].toLowerCase()))
        newErrors[key] = "Required";
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
      console.log(data);
      setResult(data); // store full API response
    } catch (error) {
      setResult({ best_model: null, combined_model: null, result: null });
    }
  };

  const formatPrediction = (pred) =>
    pred === 1 ? "YES" : pred === 0 ? "NO" : "-";

  // Flip colors: YES = red (risk), NO = green (safe)
const rowBackground = (pred) =>
  pred === 1 ? "rgba(255,0,0,0.15)" : pred === 0 ? "rgba(0,255,0,0.15)" : "inherit";

const formatColor = (pred) =>
  pred === 1 ? "red" : pred === 0 ? "green" : "inherit";

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4, p: 2 }}>
      {/* Centered Heading */}
      <Typography
        variant="h5"
        mb={2}
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        Hypertension Risk Assessment
      </Typography>

      {result ? (
        <Box mt={2}>
          {/* Overall Combined Prediction */}
          <Box sx={{ textAlign: "center", my: 2 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                color: result?.combined_model?.result === 1 ? "red" : "green",
              }}
            >
              {formatPrediction(result?.combined_model?.result)}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              {result?.combined_model?.result === 1
                ? "High risk of hypertension"
                : result?.combined_model?.result === 0
                ? "Low risk of hypertension"
                : ""}
            </Typography>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mt: 1 }}>
              Combined Confidence:{" "}
              {result?.combined_model?.confidence
                ? (result.combined_model.confidence * 100).toFixed(2) + "%"
                : "-"}
            </Typography>
          </Box>

          {/* Input Summary */}
          <Typography variant="h6">Input Summary</Typography>
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

          {/* Best Model */}
          {result?.best_model && (
            <Box>
              <Typography variant="h6" mt={3}>Best Model</Typography>
              <TableContainer component={Paper} sx={{ my: 1 }}>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                      <TableCell>{result.best_model.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Prediction</TableCell>
                      <TableCell
                        sx={{ color: result.best_model.pred === 1 ? "red" : "green" }}
                      >
                        {formatPrediction(result.best_model.pred)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold" }}>Confidence</TableCell>
                      <TableCell>
                        {(result.best_model.confidence * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Combined Model Details with row background */}
          {result?.combined_model?.details?.length > 0 && (
            <Box>
              <Typography variant="h6" mt={3}>Combined Model Details</Typography>
              <TableContainer component={Paper} sx={{ my: 1 }}>
                <Table size="small">
                  <TableBody>
                    {result.combined_model.details.map((d, idx) => (
                      <TableRow
                        key={idx}
                        sx={{ backgroundColor: rowBackground(d.hard_pred) }}
                      >
                        <TableCell sx={{ fontWeight: "bold" }}>{d.name}</TableCell>
                        <TableCell>
                          Pred: {formatPrediction(d.hard_pred)}, Prob:{" "}
                          {(d.prob_class1 * 100).toFixed(2)}%, Weight:{" "}
                          {d.weight.toFixed(2)}, Contribution:{" "}
                          {d.weighted_contribution.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

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
                label={key.charAt(0).toUpperCase() + key.slice(1)}
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
