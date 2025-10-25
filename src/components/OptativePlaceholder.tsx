interface OptativePlaceholderProps {
  year: number;
  semester: number;
  onSelectClick: () => void;
}

export function OptativePlaceholder({ year, semester, onSelectClick }: OptativePlaceholderProps) {
  return (
    <div className="course-card optative-placeholder">
      <div className="course-header">
        <div className="course-title-section">
          <div className="semester-info">{year}° Año - {semester === 1 ? "1er" : "2do"} Semestre</div>
          <h3 className="course-title">
            <span className="course-name">Materia Optativa</span>
          </h3>
          <div className="optative-description">
            Seleccioná una materia optativa para este lugar en el plan
          </div>
        </div>
      </div>
      <div className="optative-actions">
        <button 
          className="select-optative-btn"
          onClick={onSelectClick}
        >
          Seleccionar optativa
        </button>
      </div>
    </div>
  );
}
