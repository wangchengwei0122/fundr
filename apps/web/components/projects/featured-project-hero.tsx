"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import { AppButton, AppBadge } from '@/components/app';
import type { ProjectSummary } from "./types";

export type FeaturedProjectHeroProps = {
  project: ProjectSummary;
};

export function FeaturedProjectHero({ project }: FeaturedProjectHeroProps) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const millisLeft = new Date(project.deadline).getTime() - Date.now();
    const days = Math.max(0, Math.ceil(millisLeft / (1000 * 60 * 60 * 24)));
    setDaysLeft(days);
  }, [project.deadline]);

  const progress = (() => {
    if (typeof project.progress === "number") {
      return Math.max(0, Math.min(1, project.progress));
    }
    if (project.goalAmount === 0) {
      return 0;
    }
    return Math.min(project.pledgedAmount / project.goalAmount, 1);
  })();

  return (
    <section className="grid gap-6 rounded-2xl bg-card p-4 shadow-card ring-1 ring-border sm:gap-8 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative w-full max-w-full overflow-hidden rounded-xl bg-muted">
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={800}
          height={600}
          className="h-full w-full max-w-full rounded-xl object-cover"
        />
        <span className="glass absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium text-foreground sm:left-6 sm:top-6">
          {project.category}
        </span>
      </div>

      <div className="flex w-full max-w-full flex-col gap-6 self-center sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <AppBadge variant="secondary" className="rounded-full bg-status-active px-3 py-1 text-status-active-foreground">
            Featured Project
          </AppBadge>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {project.title}
          </h1>
          <p className="line-clamp-2 min-h-[3rem] text-sm leading-relaxed text-muted-foreground sm:text-base">
            {project.summary}
          </p>
          <p className="break-all text-xs text-muted-foreground sm:text-sm">
            Created by <span className="font-medium text-foreground break-all">{project.creator}</span>
          </p>
        </div>

        <div className="w-full max-w-full space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground sm:text-sm">
            <span>{Math.round(progress * 100)}% Raised</span>
            <span className="text-muted-foreground">{daysLeft ?? "--"} days left</span>
          </div>
          <div className="h-2 w-full max-w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-slower"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex w-full max-w-full flex-wrap gap-3">
          <AppButton asChild className="w-full rounded-full px-6 text-sm sm:w-auto" glow="primary">
            <Link href={`/projects/${project.id}`}>Support Project</Link>
          </AppButton>
        </div>
      </div>
    </section>
  );
}
