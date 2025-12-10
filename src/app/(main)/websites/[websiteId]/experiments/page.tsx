import { ExperimentsPage } from './ExperimentsPage';
import { Metadata } from 'next';

export default function () {
  return <ExperimentsPage />;
}

export const metadata: Metadata = {
  title: 'Experiments | Signal',
};
