import SchoolSelector from "@/components/SchoolSelector";

export default function Home() {
  return (
    <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light">
      {/* bg-gradient-to-br from-pink-100 to-blue-100 */}
      <div className="px-2 py-6">
        <SchoolSelector />
      </div>
    </div>
  );
}
