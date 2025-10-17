import BirthdayListFirebase from "@/components/BirthdayListFirebase";

export default function Home() {
	return (
		<div className="min-h-screen bg-cyan-100/80 bg-[url(/img/balloon-clear.png)] bg-contain bg-repeat bg-blend-soft-light ">
			{/* bg-gradient-to-br from-pink-100 to-blue-100 */}
			<BirthdayListFirebase />
		</div>
	);
}
