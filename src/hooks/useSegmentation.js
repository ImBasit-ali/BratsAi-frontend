import { useState, useCallback, useRef } from 'react';
import { startSegmentation, getSegmentationStatus, getSegmentationResult } from '../services/api';

const useSegmentation = () => {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | pending | processing | done | error
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const pollingRef = useRef(null);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback((id) => {
    clearPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await getSegmentationStatus(id);
        setStatus(statusData.status);
        setProgress(statusData.progress);

        if (statusData.status === 'done') {
          clearPolling();
          const resultData = await getSegmentationResult(id);
          setResult(resultData);
        } else if (statusData.status === 'error') {
          clearPolling();
          setError(statusData.error || 'Segmentation failed');
        }
      } catch (err) {
        clearPolling();
        setStatus('error');
        setError('Lost connection to server');
      }
    }, 2500);
  }, [clearPolling]);

  const runSegmentation = useCallback(async (files, settings) => {
    try {
      setStatus('uploading');
      setError(null);
      setResult(null);
      setProgress(null);

      const data = await startSegmentation(files, settings);
      setJobId(data.id);
      setStatus('pending');
      pollStatus(data.id);

      return data;
    } catch (err) {
      setStatus('error');
      setError(err.response?.data?.error || 'Failed to start segmentation. Is the backend running?');
      throw err;
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    clearPolling();
    setJobId(null);
    setStatus('idle');
    setProgress(null);
    setResult(null);
    setError(null);
  }, [clearPolling]);

  return {
    jobId,
    status,
    progress,
    result,
    error,
    runSegmentation,
    reset,
  };
};

export default useSegmentation;
