import React from "react";

const RoomHeader: React.FC<{ roomId: any }> = ({ roomId }) => (
  <div className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 z-10">
    <div className="flex items-center justify-between h-full px-6 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {roomId}
        </h1>
        <span className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Meeting Room
        </span>
      </div>
    </div>
  </div>
);

export default RoomHeader;
