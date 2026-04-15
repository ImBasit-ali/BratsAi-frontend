// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Tumor Subregions
export const TUMOR_REGIONS = {
  ET: { label: 'Enhancing Tumor (ET)', color: '#FACC15', description: 'Active tumor with contrast enhancement' },
  NETC: { label: 'Non-Enhancing Tumor Core (NETC)', color: '#EF4444', description: 'Tumor core without enhancement' },
  SNFH: { label: 'Surrounding Non-enhancing FLAIR Hyperintensity (SNFH)', color: '#3B82F6', description: 'Peritumoral edema and infiltration' },
  RC: { label: 'Resection Cavity (RC)', color: '#10B981', description: 'Surgical cavity from previous resection' },
};

// MRI Modalities
export const MODALITIES = [
  { value: 't1', label: 'T1-weighted' },
  { value: 't1ce', label: 'T1-CE ' },
  { value: 't2', label: 'T2-weighted' },
  { value: 'flair', label: 'FLAIR' },
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
    name: 'Dr. Sarah Chen',
    role: 'Lead AI Researcher',
    bio: 'PhD in Medical Imaging, specializing in deep learning for brain tumor segmentation with 10+ years of experience.',
    avatar: null,
  },
  {
    name: 'Dr. Ahmed Hassan',
    role: 'Neuroradiologist',
    bio: 'Board-certified neuroradiologist providing clinical validation and medical expertise for the segmentation models.',
    avatar: null,
  },
  {
    name: 'Maria Rodriguez',
    role: 'ML Engineer',
    bio: 'Expert in PyTorch and medical image processing pipelines, responsible for model training and optimization.',
    avatar: null,
  },
  // {
  //   name: 'James O\'Brien',
  //   role: 'Full-Stack Developer',
  //   bio: 'Builds the web platform connecting AI models to clinical workflows with seamless user experiences.',
  //   avatar: null,
  // },
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
