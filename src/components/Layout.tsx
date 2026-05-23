import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import UpdateBanner from "./UpdateBanner";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <UpdateBanner />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#121212] m-2 ml-0 rounded-lg">
          <div className="max-w-6xl mx-auto px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
