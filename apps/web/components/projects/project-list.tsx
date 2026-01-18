import Link from 'next/link';

import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/components/app';

import { ProjectCard } from './project-card';
import type { ProjectSummary } from './types';

export type ProjectListProps = {
  projects: ProjectSummary[];
};

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <AppCard className="border-dashed bg-white/60">
        <AppCardHeader>
          <AppCardTitle className="text-center text-lg">No projects found</AppCardTitle>
          <AppCardDescription className="text-center">
            Be the first to launch a project and start your Web3 crowdfunding journey.
          </AppCardDescription>
        </AppCardHeader>
        <AppCardContent className="pb-6 text-center text-sm text-slate-500">
          Future projects will be displayed here.
        </AppCardContent>
      </AppCard>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}`}
          className="block rounded-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
        >
          <ProjectCard project={project} />
        </Link>
      ))}
    </div>
  );
}
