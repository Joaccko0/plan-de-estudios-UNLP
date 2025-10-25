import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Plan, CourseProgress, CourseState, Stats } from "../types/plan";

// Materias que se comparten entre todas las carreras
const SHARED_COURSES = [
  "CNE", "CNC", "CNM", // Nivelación
  "SI106", "SI104", "SI101", // 1er año
  "SI107", "SI105", "SI102",
  "SI209", "SI203", "SI207", // 2do año
  "SI210", "SI202", "SI206", "SI204", "SI208",
  "SI308", "SI302", "SI306", "SI307", // 3er año
  "SI304", "SI301", "SI305"
];

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
  getProgressKey: (courseId: string) => string;
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

      getProgressKey: (courseId: string) => {
        const { currentCareer } = get();
        // Si es materia compartida, usar solo el ID
        if (SHARED_COURSES.includes(courseId)) {
          return courseId;
        }
        // Si no, usar prefijo de carrera
        return currentCareer ? `${currentCareer}_${courseId}` : courseId;
      },

      setCourseState: (courseId, state, grade) => {
        const { getProgressKey } = get();
        const progressKey = getProgressKey(courseId);
      
        set((store) => ({
          progress: {
            ...store.progress,
            [progressKey]: {
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
        const { plan, progress, currentCareer, selectedOptatives, getProgressKey } = get();
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

        // Determinar cuántas optativas debe tener esta carrera
        let requiredOptatives = 0;
        switch (currentCareer) {
          case 'ls': requiredOptatives = 2; break; // Sistemas
          case 'is': requiredOptatives = 1; break; // Informática
          case 'se': requiredOptatives = 1; break; // Analista
          default: requiredOptatives = 0;
        }
        
        // Contar optativas seleccionadas para esta carrera
        const selectedOptativesForCareer = Object.keys(selectedOptatives)
          .filter(key => key.startsWith(`${currentCareer}_OPT-`))
          .map(key => selectedOptatives[key]);
        
        // Total de materias = obligatorias + optativas seleccionadas
        const totalCourses = mandatoryCourses.length + requiredOptatives;;
        
        // Contar finalizadas (obligatorias + optativas seleccionadas)
        const finishedMandatory = mandatoryCourses.filter(
          (course) => progress[getProgressKey(course.id)]?.state === "final"
        ).length;
        
        const finishedOptatives = selectedOptativesForCareer.filter(
          (optId) => progress[getProgressKey(optId)]?.state === "final"
        ).length;
        
        const finishedCourses = finishedMandatory + finishedOptatives;

        // Calcular promedio (obligatorias + optativas seleccionadas)
        const allCoursesIds = [
          ...mandatoryCourses.map(c => c.id),
          ...selectedOptativesForCareer
        ];
        
        const grades = allCoursesIds
          .map((id) => progress[getProgressKey(id)]?.grade)
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