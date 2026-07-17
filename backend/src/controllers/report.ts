import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Report from '../models/Report';
import type { AuthRequest } from '../middleware/auth';

export async function generateReport(req: Request, res: Response) {
  const { title, studentId, summary, content } = req.body;
  const fileName = `report-${Date.now()}.pdf`;
  const filePath = path.resolve(process.cwd(), 'src', 'uploads', fileName);
  const doc = new PDFDocument({ size: 'A4', margin: 48 });
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).fillColor('#0f172a').text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).fillColor('#334155').text(`Student ID: ${studentId}`);
  doc.text(`Summary: ${summary}`);
  doc.moveDown();
  doc.fontSize(12).fillColor('#0f172a').text(content);
  doc.end();
  const report = await Report.create({ title, studentId, summary, pdfPath: filePath, generatedBy: (req as AuthRequest).user?.id || 'system' });
  res.status(201).json({ status: 'success', data: report });
}

export async function getReports(req: Request, res: Response) {
  const reports = await Report.find().sort({ generatedAt: -1 }).limit(50);
  res.json({ status: 'success', data: reports });
}
