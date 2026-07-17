from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os

app = FastAPI(title='UniPort ML Service')

# On Vercel the deployment filesystem is read-only; only /tmp is writable (and
# ephemeral). Fall back to the local directory for normal server hosting.
_WRITABLE_DIR = '/tmp' if os.path.isdir('/tmp') and not os.access(os.path.dirname(__file__), os.W_OK) else os.path.dirname(__file__)
MODEL_PATH = os.path.join(_WRITABLE_DIR, 'model.joblib')

class StudentData(BaseModel):
    attendancePercentage: float
    assignmentAverage: float
    quizAverage: float
    midSemesterScore: float
    previousGPA: float
    currentGPA: float
    studyHours: float
    participation: float
    libraryVisits: float
    lateSubmissionCount: float
    disciplinaryRecord: float
    lmsActivity: float
    courseLoad: float
    sleepHours: float
    stressLevel: float

class ResponseMetrics(BaseModel):
    accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: float
    best_model: str

class PredictionResponse(BaseModel):
    riskLevel: str
    riskProbability: float
    confidence: float

MODEL_MAP = {
    'logistic': LogisticRegression(max_iter=500),
    'decision_tree': DecisionTreeClassifier(random_state=42),
    'random_forest': RandomForestClassifier(random_state=42),
    'xgboost': XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
}

FEATURES = [
    'attendancePercentage', 'assignmentAverage', 'quizAverage', 'midSemesterScore', 'previousGPA',
    'currentGPA', 'studyHours', 'participation', 'libraryVisits', 'lateSubmissionCount',
    'disciplinaryRecord', 'lmsActivity', 'courseLoad', 'sleepHours', 'stressLevel'
]

RISK_BUCKETS = {0: 'Low', 1: 'Medium', 2: 'High'}

@app.on_event('startup')
async def load_model():
    if not os.path.exists(MODEL_PATH):
        await train_model_internal()

async def get_dataset() -> pd.DataFrame:
    dataset_path = os.path.join(os.path.dirname(__file__), 'ucid_student_scores.csv')
    if os.path.exists(dataset_path):
        df = pd.read_csv(dataset_path)
        if 'risk' in df.columns:
            df['risk'] = df['risk'].map({'Low': 0, 'Medium': 1, 'High': 2})
        return df

    rng = np.random.default_rng(42)
    rows = 300
    data = {
        'attendancePercentage': rng.uniform(45, 100, rows),
        'assignmentAverage': rng.uniform(30, 100, rows),
        'quizAverage': rng.uniform(25, 100, rows),
        'midSemesterScore': rng.uniform(20, 100, rows),
        'previousGPA': rng.uniform(1.5, 4.5, rows),
        'currentGPA': rng.uniform(1.0, 4.5, rows),
        'studyHours': rng.uniform(0, 20, rows),
        'participation': rng.uniform(0, 10, rows),
        'libraryVisits': rng.uniform(0, 15, rows),
        'lateSubmissionCount': rng.integers(0, 8, rows),
        'disciplinaryRecord': rng.integers(0, 3, rows),
        'lmsActivity': rng.uniform(10, 100, rows),
        'courseLoad': rng.integers(12, 25, rows),
        'sleepHours': rng.uniform(4, 9, rows),
        'stressLevel': rng.uniform(0, 10, rows)
    }
    df = pd.DataFrame(data)
    conditions = [
        (df['currentGPA'] < 2.0) | (df['attendancePercentage'] < 60) | (df['assignmentAverage'] < 50),
        (df['currentGPA'] < 3.0) | (df['attendancePercentage'] < 75) | (df['assignmentAverage'] < 70)
    ]
    choices = [2, 1]
    df['risk'] = np.select(conditions, choices, default=0)
    return df

async def train_model_internal():
    df = await get_dataset()
    X = df[FEATURES]
    y = df['risk']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    best_score = 0.0
    best_model_name = 'logistic'
    best_classifier = None
    metrics = {}

    for name, model in MODEL_MAP.items():
        model.fit(X_train_scaled, y_train)
        preds = model.predict(X_test_scaled)
        score = f1_score(y_test, preds, average='weighted')
        if score > best_score:
            best_score = score
            best_model_name = name
            best_classifier = model
        metrics[name] = {
            'accuracy': accuracy_score(y_test, preds),
            'precision': precision_score(y_test, preds, average='weighted', zero_division=0),
            'recall': recall_score(y_test, preds, average='weighted', zero_division=0),
            'f1': score,
            'roc_auc': roc_auc_score(pd.get_dummies(y_test), pd.get_dummies(model.predict_proba(X_test_scaled)), average='weighted', multi_class='ovr')
        }

    if best_classifier is None:
        best_classifier = LogisticRegression(max_iter=500)
        best_classifier.fit(X_train_scaled, y_train)

    joblib.dump({'model': best_classifier, 'scaler': scaler, 'best': best_model_name}, MODEL_PATH)
    return {
        'accuracy': metrics[best_model_name]['accuracy'],
        'precision': metrics[best_model_name]['precision'],
        'recall': metrics[best_model_name]['recall'],
        'f1': metrics[best_model_name]['f1'],
        'roc_auc': metrics[best_model_name]['roc_auc'],
        'best_model': best_model_name
    }

@app.post('/train')
async def train():
    result = await train_model_internal()
    return {'status': 'success', 'metrics': result}

@app.post('/retrain')
async def retrain():
    result = await train_model_internal()
    return {'status': 'success', 'metrics': result}

@app.get('/metrics')
async def get_metrics():
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail='Model not found')
    model_data = joblib.load(MODEL_PATH)
    return {'status': 'success', 'model': model_data['best']}

@app.get('/dataset')
async def dataset():
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail='Model not found')
    saved = joblib.load(MODEL_PATH)
    scaler = saved['scaler']
    model = saved['model']
    df = await get_dataset()
    X = df[FEATURES]
    scaled = scaler.transform(X)
    probabilities = model.predict_proba(scaled)
    predictions = np.argmax(probabilities, axis=1)

    rows = []
    summary = {'total': len(df), 'Low': 0, 'Medium': 0, 'High': 0}

    for idx, row in X.iterrows():
        pred = int(predictions[idx])
        prob = probabilities[idx]
        predicted_risk = RISK_BUCKETS[pred]
        actual_risk = RISK_BUCKETS[int(df.loc[idx, 'risk'])]
        summary[predicted_risk] += 1
        rows.append({
            **row.to_dict(),
            'predictedRisk': predicted_risk,
            'predictedProbability': float(round(prob[pred] * 100, 2)),
            'confidence': float(round(np.max(prob) * 100, 2)),
            'actualRisk': actual_risk
        })

    return {
        'status': 'success',
        'data': {
            'rows': rows,
            'summary': summary
        }
    }

@app.get('/health')
async def health():
    return {'status': 'ok', 'message': 'ML service is healthy'}

@app.post('/predict')
async def predict(data: StudentData):
    if not os.path.exists(MODEL_PATH):
        raise HTTPException(status_code=404, detail='Model not found')
    saved = joblib.load(MODEL_PATH)
    scaler = saved['scaler']
    model = saved['model']
    input_df = pd.DataFrame([{field: getattr(data, field) for field in FEATURES}])
    scaled = scaler.transform(input_df)
    probabilities = model.predict_proba(scaled)[0]
    prediction = int(np.argmax(probabilities))
    return {
        'riskLevel': RISK_BUCKETS[prediction],
        'riskProbability': float(round(probabilities[prediction] * 100, 2)),
        'confidence': float(round(np.max(probabilities) * 100, 2))
    }

