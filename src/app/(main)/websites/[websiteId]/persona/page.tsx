import { PersonaPage } from './PersonaPage';
import { Metadata } from 'next';

export default async function ({ params }: { params: Promise<{ websiteId: string }> }) {
  const { websiteId } = await params;

  return <PersonaPage websiteId={websiteId} />;
}

export const metadata: Metadata = {
  title: 'Persona AI',
};
