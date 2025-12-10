import { WelcomePage } from './WelcomePage';
import { Metadata } from 'next';

export default function () {
  return <WelcomePage />;
}

export const metadata: Metadata = {
  title: 'Welcome to Signal',
};
