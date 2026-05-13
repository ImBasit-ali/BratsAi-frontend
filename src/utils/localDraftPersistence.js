const MANIFEST_KEY = 'brats:local-draft-manifest';
const IDB_NAME = 'brats-local-drafts';
const IDB_STORE = 'fileBuffers';
const IDB_VERSION = 1;

const openDb = () =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });

/**
 * Small JSON manifest in `localStorage` (names, modalities, job id).
 * Raw NIfTI bytes live in IndexedDB — they exceed `localStorage` quota.
 * @param {string} jobId
 * @param {Array<{ file: File, modality: string }>} rows
 */
export async function persistLocalDraft(jobId, rows) {
  const manifest = {
    v: 1,
    jobId,
    updatedAt: Date.now(),
    files: rows.map((r) => ({
      modality: r.modality,
      name: r.file?.name ?? '',
      size: r.file?.size ?? 0,
    })),
  };
  try {
    localStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
  } catch {
    // Quota or private mode — still keep session state in memory
  }

  const buffers = await Promise.all(
    rows.map((r) => (r.file ? r.file.arrayBuffer() : Promise.resolve(null))),
  );

  const db = await openDb();
  try {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    buffers.forEach((buf, i) => {
      if (buf) store.put(buf, `${jobId}:${i}`);
    });
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export function clearLocalDraftPersistence() {
  try {
    localStorage.removeItem(MANIFEST_KEY);
  } catch {
    // ignore
  }

  const req = indexedDB.deleteDatabase(IDB_NAME);
  return new Promise((resolve) => {
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
}
