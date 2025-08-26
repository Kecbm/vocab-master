/**
 * Utilitários para manipulação de datas no formato simplificado
 */

/**
 * Obtém a data atual no formato YYYY-MM-DD
 * @returns string no formato "2025-08-21"
 */
export const getCurrentDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Verifica se uma data é hoje
 * @param date string no formato "YYYY-MM-DD"
 * @returns boolean
 */
export const isToday = (date?: string): boolean => {
  if (!date) return false;
  return date === getCurrentDate();
};

/**
 * Formata uma data para exibição amigável
 * @param date string no formato "YYYY-MM-DD"
 * @returns string formatada como "21 de agosto de 2025"
 */
export const formatDateForDisplay = (date?: string): string => {
  if (!date) return '';
  
  const dateObj = new Date(date + 'T00:00:00');
  return dateObj.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Calcula quantos dias se passaram desde uma data
 * @param date string no formato "YYYY-MM-DD"
 * @returns number de dias
 */
export const daysSince = (date?: string): number => {
  if (!date) return 0;
  
  const today = new Date();
  const targetDate = new Date(date + 'T00:00:00');
  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
