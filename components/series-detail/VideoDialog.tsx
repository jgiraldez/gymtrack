import React from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { VideoDialogProps } from "./types"

export const VideoDialog: React.FC<VideoDialogProps> = React.memo(({
  isOpen,
  onClose,
  videoUrl,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube.com/embed/${videoUrl}`}
            title="Exercise Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
})

VideoDialog.displayName = "VideoDialog" 