import React, { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream: MediaStream;
  muted?: boolean;
  className?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  stream, 
  muted = false,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video 
      ref={videoRef} 
      autoPlay 
      playsInline
      muted={muted}
      className={className}
    />
  );
};

export default VideoPlayer;