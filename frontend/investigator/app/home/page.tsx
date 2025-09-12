import TopNavBar from "@/components/top-nav-bar";

export default function HomePage() {
  return (
    <div>
      <TopNavBar />
      <main className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <h1 className="text-3xl font-bold">
          Welcome!
        </h1>
      </main>
    </div>
  );
}