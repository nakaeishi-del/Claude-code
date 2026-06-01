import WebinarDetailClient from './WebinarDetailClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function WebinarDetailPage() { return <WebinarDetailClient />; }
