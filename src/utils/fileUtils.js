/**
 * fileUtils.js
 * Pure helper functions for file validation and formatting.
 * No React dependencies — safe to reuse anywhere.
 */

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ACCEPTED_EXTENSIONS = /\.(xlsx|xls)$/i;
export const ACCEPTED_MIME = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel',                                           // .xls
];

/**
 * Returns true if the file is an Excel file (checked by both name and MIME type).
 * @param {File} file
 */
export function isExcelFile(file) {
  return ACCEPTED_EXTENSIONS.test(file.name) || ACCEPTED_MIME.includes(file.type);
}

/**
 * Validates an array of incoming File objects against all rules.
 * Returns categorised results so the UI can give precise feedback.
 *
 * @param {File[]} incoming   - files the user just picked / dropped
 * @param {File[]} existing   - files already in the staged list
 * @returns {{
 *   valid: File[],
 *   rejected: { file: File, reason: string }[]
 * }}
 */
export function validateFiles(incoming, existing) {
  const existingNames = new Set(existing.map(f => f.name));
  const valid = [];
  const rejected = [];

  for (const file of incoming) {
    if (!isExcelFile(file)) {
      rejected.push({ file, reason: 'Not an Excel file (.xlsx / .xls)' });
    } else if (file.size > MAX_FILE_SIZE_BYTES) {
      rejected.push({ file, reason: `Exceeds ${MAX_FILE_SIZE_MB} MB limit` });
    } else if (existingNames.has(file.name)) {
      rejected.push({ file, reason: 'Duplicate — already added' });
    } else {
      valid.push(file);
      existingNames.add(file.name); // prevent duplicates within the same batch
    }
  }

  return { valid, rejected };
}

/**
 * Checks whether adding `count` more files would exceed MAX_FILES.
 * @param {number} current  - number of files already staged
 * @param {number} count    - number of files about to be added
 * @returns {{ allowed: File[], overflow: number }}
 */
export function applyFileLimit(files, currentCount) {
  const remaining = MAX_FILES - currentCount;
  return {
    allowed: files.slice(0, remaining),
    overflow: Math.max(0, files.length - remaining),
  };
}

/**
 * Human-readable file size string.
 * @param {number} bytes
 */
export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Formats an ISO date string to a readable locale string.
 * @param {string} iso
 */
export function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
