import Layout from "./layout";
import Image from "next/image";
export default function DashboardPage() {
  return (
   
      <div className="text-center mt-20">
        <h1 className="text-5xl font-cairo ">عشّاب السلطان</h1>
        <p className="text-5xl mt-2 font-cairo">
          مرحبًا بك في نظام إدارة محل{" "}
          <span className="text-green-600 font-semibold">عشّاب السلطان</span>
        </p>
        <div className="mt-8 flex justify-center">
          <Image
            src="/assets/photo1.png"
            alt="photoIcon"
            width={784}
            height={340}
          />
        </div>
      </div>
    
  );
}
