import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/layout/PageTransition';
import MRIViewer from '../components/dashboard/MRIViewer';
import ViewerControls from '../components/dashboard/ViewerControls';
import ResultsPanel from '../components/dashboard/ResultsPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { getSegmentationResult } from '../services/api';

const OVERLAY_MASKS = [
  { key: 'enhancing_tumor', label: 'Enhancing Tumor', color: '#FACC15', colormap: 'yellow' },
  { key: 'whole_tumor', label: 'Whole Tumor', color: '#3B82F6', colormap: 'blue' },
  { key: 'tumor_core', label: 'Necrotic Core', color: '#EF4444', colormap: 'red' },
];

const ResultPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const modelInput = result?.stacked_url || result?.model_input_url;
  const selectedOverlayVolumes = result?.overlays && viewerState.showOverlay
    ? OVERLAY_MASKS
      .filter((mask) => viewerState.selectedMasks[mask.key] && result?.overlays?.[mask.key])
      .map((mask) => ({
        url: result.overlays[mask.key],
        colormap: mask.colormap,
      }))
    : [];
  const maskControls = OVERLAY_MASKS.map((mask) => ({
    ...mask,
    selected: Boolean(viewerState.selectedMasks[mask.key]),
  }));
  const allMasksSelected = maskControls.every((mask) => mask.selected);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getSegmentationResult(id);
        setResult(data);
      } catch (err) {
        setError('Failed to load result. The result may not exist or the server is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return (
      <PageTransition>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-12 h-12 border-4 border-teal/20 border-t-teal rounded-full mx-auto mb-4"
            />
            <p className="text-textColor font-medium">Loading result...</p>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Card className="text-center max-w-md">
            <span className="text-5xl mb-4 block">😔</span>
            <h2 className="text-xl font-bold text-primary mb-2">Result Not Found</h2>
            <p className="text-textColor text-sm mb-6">{error}</p>
            <Link to="/dashboard">
              <Button variant="teal">Go to Dashboard</Button>
            </Link>
          </Card>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-20 pb-12 min-h-screen bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-primary">Result</h1>
                <Badge color="teal">{id}</Badge>
              </div>
              <p className="text-textColor text-sm">
                Segmentation completed • {result?.created_at || 'Unknown date'}
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="secondary" size="sm" icon="←">
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>

          {/* Viewer + Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card hover={false} padding="p-2" className="!bg-[#0D1726]">
                <div className="h-[500px] lg:h-[600px]">
                  <MRIViewer
                    volumes={modelInput ? [{ url: modelInput }] : []}
                    overlayVolumes={selectedOverlayVolumes}
                    overlayOpacity={viewerState.overlayOpacity / 100}
                  />
                </div>
              </Card>

              {/* Results */}
              <ResultsPanel result={result} jobId={id} />
            </div>

            <div className="lg:col-span-4">
              <ViewerControls
                sliceX={viewerState.sliceX}
                sliceY={viewerState.sliceY}
                sliceZ={viewerState.sliceZ}
                zoom={viewerState.zoom}
                showOverlay={viewerState.showOverlay}
                overlayOpacity={viewerState.overlayOpacity}
                showOverlayControls={Boolean(result?.overlays)}
                overlayMasks={maskControls}
                allMasksSelected={allMasksSelected}
                onSliceChange={(axis, value) =>
                  setViewerState((prev) => ({
                    ...prev,
                    [`slice${axis.toUpperCase()}`]: value,
                  }))
                }
                onZoomChange={(value) =>
                  setViewerState((prev) => ({ ...prev, zoom: value }))
                }
                onOverlayToggle={() =>
                  setViewerState((prev) => ({
                    ...prev,
                    showOverlay: !prev.showOverlay,
                  }))
                }
                onOverlayOpacityChange={(value) =>
                  setViewerState((prev) => ({
                    ...prev,
                    overlayOpacity: value,
                  }))
                }
                onMaskToggle={(maskKey) =>
                  setViewerState((prev) => ({
                    ...prev,
                    selectedMasks: {
                      ...prev.selectedMasks,
                      [maskKey]: !prev.selectedMasks[maskKey],
                    },
                  }))
                }
                onSelectAllMasks={() =>
                  setViewerState((prev) => {
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
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResultPage;
