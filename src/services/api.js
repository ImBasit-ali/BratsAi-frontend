import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// ── API root ──────────────────────────────────────────────────────────────────
const API_ROOT = API_BASE_URL
  ? (API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`)
  : '/api';

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${normalizedPath}`;
};

// ── Session ID ────────────────────────────────────────────────────────────────
// Generated once per app load, persisted in module scope.
// Sent as X-Session-ID on every request so the backend can scope
// per-user Redis cache keys without requiring login.
const _generateSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const SESSION_ID = _generateSessionId();

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  headers: {
    Accept: 'application/json',
  },
});

// Request interceptor — attach X-Session-ID on every outgoing request
api.interceptors.request.use((config) => {
  config.headers['X-Session-ID'] = SESSION_ID;
  return config;
});

// Response interceptor — surface error detail from DRF JSON responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail =
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      error?.message ||
      'An unexpected error occurred';

    // Attach a human-readable message for components to display
    error.displayMessage = detail;
    return Promise.reject(error);
  },
);

// ── Internal helpers ──────────────────────────────────────────────────────────
const PREVIEW_MODALITY_PRIORITY = ['t1', 't1ce', 't2', 'flair'];
const STACK_PREVIEW_TIMEOUT_MS = 300000; // 5 minutes

const pickPreviewSourceFile = (files) => {
  if (!Array.isArray(files) || files.length === 0) return null;

  for (const modality of PREVIEW_MODALITY_PRIORITY) {
    const match = files.find((item) => item?.modality === modality && item?.file);
    if (match) return match.file;
  }

  return files.find((item) => item?.file)?.file || null;
};

const createLocalPreviewVolumes = (files) => {
  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const orderedFiles = [...files].sort((left, right) => {
    const leftIndex = PREVIEW_MODALITY_PRIORITY.indexOf(left?.modality);
    const rightIndex = PREVIEW_MODALITY_PRIORITY.indexOf(right?.modality);

    return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
  });

  return orderedFiles
    .filter((item) => item?.file)
    .map((item) => ({
      url: URL.createObjectURL(item.file),
      modality: item.modality,
      name: item.file.name || item.name || item.modality,
    }));
};

// ── Public API functions ──────────────────────────────────────────────────────

/**
 * Upload NIfTI files and start a segmentation job.
 * Returns job_id immediately — processing runs in a background thread.
 */
export const startSegmentation = async (files, settings) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  formData.append('regions', JSON.stringify(settings.regions));

  // Sync mode forces the response to wait until inference completes.
  // Useful when the Railway worker thread isn't available or for testing.
  const syncMode = import.meta.env.VITE_SYNC_SEGMENTATION === 'true';
  if (syncMode) {
    formData.append('sync', 'true');
  }

  const response = await api.post(buildApiUrl('/segment/'), formData, {
    timeout: syncMode ? 600000 : 30000, // 10 min sync | 30 s async
  });

  return response.data;
};

/** GET /api/health/ — backend + model + Redis status */
export const getWorkerHealth = async () => {
  const response = await api.get(buildApiUrl('/health/'));
  return response.data;
};

/**
 * View individual uploaded NIfTI files WITHOUT stacking (preview only).
 * Sends files to the backend which returns base64 PNG previews.
 */
export const viewIndividualUploads = async (files) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  const response = await api.post(buildApiUrl('/segment/view-uploads/'), formData, {
    timeout: STACK_PREVIEW_TIMEOUT_MS,
  });

  if (response.data?.success === false) {
    throw new Error(response.data?.error || 'Failed to load individual files');
  }

  return response.data;
};

/**
 * Local-only stacking preview — runs entirely in the browser, no network call.
 * Fast but shows individual file object URLs (not a true stacked volume).
 */
export const stackInputsLocal = async (files) => {
  const previewVolumes = createLocalPreviewVolumes(files);
  if (!previewVolumes.length) {
    throw new Error('Unable to generate stacked preview from uploaded files.');
  }

  return {
    status: 'stacked_local',
    preview_volumes: previewVolumes,
    filename: pickPreviewSourceFile(files)?.name || 'stacked_preview.nii.gz',
    mode: 'local-run',
  };
};

/**
 * Live stacking preview — sends all files to the backend for a full NIfTI stack.
 * Returns a base64 PNG preview of the middle axial slice.
 */
export const stackInputsLive = async (files) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  const response = await api.post(buildApiUrl('/segment/stack/'), formData, {
    timeout: STACK_PREVIEW_TIMEOUT_MS,
  });

  if (response.data?.success === false) {
    throw new Error(response.data?.error || 'Stack preview service is unavailable');
  }

  const previewVolumes = createLocalPreviewVolumes(files);

  if (response.data?.preview) {
    return {
      ...response.data,
      preview_url: `data:image/png;base64,${response.data.preview}`,
      preview_volumes: previewVolumes,
      mode: 'live-run',
    };
  }

  return {
    ...response.data,
    preview_volumes: response.data?.stacked_url ? [] : previewVolumes,
    mode: 'live-run',
  };
};

const shouldFallbackToLocal = (error) => {
  const statusCode = error?.response?.status;
  return (
    !error?.response ||
    (statusCode >= 500 && statusCode < 600) ||
    error?.code === 'ERR_NETWORK' ||
    error?.code === 'ECONNABORTED'
  );
};

/**
 * Smart stacking wrapper:
 * - 'auto' (default): tries live backend, falls back to local on network/server error
 * - 'local': always local
 * - 'live': always backend (throws on failure)
 */
export const stackInputs = async (files, options = {}) => {
  const { runMode = 'auto' } = options;

  if (runMode === 'local') {
    return stackInputsLocal(files);
  }

  if (runMode === 'live') {
    return stackInputsLive(files);
  }

  try {
    return await stackInputsLive(files);
  } catch (error) {
    if (shouldFallbackToLocal(error)) {
      const localResult = await stackInputsLocal(files);
      return {
        ...localResult,
        mode: 'local-auto-fallback',
      };
    }
    throw error;
  }
};

/** GET /api/segment/{id}/status/ — poll job progress */
export const getSegmentationStatus = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/status/`));
  return response.data;
};

/** GET /api/segment/{id}/result/ — fetch completed job results */
export const getSegmentationResult = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/result/`));
  return response.data;
};

/** GET /api/segment/{id}/download/ — download NIfTI mask as blob */
export const downloadSegmentationFile = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/download/`), {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|\")?([^\";\n]+)/i);
  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1].replace(/"/g, ''))
    : `segmentation_${jobId}.nii.gz`;

  return {
    blob: response.data,
    filename,
  };
};

/** Build download URL for a job (direct link) */
export const getDownloadUrl = (jobId) => {
  return buildApiUrl(`/segment/${jobId}/download/`);
};

/**
 * Resolve a file URL — handles both local /media/ paths and
 * external Supabase URLs transparently.
 */
export const resolveFileUrl = (url) => {
  if (!url) return null;

  // Already absolute
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative path — prepend API base if production
  if (API_BASE_URL) {
    const base = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  return url;
};

export default api;
