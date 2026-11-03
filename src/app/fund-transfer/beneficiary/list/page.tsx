
"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Search, Plus, ArrowLeft, Home, Landmark, ChevronRight } from 'lucide-react';
import Link from 'next/link';

import { useAppContext } from '@/hooks/use-app-store';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Payee } from "@/lib/types";

export default function BeneficiaryListPage() {
    const { state, dispatch } = useAppContext();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const form = useForm<Payee>({
        defaultValues: { id: `payee-${Date.now()}`, name: "", nickname: "", accountNumber: "", bank: "", ifsc: "" },
    });

    const filteredPayees = useMemo(() => {
        if (!searchQuery) return state.payees;
        return state.payees.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.accountNumber.includes(searchQuery)
        );
    }, [state.payees, searchQuery]);

    const handleAddPayee = (values: Payee) => {
        const newPayee: Payee = {
            ...values,
            name: values.name.trim(),
            nickname: values.nickname?.trim() || "",
            bank: values.bank.trim(),
            accountNumber: values.accountNumber.trim(),
            ifsc: values.ifsc.trim().toUpperCase(),
            id: values.id || `payee-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        dispatch({ type: 'ADD_PAYEE', payload: newPayee });
        // Reset the form with a new unique ID for the next entry
        form.reset({ id: `payee-${Date.now()}`, name: "", nickname: "", accountNumber: "", bank: "", ifsc: "" });
        setIsAddDialogOpen(false);
    };
    
    return (
        <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
            <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                <button onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6 text-accent" />
                </button>
                <h1 className="text-xl font-semibold">Manage Beneficiaries</h1>
                <Link href="/dashboard">
                     <Home className="h-6 w-6 text-accent" />
                </Link>
            </header>

            <main className="flex-1 p-4 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input 
                        placeholder="Search all beneficiaries"
                        className="pl-10 bg-white"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                 <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full bg-white justify-start text-gray-700 font-normal">
                           <Plus className="mr-2 h-4 w-4"/> Add Beneficiary
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Payee</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleAddPayee)} className="space-y-4">
                                <FormField control={form.control} name="name" rules={{ required: "Payee name is required." }} render={({ field }) => (
                                    <FormItem><FormLabel>Payee Name</FormLabel><FormControl><Input placeholder="John Doe" autoComplete="name" maxLength={70} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="nickname" render={({ field }) => (
                                    <FormItem><FormLabel>Nickname (Optional)</FormLabel><FormControl><Input placeholder="e.g., Landlord" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="accountNumber" rules={{ required: "Account number is required.", pattern: { value: /^\d{6,24}$/, message: "Enter a valid numeric account number." } }} render={({ field }) => (
                                    <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Enter account number" inputMode="numeric" autoComplete="off" maxLength={24} {...field} onChange={event => field.onChange(event.target.value.replace(/\D/g, "").slice(0, 24))} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="bank" rules={{ required: "Bank name is required." }} render={({ field }) => (
                                    <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g., PNB Bank" maxLength={70} {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="ifsc" rules={{ required: "IFSC code is required.", pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: "Enter a valid 11-character IFSC code." } }} render={({ field }) => (
                                    <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="Enter 11-digit IFSC" autoCapitalize="characters" maxLength={11} {...field} onChange={event => field.onChange(event.target.value.toUpperCase().slice(0, 11))} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <Button type="submit">Add Payee</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                <div className="space-y-2">
                    {filteredPayees.length > 0 ? (
                        filteredPayees.map(payee => (
                           <Link
                                key={payee.id}
                                href={`/fund-transfer/beneficiary/details/${payee.id}`}
                                className="flex min-w-0 items-center gap-3 rounded-xl border border-rose-100 bg-white p-3 transition-colors hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50">
                                    <Landmark className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold">{payee.nickname || payee.name}</p>
                                    <p className="truncate text-xs text-gray-500">{payee.bank || 'Bank'} ····{payee.accountNumber.slice(-4)}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
                            </Link>
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500">No payees found.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
