import {
  MicIcon,
  MuteIcon,
  PhoneIcon,
  SpeakerIcon,
  VideoDisabledIcon,
  VideoIcon,
} from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function MediaBar({
  speakerId,
  onSpeakerChange,
  onMicChange,
  cameraId,
  onCameraChange,
  onMicMuteChange,
  onCameraDisable,
}: {
  speakerId: string;
  onSpeakerChange: (speakerId: string) => void;
  onMicChange: (micId: string) => void;
  cameraId: string;
  onCameraChange: (cameraId: string) => void;
  onMicMuteChange: (isMuted: boolean) => void;
  onCameraDisable: (isDisabled: boolean) => void;
}) {
  const navigate = useNavigate();
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState("");
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraIsDisabled, setCameraIsDisabled] = useState(false);

  useEffect(() => {
    async function initMediaDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput" // On ios and on firefox you cannot change your output settings. They do not show any audio outputs.
      );
      const cameras = devices.filter((device) => device.kind === "videoinput");
      if (mics[0]) {
        setMicId(mics[0].deviceId);
      }
      onCameraChange(cameras[0].deviceId);
      setMicrophones(mics);
      setSpeakers(speakers);
      setCameras(cameras);
    }

    initMediaDevices();
  }, []);

  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2 ml-4">
          <SpeakerIcon />
          <Select value={speakerId} onValueChange={onSpeakerChange}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent>
              {speakers.map((speaker) => (
                <SelectItem
                  value={speaker.deviceId}
                  key={speaker.deviceId + speaker.label}
                >
                  {speaker.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <DisableCameraButton
            cameraIsDisabled={cameraIsDisabled}
            onCameraDisable={(disabled) => {
              setCameraIsDisabled(disabled);
              onCameraDisable(disabled);
            }}
          />
          <Select value={cameraId} onValueChange={onCameraChange}>
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
