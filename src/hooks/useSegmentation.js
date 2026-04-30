import { useState, useCallback, useRef } from 'react';
import {
  startSegmentation,
  getSegmentationStatus,
  getSegmentationResult,
  getWorkerHealth,
} from '../services/api';

const PENDING_STUCK_POLLS = 20;

const useSegmentation = () => {
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | pending | processing | done | error
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [stackedUrl, setStackedUrl] = useState(null);
  const [maskUrl, setMaskUrl] = useState(null);
  const pollingRef = useRef(null);
  const pendingPollsRef = useRef(0);

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pendingPollsRef.current = 0;
  }, []);

  const pollStatus = useCallback((id) => {
    clearPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const statusData = await getSegmentationStatus(id);
        setStatus(statusData.status === 'failed' ? 'error' : statusData.status);
        setProgress(statusData.progress);

        // Capture URLs from status response as they become available
        if (statusData.stacked_url) {
          setStackedUrl(statusData.stacked_url);
        }
        if (statusData.mask_url) {
          setMaskUrl(statusData.mask_url);
        }

        if (statusData.status === 'done') {
          clearPolling();
          const resultData = await getSegmentationResult(id);
          setResult(resultData);
          // Result may have more accurate URLs
          if (resultData.stacked_url) setStackedUrl(resultData.stacked_url);
          if (resultData.mask_url) setMaskUrl(resultData.mask_url);
          return;
        } else if (statusData.status === 'error' || statusData.status === 'failed') {
          clearPolling();
          setError(statusData.error || 'Segmentation failed');
          return;
        }

        if (statusData.status === 'pending') {
          pendingPollsRef.current += 1;

          if (pendingPollsRef.current >= PENDING_STUCK_POLLS) {
            const health = await getWorkerHealth();
            const workerLikelyDown = health?.pending_jobs > 0 && health?.processing_jobs === 0;

            if (workerLikelyDown) {
              clearPolling();
              setStatus('error');
              setError('Job is stuck in pending. Start backend worker with: python worker.py');
            }
          }
        } else {
          pendingPollsRef.current = 0;
        }
      } catch (err) {
        clearPolling();
        setStatus('error');
        setError('Lost connection to server');
      }
    }, 1500);
  }, [clearPolling]);

  const runSegmentation = useCallback(async (files, settings) => {
    try {
      setStatus('uploading');
      setError(null);
      setResult(null);
      setProgress(null);
      setStackedUrl(null);
      setMaskUrl(null);

      const data = await startSegmentation(files, settings);
      setJobId(data.id);

      if (data.status === 'done') {
        setStatus('done');
        const resultData = await getSegmentationResult(data.id);
        setResult(resultData);
        if (resultData.stacked_url) setStackedUrl(resultData.stacked_url);
        if (resultData.mask_url) setMaskUrl(resultData.mask_url);
      } else if (data.status === 'failed' || data.status === 'error') {
        setStatus('error');
        setError(data.error || 'Segmentation failed');
      } else {
        setStatus('pending');
        pollStatus(data.id);
      }

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
    setStackedUrl(null);
    setMaskUrl(null);
  }, [clearPolling]);

  return {
    jobId,
    status,
    progress,
    result,
    error,
    stackedUrl,
    maskUrl,
    runSegmentation,
    reset,
  };
};

export default useSegmentation;
