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

export function MediaBar() {
  const [selectedMicrophone, setSelectedMicrophone] = useState("");
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    async function getMicrophones() {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((device) => device.kind === "audioinput");
      const speakers = devices.filter(
        (device) => device.kind === "audiooutput"
      );
      setMicrophones(mics);
      setSpeakers(speakers);
    }

    getMicrophones();
  }, []);

  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <MicIcon />
          <Select
            onValueChange={(micDeviceId) => setSelectedMicrophone(micDeviceId)}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select microphone" />
            </SelectTrigger>
            <SelectContent>
              {microphones.map((microphone) => (
                <>
                  <SelectItem value={microphone.deviceId}>
                    {microphone.label}
                  </SelectItem>
                </>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <SpeakerIcon />
          <Select
            onValueChange={(micDeviceId) => setSelectedSpeaker(micDeviceId)}
          >
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Select speaker" />
            </SelectTrigger>
            <SelectContent>
              {speakers.map((speaker) => (
                <>
                  <SelectItem value={speaker.deviceId}>
                    {speaker.label}
                  </SelectItem>
                </>
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
