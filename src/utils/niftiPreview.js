import * as nifti from 'nifti-reader-js';

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Decode NIfTI voxel buffer into Float32 for slice extraction.
 * @param {import('nifti-reader-js').NIFTI1 | import('nifti-reader-js').NIFTI2} header
 * @param {ArrayBuffer} imageBuffer
 * @returns {Float32Array}
 */
function voxelsToFloat32(header, imageBuffer) {
  const { datatypeCode, littleEndian } = header;
  const dv = new DataView(imageBuffer);
  const n = imageBuffer.byteLength;

  const readAll = (bytesPer, getter) => {
    const count = Math.floor(n / bytesPer);
    const out = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      out[i] = getter(dv, i * bytesPer, littleEndian);
    }
    return out;
  };

  switch (datatypeCode) {
    case nifti.NIFTI1.TYPE_FLOAT32:
      return new Float32Array(imageBuffer);
    case nifti.NIFTI1.TYPE_FLOAT64:
      return readAll(8, (d, o, le) => d.getFloat64(o, le));
    case nifti.NIFTI1.TYPE_INT16:
      return readAll(2, (d, o, le) => d.getInt16(o, le));
    case nifti.NIFTI1.TYPE_UINT16:
      return readAll(2, (d, o, le) => d.getUint16(o, le));
    case nifti.NIFTI1.TYPE_INT8:
      return readAll(1, (d, o) => d.getInt8(o));
    case nifti.NIFTI1.TYPE_UINT8:
      return new Float32Array(new Uint8Array(imageBuffer));
    default:
      return readAll(4, (d, o, le) => d.getFloat32(o, le));
  }
}

/**
 * Middle-axial PNG data URL (matches backend preview style).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function niftiFileToAxialPreviewDataUrl(file) {
  let buffer = await file.arrayBuffer();
  if (nifti.isCompressed(buffer)) {
    buffer = nifti.decompress(buffer);
  }
  if (!nifti.isNIFTI(buffer)) {
    throw new Error('Not a NIfTI file');
  }

  const header = nifti.readHeader(buffer);
  const imageBuffer = nifti.readImage(header, buffer);
  const nx = header.dims[1];
  const ny = header.dims[2];
  const nz = header.dims[3];
  if (!nx || !ny || !nz) {
    throw new Error('Invalid NIfTI dimensions');
  }

  const voxels = voxelsToFloat32(header, imageBuffer);
  const midZ = Math.floor(nz / 2);
  const sliceLen = nx * ny;
  const zOffset = midZ * sliceLen;

  let vmin = Infinity;
  let vmax = -Infinity;
  for (let i = 0; i < sliceLen; i += 1) {
    const v = voxels[zOffset + i];
    if (v < vmin) vmin = v;
    if (v > vmax) vmax = v;
  }

  const canvas = document.createElement('canvas');
  canvas.width = nx;
  canvas.height = ny;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas unsupported');
  const imageData = ctx.createImageData(nx, ny);

  for (let i = 0; i < sliceLen; i += 1) {
    const v = voxels[zOffset + i];
    let g = 0;
    if (vmax > vmin) {
      g = Math.round(((v - vmin) / (vmax - vmin)) * 255);
    }
    const j = i * 4;
    imageData.data[j] = g;
    imageData.data[j + 1] = g;
    imageData.data[j + 2] = g;
    imageData.data[j + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

/**
 * Per-file preview in the same shape as backend `view-uploads` volumes.
 * @param {Array<{ file: File, modality: string, name?: string }>} rows
 * @returns {Promise<Array<{ modality: string, original_name: string, preview_url: string | null, visible: boolean }>>}
 */
export async function buildIndividualUploadPreviewsFromFiles(rows) {
  const volumes = [];
  for (const item of rows) {
    if (!item?.file) continue;
    const original_name = item.file.name;
    const lower = original_name.toLowerCase();

    try {
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        const preview_url = await fileToDataUrl(item.file);
        volumes.push({
          modality: item.modality,
          original_name,
          preview_url,
          visible: true,
        });
      } else if (lower.endsWith('.nii') || lower.endsWith('.nii.gz')) {
        const preview_url = await niftiFileToAxialPreviewDataUrl(item.file);
        volumes.push({
          modality: item.modality,
          original_name,
          preview_url,
          visible: true,
        });
      } else {
        volumes.push({
          modality: item.modality,
          original_name,
          preview_url: null,
          visible: true,
        });
      }
    } catch {
      volumes.push({
        modality: item.modality,
        original_name,
        preview_url: null,
        visible: true,
      });
    }
  }
  return volumes;
}
