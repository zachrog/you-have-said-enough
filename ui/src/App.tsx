import { RightArrowIcon } from "@/components/icons/icons";
import { Input } from "@/components/ui/input";

function App() {
  return (
    <>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center justify-center">
            <h1 className="text-9xl">Zuumb</h1>
          </div>
          <div className="w-full max-w-[600px] rounded-full border-white border-2 antialiased">
            <form className="flex items-center rounded-full bg-background px-4 py-2 shadow-sm">
              <Input
                type="text"
                placeholder="Join or Create Room"
                className="flex-1 border-none bg-transparent focus-visible:ring-transparent"
              />
              <RightArrowIcon className="h-6 w-6" />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
