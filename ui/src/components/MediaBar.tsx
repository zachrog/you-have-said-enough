import {
  MicIcon,
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

export function MediaBar({
  speakerId,
  setSpeakerId,
}: {
  speakerId: string;
  setSpeakerId: (speakerId: string) => void;
}) {
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function initMediaDevices() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      setSelectedMicrophone(mics[0].deviceId);
      setSpeakerId(speakers[0].deviceId);
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
          <Select
            onValueChange={(micDeviceId) => setSelectedMicrophone(micDeviceId)}
            value={selectedMicrophone}
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
          <Select value={speakerId} onValueChange={(id) => setSpeakerId(id)}>
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
        <Button variant="ghost" size="icon">
          <MicIcon className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <VideoIcon className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon">
          <PhoneIcon className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
