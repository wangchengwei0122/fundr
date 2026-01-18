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
    <section className="grid gap-6 rounded-[32px] bg-white p-4 shadow-xl shadow-blue-950/5 ring-1 ring-slate-900/5 sm:gap-8 sm:p-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="relative w-full max-w-full overflow-hidden rounded-[24px] bg-slate-100">
        <Image
          src={project.imageUrl}
          alt={project.title}
          width={800}
          height={600}
          className="h-full w-full max-w-full rounded-[24px] object-cover"
        />
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm sm:left-6 sm:top-6">
          {project.category}
        </span>
      </div>

      <div className="flex w-full max-w-full flex-col gap-6 self-center sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <AppBadge variant="secondary" className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
            Featured Project
          </AppBadge>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {project.title}
          </h1>
          <p className="line-clamp-2 min-h-[3rem] text-sm leading-relaxed text-slate-600 sm:text-base">
            {project.summary}
          </p>
          <p className="break-all text-xs text-slate-500 sm:text-sm">
            Created by <span className="font-medium text-slate-900 break-all">{project.creator}</span>
          </p>
        </div>

        <div className="w-full max-w-full space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 sm:text-sm">
            <span>{Math.round(progress * 100)}% Raised</span>
            <span className="text-slate-500">{daysLeft ?? "--"} days left</span>
          </div>
          <div className="h-2 w-full max-w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-500"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>

        <div className="flex w-full max-w-full flex-wrap gap-3">
          <AppButton asChild className="w-full rounded-full px-6 text-sm sm:w-auto">
            <Link href={`/projects/${project.id}`}>Support Project</Link>
          </AppButton>
        </div>
      </div>
    </section>
  );
}
