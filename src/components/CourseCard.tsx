import { useMemo, useState } from "react";
import { clsx } from "clsx";
import { usePlanStore } from "../store/usePlanStore";
import type { CourseProgress } from "../types/plan";
import { canEnroll, canTakeFinal, getMissingPrereqs } from "../lib/elegibility";
import { Badge } from "./Badge";
import { Modal } from "./Modal";

interface CourseCardProps {
  id: string;
  name: string;
  semester?: number;
  year?: number;
}

export function CourseCard({ id, name, semester, year }: CourseCardProps) {
  const { plan, progress, setCourseState, currentCareer } = usePlanStore();

  // Use the correct progress key with career prefix
  const progressKey = currentCareer ? `${currentCareer}_${id}` : id;
  const courseProgress = progress[progressKey] || { state: "pending" as const };

  const [showModal, setShowModal] = useState(false);
  const [gradeInput, setGradeInput] = useState(courseProgress.grade?.toString() || "");
  const [showValidationError, setShowValidationError] = useState(false);
  const [isEnteringGrade, setIsEnteringGrade] = useState(false);

  const course = plan?.courses.find(c => c.id === id) || 
    plan?.optatives?.find(c => c.id === id);

  const enrollable = useMemo(() => {
    if (!plan || !course || !currentCareer) return false;
    // Create a progress map with prefixed keys for this career
    const careerProgress: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        careerProgress[courseId] = progress[key];
      }
    });
    return canEnroll(course, careerProgress, plan.rules.canEnrollIf.allOf.length > 0 ? "approved" : "approvedOrRegular");
  }, [plan, progress, course, currentCareer]);

  const finable = useMemo(() => {
    if (!plan || !course || !currentCareer) return false;
    const careerProgress: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        careerProgress[courseId] = progress[key];
      }
    });
    return canTakeFinal(id, careerProgress, plan.rules.canTakeFinalIf.requireFinal || false, course);
  }, [plan, progress, id, course, currentCareer]);

  const missingForEnroll = useMemo(() => {
    if (!course || !currentCareer) return [];
    const careerProgress: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        careerProgress[courseId] = progress[key];
      }
    });
    return getMissingPrereqs(course, careerProgress, false);
  }, [course, progress, currentCareer]);

  const missingForFinal = useMemo(() => {
    if (!course || !currentCareer) return [];
    const careerProgress: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        careerProgress[courseId] = progress[key];
      }
    });
    return getMissingPrereqs(course, careerProgress, true);
  }, [course, progress, currentCareer]);

  const getStatusBadge = () => {
    if (courseProgress.state === "final") {
      return <Badge className="badge-completed">✅ Finalizada {courseProgress.grade ? `(${courseProgress.grade})` : ""}</Badge>;
    }
    if (courseProgress.state === "approved" && finable) {
      return <Badge className="badge-can-final">🎯 Puede Rendir</Badge>;
    }
    if (courseProgress.state === "approved" && !finable) {
      return <Badge className="badge-enrollable">📚 Aprobada</Badge>;
    }
    if (courseProgress.state === "enrolled") {
      return <Badge className="badge-enrollable">📖 Cursando</Badge>;
    }
    if (enrollable) {
      return <Badge className="badge-enrollable">🚀 Puede Cursar</Badge>;
    }
    return <Badge className="badge-blocked">🔒 Bloqueada</Badge>;
  };

  const handleStateChange = (newState: string) => {
    if (!canChangeToState(newState)) {
      setShowValidationError(true);
      setTimeout(() => setShowValidationError(false), 2000);
      return;
    }

    if (newState === "final") {
      setIsEnteringGrade(true);
      setGradeInput(courseProgress.grade?.toString() || "");
      setShowModal(true);
    } else {
      // Pass the course ID without prefix - the store adds it
      setCourseState(id, newState as any, courseProgress.grade);
    }
  };

  const canChangeToState = (newState: string): boolean => {
    if (!course || !currentCareer) return false;

    const careerProgress: Record<string, CourseProgress> = {};
    Object.keys(progress).forEach(key => {
      if (key.startsWith(`${currentCareer}_`)) {
        const courseId = key.replace(`${currentCareer}_`, '');
        careerProgress[courseId] = progress[key];
      }
    });

    switch (newState) {
      case "pending":
        return true;
      
      case "enrolled":
        return enrollable;
      
      case "approved":
        return courseProgress.state === "enrolled" || 
               courseProgress.state === "approved" || 
               courseProgress.state === "final" ||
               (courseProgress.state === "pending" && enrollable);
      
      case "final":
        const canTakeFinalDirect = course && plan ? canTakeFinal(id, careerProgress, plan.rules.canTakeFinalIf.requireFinal || false, course) : false;
        return (courseProgress.state === "approved" && finable) ||
               courseProgress.state === "final" ||
               (courseProgress.state === "pending" && canTakeFinalDirect) ||
               (courseProgress.state === "enrolled" && canTakeFinalDirect);
      
      default:
        return false;
    }
  };

  const handleGradeSubmit = () => {
    const grade = parseFloat(gradeInput);
    if (grade >= 1 && grade <= 10) {
      // Pass the course ID without prefix - the store adds it
      setCourseState(id, "final", grade);
      setShowModal(false);
      setGradeInput("");
      setIsEnteringGrade(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setGradeInput("");
    setIsEnteringGrade(false);
  };

  const getSemesterInfo = () => {
    if (year === 0) return "📋 Nivelación";
    if (!year || !semester) return "";
    return `${year}° Año - ${semester === 1 ? "1er" : "2do"} Semestre`;
  };

  return (
    <>
      <div className={clsx("course-card", courseProgress.state)}>
        <div className="course-header">
          <div className="course-title-section">
            <div className="semester-info">{getSemesterInfo()}</div>
            <h3 className="course-title">
              <span className="course-name">{name}</span>
              <span className="course-id">{id}</span>
            </h3>
          </div>
          <div className="course-controls">
            <button 
              className="prereqs-button"
              onClick={() => {
                setIsEnteringGrade(false);
                setShowModal(true);
              }}
              title="Ver correlativas"
            >
              📋 Info
            </button>
            <select
              className="course-select"
              value={courseProgress.state}
              onChange={e => handleStateChange(e.target.value)}
            >
              <option value="pending">🔄 Pendiente</option>
              <option 
                value="enrolled" 
                disabled={!canChangeToState("enrolled")}
              >
                📖 Cursando {!enrollable && courseProgress.state !== "enrolled" ? "(🔒 Bloqueada)" : ""}
              </option>
              <option 
                value="approved"
                disabled={!canChangeToState("approved")}
              >
                📚 Aprobada
              </option>
              <option 
                value="final"
                disabled={!canChangeToState("final")}
              >
                ✅ Final Aprobado {!finable && courseProgress.state !== "final" ? "(🔒 Bloqueada)" : ""}
              </option>
            </select>
          </div>
        </div>
        <div className="badges">
          {getStatusBadge()}
          {showValidationError && (
            <div className="validation-error">
              🚫 No podés cambiar a este estado. Revisá las correlativas.
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={handleModalClose}>
        <div className="modal-header">
          <h2>{name} ({id})</h2>
        </div>
        <div className="modal-body">
          {isEnteringGrade ? (
            <div className="grade-input-section">
              <h3>{courseProgress.grade ? "Editar nota del final:" : "Ingresá la nota del final:"}</h3>
              <div className="grade-input-container">
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="grade-input"
                  placeholder="Nota (1-10)"
                  autoFocus
                />
                <button 
                  onClick={handleGradeSubmit} 
                  className="grade-submit"
                  disabled={!gradeInput || parseFloat(gradeInput) < 1 || parseFloat(gradeInput) > 10}
                >
                  {courseProgress.grade ? "Actualizar Nota" : "Guardar Nota"}
                </button>
                <button 
                  onClick={handleModalClose} 
                  className="grade-cancel"
                >
                  Cancelar
                </button>
              </div>
              {gradeInput && (parseFloat(gradeInput) < 1 || parseFloat(gradeInput) > 10) && (
                <p className="grade-error">La nota debe estar entre 1 y 10</p>
              )}
            </div>
          ) : (
            <>
              {courseProgress.state === "final" && courseProgress.grade && (
                <div className="current-grade-section">
                  <h3>📊 Nota actual: {courseProgress.grade}</h3>
                  <button 
                    onClick={() => {
                      setGradeInput(courseProgress.grade?.toString() || "");
                      setIsEnteringGrade(true);
                    }}
                    className="edit-grade-button"
                  >
                    ✏️ Editar Nota
                  </button>
                </div>
              )}
              
              <div className="prereqs-section">
                <h3>📚 Correlativas para cursar:</h3>
                {course?.prereqs?.allOf && course.prereqs.allOf.length > 0 ? (
                  <ul className="prereqs-list">
                    {course.prereqs.allOf.map(prereqId => {
                      const prereqCourse = plan?.courses.find(c => c.id === prereqId);
                      const prereqKey = currentCareer ? `${currentCareer}_${prereqId}` : prereqId;
                      const isCompleted = progress[prereqKey]?.state === "approved" || progress[prereqKey]?.state === "final";
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

              <div className="prereqs-section">
                <h3>🎯 Correlativas para rendir final:</h3>
                {course?.prereqs?.allOf && course.prereqs.allOf.length > 0 ? (
                  <ul className="prereqs-list">
                    {course.prereqs.allOf.map(prereqId => {
                      const prereqCourse = plan?.courses.find(c => c.id === prereqId);
                      const prereqKey = currentCareer ? `${currentCareer}_${prereqId}` : prereqId;
                      const isCompleted = progress[prereqKey]?.state === "final";
                      return (
                        <li key={prereqId} className={clsx("prereq-item", { completed: isCompleted })}>
                          {isCompleted ? "✅" : "❌"} {prereqCourse?.name || prereqId} (Final aprobado)
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="no-prereqs">Sin correlativas</p>
                )}
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}