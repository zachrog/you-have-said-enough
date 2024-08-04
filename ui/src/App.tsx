import { Button } from "./components/ui/button";
import { useState } from "react";
import { RoomPage } from "./RoomComponent";

function App() {
  const [joinedRoom, setJoinedRoom] = useState(false);
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-950 text-white">
        {!joinedRoom && (
          <Button onClick={() => setJoinedRoom(true)}>
            Join if you D.A.R.E.
          </Button>
        )}
        {joinedRoom && <RoomPage />}
      </div>
    </>
  );
}

export default App;
