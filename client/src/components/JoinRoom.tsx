import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RoomJoin: React.FC = () => {
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <h1>Join a Room</h1>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button>
    </div>
  );
};

export default RoomJoin;