"use client";
import PaymentForm from "@/components/PaymentForm";
import PaymentDashboard from "@/components/PaymentDashboard";

export default function Home() {
  return (
    <div className='flex flex-col w-full p-6 gap-6'>
      {/* Top row with payment form and summary cards */}
      <div className='flex flex-col lg:flex-row w-full gap-6'>
        <div className='w-full lg:w-1/3'>
          <PaymentForm />
        </div>
        <div className='w-full lg:w-2/3'>
          <PaymentDashboard showTablesOnly={false} />
        </div>
      </div>

      {/* Bottom row with full-width transaction tables */}
      <div className='w-full'>
        <PaymentDashboard showTablesOnly={true} />
      </div>
    </div>
  );
}
