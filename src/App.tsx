import { useState, useEffect } from "react";
import { usePlanStore } from "./store/usePlanStore";
import { CareerSelector } from "./components/CareerSelector";
import { CourseCard } from "./components/CourseCard";
import { StatsPanel } from "./components/StatsPanel";
import { OptativesView } from "./components/OptativesView";
import "./App.css";

function App() {
  const { plan, currentCareer, selectedOptatives, selectOptative } = usePlanStore();
  const [showOptatives, setShowOptatives] = useState(false);
  const [selectingOptativeFor, setSelectingOptativeFor] = useState<{ year: number; semester: number } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Agrupar cursos por año y semestre
  const groupedCourses = plan?.courses.reduce((acc, course) => {
    const year = course.year || 0;
    const semester = course.semester || 0;
    const key = `${year}-${semester}`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(course);
    return acc;
  }, {} as Record<string, typeof plan.courses>);

  // Ordenar las keys para mostrar en orden
  const sortedKeys = groupedCourses 
    ? Object.keys(groupedCourses).sort((a, b) => {
        const [yearA, semA] = a.split('-').map(Number);
        const [yearB, semB] = b.split('-').map(Number);
        if (yearA !== yearB) return yearA - yearB;
        return semA - semB;
      })
    : [];

  const getSectionTitle = (key: string) => {
    const [year, semester] = key.split('-').map(Number);
    if (year === 0) return "📋 Materias de Nivelación";
    return `📚 ${year}° Año - ${semester === 1 ? "Primer" : "Segundo"} Semestre`;
  };

  // Configuración de optativas por carrera
  const getOptativeSlotsConfig = () => {
    if (!currentCareer) return { totalSlots: 0, yearSemester: [] };
    
    switch (currentCareer) {
      case 'ls': // Sistemas
        return { 
          totalSlots: 2,
          yearSemester: [
            { year: 4, semester: 2 },
            { year: 5, semester: 1 }
          ]
        };
      case 'is': // Informática
        return { 
          totalSlots: 1,
          yearSemester: [{ year: 4, semester: 2 }]
        };
      case 'se': // Analista
        return { 
          totalSlots: 1,
          yearSemester: [{ year: 4, semester: 2 }]
        };
      default:
        return { totalSlots: 0, yearSemester: [] };
    }
  };

  const optativeConfig = getOptativeSlotsConfig();

  // Obtener optativas seleccionadas para esta carrera
  const getSelectedOptativesForCareer = () => {
    if (!currentCareer) return [];
    return Object.keys(selectedOptatives)
      .filter(key => key.startsWith(`${currentCareer}_SLOT-`))
      .map(key => selectedOptatives[key]);
  };

  // Manejar la selección de una optativa
  const handleOptativeSelected = (optativeId: string, slotIndex: number) => {
    if (!currentCareer) return;
    
    const slotId = `${currentCareer}_SLOT-${slotIndex}`;
    selectOptative(slotId, optativeId);
    setSelectingOptativeFor(null);
  };

  // Renderizar placeholder u optativa seleccionada para un slot
  const renderOptativeSlot = (slotIndex: number) => {
    if (!currentCareer) return null;
    
    const slotId = `${currentCareer}_SLOT-${slotIndex}`;
    const selectedOptativeId = selectedOptatives[slotId];
    
    if (selectedOptativeId) {
      const optative = plan?.optatives?.find(opt => opt.id === selectedOptativeId);
      if (optative) {
        return (
          <div key={`slot-${slotIndex}`} className="optative-container">
            <CourseCard 
              id={optative.id} 
              name={optative.name} 
              semester={optative.semester} 
              year={optative.year} 
            />
            <button 
              className="change-optative-btn"
              onClick={() => setSelectingOptativeFor({ year: 0, semester: slotIndex })}
            >
              Cambiar optativa (Slot {slotIndex + 1})
            </button>
          </div>
        );
      }
    }
    
    return (
      <div key={`placeholder-${slotIndex}`} className="optative-placeholder-slot">
        <div className="optative-slot-info">
          <h3>Materia Optativa - Slot {slotIndex + 1}</h3>
          <p>Selecciona una optativa disponible del plan</p>
          <small>Has seleccionado {getSelectedOptativesForCareer().length} de {optativeConfig.totalSlots} optativas</small>
        </div>
        <button 
          className="select-optative-btn"
          onClick={() => setSelectingOptativeFor({ year: 0, semester: slotIndex })}
        >
          Seleccionar optativa
        </button>
      </div>
    );
  };

  // Mostrar la vista de optativas con el slot actual
  if (selectingOptativeFor && currentCareer) {
    const slotIndex = selectingOptativeFor.semester;
    
    return (
      <div className="app">
        <OptativesView 
          onBack={() => setSelectingOptativeFor(null)}
          filterSemester={null}
          filterYear={null}
          selectionMode={true}
          onSelect={(optId) => handleOptativeSelected(optId, slotIndex)}
          selectedOptatives={getSelectedOptativesForCareer()}
          slotIndex={slotIndex}
        />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 Plan de Estudios Dinámico</h1>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <CareerSelector />
      </header>

      {!currentCareer ? (
        <div className="welcome-message">
          <h2>👋 Bienvenido!</h2>
          <p>Seleccioná una carrera para comenzar a trackear tu progreso académico.</p>
        </div>
      ) : !plan ? (
        <div className="loading-message">
          <p>⏳ Cargando plan de estudios...</p>
        </div>
      ) : (
        <>
          <StatsPanel />

          <main className="courses-container">
            {sortedKeys.map(key => (
              <section key={key} className="year-section">
                <h2 className="section-title">{getSectionTitle(key)}</h2>
                <div className="courses-grid">
                  {groupedCourses?.[key]?.map(course => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      name={course.name}
                      semester={course.semester}
                      year={course.year}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Sección de Optativas al final */}
            {optativeConfig.totalSlots > 0 && (
              <section className="year-section">
                <h2 className="section-title">📚 Materias Optativas ({optativeConfig.totalSlots})</h2>
                <div className="courses-grid">
                  {Array.from({ length: optativeConfig.totalSlots }).map((_, index) => 
                    renderOptativeSlot(index)
                  )}
                </div>
              </section>
            )}
          </main>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button 
              className="view-optatives-btn"
              onClick={() => setShowOptatives(true)}
            >
              📚 Ver todas las Optativas Disponibles
            </button>
          </div>
        </>
      )}

      <footer className="app-footer">
        <p>💾 Tu progreso se guarda automáticamente en tu navegador</p>
        <p>🚀 Versión 1.0.0 - Desarrollado localmente</p>
      </footer>
    </div>
  );
}

export default App;