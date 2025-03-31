"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ArrowDownUp, DollarSign, IndianRupee, Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Payment {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Payout {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface PaymentDashboardProps {
  showTablesOnly?: boolean;
}

export default function PaymentDashboard({
  showTablesOnly = false
}: PaymentDashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Create a fetchData function that can be called multiple times
  const fetchData = useCallback(async () => {
    try {
      const paymentsResponse = await axios.get<Payment[]>(
        "http://localhost:3001/api/payments"
      );
      const payoutsResponse = await axios.get<Payout[]>(
        "http://localhost:3002/api/payouts"
      );

      setPayments(paymentsResponse.data);
      setPayouts(payoutsResponse.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up polling
  useEffect(() => {
    // Poll every 3 seconds for data updates - Make this configurable, 3 seconds is just for testing - not feasible for production
    const pollingInterval = setInterval(() => {
      fetchData();
    }, 3000);

    // Clean up on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [fetchData]);

  const allTransactions = [...payments, ...payouts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPayouts = payouts.reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return (
          <Badge className='bg-emerald-500 hover:bg-emerald-600'>
            Succeeded
          </Badge>
        );
      case "processed":
        return (
          <Badge className='bg-blue-500 hover:bg-blue-600'>Processed</Badge>
        );
      case "pending":
        return (
          <Badge variant='outline' className='text-amber-500 border-amber-500'>
            Pending
          </Badge>
        );
      case "failed":
        return <Badge variant='destructive'>Failed</Badge>;
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  const trimPaymentId = (id: string) => {
    return id.slice(0, 4) + "..." + id.slice(-4);
  };

  if (loading) {
    return (
      <div className='flex h-[200px] w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  // Summary section (only shown when showTablesOnly is false)
  if (!showTablesOnly) {
    return (
      <div className='h-full'>
        <div className='mb-4'>
          <h2 className='text-3xl font-bold tracking-tight'>
            Payments & Payouts
          </h2>
          <p className='text-muted-foreground'>
            Monitor your transaction activity
            <span className='ml-2 text-xs opacity-70'>
              (Last updated: {lastUpdated.toLocaleTimeString()})
            </span>
          </p>
        </div>

        <div className='grid gap-4 grid-cols-1 sm:grid-cols-2'>
          <Card className='shadow-md'>
            <CardHeader className='rounded-t-lg'>
              <CardTitle className='flex items-center justify-between'>
                <span>Total USD Payments</span>
                <DollarSign className='h-5 w-5 text-green-600' />
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='text-3xl font-bold'>
                ${totalPayments.toFixed(2)}
              </div>
              <p className='text-sm text-muted-foreground mt-2'>
                {payments.length} transaction{payments.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card className='shadow-md'>
            <CardHeader className='rounded-t-lg'>
              <CardTitle className='flex items-center justify-between'>
                <span>Total INR Payouts</span>
                <IndianRupee className='h-5 w-5 text-blue-600' />
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='text-3xl font-bold'>
                ₹{totalPayouts.toFixed(2)}
              </div>
              <p className='text-sm text-muted-foreground mt-2'>
                {payouts.length} transaction{payouts.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Tables section
  return (
    <Card className='shadow-md'>
      <CardHeader className='-pb-4 h-fit'>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View and manage all your payment and payout transactions
          <span className='ml-2 text-xs opacity-70'>
            (Auto-refreshing, last updated: {lastUpdated.toLocaleTimeString()})
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className='p-0'>
        <Tabs defaultValue='all' className='w-full'>
          <div className='px-6 pt-2 border-b'>
            <TabsList className='w-full sm:w-auto grid grid-cols-3 sm:inline-flex mb-2'>
              <TabsTrigger value='all'>All Transactions</TabsTrigger>
              <TabsTrigger value='payments'>Payments</TabsTrigger>
              <TabsTrigger value='payouts'>Payouts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='all' className='m-0'>
            <div className='h-[400px] overflow-auto'>
              <Table>
                <TableHeader className='sticky top-0 z-10 bg-background'>
                  <TableRow>
                    <TableHead className='w-[200px]'>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.paymentId}
                      className='bg-background hover:bg-muted/20'
                    >
                      <TableCell className='font-mono text-xs'>
                        {trimPaymentId(transaction.paymentId)}
                      </TableCell>
                      <TableCell>
                        {transaction.currency === "USD" ? (
                          <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4 text-green-600' />
                            <span>Payment</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <IndianRupee className='h-4 w-4 text-blue-600' />
                            <span>Payout</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.currency === "USD" ? "$" : "₹"}
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='payments' className='m-0'>
            <div className='h-[400px] overflow-auto'>
              <Table>
                <TableHeader className='sticky top-0 z-10 bg-background'>
                  <TableRow>
                    <TableHead className='w-[200px]'>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow
                      key={payment.paymentId}
                      className='bg-background hover:bg-muted/20'
                    >
                      <TableCell className='font-mono text-xs'>
                        {trimPaymentId(payment.paymentId)}
                      </TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {new Date(payment.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value='payouts' className='m-0'>
            <div className='h-[400px] overflow-auto'>
              <Table>
                <TableHeader className='sticky top-0 z-10 bg-background'>
                  <TableRow>
                    <TableHead className='w-[200px]'>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow
                      key={payout.paymentId}
                      className='bg-background hover:bg-muted/20'
                    >
                      <TableCell className='font-mono text-xs'>
                        {trimPaymentId(payout.paymentId)}
                      </TableCell>
                      <TableCell>₹{payout.amount.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {new Date(payout.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
