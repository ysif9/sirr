"use client";

import TopNavBar from "@/components/top-nav-bar";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  const welcomeMessage = user?.firstName
    ? `Welcome, ${user.firstName}!`
    : "Welcome!";

  return (
    <div>
      <TopNavBar />
      <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-3xl font-bold">
          {isLoading ? "Loading..." : welcomeMessage}
        </h1>
      </main>
    </div>
  );
}