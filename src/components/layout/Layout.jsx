// Shared page shell that keeps the navbar above the active route.
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function Layout() {
  return (
    <>
      {/* The outlet renders the matching child route. */}
      <Navbar />
      <Outlet />
    </>
  );
}
