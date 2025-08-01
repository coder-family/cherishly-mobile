import React from 'react';
import { PromptResponseAttachment } from '../../services/promptService';
import MediaViewerBase from '../media/MediaViewerBase';

interface QAMediaViewerProps {
  attachments: PromptResponseAttachment[];
  maxPreviewCount?: number;
}

export default function QAMediaViewer({ 
  attachments, 
  maxPreviewCount = 3 
}: QAMediaViewerProps) {
  return (
    <MediaViewerBase
      attachments={attachments}
      maxPreviewCount={maxPreviewCount}
    />
  );
} 