import { TUMOR_REGIONS } from '../../utils/constants';

const SettingsPanel = ({ settings, onSettingsChange }) => {
  const handleRegionToggle = (regionKey) => {
    const newRegions = { ...settings.regions };
    newRegions[regionKey] = !newRegions[regionKey];
    onSettingsChange({ ...settings, regions: newRegions });
  };

  return (
    <div className="space-y-6">
      {/* Subregion Checkboxes */}
      <div>
        <h4 className="text-sm font-semibold text-primary/70 mb-3">Tumor Subregions</h4>
        <div className="space-y-2">
          {Object.entries(TUMOR_REGIONS).map(([key, region]) => (
            <label
              key={key}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface cursor-pointer transition-colors group"
            >
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.regions[key]}
                  onChange={() => handleRegionToggle(key)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded-md border-2 border-primary/20 peer-checked:border-transparent transition-all"
                  style={{ backgroundColor: settings.regions[key] ? region.color : 'transparent' }}
                >
                  {settings.regions[key] && (
                    <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary/80 group-hover:text-primary">{key}</span>
                <span className="text-xs text-textColor/50 hidden sm:inline">{region.label.split('(')[0].trim()}</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
