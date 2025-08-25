export function formatName(name?: string | null): string {
  if (!name) {
    return '';
  }
  
  // Divide o nome em palavras, removendo espaços extras
  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) {
    return '';
  }
  
  // Se houver apenas uma palavra, pega as duas primeiras letras dela
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Pega a primeira letra do primeiro nome
  const firstInitial = words[0][0];
  // Pega a primeira letra do último nome
  const lastInitial = words[words.length - 1][0];
  
  return `${firstInitial}${lastInitial}`.toUpperCase();
}