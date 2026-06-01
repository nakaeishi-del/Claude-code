import CheckPageClient from './CheckPageClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function CheckPage() { return <CheckPageClient />; }
