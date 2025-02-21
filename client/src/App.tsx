import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RoomJoin from "./components/JoinRoom";
import Room from "./components/Room";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoomJoin />} />
        <Route path="/room/:roomId" element={<Room  />} />
      </Routes>
    </Router>
  );
};

export default App;
