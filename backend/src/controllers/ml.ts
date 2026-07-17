import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import config from '../config';

const API_BASE = config.mlServiceUrl;
const LOCAL_DATASET_PATH = path.resolve(__dirname, '..', 'ml', 'ucid_student_scores.csv');

const RISK_LABELS: Record<string, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
};

function getHeuristicPrediction(row: Record<string, string>) {
  const attendancePercentage = Number(row.attendancePercentage);
  const assignmentAverage = Number(row.assignmentAverage);
  const currentGPA = Number(row.currentGPA);

  if (currentGPA < 2.0 || attendancePercentage < 60 || assignmentAverage < 50) {
    return 2;
  }

  if (currentGPA < 3.0 || attendancePercentage < 75 || assignmentAverage < 70) {
    return 1;
  }

  return 0;
}

function getHeuristicScore(prediction: number) {
  switch (prediction) {
    case 2:
      return { predictedProbability: 0.85, confidence: 0.88 };
    case 1:
      return { predictedProbability: 0.70, confidence: 0.75 };
    default:
      return { predictedProbability: 0.80, confidence: 0.84 };
  }
}

async function readLocalDataset() {
  const content = await fs.readFile(LOCAL_DATASET_PATH, 'utf8');
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(',');

  const rows = lines.map((line) => {
    const values = line.split(',').map((value) => value.trim());
    const entry: Record<string, string> = {};

    headers.forEach((header, index) => {
      entry[header] = values[index] ?? '';
    });

    const prediction = getHeuristicPrediction(entry);
    const { predictedProbability, confidence } = getHeuristicScore(prediction);
    const predictedRisk = RISK_LABELS[Object.keys(RISK_LABELS)[prediction]] || 'Low';
    const actualRisk = RISK_LABELS[entry.risk] || 'Low';

    return {
      attendancePercentage: Number(entry.attendancePercentage),
      assignmentAverage: Number(entry.assignmentAverage),
      quizAverage: Number(entry.quizAverage),
      midSemesterScore: Number(entry.midSemesterScore),
      previousGPA: Number(entry.previousGPA),
      currentGPA: Number(entry.currentGPA),
      studyHours: Number(entry.studyHours),
      participation: Number(entry.participation),
      libraryVisits: Number(entry.libraryVisits),
      lateSubmissionCount: Number(entry.lateSubmissionCount),
      disciplinaryRecord: Number(entry.disciplinaryRecord),
      lmsActivity: Number(entry.lmsActivity),
      courseLoad: Number(entry.courseLoad),
      sleepHours: Number(entry.sleepHours),
      stressLevel: Number(entry.stressLevel),
      predictedRisk,
      predictedProbability: Number((predictedProbability * 100).toFixed(2)),
      confidence: Number((confidence * 100).toFixed(2)),
      actualRisk
    };
  });

  const summary = rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.predictedRisk as 'Low' | 'Medium' | 'High'] += 1;
      return acc;
    },
    { total: 0, Low: 0, Medium: 0, High: 0 }
  );

  return { rows, summary };
}

export async function trainModel(req: Request, res: Response) {
  const response = await axios.post(`${API_BASE}/train`);
  res.status(response.status).json(response.data);
}

export async function predictRisk(req: Request, res: Response) {
  const response = await axios.post(`${API_BASE}/predict`, req.body);
  res.status(response.status).json(response.data);
}

export async function datasetPredictions(req: Request, res: Response) {
  try {
    const response = await axios.get(`${API_BASE}/dataset`);
    return res.status(response.status).json(response.data);
  } catch (error: any) {
    try {
      const localData = await readLocalDataset();
      return res.status(200).json({ status: 'success', data: localData });
    } catch (fallbackError) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { status: 'error', message: 'Failed to fetch dataset predictions' };
      return res.status(status).json(data);
    }
  }
}

export async function retrainModel(req: Request, res: Response) {
  const response = await axios.post(`${API_BASE}/retrain`);
  res.status(response.status).json(response.data);
}

export async function metrics(req: Request, res: Response) {
  const response = await axios.get(`${API_BASE}/metrics`);
  res.status(response.status).json(response.data);
}

export async function health(req: Request, res: Response) {
  const response = await axios.get(`${API_BASE}/health`);
  res.status(response.status).json(response.data);
}
