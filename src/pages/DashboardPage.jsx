import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import FileUpload from '../components/dashboard/FileUpload';
import FileList from '../components/dashboard/FileList';
import MRIViewer from '../components/dashboard/MRIViewer';
import ViewerControls from '../components/dashboard/ViewerControls';
import SegmentationStepper from '../components/dashboard/SegmentationStepper';
import ResultsPanel from '../components/dashboard/ResultsPanel';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import useSegmentation from '../hooks/useSegmentation';
import { stackInputs } from '../services/api';
import { getMissingModalities } from '../utils/constants';

const OVERLAY_MASKS = [
  { key: 'enhancing_tumor', label: 'Enhancing Tumor', color: '#FACC15', colormap: 'yellow' },
  { key: 'whole_tumor', label: 'Whole Tumor', color: '#3B82F6', colormap: 'blue' },
  { key: 'tumor_core', label: 'Tumor Core', color: '#EF4444', colormap: 'red' },
];

const DashboardPage = () => {
  // File management
  const [files, setFiles] = useState([]);
  const [uploadError, setUploadError] = useState(null);
  const [stackPreviewUrl, setStackPreviewUrl] = useState(null);
  const [isStacking, setIsStacking] = useState(false);
  const [isViewerUpdating, setIsViewerUpdating] = useState(false);
  const [viewerResetVersion, setViewerResetVersion] = useState(0);
  const viewerUpdateTimerRef = useRef(null);

  const revokeStackPreviewUrl = useCallback((url) => {
    if (typeof url === 'string' && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, []);

  // Viewer state
  const [viewerState, setViewerState] = useState({
    sliceX: 50,
    sliceY: 50,
    sliceZ: 50,
    zoom: 100,
    showOverlay: true,
    overlayOpacity: 70,
    selectedMasks: {
      enhancing_tumor: true,
      whole_tumor: true,
      tumor_core: true,
    },
  });

  // Segmentation hook
  const { jobId, status, progress, result, error, stackedUrl, maskUrl, runSegmentation, reset } = useSegmentation();

  const markViewerUpdating = useCallback(() => {
    setIsViewerUpdating(true);
    if (viewerUpdateTimerRef.current) {
      clearTimeout(viewerUpdateTimerRef.current);
    }
    // Debounce update completion so rapid slider drags still feel smooth.
    viewerUpdateTimerRef.current = setTimeout(() => {
      setIsViewerUpdating(false);
      viewerUpdateTimerRef.current = null;
    }, 80);
  }, []);

  useEffect(() => () => {
    if (viewerUpdateTimerRef.current) {
      clearTimeout(viewerUpdateTimerRef.current);
    }
  }, []);

  useEffect(() => () => {
    revokeStackPreviewUrl(stackPreviewUrl);
  }, [stackPreviewUrl, revokeStackPreviewUrl]);

  // File handlers
  const handleFilesAdded = useCallback((newFiles) => {
    setUploadError(null);
    revokeStackPreviewUrl(stackPreviewUrl);
    setStackPreviewUrl(null);
    reset();
    setFiles((prev) => {
      const existingModalities = new Set(prev.map((file) => file.modality));
      const incomingModalities = new Set();

      for (const file of newFiles) {
        if (existingModalities.has(file.modality) || incomingModalities.has(file.modality)) {
          setUploadError(`File for ${file.modality.toUpperCase()} is already uploaded.`);
          return prev;
        }
        incomingModalities.add(file.modality);
      }

      const merged = [...prev, ...newFiles];
      if (merged.length > 4) {
        setUploadError('Upload up to 4 unique modalities only.');
        return prev;
      }

      return merged;
    });
  }, [revokeStackPreviewUrl, reset, stackPreviewUrl]);

  const handleFileRemove = useCallback((fileId) => {
    revokeStackPreviewUrl(stackPreviewUrl);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setUploadError(null);
    setStackPreviewUrl(null);
    reset();
  }, [revokeStackPreviewUrl, reset, stackPreviewUrl]);

  const handleModalityChange = useCallback((fileId, modality) => {
    setUploadError(null);
    revokeStackPreviewUrl(stackPreviewUrl);
    setStackPreviewUrl(null);
    reset();
    setFiles((prev) => {
      const duplicate = prev.find((file) => file.modality === modality && file.id !== fileId);
      if (duplicate) {
        setUploadError(`File for ${modality.toUpperCase()} is already uploaded.`);
        return prev;
      }

      return prev.map((file) => (file.id === fileId ? { ...file, modality } : file));
    });
  }, [revokeStackPreviewUrl, reset, stackPreviewUrl]);

  const handleFileDuplicate = useCallback((fileId) => {
    setUploadError(null);
    revokeStackPreviewUrl(stackPreviewUrl);
    setStackPreviewUrl(null);
    reset();
    setFiles((prev) => {
      const sourceFile = prev.find((file) => file.id === fileId);
      if (!sourceFile) return prev;

      const missingModalities = getMissingModalities(prev.map((file) => file.modality));
      if (missingModalities.length === 0) {
        setUploadError('All four modalities are already uploaded.');
        return prev;
      }

      const targetModality = missingModalities[0];
      if (prev.some((file) => file.modality === targetModality)) {
        setUploadError(`File for ${targetModality.toUpperCase()} is already uploaded.`);
        return prev;
      }

      const duplicatedFile = {
        ...sourceFile,
        id: `${sourceFile.id}-${targetModality}-${Date.now()}`,
        modality: targetModality,
        name: `${sourceFile.name} (${targetModality.toUpperCase()} copy)`,
      };

      return [...prev, duplicatedFile];
    });
  }, [revokeStackPreviewUrl, reset, stackPreviewUrl]);

  const handleStackFiles = async () => {
    if (files.length === 0) return;

    const currentModalities = files.map((file) => file.modality);
    const missingModalities = getMissingModalities(currentModalities);

    if (files.length === 2 || files.length === 3) {
      setUploadError(
        `Four modalities are required to stack. Missing: ${missingModalities.map((modality) => modality.toUpperCase()).join(', ')}.`
      );
      return;
    }

    if (![1, 4].includes(files.length)) {
      setUploadError('Upload either 1 file to duplicate or all 4 modalities once each.');
      return;
    }

    try {
      setIsStacking(true);
      // Call backend to perform full stacking and get both preview + stacked_url
      const response = await stackInputs(files);
      
      if (response?.stacked_url) {
        // Use the full stacked NIfTI volume URL for the viewer to show all slices
        setStackPreviewUrl(response.stacked_url);
      } else if (response?.preview_url) {
        // Fallback to preview if stacked_url is not available
        setStackPreviewUrl(response.preview_url);
      }
      setUploadError(null);
    } catch (error) {
      setUploadError(error.response?.data?.error || error.message || 'Failed to stack inputs.');
    } finally {
      setIsStacking(false);
    }
  };

  const handleViewerLoadError = useCallback((message, error) => {
    if (stackPreviewUrl) {
      revokeStackPreviewUrl(stackPreviewUrl);
    }
    setStackPreviewUrl(null);
    setUploadError(message || error?.message || 'Failed to load MRI volume. Try stacking again.');
  }, [revokeStackPreviewUrl, stackPreviewUrl]);

  // Run segmentation
  const handleRunSegmentation = async () => {
    if (files.length === 0) return;

    if (!stackPreviewUrl) {
      setUploadError('Stack images first, then run segmentation.');
      return;
    }

    if (![1, 4].includes(files.length)) {
      setUploadError('Upload either exactly 4 modality files or exactly 1 stacked file.');
      return;
    }

    if (files.length === 4) {
      const required = ['t1', 't1ce', 't2', 'flair'];
      const selected = files.map((f) => f.modality);
      const hasAllUnique = required.every((m) => selected.includes(m)) && new Set(selected).size === 4;
      if (!hasAllUnique) {
        setUploadError('For 4 files, assign modalities exactly once: T1, T1ce, T2, and FLAIR.');
        return;
      }
    }

    const uploadFiles = files.length === 1
      ? [{ ...files[0], modality: 'stacked' }]
      : files;

    try {
      await runSegmentation(uploadFiles, {
        regions: { ET: true, NETC: true, SNFH: true, RC: true },
      });
      setUploadError(null);
    } catch {
      // Error handled in hook
    }
  };

  // Reset
  const handleReset = () => {
    revokeStackPreviewUrl(stackPreviewUrl);
    reset();
    setFiles([]);
    setUploadError(null);
    setStackPreviewUrl(null);
    setViewerResetVersion((prev) => prev + 1);
  };

  const isProcessing = ['uploading', 'pending', 'processing'].includes(status);
  const isDone = status === 'done';
  const isError = status === 'error';
  const showStepper = isProcessing;

  const workflowStep = (() => {
    if (status === 'done') return 'done';
    if (status === 'uploading' || status === 'pending') return 'preprocess';

    if (status === 'processing') {
      if (typeof progress === 'number') {
        if (progress < 35) return 'preprocess';
        if (progress < 80) return 'inference';
        return 'postprocess';
      }
      return 'inference';
    }

    return null;
  })();

  const workflowStatusLabel = (() => {
    if (workflowStep === 'preprocess') return 'Preprocessing';
    if (workflowStep === 'inference') return 'Model Inference';
    if (workflowStep === 'postprocess') return 'Post-processing';
    if (workflowStep === 'done') return 'Complete';
    return status;
  })();
  const canRunSegmentation = Boolean(stackPreviewUrl);
  const isSingleStacked = files.length === 1;
  const canStack = files.length === 1 || files.length === 4;
  const hasStackedPreview = Boolean(stackPreviewUrl);
  const showUploadPanel = !hasStackedPreview;
  const showViewerPanel = hasStackedPreview;
  const hasModelResult = isDone && Boolean(result?.overlays);
  const viewerVolume = stackedUrl || result?.model_input_url || stackPreviewUrl || null;
  const isImagePreview = Boolean(viewerVolume && viewerVolume.startsWith('data:image/'));
  const selectedOverlayVolumes = useMemo(() => {
    if (!hasModelResult || !viewerState.showOverlay) {
      return [];
    }

    return OVERLAY_MASKS
      .filter((mask) => viewerState.selectedMasks[mask.key] && result?.overlays?.[mask.key])
      .map((mask) => ({
        url: result.overlays[mask.key],
        colormap: mask.colormap,
      }));
  }, [hasModelResult, viewerState.showOverlay, viewerState.selectedMasks, result]);
  const maskControls = OVERLAY_MASKS.map((mask) => ({
    ...mask,
    selected: Boolean(viewerState.selectedMasks[mask.key]),
  }));
  const allMasksSelected = maskControls.every((mask) => mask.selected);
  const showOverlayControls = hasModelResult;
  const stackButtonLabel = files.length === 1 ? 'Duplicate & Stack' : 'Stack Images';
  const stackButtonHint = files.length === 2 || files.length === 3
    ? `Missing: ${getMissingModalities(files.map((file) => file.modality)).map((modality) => modality.toUpperCase()).join(', ')}. Use Duplicate on a file or upload the missing modality.`
    : stackPreviewUrl
      ? 'Images are stacked and ready for segmentation.'
      : 'Stack the uploaded inputs without running the model.';
  const showStackButton = !hasStackedPreview && !isProcessing && !isDone;
  const showRunButton = hasStackedPreview && !isProcessing && !isDone;

  const baseVolume = useMemo(() => (
    viewerVolume && !isImagePreview ? [{ url: viewerVolume }] : []
  ), [viewerVolume, isImagePreview]);
  const viewerBusyLabel = isStacking
    ? 'Stacking input files...'
    : isProcessing
      ? 'Preparing segmentation view...'
      : 'Loading MRI volume...';
  const overlayUrlKey = useMemo(
    () => selectedOverlayVolumes.map((overlay) => overlay.url).join('|'),
    [selectedOverlayVolumes]
  );
  const viewerInstanceKey = `${viewerResetVersion}:${viewerVolume || 'empty'}:${overlayUrlKey}`;

  useEffect(() => {
    if (!isDone) return;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Segmentation is completed. Are you sure you want to start over?';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDone]);

  return (
    <PageTransition>
      <div className="pt-20 pb-12 min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-primary">Segmentation Arena</h1>
            <p className="text-textColor mt-2">
              Upload MRI scans, configure settings, and run AI-powered tumor segmentation
            </p>
          </motion.div>

          {/* Two-panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT PANEL */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-4 space-y-6"
            >
              {showUploadPanel && (
                <Card hover={false}>
                  <h3 className="text-base font-bold text-primary mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Upload Files
                  </h3>

                  <FileUpload onFilesAdded={handleFilesAdded} />

                  <div className="mt-4">
                    <FileList
                      files={files}
                      onFileRemove={handleFileRemove}
                      onFileDuplicate={handleFileDuplicate}
                      onModalityChange={handleModalityChange}
                      isSingleStacked={isSingleStacked}
                    />
                  </div>

                  {uploadError && (
                    <p className="mt-3 text-sm text-red-500">{uploadError}</p>
                  )}

                  <div className="mt-4 space-y-3">
                    {showStackButton && (
                      <>
                        <Button
                          variant="secondary"
                          size="md"
                          className="w-full"
                          disabled={!canStack || isStacking}
                          loading={isStacking}
                          onClick={handleStackFiles}
                        >
                          {isStacking ? 'Stacking Images...' : stackButtonLabel}
                        </Button>
                        <p className="text-xs text-textColor/60">
                          {isStacking ? 'Please wait while inputs are being stacked.' : stackButtonHint}
                        </p>
                      </>
                    )}

                    {hasStackedPreview && (
                      <Badge color="green">Stacked</Badge>
                    )}

                  </div>
                </Card>
              )}

              {showViewerPanel && (
                <ViewerControls
                  sliceX={viewerState.sliceX}
                  sliceY={viewerState.sliceY}
                  sliceZ={viewerState.sliceZ}
                  zoom={viewerState.zoom}
                  showOverlay={viewerState.showOverlay}
                  overlayOpacity={viewerState.overlayOpacity}
                  showOverlayControls={showOverlayControls}
                  overlayMasks={maskControls}
                  allMasksSelected={allMasksSelected}
                  isUpdating={isViewerUpdating}
                  onSliceChange={(axis, value) =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      return {
                        ...prev,
                        [`slice${axis.toUpperCase()}`]: value,
                      };
                    })
                  }
                  onZoomChange={(value) =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      return { ...prev, zoom: value };
                    })
                  }
                  onOverlayToggle={() =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      return {
                        ...prev,
                        showOverlay: !prev.showOverlay,
                      };
                    })
                  }
                  onOverlayOpacityChange={(value) =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      return {
                        ...prev,
                        overlayOpacity: value,
                      };
                    })
                  }
                  onMaskToggle={(maskKey) =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      return {
                        ...prev,
                        selectedMasks: {
                          ...prev.selectedMasks,
                          [maskKey]: !prev.selectedMasks[maskKey],
                        },
                      };
                    })
                  }
                  onSelectAllMasks={() =>
                    setViewerState((prev) => {
                      markViewerUpdating();
                      const shouldSelectAll = !Object.values(prev.selectedMasks).every(Boolean);
                      return {
                        ...prev,
                        selectedMasks: {
                          enhancing_tumor: shouldSelectAll,
                          whole_tumor: shouldSelectAll,
                          tumor_core: shouldSelectAll,
                        },
                      };
                    })
                  }
                />
              )}

              <div className="space-y-3">
                {showRunButton && (
                  <Button
                    variant="teal"
                    size="lg"
                    className="w-full"
                    disabled={!canRunSegmentation}
                    onClick={handleRunSegmentation}
                    icon="🧠"
                  >
                    Run Segmentation
                  </Button>
                )}

                {isProcessing && (
                  <Button
                    variant="teal"
                    size="lg"
                    className="w-full"
                    disabled
                  >
                    Segmentation Running
                  </Button>
                )}

                {isDone && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={handleReset}
                    icon="🔄"
                  >
                    New Segmentation
                  </Button>
                )}

                {isError && (
                  <Card hover={false} className="!bg-red-50 !border-red-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-600 mb-1">Segmentation Failed</p>
                        <p className="text-xs text-red-500">{error}</p>
                        <div className="flex gap-2 mt-3">
                          <Button variant="danger" size="sm" onClick={handleRunSegmentation}>
                            Retry
                          </Button>
                          <Button variant="ghost" size="sm" onClick={handleReset}>
                            Reset
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {showStepper && (
                <Card hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-primary">
                      {isDone ? 'Completed Steps' : 'Processing Status'}
                    </h3>
                    <Badge color={isDone ? 'green' : 'teal'}>{workflowStatusLabel}</Badge>
                  </div>
                  <SegmentationStepper currentStep={workflowStep} status={status} />
                  {typeof progress === 'number' && !isDone && (
                    <p className="mt-3 text-xs text-textColor/70">Progress: {Math.round(progress)}%</p>
                  )}
                </Card>
              )}

              {isDone && result && (
                <ResultsPanel result={result} jobId={jobId} />
              )}
            </motion.div>

            {/* RIGHT PANEL */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* MRI Viewer */}
              <Card hover={false} padding="p-2" className="!bg-[#0D1726]">
                <div className="flex items-center justify-between px-2 pt-2 pb-3">
                  <h3 className="text-sm font-semibold text-white/80">Stacked Viewer</h3>
                  {stackPreviewUrl && !isDone && <Badge color="teal">Stacked</Badge>}
                  {isDone && <Badge color="green">Complete</Badge>}
                </div>
                <div className="h-[500px] lg:h-[600px]">
                  {isImagePreview ? (
                    <div className="w-full h-full flex items-center justify-center bg-[#07142A] rounded-xl border border-white/10 p-3">
                      <img
                        src={viewerVolume}
                        alt="Stack preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    </div>
                  ) : (
                    <MRIViewer
                      key={viewerInstanceKey}
                      volumes={baseVolume}
                      overlayVolumes={selectedOverlayVolumes}
                      overlayOpacity={viewerState.overlayOpacity / 100}
                      sliceX={viewerState.sliceX}
                      sliceY={viewerState.sliceY}
                      sliceZ={viewerState.sliceZ}
                      zoom={viewerState.zoom}
                      isUpdating={isViewerUpdating}
                      isBusy={isStacking || isProcessing}
                      busyLabel={viewerBusyLabel}
                      onLoadError={handleViewerLoadError}
                    />
                  )}
                </div>
              </Card>

              {/* {!hasStackedPreview && (
                <Card hover={false}>
                  <p className="text-sm text-textColor/70">
                    Upload and stack files from the left panel to enable full viewer controls and segmentation overlays.
                  </p>
                </Card>
              )} */}
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default DashboardPage;
