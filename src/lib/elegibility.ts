import type { Course, CourseProgress } from "../types/plan";

type Progress = Record<string, CourseProgress>;

const isApprovedOrRegular = (progress?: CourseProgress) => progress?.state === "approved" || progress?.state === "final";
const isApprovedOnly = (progress?: CourseProgress) => progress?.state === "final";

function satisfies(prereqs: Course["prereqs"] | undefined, progress: Progress, rule: "approved" | "approvedOrRegular") {
  if (!prereqs) return true;
  
  const ok = (id: string) => rule === "approvedOrRegular" ? isApprovedOrRegular(progress[id]) : isApprovedOnly(progress[id]);
  const all = prereqs.allOf?.every(ok) ?? true;
  return all;
}

export function canEnroll(course: Course, progress: Progress, rule: "approved" | "approvedOrRegular") {
  return satisfies(course.prereqs, progress, rule);
}

export function canTakeFinal(courseId: string, progress: Progress, requireFinal: boolean, course?: Course) {
  const courseProgress = progress[courseId];
  
  if (courseProgress?.state === "final") return false;
  
  if (!course || !requireFinal) {
    return courseProgress?.state === "approved" || courseProgress?.state === "enrolled";
  }
  
  if (course.prereqs) {
    return satisfies(course.prereqs, progress, "approved");
  }
  
  return true;
}

export function getMissingPrereqs(course: Course, progress: Progress, forFinal = false): string[] {
  if (!course.prereqs) return [];
  
  const missing: string[] = [];
  const checkFn = forFinal ? isApprovedOnly : isApprovedOrRegular;
  
  if (course.prereqs.allOf) {
    for (const prereqId of course.prereqs.allOf) {
      if (!checkFn(progress[prereqId])) {
        missing.push(prereqId);
      }
    }
  }
  
  return missing;
}