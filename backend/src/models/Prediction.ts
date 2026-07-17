import { Schema, model, models } from 'mongoose';

const PredictionSchema = new Schema({
  studentId: { type: String, required: true },
  predictedAt: { type: Date, default: Date.now },
  riskLevel: { type: String, required: true },
  riskProbability: { type: Number, required: true },
  confidence: { type: Number, default: 0 },
  details: { type: Schema.Types.Mixed, default: {} }
});

const Prediction = models.Prediction || model('Prediction', PredictionSchema);
export default Prediction;
