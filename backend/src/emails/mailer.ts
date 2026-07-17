import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.emailHost,
  port: config.emailPort,
  auth: { user: config.emailUser, pass: config.emailPass }
});

async function safeSendMail(message: any) {
  if (!config.emailHost || !config.emailUser || !config.emailPass) {
    console.warn('Email credentials are not configured. Skipping email send.');
    return;
  }

  try {
    await transporter.sendMail(message);
  } catch (error) {
    console.warn('Email delivery failed:', error);
  }
}

export async function sendVerificationEmail(email: string, name: string) {
  await safeSendMail({
    from: 'no-reply@uniport.edu',
    to: email,
    subject: 'Verify your UniPort account',
    html: `<p>Hi ${name},</p><p>Thank you for registering with UniPort. Please verify your email address from your dashboard.</p>`
  });
}

export async function sendPasswordReset(email: string, token: string) {
  await safeSendMail({
    from: 'no-reply@uniport.edu',
    to: email,
    subject: 'UniPort password reset',
    html: `<p>Use this link to reset your password:</p><p><a href="${config.frontendUrl}/reset-password?token=${token}">Reset password</a></p>`
  });
}

export async function sendRiskNotification(email: string, studentName: string, riskLevel: string) {
  await safeSendMail({
    from: 'no-reply@uniport.edu',
    to: email,
    subject: 'High risk notification',
    html: `<p>Student ${studentName} has been identified as ${riskLevel}. Please review the recommendation report.</p>`
  });
}

export async function sendRiskAlertToStudent(email: string, name: string, riskLevel: string, topFactors: string[]) {
  const factorList = topFactors.map((f) => `<li>${f}</li>`).join('');
  await safeSendMail({
    from: 'no-reply@uniport.edu',
    to: email,
    subject: `UNIPORT Academic Alert: Your risk status is now ${riskLevel}`,
    html: `
      <p>Dear ${name},</p>
      <p>Your academic risk status has changed to <strong>${riskLevel}</strong>.</p>
      <p>Main contributing factors:</p>
      <ul>${factorList}</ul>
      <p>Please log in to your dashboard for personalised recommendations, and reach out to your academic adviser as soon as possible.</p>
      <p>— UniPort Student Risk Early-Warning System</p>
    `
  });
}

export async function sendInterventionAssignedToAdviser(
  email: string,
  adviserName: string,
  studentName: string,
  studentId: string,
  riskLevel: string,
  triggerReason: string
) {
  await safeSendMail({
    from: 'no-reply@uniport.edu',
    to: email,
    subject: `Action required: ${studentName} flagged as ${riskLevel} risk`,
    html: `
      <p>Dear ${adviserName},</p>
      <p>An intervention case has been opened for your advisee:</p>
      <p><strong>${studentName}</strong> (${studentId})<br/>
      Risk level: <strong>${riskLevel}</strong><br/>
      Trigger: ${triggerReason}</p>
      <p>Please log in to the dashboard, review the risk factors, and record the action you take.</p>
      <p>— UniPort Student Risk Early-Warning System</p>
    `
  });
}
