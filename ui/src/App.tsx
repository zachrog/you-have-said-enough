import { RoomPage } from "@/pages/RoomPage";
import { Button } from "./components/ui/button";
import { useState } from "react";

function App() {
  const [joinedRoom, setJoinedRoom] = useState(false);
  return (
    <>
      <div className="">
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
