import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import VideoPlayer from "./VideoPlayer";
import Controls from "./Controls";

const socket = io("http://localhost:9005");

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [key: string]: MediaStream;
  }>({});
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const localVideoRef = useRef<HTMLVideoElement>(null);

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  // Initialize local stream
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Got local stream:", stream.id);
        setLocalStream(stream);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initLocalStream();
    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const createPeerConnection = (userId: string) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      });

      // Add local tracks to the peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log("Received remote track:", event.streams[0].id);
        setRemoteStreams((prev) => ({
          ...prev,
          [userId]: event.streams[0],
        }));
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: userId,
            candidate: event.candidate,
          });
        }
      };

      // Log connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${userId}:`, pc.connectionState);
      };

      pc.oniceconnectionstatechange = () => {
        console.log(`ICE state with ${userId}:`, pc.iceConnectionState);
      };

      peerConnections.current[userId] = pc;
      return pc;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      return null;
    }
  };

  // Handle room connection
  useEffect(() => {
    if (!roomId || !localStream) return;

    socket.emit("join-room", roomId);

    socket.on("user-connected", async (userId: string) => {
      console.log("New user connected:", userId);
      const pc = createPeerConnection(userId);
      if (!pc) return;

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: userId, offer });
      } catch (error) {
        console.error("Error creating offer:", error);
      }
    });

    socket.on(
      "offer",
      async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
        console.log("Received offer from:", data.from);
        const pc = createPeerConnection(data.from);
        if (!pc) return;

        try {
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", { to: data.from, answer });
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    );

    socket.on(
      "answer",
      async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
        console.log("Received answer from:", data.from);
        const pc = peerConnections.current[data.from];
        if (pc) {
          try {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          } catch (error) {
            console.error("Error setting remote description:", error);
          }
        }
      }
    );

    socket.on(
      "ice-candidate",
      async (data: { from: string; candidate: RTCIceCandidateInit }) => {
        const pc = peerConnections.current[data.from];
        if (pc) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      }
    );

    socket.on("user-disconnected", (userId: string) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });

    return () => {
      socket.off("user-connected");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-disconnected");

      // Cleanup peer connections
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      peerConnections.current = {};
    };
  }, [roomId, localStream]);

  const handleToggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioEnabled(audioTrack.enabled);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoEnabled(videoTrack.enabled);
    }
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing and revert to camera
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const newVideoTrack = newStream.getVideoTracks()[0];

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(newVideoTrack);
          }
        });

        if (localStream) {
          const updatedStream = new MediaStream([
            newVideoTrack,
            ...localStream.getAudioTracks(),
          ]);
          setLocalStream(updatedStream);
        }
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

        const videoTrack = screenStream.getVideoTracks()[0];

        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video");
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
        });

        if (localStream) {
          const newStream = new MediaStream([
            videoTrack,
            ...localStream.getAudioTracks(),
          ]);
          setLocalStream(newStream);
        }

        setIsScreenSharing(true);

        // Handle stop sharing
        videoTrack.onended = async () => {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
          const newVideoTrack = newStream.getVideoTracks()[0];

          Object.values(peerConnections.current).forEach((pc) => {
            const sender = pc
              .getSenders()
              .find((s) => s.track?.kind === "video");
            if (sender) {
              sender.replaceTrack(newVideoTrack);
            }
          });

          if (localStream) {
            const updatedStream = new MediaStream([
              newVideoTrack,
              ...localStream.getAudioTracks(),
            ]);
            setLocalStream(updatedStream);
          }
          setIsScreenSharing(false);
        };
      }
    } catch (error) {
      console.error("Error handling screen share:", error);
      setIsScreenSharing(false);
    }
  };
  return (
    <div className="p-4 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-white">Room: {roomId}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Local video */}
        {localStream && (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <VideoPlayer
              stream={localStream}
              muted={true}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              You
            </div>
          </div>
        )}

        {/* Remote videos */}
        {Object.entries(remoteStreams).map(([userId, stream]) => (
          <div
            key={userId}
            className="relative bg-gray-800 rounded-lg overflow-hidden"
          >
            <VideoPlayer
              stream={stream}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
              Participant {userId.slice(0, 4)}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
        <Controls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onScreenShare={handleScreenShare}
        />
      </div>
    </div>
  );
};

export default Room;
