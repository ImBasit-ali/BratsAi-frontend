import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { TUMOR_REGIONS } from '../../utils/constants';
import { downloadSegmentationFile } from '../../services/api';

const ResultsPanel = ({ result, jobId }) => {
  if (!result) return null;

  const { metrics } = result;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const getScoreColor = (score) => {
    if (score >= 0.9) return 'green';
    if (score >= 0.8) return 'teal';
    if (score >= 0.7) return 'orange';
    return 'red';
  };

  const handleDownloadSegmentation = async () => {
    if (!jobId || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadError(null);

      const { blob, filename } = await downloadSegmentationFile(jobId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError('Failed to download segmentation file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportMetricsCsv = () => {
    if (!metrics || Object.keys(metrics).length === 0) {
      return;
    }

    const escapeCsv = (value) => {
      const text = value == null ? '' : String(value);
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const rows = [
      ['region', 'volume_ml', 'dsc', 'sensitivity', 'specificity'],
      ...Object.entries(metrics).map(([region, data]) => ([
        region,
        data?.volume_ml ?? '',
        data?.dsc ?? '',
        data?.sensitivity ?? '',
        data?.specificity ?? '',
      ])),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics_${jobId || 'segmentation'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Segmentation Results
        </h3>
        <Badge color="green">Complete</Badge>
      </div>

      {/* Metrics Table */}
      <Card padding="p-0" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">Region</th>
                <th className="text-center text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">Volume (ml)</th>
                <th className="text-center text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">DSC</th>
                <th className="text-center text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">Sensitivity</th>
                <th className="text-center text-xs font-semibold text-primary/50 uppercase tracking-wider px-5 py-3">Specificity</th>
              </tr>
            </thead>
            <tbody>
              {metrics && Object.entries(metrics).map(([key, data]) => (
                <tr key={key} className="border-b border-gray-50 hover:bg-surface/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: TUMOR_REGIONS[key]?.color || '#888' }}
                      />
                      <span className="text-sm font-semibold text-primary">{key}</span>
                    </div>
                  </td>
                  <td className="text-center px-5 py-3">
                    <span className="text-sm text-textColor">{data.volume_ml?.toFixed(1)}</span>
                  </td>
                  <td className="text-center px-5 py-3">
                    <Badge color={getScoreColor(data.dsc)}>{data.dsc?.toFixed(3)}</Badge>
                  </td>
                  <td className="text-center px-5 py-3">
                    <Badge color={getScoreColor(data.sensitivity)}>{data.sensitivity?.toFixed(3)}</Badge>
                  </td>
                  <td className="text-center px-5 py-3">
                    <Badge color={getScoreColor(data.specificity)}>{data.specificity?.toFixed(3)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Download buttons */}
      <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto pb-1">
        <Button
          variant="primary"
          size="xs"
          icon="📥"
          disabled={!jobId || isDownloading}
          onClick={handleDownloadSegmentation}
        >
          {isDownloading ? 'Downloading...' : 'Download Mask'}
        </Button>
        <Button
          variant="secondary"
          size="xs"
          icon="📊"
          disabled={!metrics || Object.keys(metrics).length === 0}
          onClick={handleExportMetricsCsv}
        >
          Export Metrics (CSV)
        </Button>
      </div>

      {downloadError && (
        <p className="text-xs text-red-500">{downloadError}</p>
      )}
    </motion.div>
  );
};

export default ResultsPanel;
