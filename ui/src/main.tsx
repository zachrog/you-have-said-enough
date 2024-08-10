import ReactDOM from "react-dom/client";
import { HomePage } from "./pages/HomePage";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { RoomPage } from "@/pages/RoomPage.tsx";

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
  <RouterProvider router={router} />
  // </React.StrictMode>,
);
