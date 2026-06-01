import TasksPageClient from './TasksPageClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function TasksPage() { return <TasksPageClient />; }
