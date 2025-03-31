"use client";

import { useState, type FormEvent, useEffect } from "react";
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
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

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
          currency: "USD"
        },
        {
          headers: { "Idempotency-Key": idempotencyKey }
        }
      );

      setPaymentId(response.data.paymentId);
      setPaymentStatus(response.data.status);
      setSuccess(true);

      // Start polling for payment status
      startPollingPaymentStatus(response.data.paymentId);
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

  const startPollingPaymentStatus = (id: string) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    // Poll every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/payments/${id}`
        );

        setPaymentStatus(response.data.status);

        // If payment is "succeeded", check for payout
        if (response.data.status === "succeeded") {
          // Check if there's a payout for this payment
          const payoutsResponse = await axios.get(
            "http://localhost:3002/api/payouts"
          );

          const matchingPayout = payoutsResponse.data.find(
            (payout: any) => payout.paymentId === id
          );

          if (matchingPayout) {
            setPaymentStatus(
              `Payment succeeded, payout ${matchingPayout.status}`
            );

            // If payout is processed, we can stop polling
            if (
              matchingPayout.status === "processed" ||
              matchingPayout.status === "succeeded"
            ) {
              clearInterval(interval);
              setPollingInterval(null);
            }
          }
        }
      } catch (error) {
        console.error("Error polling payment status:", error);
      }
    }, 2000);

    setPollingInterval(interval);
  };

  // Get a status message based on the current payment status
  const getStatusMessage = () => {
    if (!paymentStatus) return "Your payment is being processed";

    switch (paymentStatus) {
      case "processing":
        return "Your payment is being processed";
      case "succeeded":
        return "Your payment has succeeded and is awaiting payout";
      default:
        if (paymentStatus.includes("payout")) {
          return paymentStatus;
        }
        return `Payment status: ${paymentStatus}`;
    }
  };

  return (
    <Card className='h-full shadow-md'>
      <CardHeader className='rounded-t-lg'>
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          Process a USD payment that will be converted to INR for payout
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
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
                  className='pl-7 bg-background'
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

            <Button
              type='submit'
              className='w-full cursor-pointer'
              disabled={loading}
            >
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
                {getStatusMessage()}
              </AlertDescription>
            </Alert>

            <div className='rounded-md bg-background p-4'>
              <div className='text-sm font-medium'>Payment ID</div>
              <div className='mt-1 font-mono text-xs'>{paymentId}</div>
              <div className='mt-2 text-sm font-medium'>Status</div>
              <div className='mt-1 text-xs'>
                {paymentStatus || "Processing..."}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {success && (
        <CardFooter className='bg-muted/40 rounded-b-lg'>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => {
              setSuccess(false);
              setAmount("");
              setPaymentId(null);
              setPaymentStatus(null);
              setError(null);

              // Clear polling interval
              if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
              }
            }}
          >
            Make Another Payment
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
