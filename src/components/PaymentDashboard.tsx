"use client";

import { useState, useEffect } from "react";
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
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export default function PaymentDashboard() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real app, you'd fetch actual data from your API
        const paymentsResponse = await axios.get<Payment[]>(
          "http://localhost:3001/api/payments"
        );
        const payoutsResponse = await axios.get<Payout[]>(
          "http://localhost:3002/api/payouts"
        );

        setPayments(paymentsResponse.data);
        setPayouts(payoutsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // // For demo purposes, let's add mock data if API is not available
    // // This would be removed in a real implementation
    // if (process.env.NODE_ENV === "development") {
    //   setPayments([
    //     {
    //       id: "pay_123",
    //       amount: 100,
    //       currency: "USD",
    //       status: "succeeded",
    //       createdAt: new Date().toISOString()
    //     },
    //     {
    //       id: "pay_124",
    //       amount: 250,
    //       currency: "USD",
    //       status: "succeeded",
    //       createdAt: new Date().toISOString()
    //     }
    //   ]);

    //   setPayouts([
    //     {
    //       id: "pout_123",
    //       amount: 8325,
    //       currency: "INR",
    //       status: "processed",
    //       createdAt: new Date().toISOString()
    //     },
    //     {
    //       id: "pout_124",
    //       amount: 20812.5,
    //       currency: "INR",
    //       status: "processed",
    //       createdAt: new Date().toISOString()
    //     }
    //   ]);

    //   setLoading(false);
    // }
  }, []);

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

  if (loading) {
    return (
      <div className='flex h-[50vh] w-full items-center justify-center'>
        <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Payments & Payouts
        </h2>
        <p className='text-muted-foreground'>
          Monitor your transaction activity
        </p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total USD Payments
            </CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              ${totalPayments.toFixed(2)}
            </div>
            <p className='text-xs text-muted-foreground'>
              {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Total INR Payouts
            </CardTitle>
            <IndianRupee className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>₹{totalPayouts.toFixed(2)}</div>
            <p className='text-xs text-muted-foreground'>
              {payouts.length} transaction{payouts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue='all' className='w-full'>
        <TabsList>
          <TabsTrigger value='all'>All Transactions</TabsTrigger>
          <TabsTrigger value='payments'>Payments</TabsTrigger>
          <TabsTrigger value='payouts'>Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value='all' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                A list of all your recent payment and payout transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className='font-mono text-xs'>
                        {transaction.id}
                      </TableCell>
                      <TableCell>
                        {transaction.currency === "USD" ? (
                          <div className='flex items-center gap-2'>
                            <DollarSign className='h-4 w-4' />
                            <span>Payment</span>
                          </div>
                        ) : (
                          <div className='flex items-center gap-2'>
                            <IndianRupee className='h-4 w-4' />
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='payments' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                A list of all your USD payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className='font-mono text-xs'>
                        {payment.id}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='payouts' className='mt-6'>
          <Card>
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
              <CardDescription>
                A list of all your INR payout transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='hidden md:table-cell'>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell className='font-mono text-xs'>
                        {payout.id}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
