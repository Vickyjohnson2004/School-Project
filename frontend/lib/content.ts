import { Activity, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

export const stats = [
  { label: 'Self-service analytics', value: '24/7' },
  { label: 'Secure login', value: 'Cookie-based' },
  { label: 'Team adoption', value: '120+' },
  { label: 'Model updates', value: 'Weekly' }
];

export const features = [
  { title: 'Predictive alerts', description: 'Identify students at risk before they fall behind.', category: 'AI insights', icon: BarChart3 },
  { title: 'Safe campus data', description: 'Role-based access for administrators, lecturers, and advisors.', category: 'Security', icon: ShieldCheck },
  { title: 'Actionable recommendations', description: 'Generate interventions based on attendance and performance.', category: 'Interventions', icon: Sparkles },
  { title: 'Behavioral tracking', description: 'Monitor activity, participation and submission patterns.', category: 'Monitoring', icon: Activity }
];

export const testimonials = [
  { name: 'Dr. Amaka Obi', role: 'Academic Affairs Director', quote: 'UniPort transformed how we identify students who need help. The dashboards are clear and the predictions are actionable.' },
  { name: 'Prof. Daniel Nwosu', role: 'Lecturer', quote: 'Uploading attendance and quiz results is seamless. I can intervene faster and see a measurable difference.' },
  { name: 'Rita Chukwu', role: 'Academic Advisor', quote: 'The risk recommendations allow me to prioritize meetings with students who need support the most.' }
];

export const loaderItems = [
  { label: 'Attendance engagement', value: '74%', progress: '74%' },
  { label: 'Assignment completion', value: '88%', progress: '88%' },
  { label: 'Model accuracy', value: '91%', progress: '91%' }
];
