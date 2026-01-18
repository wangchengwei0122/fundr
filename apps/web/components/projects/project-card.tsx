'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import type { ProjectSummary } from './types';

export type ProjectCardProps = {
  project: ProjectSummary;
};

const statusLabel: Record<ProjectSummary['status'], string> = {
  active: 'In Progress',
  successful: 'Successful',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

const statusClassName: Record<ProjectSummary['status'], string> = {
  active: 'bg-status-active text-status-active-foreground',
  successful: 'bg-status-successful text-status-successful-foreground',
  failed: 'bg-status-failed text-status-failed-foreground',
  cancelled: 'bg-muted text-muted-foreground',
};

function formatEth(value: number) {
  if (!Number.isFinite(value)) {
    return '0 ETH';
  }
  return `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} ETH`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const deadlineMillis = new Date(project.deadline).getTime();
    const millisLeft = deadlineMillis - Date.now();
    const days = Math.max(0, Math.ceil(millisLeft / (1000 * 60 * 60 * 24)));
    setDaysLeft(days);
  }, [project.deadline]);

  const progress = (() => {
    if (typeof project.progress === 'number') {
      return Math.max(0, Math.min(1, project.progress));
    }
    if (project.goalAmount === 0) {
      return 0;
    }
    return Math.min(project.pledgedAmount / project.goalAmount, 1);
  })();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl bg-card shadow-card ring-1 ring-border transition-base hover:-translate-y-0.5 hover:shadow-float">
      <div className="relative aspect-[16/11] w-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={800}
          height={550}
          className="h-full w-full object-cover transition-slower group-hover:scale-105"
        />
        <span className="glass absolute left-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-foreground">
          {project.category}
        </span>
        <span
          className={`absolute right-5 top-5 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClassName[project.status]}`}
        >
          {statusLabel[project.status]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="space-y-3">
          <p className="break-words text-sm text-muted-foreground">
            By <span className="font-medium text-foreground break-words">{project.creator}</span>
          </p>
          <h3 className="text-xl font-semibold text-foreground">{project.title}</h3>
          <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-muted-foreground">
            {project.summary}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>{formatEth(project.pledgedAmount)}</span>
            <span className="text-muted-foreground/70">Target {formatEth(project.goalAmount)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-slower"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress {Math.round(progress * 100)}%</span>
            <span>{daysLeft ?? '--'} days left</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm font-medium text-primary">
          <span>view project</span>
          <span aria-hidden className="transition-base group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </article>
  );
}
