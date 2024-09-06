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
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function MediaBar({
  audioWindow,
  onMicChange,
  onCameraChange,
  onMicMuteChange,
  onCameraDisable,
}: {
  audioWindow: number;
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

    initMediaDevices();
  }, []);

  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <RoomSettings />
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

function RoomSettings({}) {
  const [roomSettingsIsOpen, setRoomSettingsIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    username: "",
    videoQuality: "medium",
    audioEnabled: true,
    videoEnabled: true,
    backgroundBlur: false,
  });

  const handleSave = () => {
    console.log("Settings saved:", settings);
    setRoomSettingsIsOpen(false);
  };

  return (
    <Dialog open={roomSettingsIsOpen} onOpenChange={setRoomSettingsIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Room Settings</DialogTitle>
          <DialogDescription>
            Adjust room settings here. It's always fun to screw with people.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 py-4">
          <div className="flex items-center justify-between w-full gap-4">
            <div>
              <Label htmlFor="audioWindow" className="">
                Audio Window
              </Label>
            </div>
            <div className="flex flex-row items-center">
              <Input
                id="audioWindow"
                value={settings.username}
                onChange={(e) =>
                  setSettings({ ...settings, username: e.target.value })
                }
                className="col-span-3"
              />
              <p className="ml-1">s</p>
              <div className='ml-2'>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button size="icon" variant="ghost">
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
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
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
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
