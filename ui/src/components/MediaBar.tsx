import { MicIcon, PhoneIcon, VideoIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function MediaBar() {
  return (
    <div className="bg-background border-t flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-4">
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select microphone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mic1">Microphone 1</SelectItem>
            <SelectItem value="mic2">Microphone 2</SelectItem>
            <SelectItem value="mic3">Microphone 3</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select speaker" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="speaker1">Speaker 1</SelectItem>
            <SelectItem value="speaker2">Speaker 2</SelectItem>
            <SelectItem value="speaker3">Speaker 3</SelectItem>
          </SelectContent>
        </Select>
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
