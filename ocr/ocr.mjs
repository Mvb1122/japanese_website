import { createWorker } from 'https://cdn.jsdelivr.net/npm/tesseract.js@5/+esm';

let activeCallback = null;
let worker = await createWorker('jpn', 1, {
    logger: ({ status, progress }) => {
        if (typeof activeCallback !== 'function') return;

        const pct = Math.round((progress ?? 0) * 100);
        activeCallback(
            `${status} ${Number.isFinite(pct) ? `(${pct}%)` : ''}`.trim()
        );
    }
});
// await worker.terminate(); -- For shutdown.

/**
 * OCRs an image from blob.
 * @param {Blob} blob image blob
 * @param {(string) => void} callback streaming callback for recognition progress.
 * @returns {Promise<import('./tesseract_resp').OCRMetadata>} output text.
 */
export async function OCR(blob, callback = () => {}) {
  // Stream progress as Tesseract recognizes the image.
  const ret = await worker.recognize(blob);
  activeCallback = callback;

  return ret;
}