'use client';

import { PersonaDashboard } from '@/components/persona';

interface PersonaPageProps {
  websiteId: string;
}

export function PersonaPage({ websiteId }: PersonaPageProps) {
  return <PersonaDashboard websiteId={websiteId} />;
}
