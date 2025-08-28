import React, { useEffect, useState } from "react";
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ModelReportsTab() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const models = ["randomforest", "decisiontree", "logisticregression", "gradientboosting", "svm"];
    Promise.all(models.map(m =>
      fetch(`${import.meta.env.VITE_API_BASE_URL}/artifacts/${m}_report.json`)
        .then(res => res.json())
        .then(json => ({ model: m, content: json }))
        .catch(() => null)
    )).then(res => setReports(res.filter(Boolean)));
  }, []);

  if (!reports.length) return <Typography>Loading model reports...</Typography>;

  return (
    <Box>
      {reports.map(r => (
        <Accordion key={r.model}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{r.model}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(r.content, null, 2)}</pre>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}
