import { GitHubIcon, InfoIcon, RightArrowIcon } from "@/components/icons/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const [roomId, setRoomId] = useState("");
  const [titleScale, setTitleScale] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    let lastDirectionChange = 0;
    let direction = 1;
    const interval = setInterval(() => {
      const timeSinceLastChange = performance.now() - lastDirectionChange;
      if (timeSinceLastChange > 150) {
        direction = Math.random() < 0.5 ? -1 : 1;
        lastDirectionChange = performance.now();
      }

      setTitleScale((old) => {
        let newScale = old + direction * 0.003;
        newScale = Math.min(1, newScale);
        newScale = Math.max(0.3, newScale);
        return newScale;
      });
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center justify-center">
            <h1
              className="text-9xl"
              style={{ transform: `scale(${titleScale})` }}
            >
              Zuumb
            </h1>
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
              <Button
                className=""
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/room/${roomId}`);
                }}
              >
                <RightArrowIcon className="h-6 w-6" />
              </Button>
            </form>
          </div>
        </div>
        <CreatorInfo />
      </div>
    </>
  );
}

function CreatorInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <InfoIcon className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>About This Website</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              We are just two developers who have been in enough video
              conference meetings to know that sometimes you should just shut
              up. All we wanted to do was make something fun. If you are an
              engineer or maker we hope you take some time to go make someting
              fun and remember why you started doing this in the first place.
              <br />
              <br />
              This whole project is open source so feel free to look at what we
              threw together or copy it and make your own. Remember the goal was
              fun, not pristine code.
            </p>
            <h3 className="text-lg font-semibold mb-2">Creators</h3>
            <div className="space-y-2">
              <CreatorLink name="Zachary Rogers" github="zachrog" />
              <CreatorLink name="Nathan Fronk" github="ncfronk" />
            </div>
            <div className="py-2"></div>
            <h3 className="text-lg font-semibold mb-2">Checkout the Repo</h3>
            <a
              href="https://github.com/zachrog/you-have-said-enough/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-sm hover:underline"
            >
              <GitHubIcon className="w-6 h-6" />
              <span>Zuumb</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CreatorLink({ name, github }: { name: string; github: string }) {
  return (
    <a
      href={`https://github.com/${github}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-2 text-sm hover:underline"
    >
      <GitHubIcon className="w-6 h-6" />
      <span>{name}</span>
    </a>
  );
}
