'use client';

import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { searchPlugin } from '@react-pdf-viewer/search';
import { useMemo } from 'react';
import type { Match } from '@react-pdf-viewer/search';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';

type Props = {
  fileUrl: string;
  searchTerm: string;
  onSearchReady?: (instance: any, store: any) => void;
};

export default function PdfViewer({ fileUrl, searchTerm, onSearchReady }: Props) {
  const searchPluginInstance = useMemo(() => searchPlugin(), []);
  const searchInstance = useMemo(() => (searchPluginInstance as any).instance, [searchPluginInstance]);
  const store = useMemo(() => (searchPluginInstance as any).store, [searchPluginInstance]);

  useMemo(() => {
    if (searchTerm && searchInstance) {
      searchInstance.clearHighlights();
      searchInstance.highlight(searchTerm).then(() => {
        if (store.numberOfMatches > 0) {
          searchInstance.jumpToMatch(0);
        }
      });
    }
  }, [searchTerm]);

  // Exponer instancia al padre
  useMemo(() => {
    if (onSearchReady) onSearchReady(searchInstance, store);
  }, [searchInstance, store]);

  return (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
      <Viewer
        fileUrl={fileUrl}
        plugins={[searchPluginInstance]}
        defaultScale={SpecialZoomLevel.PageFit}
        theme="dark"
      />
    </Worker>
  );
}

