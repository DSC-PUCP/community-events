/**
 * Utilidades para generar rangos de fechas comunes
 * Retorna objetos { start: string, end: string } en formato ISO (YYYY-MM-DD)
 */

/**
 * Obtiene el rango de fechas para "Esta semana" (Lunes a Domingo)
 */
export function getThisWeek(): { start: string; end: string } {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

  // Calcular cuántos días restar para llegar al lunes
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/**
 * Obtiene el rango de fechas para "Este mes"
 */
export function getThisMonth(): { start: string; end: string } {
  const today = new Date();

  // Primer día del mes
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  // Último día del mes
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0],
  };
}

export function getToday(): { start: string; end: string } {
  return futureDateString(0);
}

export function futureDateString(daysFromToday: number): {
  start: string;
  end: string;
} {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysFromToday);
  return {
    start: today.toISOString().split('T')[0],
    end: futureDate.toISOString().split('T')[0],
  };
}

/**
 * Compara si dos rangos de fechas son iguales
 * Útil para determinar qué preset está activo
 */
export function areDateRangesEqual(
  range1: { start: string; end: string },
  range2: { start: string; end: string },
): boolean {
  return range1.start === range2.start && range1.end === range2.end;
}
