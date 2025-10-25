export interface Course {
  id: string;
  name: string;
  year?: number;
  semester?: number;
  prereqs?: {
    allOf: string[];
  };
}

export interface Plan {
  name: string;
  courses: Course[];
  optatives?: Course[];
  rules: {
    canEnrollIf: {
      allOf: string[];
    };
    canTakeFinalIf: {
      allOf: string[];
      requireFinal?: boolean;
    };
  };
}

export type CourseState = "pending" | "enrolled" | "approved" | "final";

export interface CourseProgress {
  state: CourseState;
  grade?: number;
}

export interface Stats {
  totalCourses: number;
  finishedCourses: number;
  averageGrade: number;
  progressPercentage: number;
}