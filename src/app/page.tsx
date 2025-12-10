import { LandingPage } from './landing/LandingPage';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import client from '@/lib/prisma';

export default async function RootPage() {
  if (process.env.DISABLE_AUTH === 'true') {
    const website = await client.client.website.findFirst();
    if (website) {
      redirect(`/websites/${website.id}`);
    }
  }
  return <LandingPage />;
}

export const metadata: Metadata = {
  title: 'Signal Conversions - Decode Visitor Intent & Convert with Precision',
  description:
    "Capture 30+ behavioral signals to identify buyer personas in real-time. Understand who's browsing, what they need, and convert them—without cookies.",
};
