"use client"

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Profile() {
 const router =useRouter()

const onLogout = async () => {
  try {
    await axios.post("/api/auth/logout");

    router.push("/login");
  } catch (error: any) {
    console.log("Logout failed:", error.message);
  }
};
  return (
    <div className="min-h-screen bg-[#111111] text-white">

    
      <nav className="flex items-center justify-between px-8 py-5">
        <h1 className="text-xl font-bold">
          John Doe
        </h1>

        <button
        onClick={onLogout}
          type="button"
          className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

 
      <main className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Welcome to your profile
          </h2>

          <p className="mt-3 text-gray-400">
            Your profile information will appear here.
          </p>
        </div>
      </main>

    </div>
  );
}