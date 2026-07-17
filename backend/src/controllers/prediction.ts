import { Request, Response } from 'express';
import Prediction from '../models/Prediction';

export async function submitPrediction(req: Request, res: Response) {
  const { studentId, riskLevel, riskProbability, confidence, details } = req.body;
  const prediction = await Prediction.create({ studentId, riskLevel, riskProbability, confidence, details });
  res.status(201).json({ status: 'success', data: prediction });
}

export async function getPredictions(req: Request, res: Response) {
  const predictions = await Prediction.find().sort({ predictedAt: -1 }).limit(50);
  res.json({ status: 'success', data: predictions });
}
