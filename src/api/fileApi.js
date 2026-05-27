/**
 * fileApi.js — Dummy API service
 *
 * All functions mirror what a real REST API client would look like.
 * To switch to a real backend, replace the function bodies with
 * fetch() / axios calls to your server endpoints.
 *
 * Shape returned by every function:
 *   { data, error }   — one will always be null
 */

const STORAGE_KEY = 'uploaded_files';

/** Simulate network latency */
function delay(ms = 600) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Read the mock "database" from localStorage */
function readDb() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Write the mock "database" to localStorage */
function writeDb(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// ─── API methods ────────────────────────────────────────────────────────────

/**
 * GET /files
 * Returns all uploaded file records for the current session.
 */
export async function getFiles() {
  await delay(400);
  try {
    const data = readDb();
    return { data, error: null };
  } catch {
    return { data: null, error: 'Failed to fetch files.' };
  }
}

/**
 * POST /files/upload
 * Accepts an array of File objects, "uploads" them and returns their records.
 *
 * @param {File[]} files
 * @returns {{ data: FileRecord[], error: string|null }}
 *
 * Real API replacement:
 *   const form = new FormData();
 *   files.forEach(f => form.append('files', f));
 *   const res = await fetch('/api/files/upload', { method: 'POST', body: form });
 *   return res.json();
 */
export async function uploadFiles(files) {
  await delay(800);
  try {
    const existing = readDb();
    const existingNames = new Set(existing.map(f => f.name));

    const newRecords = files
      .filter(f => !existingNames.has(f.name))   // skip duplicates
      .map(f => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: f.name,
        size: f.size,
        uploadedAt: new Date().toISOString(),
      }));

    const updated = [...existing, ...newRecords];
    writeDb(updated);
    return { data: newRecords, error: null };
  } catch {
    return { data: null, error: 'Upload failed. Please try again.' };
  }
}

/**
 * DELETE /files/:id
 * Removes a file record by id.
 *
 * Real API replacement:
 *   const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
 *   return res.json();
 */
export async function deleteFile(id) {
  await delay(300);
  try {
    const updated = readDb().filter(f => f.id !== id);
    writeDb(updated);
    return { data: { id }, error: null };
  } catch {
    return { data: null, error: 'Failed to delete file.' };
  }
}

/**
 * DELETE /files
 * Clears all file records.
 */
export async function clearAllFiles() {
  await delay(300);
  try {
    writeDb([]);
    return { data: [], error: null };
  } catch {
    return { data: null, error: 'Failed to clear files.' };
  }
}
