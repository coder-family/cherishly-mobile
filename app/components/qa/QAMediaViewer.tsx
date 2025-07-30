import { PromptResponseAttachment } from "../../services/promptService";
import MediaViewerBase from "../media/MediaViewerBase";

interface QAMediaViewerProps {
  attachments: PromptResponseAttachment[];
  maxPreviewCount?: number;
}

export default function QAMediaViewer({
  attachments,
  maxPreviewCount,
}: QAMediaViewerProps) {
  console.log('QAMediaViewer: Received attachments:', {
    count: attachments?.length || 0,
    attachments: attachments?.map(att => ({
      id: att.id,
      url: att.url,
      type: att.type,
      hasId: !!att.id,
      filename: att.filename,
      size: att.size
    })) || []
  });

  return (
    <MediaViewerBase
      attachments={attachments}
      maxPreviewCount={maxPreviewCount}
    />
  );
} 