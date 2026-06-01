import TemplatesPageClient from './TemplatesPageClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function TemplatesPage() { return <TemplatesPageClient />; }
