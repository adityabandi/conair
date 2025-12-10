import { LivePage } from './LivePage';
import { Metadata } from 'next';

export default function () {
  return <LivePage />;
}

export const metadata: Metadata = {
  title: 'Live Feed | Signal',
};
