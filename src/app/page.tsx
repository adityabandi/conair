import { LandingPage } from './landing/LandingPage';
import { Metadata } from 'next';

export default function RootPage() {
  return <LandingPage />;
}

export const metadata: Metadata = {
  title: 'Signal Conversions - Decode Visitor Intent & Convert with Precision',
  description: 'Capture 30+ behavioral signals to identify buyer personas in real-time. Understand who\'s browsing, what they need, and convert them—without cookies.',
};
