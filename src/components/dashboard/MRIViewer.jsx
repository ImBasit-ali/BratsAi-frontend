import { useEffect, useRef, useState } from 'react';
import { Niivue } from '@niivue/niivue';

const MASK_COLORMAP_KEYS = {
  yellow: 'maskSolidYellow',
  blue: 'maskSolidBlue',
  red: 'maskSolidRed',
};

const createSolidMaskColormap = (rgb) => ({
  R: [0, rgb[0]],
  G: [0, rgb[1]],
  B: [0, rgb[2]],
  A: [0, 255],
  I: [0, 255],
});

const registerMaskColormaps = (nv) => {
  nv.addColormap(MASK_COLORMAP_KEYS.yellow, createSolidMaskColormap([250, 204, 21]));
  nv.addColormap(MASK_COLORMAP_KEYS.blue, createSolidMaskColormap([59, 130, 246]));
  nv.addColormap(MASK_COLORMAP_KEYS.red, createSolidMaskColormap([239, 68, 68]));
};

const resolveOverlayColormap = (colormap) => MASK_COLORMAP_KEYS[colormap] || MASK_COLORMAP_KEYS.red;

const MRIViewer = ({
  volumes = [],
  overlayVolumes = [],
  overlayOpacity = 0.5,
  sliceX = 50,
  sliceY = 50,
  sliceZ = 50,
  zoom = 100,
  isUpdating = false,
  isBusy = false,
  busyLabel = 'Loading MRI volume...',
  onLoadError,
}) => {
  const canvasRef = useRef(null);
  const nvRef = useRef(null);
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [viewMode, setViewMode] = useState('multi'); // multi, axial, sagittal, coronal
  const volumeSignature = [
    ...volumes.map((vol) => vol?.url || ''),
    ...overlayVolumes.map((overlay) => overlay?.url || ''),
  ].join('|');
  const hasOverlayVolumes = overlayVolumes.some((overlay) => Boolean(overlay?.url));

  useEffect(() => {
    if (!canvasRef.current) return;

    const nv = new Niivue({
      backColor: [0.05, 0.09, 0.15, 1],
      show3Dcrosshair: true,
      crosshairColor: [0, 0.67, 0.59, 0.5],
      isRadiologicalConvention: false,
      isNearestInterpolation: true,
      multiplanarShowRender: 0,
      multiplanarForceRender: false,
    });

    nv.attachToCanvas(canvasRef.current);
    registerMaskColormaps(nv);
    nv.setAdditiveBlend(false);
    nv.setInterpolation(true);
    nvRef.current = nv;

    // Set default view
    nv.setSliceType(nv.sliceTypeMultiplanar);

    return () => {
      nvRef.current = null;
    };
  }, []);

  // Load volumes only when source URLs change.
  useEffect(() => {
    if (!nvRef.current) return;

    let isActive = true;

    if (volumes.length === 0) {
      setIsLoadingVolumes(false);
      setLoadError(null);
      return () => {
        isActive = false;
      };
    }

    const loadVolumes = async () => {
      setIsLoadingVolumes(true);
      setLoadError(null);
      try {
        const volumeList = volumes.map((v, i) => ({
          url: v.url,
          colormap: i === 0 ? 'gray' : 'actc',
          opacity: i === 0 ? 1 : overlayOpacity,
          cal_min: i === 0 ? 1 : undefined,
          isTransparentBelowCalMin: i === 0 ? true : undefined,
          ignoreZeroVoxels: i === 0 ? true : undefined,
        }));

        overlayVolumes.forEach((overlay) => {
          if (overlay?.url) {
            volumeList.push({
              url: overlay.url,
              colormap: resolveOverlayColormap(overlay.colormap),
              opacity: Math.min(Math.max(overlayOpacity, 0), 0.65),
              cal_min: 1,
              cal_max: 1,
              isTransparentBelowCalMin: true,
              alphaThreshold: true,
              ignoreZeroVoxels: true,
              visible: true,
            });
          }
        });

        await nvRef.current.loadVolumes(volumeList);
        if (isActive) {
          setIsLoadingVolumes(false);
        }
      } catch (err) {
        if (isActive) {
          setIsLoadingVolumes(false);
          const message = 'Failed to load MRI volume. Try stacking again.';
          setLoadError(message);
          onLoadError?.(message, err);
        }
        console.error('Error loading volumes:', err);
      }
    };

    loadVolumes();

    return () => {
      isActive = false;
    };
  }, [volumeSignature]);

  // Update view mode
  useEffect(() => {
    if (!nvRef.current) return;
    const nv = nvRef.current;
    switch (viewMode) {
      case 'axial': nv.setSliceType(nv.sliceTypeAxial); break;
      case 'sagittal': nv.setSliceType(nv.sliceTypeSagittal); break;
      case 'coronal': nv.setSliceType(nv.sliceTypeCoronal); break;
      default: nv.setSliceType(nv.sliceTypeMultiplanar); break;
    }
  }, [viewMode]);

  // Update crosshair/slice position from controls without reloading volumes.
  useEffect(() => {
    const nv = nvRef.current;
    if (!nv || !Array.isArray(nv.volumes) || nv.volumes.length === 0) return;

    const pos = [sliceX / 100, sliceY / 100, sliceZ / 100];
    try {
      if (typeof nv.setCrosshairPos === 'function') {
        nv.setCrosshairPos(pos);
      } else if (nv.scene) {
        nv.scene.crosshairPos = pos;
      }

      if (typeof nv.drawScene === 'function') {
        nv.drawScene();
      }
    } catch (err) {
      console.error('Error updating slice position:', err);
    }
  }, [sliceX, sliceY, sliceZ]);

  // Update overlay opacity without re-fetching volumes.
  useEffect(() => {
    const nv = nvRef.current;
    if (!nv || !Array.isArray(nv.volumes) || nv.volumes.length === 0) return;

    nv.volumes.forEach((vol, index) => {
      vol.opacity = index === 0 ? 1 : Math.min(Math.max(overlayOpacity, 0), 0.65);
      if (index > 0) {
        vol.cal_min = 1;
        vol.cal_max = 1;
      }
    });

    if (typeof nv.updateGLVolume === 'function') {
      nv.updateGLVolume();
    }
    if (typeof nv.drawScene === 'function') {
      nv.drawScene();
    }
  }, [overlayOpacity]);

  const viewModes = [
    { key: 'multi', label: 'Multi' },
    { key: 'axial', label: 'Axial' },
    { key: 'sagittal', label: 'Sagittal' },
    { key: 'coronal', label: 'Coronal' },
  ];

  const showBusyOverlay = isBusy || isLoadingVolumes;
  const hasVolumes = volumes.length > 0;
  const showEmptyState = !hasVolumes && !showBusyOverlay;
  const statusText = loadError
    ? 'Load Failed'
    : showBusyOverlay
      ? 'Loading'
      : hasVolumes
        ? 'MRI Loaded'
        : '';

  return (
    <div className="relative w-full h-full min-h-[400px] bg-[#0D1726] rounded-2xl overflow-hidden border border-white/10">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_15%,rgba(20,184,166,0.22),transparent_42%),radial-gradient(circle_at_85%_90%,rgba(56,189,248,0.14),transparent_38%)]" />

      {/* Canvas */}
      <div
        className="w-full h-full origin-center transition-transform duration-75 ease-out"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Professional top status strip */}
      {statusText && (
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-black/35 backdrop-blur-sm border border-white/10 text-[11px] font-semibold text-white/80">
          {statusText}
        </div>
      )}

      {/* View mode buttons */}
      <div className="absolute top-4 left-4 flex gap-1 bg-black/40 backdrop-blur-sm rounded-xl p-1">
        {viewModes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              viewMode === mode.key
                ? 'bg-teal text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Fast update overlay while controls are changing */}
      {isUpdating && hasVolumes && !showBusyOverlay && (
        <div className="absolute inset-0 pointer-events-none bg-[#0D1726]/25 backdrop-blur-[1px]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10 overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-teal/20 via-teal to-cyan-300 animate-[pulse_0.35s_ease-in-out_infinite]" />
          </div>
          <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/45 text-[11px] text-white/80 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Rendering updates
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {showBusyOverlay && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0D1726]/70 backdrop-blur-sm text-white/80">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-teal animate-spin" />
          <p className="text-sm font-medium">{busyLabel}</p>
          <p className="text-xs text-white/60">Please wait while the viewer refreshes.</p>
        </div>
      )}

      {loadError && (
        <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {loadError}
        </div>
      )}

      {/* Empty state */}
      {showEmptyState && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30">
          <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-sm font-medium">No MRI loaded</p>
          <p className="text-xs mt-1 text-white/20">Upload files and run segmentation to view results</p>
        </div>
      )}
    </div>
  );
};

export default MRIViewer;
