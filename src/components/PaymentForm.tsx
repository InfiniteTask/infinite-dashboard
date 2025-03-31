"use client";

import { useState, type FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Check, CreditCard, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PaymentResponse {
  paymentId: string;
  status: string;
}

export default function PaymentForm() {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Generate idempotency key for this request
      const idempotencyKey = uuidv4();

      const response = await axios.post<PaymentResponse>(
        "http://localhost:3001/api/payments",
        {
          amount: Number.parseFloat(amount),
          currency: "USD",
          customerId: "cust_123"
        },
        {
          headers: { "Idempotency-Key": idempotencyKey }
        }
      );

      setPaymentId(response.data.paymentId);
      setSuccess(true);

      // Poll for payment status
      pollPaymentStatus(response.data.paymentId);
    } catch (err) {
      console.log(err, "err in payment form");
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || "Payment failed");
      } else {
        setError("Payment failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (id: string): Promise<void> => {
    // Implementation for polling payment status
    console.log(`Polling status for payment ${id}`);
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          Process a USD payment that will be converted to INR for payout
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!success ? (
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='amount'>Amount (USD)</Label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <span className='text-muted-foreground'>$</span>
                </div>
                <Input
                  id='amount'
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min='1'
                  step='0.01'
                  required
                  placeholder='0.00'
                  className='pl-7'
                />
              </div>
            </div>

            {error && (
              <Alert variant='destructive'>
                <AlertCircle className='h-4 w-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type='submit' className='w-full' disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className='mr-2 h-4 w-4' />
                  Pay Now
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className='space-y-4'>
            <Alert className='bg-emerald-50 text-emerald-900 border-emerald-200'>
              <Check className='h-4 w-4 text-emerald-600' />
              <AlertTitle className='text-emerald-800'>
                Payment Initiated
              </AlertTitle>
              <AlertDescription className='text-emerald-700'>
                Your payment is being processed and will be converted to INR for
                payout.
              </AlertDescription>
            </Alert>

            <div className='rounded-md bg-muted p-4'>
              <div className='text-sm font-medium'>Payment ID</div>
              <div className='mt-1 font-mono text-xs'>{paymentId}</div>
            </div>
          </div>
        )}
      </CardContent>
      {success && (
        <CardFooter>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => {
              setSuccess(false);
              setAmount("");
              setPaymentId(null);
              setError(null);
            }}
          >
            Make Another Payment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
