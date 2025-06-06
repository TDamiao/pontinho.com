
// Calcular hash SHA-256 de um arquivo
export const calculateImageHash = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Validar arquivo de imagem
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 1024 * 1024; // 1MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Formato não suportado. Use JPEG, PNG ou WebP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Arquivo muito grande. Máximo 1MB.' };
  }

  return { valid: true };
};
