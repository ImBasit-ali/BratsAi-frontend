import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const API_ROOT = API_BASE_URL
  ? (API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`)
  : '/api';

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ROOT}${normalizedPath}`;
};

const api = axios.create({
  headers: {
    'Accept': 'application/json',
  },
});

const PREVIEW_MODALITY_PRIORITY = ['t1', 't1ce', 't2', 'flair'];
const STACK_PREVIEW_TIMEOUT_MS = 300000;

const pickPreviewSourceFile = (files) => {
  if (!Array.isArray(files) || files.length === 0) return null;

  for (const modality of PREVIEW_MODALITY_PRIORITY) {
    const match = files.find((item) => item?.modality === modality && item?.file);
    if (match) return match.file;
  }

  return files.find((item) => item?.file)?.file || null;
};

const createLocalPreviewUrl = (files) => {
  const sourceFile = pickPreviewSourceFile(files);
  if (!sourceFile) {
    return null;
  }

  return URL.createObjectURL(sourceFile);
};

// Upload NIfTI files and start segmentation — returns job_id immediately
export const startSegmentation = async (files, settings) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  formData.append('regions', JSON.stringify(settings.regions));

  const response = await api.post(buildApiUrl('/segment/'), formData);

  return response.data;
};

// Stack uploaded files without starting model inference
export const stackInputs = async (files, options = {}) => {
  const { useBackendPreview = true } = options;

  if (!useBackendPreview) {
    const previewUrl = createLocalPreviewUrl(files);
    if (!previewUrl) {
      throw new Error('Unable to generate stacked preview from uploaded files.');
    }

    return {
      status: 'stacked_local',
      preview_url: previewUrl,
      filename: pickPreviewSourceFile(files)?.name || 'stacked_preview.nii.gz',
      mode: 'local-fast-preview',
    };
  }

  const formData = new FormData();
  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  try {
    const response = await api.post(buildApiUrl('/segment/stack/'), formData, {
      timeout: STACK_PREVIEW_TIMEOUT_MS,
    });

    if (response.data?.success === false) {
      throw new Error(response.data?.error || 'Stack preview service is unavailable');
    }

    if (response.data?.preview) {
      return {
        ...response.data,
        preview_url: `data:image/png;base64,${response.data.preview}`,
      };
    }

    return response.data;
  } catch (error) {
    const statusCode = error.response?.status;
    const isBackendUnavailable =
      !error.response ||
      (statusCode >= 500 && statusCode < 600) ||
      error.code === 'ERR_NETWORK';

    if (isBackendUnavailable) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Stack preview timed out. Please try again.');
      }

      const previewUrl = createLocalPreviewUrl(files);
      if (!previewUrl) {
        throw error;
      }

      return {
        status: 'stacked_local',
        preview_url: previewUrl,
        filename: files[0]?.name || 'stacked_preview.nii.gz',
        mode: 'local-fallback',
      };
    }

    throw error;
  }
};

// Get segmentation job status — includes stacked_url, mask_url when done
export const getSegmentationStatus = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/status/`));
  return response.data;
};

// Get segmentation result — includes stacked_url, mask_url, overlays
export const getSegmentationResult = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/result/`));
  return response.data;
};

// Download segmentation file as blob
export const downloadSegmentationFile = async (jobId) => {
  const response = await api.get(buildApiUrl(`/segment/${jobId}/download/`), {
    responseType: 'blob',
  });

  const contentDisposition = response.headers['content-disposition'] || '';
  const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i);
  const filename = filenameMatch
    ? decodeURIComponent(filenameMatch[1].replace(/\"/g, ''))
    : `segmentation_${jobId}.nii.gz`;

  return {
    blob: response.data,
    filename,
  };
};

// Download segmentation file
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
