import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from "@mui/material";
import FeatureImportanceTab from "./FeatureImportanceTab";
import DisagreementTab from "./DisagreementTab"; 
import ModelReportsTab from "./ModelReportsTab"; 
import ROCChartTab from "./ROCChartTab"
import DataQualityTab from "./DataQualityTab"
const baseurl = import.meta.env.VITE_API_BASE_URL;

const tabConfig = [
  { label: "Data Quality", component: DataQualityTab },
  { label: "Feature Importance", component: FeatureImportanceTab },
  { label: "Model Reports", component: ModelReportsTab },
  { label: "Disagreement Cases", component: DisagreementTab },
  { label: "ROC Curves", component: ROCChartTab },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const tab = tabConfig[activeTab];
      if (tab.file) {
        try {
          const res = await fetch(`${baseurl}/artifacts/${tab.file}`);
          if (tab.type === "json") {
            const data = await res.json();
            setContent(data);
          } else if (tab.type === "image") {
            setContent(`${baseurl}/artifacts/${tab.file}`);
          }
        } catch (err) {
          console.error("Error fetching artifact:", err);
          setContent(null);
        }
      } else {
        setContent(null); // component-based tabs manage their own data
      }
    };
    fetchContent();
  }, [activeTab]);

  const renderJsonTable = (data) => {
    if (!data) return <Typography>Loading data...</Typography>;

    return Object.entries(data).map(([model, feats]) => (
      <Box key={model} sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>{model}</Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableBody>
              {Object.entries(feats).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{typeof value === "number" ? value.toFixed(4) : value.toString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    ));
  };

  const ActiveTabContent = tabConfig[activeTab].component;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(e, newVal) => setActiveTab(newVal)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabConfig.map((tab, idx) => (
          <Tab key={idx} label={tab.label} />
        ))}
      </Tabs>

      <Paper sx={{ p: 2, mt: 2, maxHeight: 600, overflow: "auto" }}>
        {ActiveTabContent ? (
          <ActiveTabContent />
        ) : tabConfig[activeTab].type === "json" ? (
          renderJsonTable(content)
        ) : tabConfig[activeTab].type === "image" ? (
          <img src={content} alt={tabConfig[activeTab].label} style={{ maxWidth: "100%" }} />
        ) : (
          <Typography>No content available</Typography>
        )}
      </Paper>
    </Box>
  );
}
