import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, CourseProgress, CourseState, Stats } from "../types/plan";

interface PlanStore {
  plan: Plan | null;
  progress: Record<string, CourseProgress>;
  currentCareer: string | null;
  selectedOptatives: Record<string, string>;
  setPlan: (plan: Plan) => void;
  setCurrentCareer: (careerId: string) => void;
  setCourseState: (courseId: string, state: CourseState, grade?: number) => void;
  selectOptative: (groupId: string, optativeId: string) => void;
  getStats: () => Stats;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: null,
      progress: {},
      currentCareer: null,
      selectedOptatives: {},

      setPlan: (plan) => set({ plan }),
      
      setCurrentCareer: (careerId) => set({ currentCareer: careerId }),

      setCourseState: (courseId, state, grade) => {
        const currentCareer = get().currentCareer;
        if (!currentCareer) return;

        set((store) => ({
          progress: {
            ...store.progress,
            [`${currentCareer}_${courseId}`]: {
              state,
              grade: state === "final" ? grade : undefined,
            },
          },
        }));
      },

      selectOptative: (groupId, optativeId) => {
        set((store) => ({
          selectedOptatives: {
            ...store.selectedOptatives,
            [groupId]: optativeId,
          },
        }));
      },

      getStats: () => {
        const { plan, progress, currentCareer, selectedOptatives } = get();
        if (!plan || !currentCareer) {
          return {
            totalCourses: 0,
            finishedCourses: 0,
            averageGrade: 0,
            progressPercentage: 0,
          };
        }

        // Contar materias obligatorias
        const mandatoryCourses = plan.courses;
        
        // Contar optativas seleccionadas para esta carrera
        const selectedOptativesForCareer = Object.keys(selectedOptatives)
          .filter(key => key.startsWith(`${currentCareer}_OPT-`))
          .map(key => selectedOptatives[key]);
        
        // Total de materias = obligatorias + optativas seleccionadas
        const totalCourses = mandatoryCourses.length + selectedOptativesForCareer.length;
        
        // Contar finalizadas (obligatorias + optativas seleccionadas)
        const finishedMandatory = mandatoryCourses.filter(
          (course) => progress[`${currentCareer}_${course.id}`]?.state === "final"
        ).length;
        
        const finishedOptatives = selectedOptativesForCareer.filter(
          (optId) => progress[`${currentCareer}_${optId}`]?.state === "final"
        ).length;
        
        const finishedCourses = finishedMandatory + finishedOptatives;

        // Calcular promedio (obligatorias + optativas seleccionadas)
        const allCoursesIds = [
          ...mandatoryCourses.map(c => c.id),
          ...selectedOptativesForCareer
        ];
        
        const grades = allCoursesIds
          .map((id) => progress[`${currentCareer}_${id}`]?.grade)
          .filter((grade): grade is number => grade !== undefined);

        const averageGrade = grades.length > 0 
          ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length 
          : 0;

        const progressPercentage = totalCourses > 0 ? (finishedCourses / totalCourses) * 100 : 0;

        return {
          totalCourses,
          finishedCourses,
          averageGrade,
          progressPercentage,
        };
      },
    }),
    {
      name: "plan-storage",
      partialize: (state) => ({ 
        progress: state.progress,
        currentCareer: state.currentCareer,
        selectedOptatives: state.selectedOptatives
      }),
    }
  )
);