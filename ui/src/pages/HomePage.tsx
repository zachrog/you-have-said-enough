import { RightArrowIcon } from "@/components/icons/icons";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center justify-center">
            <h1 className="text-9xl">Zuumb</h1>
          </div>
          <div className="w-full max-w-[600px] rounded-full border-white border-2 antialiased">
            <form
              className="flex items-center rounded-full bg-background px-4 py-2 shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/room/${roomId}`);
              }}
            >
              <Input
                type="text"
                placeholder="Join or Create Room"
                className="flex-1 border-none bg-transparent focus-visible:ring-transparent"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <RightArrowIcon className="h-6 w-6" />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
