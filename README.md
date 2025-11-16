BPAlign








BPAlign is a web-based Decision Support System (DSS) for predicting hypertension risk by combining benchmark datasets with real-world telemedicine records.
It provides both ensemble predictions and system-level stability scoring, making it suitable for clinical decision-making and research.

⭐ Features at a Glance

🩺 Hypertension Risk Prediction (Framingham-based ML models)

📊 Data Quality Scoring

🔍 Feature Importance Consistency

🤖 Model Reliability & AUC Stability

⚠️ Model Disagreement Analysis

🧭 Overall DSS Stability Score

📈 Interactive dashboards & visualizations

🚀 How It Works
Input

Patient details such as:

age, sex, smoking status, diabetes

sysBP, diaBP

BMI, heart rate, glucose

common telemedicine vitals

Output

Hypertension probability

Module-wise stability scores

Model performance diagnostics

Data quality feedback

🧮 Module Scores & Formulas
1. Data Quality Score (DQS)

Final Score: 98.95 / 100

DQS = 0.4 × Completeness  
    + 0.3 × Integrity  
    + 0.3 × Outlier Control

2. Feature Importance Consistency

Final Score: 99.32 / 100

Consistency = 100 - (average variance × 100)

3. Model Reliability Score (MRS)

Final Score: 98.25 / 100

MRS = 100 - (average variance of model metrics × 10000)

4. Model Disagreement Stability (MDSS)

Final Score: 73.15 / 100

MDSS = 100 - (average disagreement × 100)

5. AUC Stability Score

Final Score: 96.75 / 100

AUC Stability = 100 - (std(AUC) × 100)

🧭 Overall DSS Stability Score
⭐ 92.64 / 100

Weighted composite reflecting system robustness.

Overall Stability =
    0.20 × Data Quality
  + 0.20 × Feature Consistency
  + 0.25 × Model Reliability
  + 0.20 × AUC Stability
  + 0.15 × Model Disagreement Stability


A score above 90 indicates a highly stable and trustworthy DSS.

📚 Purpose
👨‍⚕️ For Clinicians

Support hypertension risk decisions in telemedicine workflows

Ensure predictions are stable and explainable

🧪 For Researchers

Evaluate model robustness across diverse data conditions

Bridge benchmark datasets with real-world records

🛠️ Tech Stack

Frontend: React, TailwindCSS

Backend: Python (FastAPI / Flask) (if applicable)

Models: Logistic Regression, Random Forest, Gradient Boosting, SVM

Data: Framingham + Telemedicine dataset

📦 Installation
git clone https://github.com/yourusername/BPAlign-UI.git
cd BPAlign-UI
npm install
npm start

📝 Usage

BPAlign is an active research project.
If you use it, extend it, or reference it, please contact the author first.

👤 Author

Eva Majumder
📌 Portfolio: https://eva0dev.github.io/

📌 GitHub UI Repo: https://eva0dev.github.io/BPAlign-UI/
