import { motion, AnimatePresence } from 'framer-motion';
import { MODALITIES } from '../../utils/constants';

const FileList = ({
  files,
  onFileRemove,
  onFileDuplicate,
  uploadVisibility = {},
  onFileVisibilityToggle,
  isSingleStacked = false,
}) => {
  if (files.length === 0) return null;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getModalityLabel = (value) => {
    return MODALITIES.find((modality) => modality.value === value)?.label || value?.toUpperCase();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-primary/70">
          Uploaded Files ({files.length})
        </h4>
      </div>

      <AnimatePresence>
        {files.map((fileObj) => (
          <motion.div
            key={fileObj.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 p-3 bg-surface rounded-xl group"
          >
            {/* File icon */}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-primary/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{fileObj.name}</p>
              <p className="text-xs text-textColor/60">{formatSize(fileObj.size)}</p>
            </div>

            {/* Modality label */}
            <div className="flex items-center gap-2">
              {!isSingleStacked && (
                <label className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border border-primary/15 bg-white text-xs text-primary/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={uploadVisibility[fileObj.modality] !== false}
                    onChange={() => onFileVisibilityToggle?.(fileObj.modality)}
                    className="w-3.5 h-3.5 rounded border-primary/30 text-teal focus:ring-teal/30"
                  />
                  View
                </label>
              )}
              <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary min-w-[140px] text-center">
                {isSingleStacked ? 'Stacked Input' : getModalityLabel(fileObj.modality)}
              </span>
            </div>

            {/* Remove button */}
            <div className="flex items-center gap-1">
              {onFileDuplicate && !isSingleStacked && files.length < 4 && (
                <button
                  onClick={() => onFileDuplicate(fileObj.id)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-teal hover:bg-teal/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  Duplicate
                </button>
              )}
              <button
                onClick={() => onFileRemove(fileObj.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FileList;
