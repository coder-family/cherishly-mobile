import { MemoryAttachment } from "../../services/memoryService";
import MediaViewerBase from "../media/MediaViewerBase";

interface MemoryMediaViewerProps {
  attachments: MemoryAttachment[];
  maxPreviewCount?: number;
}

export default function MemoryMediaViewer({
  attachments,
  maxPreviewCount,
}: MemoryMediaViewerProps) {
  // console.log('MemoryMediaViewer: Received attachments:', {
  //   count: attachments?.length || 0,
  //   attachments: attachments?.map(att => ({
  //     id: att.id,
  //     url: att.url,
  //     type: att.type,
  //     hasId: !!att.id,
  //     filename: att.filename,
  //     size: att.size
  //   })) || []
  // });

  return (
    <MediaViewerBase
      attachments={attachments}
      maxPreviewCount={maxPreviewCount}
    />
  );
}
