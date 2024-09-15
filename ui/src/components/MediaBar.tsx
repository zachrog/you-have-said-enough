import {
  InfoIcon,
  MicIcon,
  MuteIcon,
  PhoneIcon,
  SettingsIcon,
  VideoDisabledIcon,
  VideoIcon,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Room } from "server/src/entities/Room";

export function MediaBar({
  roomInfo,
  onMicChange,
  onCameraChange,
  onMicMuteChange,
  onCameraDisable,
  onRoomChange,
}: {
  roomInfo: Room;
  onRoomChange: (room: Room) => void;
  onMicChange: (micId: string) => void;
  onCameraChange: (cameraId: string) => void;
  onMicMuteChange: (isMuted: boolean) => void;
  onCameraDisable: (isDisabled: boolean) => void;
}) {
  const navigate = useNavigate();
  const [microphones, setMicrophones] = useState([
    { label: "System Default Microphone", deviceId: "default" },
  ]);
  const [micId, setMicId] = useState("");
  const [cameras, setCameras] = useState([
    { label: "System Default Camera", deviceId: "default" },
  ]);
  const [cameraId, setCameraId] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [cameraIsDisabled, setCameraIsDisabled] = useState(false);

  useEffect(() => {
    async function initMediaDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((device) => device.kind === "audioinput");
      const cameras = devices.filter((device) => device.kind === "videoinput");
      if (mics.length) {
        setMicId(mics[0].deviceId);
        setMicrophones(mics);
      }
      if (cameras.length) {
        setCameraId(cameras[0].deviceId);
        setCameras(cameras);
      }
    }

    initMediaDevices().catch(console.error);
  }, []);

  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <RoomSettings roomInfo={roomInfo} onRoomChange={onRoomChange} />
        </div>
        <div className="flex items-center gap-2">
          <MuteButton
            isMuted={isMuted}
            onMicMuteChange={(mute) => {
              setIsMuted(mute);
              onMicMuteChange(mute);
            }}
          />
          <Select
            onValueChange={(id) => {
              setMicId(id);
              onMicChange(id);
            }}
            value={micId}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {microphones.map((microphone) => (
                <SelectItem
                  value={microphone.deviceId}
                  key={microphone.deviceId + microphone.label}
                >
                  {microphone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DisableCameraButton
            cameraIsDisabled={cameraIsDisabled}
            onCameraDisable={(disabled) => {
              setCameraIsDisabled(disabled);
              onCameraDisable(disabled);
            }}
          />
          <Select
            value={cameraId}
            onValueChange={(id) => {
              setCameraId(id);
              onCameraChange(id);
            }}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select camera" />
            </SelectTrigger>
            <SelectContent>
              {cameras.map((camera) => {
                return (
                  <SelectItem
                    value={camera.deviceId}
                    key={camera.deviceId + camera.label}
                  >
                    {camera.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button
          className="hover:bg-red-500"
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
        >
          <PhoneIcon className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

function RoomSettings({
  roomInfo,
  onRoomChange,
}: {
  roomInfo: Room;
  onRoomChange: (room: Room) => void;
}) {
  const [roomSettingsIsOpen, setRoomSettingsIsOpen] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null); // Create a ref for the input

  function handleSave(room: Room) {
    setRoomSettingsIsOpen(false);
    onRoomChange(room);
  }

  return (
    <Dialog open={roomSettingsIsOpen} onOpenChange={setRoomSettingsIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-[400px]"
        onOpenAutoFocus={(e) => {
          e.preventDefault(); // Prevent the dialog from focusing on the first input
          submitButtonRef.current?.focus();
        }}
      >
        <form
          onSubmit={(e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            e.preventDefault();
            handleSave({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              audioWindow: (e.target as any).audioWindow.value * 1000,
              roomId: roomInfo.roomId,
            });
          }}
        >
          <DialogHeader>
            <DialogTitle>Room Settings</DialogTitle>
            <DialogDescription>
              It's always fun to screw with people.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 py-4">
            <div className="flex items-center justify-between w-full gap-4">
              <div>
                <Label htmlFor="audioWindow" className="text-md">
                  Audio Window
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground ml-2" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        What time period Zuumb will listen to audio and adjust
                        the room.
                        <br />
                        The shorter the time the more chaotic.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-row items-center">
                <Input
                  id="audioWindow"
                  defaultValue={roomInfo.audioWindow / 1000}
                  type="number"
                  name="audioWindow"
                  step="any"
                  min="0"
                  className="w-20 text-right"
                />
                <p className="ml-1">s</p>
                <div className="ml-2"></div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" ref={submitButtonRef}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MuteButton({
  isMuted,
  onMicMuteChange,
}: {
  isMuted: boolean;
  onMicMuteChange: (isMuted: boolean) => void;
}) {
  if (isMuted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onMicMuteChange(!isMuted)}
        title="Unmute"
        className="bg-red-600 hover:bg-red-500"
      >
        <MuteIcon className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      title="Mute"
      onClick={() => onMicMuteChange(!isMuted)}
    >
      <MicIcon className="w-6 h-6" />
    </Button>
  );
}

function DisableCameraButton({
  cameraIsDisabled,
  onCameraDisable,
}: {
  cameraIsDisabled: boolean;
  onCameraDisable: (isMuted: boolean) => void;
}) {
  if (cameraIsDisabled) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onCameraDisable(!cameraIsDisabled)}
        title="Unmute"
        className="bg-red-600 hover:bg-red-500"
      >
        <VideoDisabledIcon className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      title="Mute"
      onClick={() => onCameraDisable(!cameraIsDisabled)}
    >
      <VideoIcon className="w-6 h-6" />
    </Button>
  );
}
