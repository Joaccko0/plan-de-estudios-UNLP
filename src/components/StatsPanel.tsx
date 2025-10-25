import { usePlanStore } from "../store/usePlanStore";
import { useMemo } from "react";

export function StatsPanel() {
  const { progress, currentCareer, selectedOptatives, plan, getStats } = usePlanStore();

  const stats = useMemo(
    () => getStats(),
    [progress, currentCareer, selectedOptatives, plan, getStats]
  );

  return (
    <div className="stats-panel">
      <div className="stat-item">
        <div className="stat-value">{stats.finishedCourses}</div>
        <div className="stat-label">Materias Finalizadas</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.totalCourses}</div>
        <div className="stat-label">Total de Materias</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.averageGrade.toFixed(1)}</div>
        <div className="stat-label">Promedio</div>
      </div>
      <div className="stat-item">
        <div className="stat-value">{stats.progressPercentage.toFixed(1)}%</div>
        <div className="stat-label">Progreso</div>
      </div>
    </div>
  );
}