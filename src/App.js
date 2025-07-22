import React, { useState } from "react";
import { TextField, MenuItem, Button, Box, Typography } from "@mui/material";
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";

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
  glucose: ""
};

const selectFields = {
  gender: ["male", "female"],
  smoking: ["yes", "no"],
  diabetes: ["yes", "no"]
};

export default function App() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("${baseurl}/prediction/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      setResult(data.result || JSON.stringify(data));
      //setForm(initialState); // Optionally reset form on submit
    } catch (error) {
      setResult("Error: Could not get prediction.");
    }
  };
  return (
  <Box sx={{ maxWidth: 400, mx: "auto", mt: 4, p: 2 }}>
    <Typography variant="h5" mb={2}>Hypertension Risk Assessment</Typography>
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
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Highlighted Result Section */}
        <Box sx={{ textAlign: "center", my: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color:
                result === "1" || result === 1
                  ? "green"
                  : result === "0" || result === 0
                  ? "red"
                  : "inherit",
            }}
          >
            {result === "1" || result === 1
              ? "Yes"
              : result === "0" || result === 0
              ? "No"
              : result}
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
            {result === "1" || result === 1
              ? "High risk of hypertension"
              : result === "0" || result === 0
              ? "Low risk of hypertension"
              : ""}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={() => {
            setResult(null);
            setForm(initialState);
          }}
        >
          New Prediction
        </Button>
      </Box>
    ) : (
      // Show form if no result
      <form onSubmit={handleSubmit}>
        {Object.entries(initialState).map(([key, value]) =>
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
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              name={key}
              type="number"
              value={form[key]}
              onChange={handleChange}
              margin="normal"
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