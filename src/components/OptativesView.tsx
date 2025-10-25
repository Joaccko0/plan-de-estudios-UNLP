import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { usePlanStore } from "../store/usePlanStore";
import { canEnroll, getMissingPrereqs } from "../lib/elegibility";
import { Modal } from "./Modal";
import type { CourseProgress } from "../types/plan";

interface OptativesViewProps {
  onBack: () => void;
  filterSemester?: number | null;
  filterYear?: number | null;
  selectionMode?: boolean;
  onSelect?: (id: string) => void;
  selectedOptatives?: string[];
  slotIndex?: number;
}

export function OptativesView({ 
  onBack, 
  filterSemester = null, 
  filterYear = null,
  selectionMode = false,
  onSelect,
  selectedOptatives = [],
  slotIndex = 0
}: OptativesViewProps) {
  const { plan, progress, currentCareer } = usePlanStore();
  const [selectedOptativeForInfo, setSelectedOptativeForInfo] = useState<string | null>(null);
  
  const optatives = plan?.optatives || [];
  
  // Filtrar optativas si es necesario
  const filteredOptatives = useMemo(() => {
    return optatives.filter(opt => {
      if (filterSemester !== null && opt.semester !== filterSemester) return false;
      if (filterYear !== null && opt.year !== filterYear) return false;
      return true;
    });
  }, [optatives, filterSemester, filterYear]);

  // Crear progreso sin prefijo para la lógica de elegibilidad
  const careerProgress = useMemo(() => {
    if (!currentCareer) return {};
    const result: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        result[courseId] = progress[key];
      }
    });
    return result;
  }, [progress, currentCareer]);
  
  const selectedOptative = selectedOptativeForInfo 
    ? optatives.find(opt => opt.id === selectedOptativeForInfo)
    : null;

  return (
    <>
      <div className="optatives-view">
        <div className="optatives-header">
          <button className="back-button" onClick={onBack}>← Volver</button>
          <h2>
            {selectionMode 
              ? `Selecciona una optativa para el Slot ${slotIndex + 1}` 
              : "Materias Optativas Disponibles"}
          </h2>
          {selectionMode && (
            <p className="optatives-description">
              Ya has seleccionado {selectedOptatives.length} optativa(s). 
              Elige una que no esté ya seleccionada.
            </p>
          )}
        </div>
        
        <div className="optatives-grid">
          {filteredOptatives.map(opt => {
            const isEligible = canEnroll(opt, careerProgress, plan?.rules.canEnrollIf.allOf.length ? "approved" : "approvedOrRegular");
            const missing = getMissingPrereqs(opt, careerProgress, false);
            const isAlreadySelected = selectedOptatives.includes(opt.id);
            
            return (
              <div 
                key={opt.id} 
                className={clsx("optative-card", { 
                  "selected": isAlreadySelected,
                  "eligible": isEligible && !isAlreadySelected
                })}
              >
                <div className="optative-header">
                  <h3 className="optative-name">{opt.name}</h3>
                  <span className="optative-id">{opt.id}</span>
                </div>
                
                <div className="optative-info">
                  <div className="optative-semester-info">
                    {opt.year}° año - {opt.semester === 1 ? "1er" : "2do"} semestre
                  </div>
                  
                  {isAlreadySelected && (
                    <div className="optative-selected-badge">
                      ✓ Seleccionada
                    </div>
                  )}
                </div>
                
                <div className="optative-actions">
                  <button 
                    className="optative-info-btn"
                    onClick={() => setSelectedOptativeForInfo(opt.id)}
                  >
                    📋 Info
                  </button>
                  
                  {selectionMode && (
                    <button 
                      className={clsx("optative-select-btn", { "disabled": !isEligible || isAlreadySelected })}
                      onClick={() => isEligible && !isAlreadySelected && onSelect && onSelect(opt.id)}
                      disabled={!isEligible || isAlreadySelected}
                    >
                      {isAlreadySelected ? "Ya seleccionada" : isEligible ? "Seleccionar" : "No elegible"}
                    </button>
                  )}
                </div>
                
                {isAlreadySelected && (
                  <div className="optative-already-selected">
                    ✓ Esta optativa ya está seleccionada en otro slot
                  </div>
                )}
                
                {!isEligible && missing.length > 0 && (
                  <div className="optative-missing">
                    <strong>Falta aprobar:</strong> {missing.join(", ")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedOptative && (
        <Modal isOpen={true} onClose={() => setSelectedOptativeForInfo(null)}>
          <div className="modal-header">
            <h2>{selectedOptative.name} ({selectedOptative.id})</h2>
          </div>
          <div className="modal-body">
            <div className="optative-details">
              <div className="optative-detail-item">
                <span className="detail-label">Año:</span>
                <span className="detail-value">{selectedOptative.year}° año</span>
              </div>
              <div className="optative-detail-item">
                <span className="detail-label">Semestre:</span>
                <span className="detail-value">{selectedOptative.semester === 1 ? "1er semestre" : "2do semestre"}</span>
              </div>
            </div>
            
            <div className="prereqs-section">
              <h3>📚 Correlativas para cursar:</h3>
              {selectedOptative.prereqs?.allOf && selectedOptative.prereqs.allOf.length > 0 ? (
                <ul className="prereqs-list">
                  {selectedOptative.prereqs.allOf.map(prereqId => {
                    const prereqCourse = plan?.courses.find(c => c.id === prereqId);
                    const isCompleted = careerProgress[prereqId]?.state === "approved" || careerProgress[prereqId]?.state === "final";
                    return (
                      <li key={prereqId} className={clsx("prereq-item", { completed: isCompleted })}>
                        {isCompleted ? "✅" : "❌"} {prereqCourse?.name || prereqId}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="no-prereqs">Sin correlativas</p>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
