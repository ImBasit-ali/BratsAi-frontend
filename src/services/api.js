import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Upload NIfTI files and start segmentation
export const startSegmentation = async (files, settings) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  formData.append('regions', JSON.stringify(settings.regions));

  const response = await api.post('/api/segment/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Stack uploaded files without starting model inference
export const stackInputs = async (files) => {
  const formData = new FormData();

  files.forEach((fileObj) => {
    formData.append('files', fileObj.file);
    formData.append('modalities', fileObj.modality);
  });

  const response = await api.post('/api/segment/stack/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

// Get segmentation job status
export const getSegmentationStatus = async (jobId) => {
  const response = await api.get(`/api/segment/${jobId}/status/`);
  return response.data;
};

// Get segmentation result
export const getSegmentationResult = async (jobId) => {
  const response = await api.get(`/api/segment/${jobId}/result/`);
  return response.data;
};

// Download segmentation file as blob
export const downloadSegmentationFile = async (jobId) => {
  const response = await api.get(`/api/segment/${jobId}/download/`, {
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
  return `${API_BASE_URL}/api/segment/${jobId}/download/`;
};

export default api;
