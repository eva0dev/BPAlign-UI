import React, { useState } from "react";

const PredictFile = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/predict_file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setSummary(result.summary);
      } else {
        alert("Error: " + result.status);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Upload Prediction File</h2>
      <input type="file" accept=".csv" onChange={handleFileUpload} />

      {loading && <p className="mt-2">Processing file...</p>}

      {summary && (
        <div className="mt-6 p-4 border rounded bg-gray-50 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Prediction Summary</h3>
          <p>Total Samples: {summary.total_samples}</p>
          <p>Count 1: {summary.count_1}</p>
          <p>Count 0: {summary.count_0}</p>
          <p>Percentage 1: {summary.percentage_1}</p>
          <p>Percentage 0: {summary.percentage_0}</p>
          <p>Avg. Confidence: {summary.avg_confidence}</p>
        </div>
      )}
    </div>
  );
};

export default PredictFile;
