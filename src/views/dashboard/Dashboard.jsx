import React, { useState, useEffect } from "react";
import { Tabs, Tab, Box, Typography, Paper } from "@mui/material";

const baseurl = import.meta.env.VITE_API_BASE_URL;

const tabConfig = [
  { label: "Feature Importance", file: "feature_importances.json", type: "json" },
  { label: "Decision Tree Report", file: "decisiontree_report.json", type: "json" },
  { label: "Random Forest Report", file: "randomforest_report.json", type: "json" },
  { label: "Logistic Regression Report", file: "logisticregression_report.json", type: "json" },
  { label: "Gradient Boosting Report", file: "gradientboosting_report.json", type: "json" },
  { label: "SVM Report", file: "svm_report.json", type: "json" },
  { label: "Disagreement Cases", file: "model_disagreements.json", type: "json" },
  { label: "ROC Curves", file: "roc_comparison.png", type: "image" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      const tab = tabConfig[activeTab];
      try {
        if (tab.type === "json") {
          const res = await fetch(`${baseurl}/artifacts/${tab.file}`);
          const data = await res.json();
          setContent(JSON.stringify(data, null, 2));
        } else if (tab.type === "image") {
          setContent(`${baseurl}/artifacts/${tab.file}`);
        }
      } catch (err) {
        console.error("Error fetching artifact:", err);
        setContent("Failed to load data");
      }
    };

    fetchContent();
  }, [activeTab]);

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
        {tabConfig[activeTab].type === "json" ? (
          <pre>{content}</pre>
        ) : tabConfig[activeTab].type === "image" ? (
          <img src={content} alt={tabConfig[activeTab].label} style={{ maxWidth: "100%" }} />
        ) : (
          <Typography>{content}</Typography>
        )}
      </Paper>
    </Box>
  );
}
