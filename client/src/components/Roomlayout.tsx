import VideoPlayer from "./VideoPlayer";

const VideoLayout: React.FC<{ localStream: MediaStream; remoteStreams: { [key: string]: MediaStream } }> = ({
  localStream,
  remoteStreams,
}) => {
  const totalParticipants = Object.keys(remoteStreams).length + 1;

  const getLayoutClass = () => {
    switch (totalParticipants) {
      case 1:
        return "grid-cols-1 max-w-3xl mx-auto";
      case 2:
        return "grid-cols-2 max-w-4xl mx-auto";
      case 3:
        return "grid-cols-3 max-w-6xl mx-auto";
      case 4:
        return "grid-cols-2 grid-rows-2 max-w-5xl mx-auto";
      default:
        return "grid-cols-3 grid-rows-2 max-w-6xl mx-auto";
    }
  };

  return (
    <div className={`grid gap-4 h-[calc(100vh-180px)] ${getLayoutClass()}`}>
      {/* Local video */}
      {localStream && (
        <div className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <VideoPlayer
            stream={localStream}
            muted={true}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            You
          </div>
        </div>
      )}

      {/* Remote videos */}
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <div
          key={userId}
          className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg"
        >
          <VideoPlayer stream={stream} className="w-full h-full object-cover" />
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
            Participant {userId.slice(0, 4)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoLayout;
