"use client";
import { redirect } from "next/navigation";
import { useAuth } from "../Auth";
import Navbar from "../components/Navbar";

export default function PrivateLayout({ children }) {
  const [isLogin] = useAuth();

  if (!isLogin) {
    redirect("/");
  }

  return (
    <div>
      <Navbar>{children}</Navbar>
    </div>
  );
}
