import Slider from '../ui/Slider';

const ViewerControls = ({
  sliceX = 50,
  sliceY = 50,
  sliceZ = 50,
  zoom = 100,
  showOverlay = true,
  overlayOpacity = 70,
  showOverlayControls = true,
  overlayMasks = [],
  allMasksSelected = false,
  isUpdating = false,
  onSliceChange,
  onZoomChange,
  onOverlayToggle,
  onOverlayOpacityChange,
  onMaskToggle,
  onSelectAllMasks,
}) => {
  return (
    <div className="space-y-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-primary/70 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          Viewer Controls
        </h4>
        {isUpdating && (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
            Updating
          </div>
        )}
      </div>

      {/* Slice sliders */}
      <Slider
        label="Axial Slice"
        value={sliceX}
        onChange={(v) => onSliceChange?.('x', v)}
        min={0}
        max={100}
        unit=""
      />
      <Slider
        label="Sagittal Slice"
        value={sliceY}
        onChange={(v) => onSliceChange?.('y', v)}
        min={0}
        max={100}
        unit=""
      />
      <Slider
        label="Coronal Slice"
        value={sliceZ}
        onChange={(v) => onSliceChange?.('z', v)}
        min={0}
        max={100}
        unit=""
      />

      {/* Zoom */}
      <Slider
        label="Zoom"
        value={zoom}
        onChange={onZoomChange}
        min={50}
        max={300}
        unit="%"
      />

      {showOverlayControls && (
        <>
          {/* Overlay toggle */}
          <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface transition-colors">
            <span className="text-sm font-medium text-primary/80">Show Overlay</span>
            <button
              onClick={onOverlayToggle}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                showOverlay ? 'bg-teal' : 'bg-primary/20'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  showOverlay ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary/80">Overlay Masks</span>
              {overlayMasks.length > 0 && (
                <button
                  type="button"
                  className="px-2 py-1 text-xs font-semibold rounded-lg bg-teal/10 text-teal hover:bg-teal/20 transition-colors"
                  onClick={onSelectAllMasks}
                >
                  {allMasksSelected ? 'All Selected' : 'Select All'}
                </button>
              )}
            </div>

            {overlayMasks.length > 0 ? (
              <div className="space-y-1.5">
                {overlayMasks.map((mask) => (
                  <label
                    key={mask.key}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                      mask.selected ? 'border-teal/40 bg-teal/5' : 'border-primary/10 bg-surface/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: mask.color }}
                      />
                      <span className="text-sm font-medium text-primary/80">{mask.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={mask.selected}
                      onChange={() => onMaskToggle?.(mask.key)}
                      className="w-4 h-4 rounded border-primary/20 text-teal focus:ring-teal/30"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-primary/10 bg-surface/40 px-3 py-2 text-xs text-textColor/60">
                Stack the images first, then run segmentation to reveal overlay masks.
              </p>
            )}
          </div>

          <Slider
            label="Overlay Opacity"
            value={overlayOpacity}
            onChange={onOverlayOpacityChange}
            min={0}
            max={100}
            step={5}
          />
        </>
      )}
    </div>
  );
};

export default ViewerControls;
