import {
  MicIcon,
  MuteIcon,
  PhoneIcon,
  SpeakerIcon,
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
  micId,
  onMicChange,
  onMicMuteChange,
  isMuted,
}: {
  speakerId: string;
  onSpeakerChange: (speakerId: string) => void;
  micId: string;
  onMicChange: (micId: string) => void;
  onMicMuteChange: (isMuted: boolean) => void;
  isMuted: boolean;
}) {
  const navigate = useNavigate();
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function initMediaDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      setMicrophones(mics);
      setSpeakers(speakers);
    }

    initMediaDevices();
  }, []);

  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MicIcon />
          <Select onValueChange={onMicChange} value={micId}>
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
      </div>
      <div className="flex items-center gap-4">
        <MuteButton isMuted={isMuted} onMicMuteChange={onMicMuteChange} />
        <Button variant="ghost" size="icon">
          <VideoIcon className="w-6 h-6" />
        </Button>
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
