import { useState, useEffect } from "react";
import { usePlanStore } from "../store/usePlanStore";
import type { Plan } from "../types/plan";

interface Career {
  id: string;
  name: string;
  file: string;
}

const AVAILABLE_CAREERS: Career[] = [
  { id: "ls", name: "Licenciatura en Sistemas", file: "/careers/sistemas.json" },
  { id: "is", name: "Licenciatura en Informatica", file: "/careers/informatica.json" },
  { id: "se", name: "Analista Programador", file: "/careers/analista.json" },
];

export function CareerSelector() {
  const { currentCareer, setCurrentCareer, setPlan, plan } = usePlanStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentCareer && !plan) {
      handleCareerChange(currentCareer);
    }
  }, [currentCareer, plan]);

  const handleCareerChange = async (careerId: string) => {
    const career = AVAILABLE_CAREERS.find(c => c.id === careerId);
    if (!career) return;

    setIsLoading(true);
    try {
      const response = await fetch(career.file);
      const planData: Plan = await response.json();
      console.log("📚 Plan cargado:", planData); // DEBUG
      console.log("📋 Reglas:", planData.rules); // DEBUG
      console.log("📖 Cursos:", planData.courses?.length); // DEBUG
      setPlan(planData);
      setCurrentCareer(careerId);
    } catch (error) {
      console.error("❌ Error loading career:", error);
      alert("Error al cargar la carrera. Verifica que el archivo exista.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="career-selector">
      <label htmlFor="career-select">🎓 Seleccionar Carrera:</label>
      <select
        id="career-select"
        value={currentCareer || ""}
        onChange={(e) => handleCareerChange(e.target.value)}
        disabled={isLoading}
        className="career-select"
      >
        <option value="">-- Seleccionar --</option>
        {AVAILABLE_CAREERS.map(career => (
          <option key={career.id} value={career.id}>
            {career.name}
          </option>
        ))}
      </select>
      {isLoading && <span className="loading-indicator">⏳ Cargando...</span>}
    </div>
  );
}