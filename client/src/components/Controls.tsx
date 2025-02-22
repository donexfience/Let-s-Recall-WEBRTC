import React from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  StopCircle,
  Phone,
  Grid,
  Users,
} from "lucide-react";

interface ControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onScreenShare: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onScreenShare,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto h-full px-6">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">3:42 PM</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAudio}
            className={`p-4 rounded-full ${
              isAudioEnabled
                ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                : "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
            } transition-all duration-200`}
            title={isAudioEnabled ? "Mute Audio" : "Unmute Audio"}
          >
            {isAudioEnabled ? (
              <Mic className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <MicOff className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </button>

          <button
            onClick={onToggleVideo}
            className={`p-4 rounded-full ${
              isVideoEnabled
                ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                : "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
            } transition-all duration-200`}
            title={isVideoEnabled ? "Stop Video" : "Start Video"}
          >
            {isVideoEnabled ? (
              <Video className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            ) : (
              <VideoOff className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </button>

          <button
            onClick={onScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing
                ? "bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
            } transition-all duration-200`}
            title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
          >
            {isScreenSharing ? (
              <StopCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <Monitor className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            )}
          </button>

          <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2" />

          <button
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
            title="Leave Call"
          >
            <Phone className="w-6 h-6 text-white transform rotate-225" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Change Layout"
          >
            <Grid className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
          <button
            className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
            title="Show Participants"
          >
            <Users className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
