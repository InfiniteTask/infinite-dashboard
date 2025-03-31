"use client";
import PaymentForm from "@/components/PaymentForm";
import PaymentDashboard from "@/components/PaymentDashboard";

export default function Home() {
  return (
    <div className='flex flex-row items-start justify-around h-screen w-full p-10'>
      <PaymentForm />
      <PaymentDashboard />
    </div>
  );
}
