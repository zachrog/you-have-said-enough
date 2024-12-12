import ReactDOM from "react-dom/client";
import { HomePage } from "./pages/HomePage";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomPage } from "@/pages/RoomPage.tsx";
import { PostHogProvider } from "posthog-js/react";
import { PostHogConfig } from 'posthog-js';

const options: Partial<PostHogConfig> = {
  api_host: import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_HOST,
  autocapture: false,
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "room/:roomId",
    element: <RoomPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <PostHogProvider
    apiKey={import.meta.env.VITE_REACT_APP_PUBLIC_POSTHOG_KEY}
    options={options}
  >
    <RouterProvider router={router} />
  </PostHogProvider>
  // </React.StrictMode>,
);
