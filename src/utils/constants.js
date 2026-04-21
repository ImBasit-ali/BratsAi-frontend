// API Base URL
const normalizeApiBaseUrl = (value) => {
  if (!value) return '';

  const trimmed = value.trim().replace(/\/$/, '');

  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (/^\/\//.test(trimmed)) {
    return `https:${trimmed}`;
  }

  // If deploy env var is set as plain host (without scheme), force https.
  if (/^[a-z0-9.-]+(?::\d+)?(?:\/.*)?$/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const DEFAULT_PROD_API_BASE_URL = 'https://brats-backend-production.up.railway.app';
const isRelativeApiUrl = (value) => {
  if (!value) return false;
  if (/^https?:\/\//i.test(value) || /^\/\//.test(value)) return false;
  return value.startsWith('/');
};
const isLocalhostApiUrl = (value) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value || '');
const safeApiBaseUrl = import.meta.env.DEV
  ? configuredApiBaseUrl
  : (isLocalhostApiUrl(configuredApiBaseUrl) || isRelativeApiUrl(configuredApiBaseUrl))
    ? DEFAULT_PROD_API_BASE_URL
    : (configuredApiBaseUrl || DEFAULT_PROD_API_BASE_URL);

export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.DEV
    ? ''
    : safeApiBaseUrl || ''
);

// Tumor Subregions
export const TUMOR_REGIONS = {
  ET: { label: 'Enhancing Tumor (ET)', color: '#FACC15', description: 'Active tumor with contrast enhancement' },
  NETC: { label: 'Non-Enhancing Tumor Core (NETC)', color: '#EF4444', description: 'Tumor core without enhancement' },
  SNFH: { label: 'Surrounding Non-enhancing FLAIR Hyperintensity (SNFH)', color: '#3B82F6', description: 'Peritumoral edema and infiltration' },
  RC: { label: 'Resection Cavity (RC)', color: '#10B981', description: 'Surgical cavity from previous resection' },
};

// MRI Modalities
export const MODALITIES = [
  { value: 't1', label: 'T1n' },
  { value: 't1ce', label: 'T1c ' },
  { value: 't2', label: 'T2w' },
  { value: 'flair', label: 'T2f' },
];

export const FILE_NAMING_GUIDES = {
  t1: 'BraTS-GLI-02073-100-t1n.nii',
  t1ce: 'BraTS-GLI-02073-100-t1c.nii',
  t2: 'BraTS-GLI-02073-100-t2w.nii',
  flair: 'BraTS-GLI-02073-100-t2f.nii',
};

export const getFileNamingGuide = (modality) => FILE_NAMING_GUIDES[modality] || 'patient_modality.nii.gz';

export const EXPECTED_MODALITIES = MODALITIES.map((item) => item.value);

export const inferModalityFromFilename = (filename) => {
  const lower = filename.toLowerCase();
  if (lower.includes('-t1c') || lower.includes('t1ce')) return 't1ce';
  if (lower.includes('-t1n') || (lower.includes('t1') && !lower.includes('t1c'))) return 't1';
  if (lower.includes('-t2f') || lower.includes('flair')) return 'flair';
  if (lower.includes('-t2w') || lower.includes('t2')) return 't2';
  return 't1';
};

export const getMissingModalities = (modalities) =>
  EXPECTED_MODALITIES.filter((modality) => !modalities.includes(modality));

// Processing Steps
export const PROCESSING_STEPS = [
  { key: 'preprocess', label: 'Preprocessing', icon: '⚙️' },
  { key: 'inference', label: 'Model Inference', icon: '🧠' },
  { key: 'postprocess', label: 'Post-processing', icon: '📊' },
  { key: 'done', label: 'Complete', icon: '✅' },
];

// Team Members
export const TEAM_MEMBERS = [
  {
    name: 'Mutyyaba Asghar',
    role: 'Computer Vision & Deep Learning Researcher',
    bio: 'M.Phil. in Computer Science and 4 years of experience in image processing, computer vision and Deep learning.',
    avatar: '/Mutyyba%20Asghar.jpg.jpeg',
    linkedin: 'https://www.linkedin.com/in/mutyyba-asghar/',
  },
  {
    name: 'Muhammad Wahaj Sajid',
    role: 'Computer Vision Researcher & Software Engineer',
    bio: 'Final-year computer science student skilled in medical imaging and native android mobile applications.',
    avatar: '/Profile-Picture.jpeg',
    linkedin:' https://www.linkedin.com/in/muhammad-wahaj-s-172134229/',
  },
  {
    name: 'Basit Ali',
    role: 'Computer Vision Researcher & Software Engineer',
    bio: 'Final-year computer science student skilled in medical imaging and Flutter, Django developer.',
    avatar: '/Basit%20Ali.jpeg',
    linkedin: 'https://www.linkedin.com/in/basit-ali-2902aa333/',
  },

];

// Model Highlights
export const MODEL_HIGHLIGHTS = [
  {
    title: 'State-of-the-Art U-Net',
    description: 'Modified 3D U-Net architecture optimized for multi-class brain tumor segmentation.',
    icon: '🏗️',
  },
  {
    title: 'BraTS 2024 Dataset',
    description: 'Trained on the latest Brain Tumor Segmentation Challenge dataset with expert annotations.',
    icon: '📦',
  },
  {
    title: 'Multi-Region Analysis',
    description: 'Segments 4 distinct tumor subregions including enhancing tumor, core, edema, and resection cavity.',
    icon: '🎯',
  },
  {
    title: 'Clinical Metrics',
    description: 'Provides Dice Score, sensitivity, and specificity for each segmented region.',
    icon: '📈',
  },
];
