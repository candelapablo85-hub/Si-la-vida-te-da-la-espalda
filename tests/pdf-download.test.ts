import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PDF_DOWNLOAD_PATH, getPdfDownloadUrl } from '../src/pdfDownload';

test('uses the public PDF path by default', () => {
  assert.equal(getPdfDownloadUrl(''), DEFAULT_PDF_DOWNLOAD_PATH);
  assert.equal(getPdfDownloadUrl(undefined), DEFAULT_PDF_DOWNLOAD_PATH);
});

test('allows overriding the PDF path when configured', () => {
  assert.equal(getPdfDownloadUrl('/custom.pdf'), '/custom.pdf');
});

test('normalizes relative PDF paths to a root-relative URL', () => {
  assert.equal(getPdfDownloadUrl('assets/Adelanto-libro.pdf'), '/assets/Adelanto-libro.pdf');
});
