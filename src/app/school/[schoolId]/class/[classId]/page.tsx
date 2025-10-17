import ClassBirthdayList from "@/components/ClassBirthdayList";

interface ClassPageProps {
  params: {
    schoolId: string;
    classId: string;
  };
}

export default function ClassPage({ params }: ClassPageProps) {
  return (
    <div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light">
      <ClassBirthdayList schoolId={params.schoolId} classId={params.classId} />
    </div>
  );
}
