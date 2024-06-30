import { Button } from "./components/ui/button";
import { useState } from "react";
import { RoomComponent } from "./RoomComponent";

function App() {
  const [joinedRoom, setJoinedRoom] = useState(false);
  return (
    <>
      <div className="flex flex-col h-screen bg-gray-950 text-white">
        <Button onClick={() => setJoinedRoom(true)}>
          Join if you D.A.R.E.
        </Button>
        {joinedRoom && <RoomComponent />}
      </div>
    </>
  );
}

export default App;
