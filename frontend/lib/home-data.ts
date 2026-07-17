import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  BookOpen,
  Cpu,
  FileText,
  Grid,
  Layers,
  Lock,
  MonitorSpeaker,
  Radar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

export const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#machine-learning', label: 'Machine Learning' },
  { href: '#analytics', label: 'Analytics' },
  { href: '#about', label: 'About' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' }
];

export const heroHighlights = [
  { label: 'Risk Score', value: '82%', accent: 'High risk' },
  { label: 'Confidence', value: '91%', accent: 'Certified AI' },
  { label: 'Students tracked', value: '22,400+', accent: 'University scale' }
];

export const trustStats = [
  { value: '20,000+', label: 'Students Managed' },
  { value: '98%', label: 'Prediction Accuracy' },
  { value: '15+', label: 'Departments' },
  { value: '4', label: 'User Roles' },
  { value: '100,000+', label: 'Predictions Generated' },
  { value: '50+', label: 'Academic Reports' }
];

export const featureCards = [
  { icon: Cpu, title: 'Machine Learning Prediction', description: 'Smart risk detection using ensemble models and adaptive retraining.' },
  { icon: Activity, title: 'Behavior Analysis', description: 'Track attendance, participation and LMS activity for early signal detection.' },
  { icon: BarChart3, title: 'Academic Analytics', description: 'Visualize progress, trends and comparative performance across cohorts.' },
  { icon: Bell, title: 'Real-time Notifications', description: 'Alert advisors and lecturers instantly when the model flags risks.' },
  { icon: ShieldCheck, title: 'Explainable AI', description: 'SHAP-based explanations show why each student is at risk.' },
  { icon: FileText, title: 'Automated Reports', description: 'Generate polished PDFs with recommendations and performance summaries.' },
  { icon: Layers, title: 'Recommendation Engine', description: 'Translate risk signals into practical student interventions.' },
  { icon: Grid, title: 'Role-Based Dashboards', description: 'Dedicated views for students, lecturers, advisors, and administrators.' }
];

export const workflowSteps = [
  'Collect student academic data',
  'Collect behavioral data',
  'Machine learning analysis',
  'Risk prediction',
  'Advisor intervention',
  'Improved student success'
];

export const mlHighlights = [
  { label: 'Random Forest', value: 'Ensemble performance' },
  { label: 'XGBoost', value: 'Optimized ranking' },
  { label: 'Decision Tree', value: 'Explainable rules' },
  { label: 'Logistic Regression', value: 'Baseline probability' }
];

export const dashboardPreviews = [
  {
    role: 'Student',
    headline: 'Student Success Console',
    summary: 'Personalized performance insights and risk action plan for each student.',
    stats: [
      { label: 'Current GPA', value: '3.2' },
      { label: 'Attendance', value: '76%' },
      { label: 'Risk', value: 'Medium' }
    ]
  },
  {
    role: 'Lecturer',
    headline: 'Classroom Risk Overview',
    summary: 'Monitor at-risk students and identify course areas needing support.',
    stats: [
      { label: 'Class risk', value: '28%' },
      { label: 'Engagement', value: '81%' },
      { label: 'Alerts', value: '14' }
    ]
  },
  {
    role: 'Advisor',
    headline: 'Advisor Intervention Hub',
    summary: 'Prioritize meetings and follow-ups using AI-driven recommendations.',
    stats: [
      { label: 'High risk', value: '12' },
      { label: 'Meetings', value: '7 scheduled' },
      { label: 'Impact', value: '92%' }
    ]
  },
  {
    role: 'Admin',
    headline: 'Program Analytics Studio',
    summary: 'Leadership analytics across departments, risk exposure and outcomes.',
    stats: [
      { label: 'Faculty reach', value: '6' },
      { label: 'Reports', value: '82 generated' },
      { label: 'Active users', value: '1.2k' }
    ]
  }
];

export const whyCards = [
  { icon: Zap, title: 'Early Detection', description: 'Act before failure with actionable insights delivered in real time.' },
  { icon: Sparkles, title: 'Smart Recommendations', description: 'Tailored interventions for students based on behavior and performance.' },
  { icon: Users, title: 'Role Intelligence', description: 'Dashboards designed for every stakeholder in the academic ecosystem.' },
  { icon: Lock, title: 'Secure & Trusted', description: 'Enterprise-grade security and governance for sensitive student data.' }
];

export const analyticsMetrics = [
  { label: 'Risk distribution', value: 'High risk 18%', color: '#38bdf8' },
  { label: 'Attendance trend', value: '+12% over semester', color: '#34d399' },
  { label: 'Performance trend', value: '+9% GPA uplift', color: '#fbbf24' }
];

export const explainabilityData = [
  { label: 'Attendance', value: 40 },
  { label: 'Assignments', value: 22 },
  { label: 'Study Hours', value: 16 },
  { label: 'Previous GPA', value: 12 },
  { label: 'Late Submission', value: 10 }
];

export const testimonials = [
  { name: 'Dr. Amaka Osei', role: 'Dean of Student Success', quote: 'UAEWSS transformed our intervention process and helped us reach students before they fell behind.', logo: 'University of Port Harcourt' },
  { name: 'Prof. David Brown', role: 'Head of Computer Science', quote: 'The platform gives us clarity over class performance and supports data-driven advising.', logo: 'TSI Academy' },
  { name: 'Aisha Bello', role: 'Academic Advisor', quote: 'I can now prioritize students with confidence and deliver measurable support.', logo: 'Campus Support' }
];

export const faqItems = [
  { question: 'How does the AI work?', answer: 'The system combines academic and behavioral signals with machine learning models to estimate risk and surface the strongest contributing factors.' },
  { question: 'How accurate is the model?', answer: 'Our enterprise workflow achieves accuracy above 95% on validation data and improves over time with retraining.' },
  { question: 'Can the model be retrained?', answer: 'Yes, the platform supports continuous retraining with fresh academic and behavioral data to adapt to changing student patterns.' },
  { question: 'Is my data secure?', answer: 'Yes, UAEWSS is built with secure authentication, role-based access, and data encryption best practices.' },
  { question: 'Who can use the platform?', answer: 'Students, lecturers, academic advisors and university administrators all benefit from role-specific dashboards and insights.' }
];

export const demoFeatures = [
  { label: 'Attendance', max: 100 },
  { label: 'Study Hours', max: 20 },
  { label: 'Assignments', max: 100 },
  { label: 'Quiz Scores', max: 100 },
  { label: 'Participation', max: 10 },
  { label: 'Current GPA', max: 5 }
];
