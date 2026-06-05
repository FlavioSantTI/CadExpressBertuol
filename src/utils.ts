/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Sanitizes and formats CPF in real-time as user types (format: 000.000.000-00)
 */
export function formatCPF(value: string): string {
  // Extract digits only
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  }
  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

/**
 * Sanitizes and formats Telefone in real-time as user types (format: (00) 00000-0000)
 */
export function formatTelefone(value: string): string {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Validates whether email format is standard client-side
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validates CPF check digits (standard Brazilian CPF formula)
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  
  // Exclude known invalid repetitive ones
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
}

/**
 * Get current ISO date in YYYY-MM-DD format (used to set max attribute)
 */
export function getTodayString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Nicely formats date strings to Brazilian localized date format
 */
export function formatToBRLDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return '-';
  }
}

/**
 * Formats full timestamp of created_at to readable PT-BR
 */
export function formatTimestampToBRL(isoStr: string | null | undefined): string {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '-';
    // Brazilian format with hour
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return '-';
  }
}

/**
 * Splits a full address string like "Avenida Paulista, 1000 - Bela Vista, São Paulo/SP" 
 * into logradouro/bairro (rua), city (cidade), and state (uf).
 */
export function parseEndereco(endereco: string | null | undefined): { rua: string; cidade: string; uf: string } {
  if (!endereco) return { rua: '', cidade: '', uf: '' };
  
  // Check for the Slash format: City/UF at the very end
  const lastSlashIdx = endereco.lastIndexOf('/');
  if (lastSlashIdx !== -1 && lastSlashIdx > 3 && endereco.length - lastSlashIdx <= 4) {
    const uf = endereco.slice(lastSlashIdx + 1).trim().toUpperCase();
    const rest = endereco.slice(0, lastSlashIdx);
    const lastCommaIdx = rest.lastIndexOf(',');
    if (lastCommaIdx !== -1) {
      const cidade = rest.slice(lastCommaIdx + 1).trim();
      const rua = rest.slice(0, lastCommaIdx).trim();
      return { rua, cidade, uf };
    }
  }
  return { rua: endereco, cidade: '', uf: '' };
}
