import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  StopCircle,
} from "lucide-react";

interface ControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
}) => {
  return (
    <div className="flex gap-4">
      <button
        onClick={onToggleAudio}
        className={`p-3 rounded-full ${
          isAudioEnabled ? "bg-blue-500" : "bg-red-500"
        } text-white hover:opacity-80 transition-opacity`}
        title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
      >
        {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
      </button>

      <button
        onClick={onToggleVideo}
        className={`p-3 rounded-full ${
          isVideoEnabled ? "bg-blue-500" : "bg-red-500"
        } text-white hover:opacity-80 transition-opacity`}
        title={isVideoEnabled ? "Stop Video" : "Start Video"}
      >
        {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
      </button>

      <button
        onClick={onScreenShare}
        className={`p-3 rounded-full ${
          isScreenSharing ? "bg-red-500" : "bg-blue-500"
        } text-white hover:opacity-80 transition-opacity`}
        title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
      >
        {isScreenSharing ? <StopCircle size={24} /> : <Monitor size={24} />}
      </button>
    </div>
  );
};

export default Controls;
