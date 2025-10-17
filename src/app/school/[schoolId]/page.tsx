import ClassSelector from "@/components/ClassSelector";

interface SchoolPageProps {
  params: {
    schoolId: string;
  };
}

export default function SchoolPage({ params }: SchoolPageProps) {
  return (
    <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light">
      <ClassSelector schoolId={params.schoolId} />
    </div>
  );
}
