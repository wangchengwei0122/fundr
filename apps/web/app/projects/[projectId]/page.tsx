import { notFound } from 'next/navigation';

import { ProjectDetails } from '../../../components/projects/project-details';
import { fetchProjectDetail } from '@/src/lib/project-detail';

export type ProjectDetailPageProps = {
  params: {
    projectId: string;
  };
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await fetchProjectDetail(params.projectId);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-full space-y-6 overflow-x-hidden px-4 py-4 sm:max-w-6xl sm:space-y-10 sm:px-6 sm:py-6">
      <ProjectDetails project={project} />
    </main>
  );
}
