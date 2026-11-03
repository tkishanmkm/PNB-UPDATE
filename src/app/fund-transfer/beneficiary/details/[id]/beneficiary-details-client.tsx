
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/hooks/use-app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Trash2, Landmark } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { RupeeIcon } from '@/components/rupee-icon';

const DetailRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className="flex items-start justify-between gap-4 py-3">
        <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
        <span className="min-w-0 max-w-[68%] break-all text-right text-sm font-semibold">{value?.trim() || '-'}</span>
    </div>
);

export default function BeneficiaryDetailsClient({ payeeId }: { payeeId: string }) {
    const router = useRouter();
    const { state, dispatch } = useAppContext();
    const { toast } = useToast();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editValues, setEditValues] = useState({ name: '', nickname: '', bank: '', accountNumber: '', ifsc: '' });
    const payee = state.payees.find(p => p.id === payeeId);

    if (!payee) {
        return (
            <div className="p-4">
                <p>Beneficiary not found.</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }
    
    const lastTransaction = state.transactions
        .filter(t => t.payeeId === payee.id && t.type === 'debit')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    const handleOpenEdit = () => {
        setEditValues({
            name: payee.name || '',
            nickname: payee.nickname || '',
            bank: payee.bank || '',
            accountNumber: payee.accountNumber || '',
            ifsc: payee.ifsc || '',
        });
    };

    const handleSaveEdit = () => {
        const name = editValues.name.trim();
        const bank = editValues.bank.trim();
        const accountNumber = editValues.accountNumber.trim();
        const ifsc = editValues.ifsc.trim().toUpperCase();

        if (!name || !bank || !accountNumber || !ifsc) {
            toast({ variant: 'destructive', title: 'Missing details', description: 'Enter the beneficiary name, bank, account number and IFSC.' });
            return;
        }
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)) {
            toast({ variant: 'destructive', title: 'Invalid IFSC', description: 'Enter a valid 11-character IFSC code.' });
            return;
        }

        const updatedPayee = { ...payee, name, nickname: editValues.nickname.trim(), bank, accountNumber, ifsc };
        dispatch({ type: 'UPDATE_PAYEES', payload: state.payees.map(item => item.id === payee.id ? updatedPayee : item) });
        setIsEditOpen(false);
        toast({ title: 'Beneficiary updated', description: 'The saved beneficiary details have been updated.' });
    };

    const handleDelete = () => {
        if (!window.confirm(`Delete beneficiary “${payee.nickname || payee.name}”?`)) return;
        dispatch({ type: 'DELETE_PAYEE', payload: { id: payeeId }});
        router.push('/fund-transfer/beneficiary/list');
    };

    const handleSendMoney = () => {
        dispatch({ type: 'SET_TRANSFER_DETAILS', payload: { payeeId: payee.id } });
        router.push(`/fund-transfer/to-beneficiary/${payee.id}`);
    }
    
    const getViewReceiptUrl = (tx: Transaction) => {
         const queryParams = new URLSearchParams({
            payeeId: tx.payeeId!,
            amount: Math.abs(tx.amount).toString(),
            remarks: tx.remarks || '',
            transferDate: tx.date,
            referenceId: tx.id,
            rrn: tx.reference || ''
        }).toString();
        return `/fund-transfer/success?${queryParams}`;
    }

    return (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
            <header className="pnb-page-header bg-primary text-primary-foreground p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
                <button type="button" onClick={() => router.back()} aria-label="Go back" className="shrink-0">
                    <ArrowLeft className="h-6 w-6 text-accent" />
                </button>
                <h1 className="min-w-0 flex-1 truncate px-2 text-center text-lg font-semibold">{payee.nickname || payee.name}</h1>
                <div className="flex shrink-0 items-center gap-3">
                    <DialogTrigger asChild>
                        <button type="button" onClick={handleOpenEdit} aria-label="Edit beneficiary" className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                            <Edit className="h-5 w-5 text-accent" />
                        </button>
                    </DialogTrigger>
                    <button type="button" onClick={handleDelete} aria-label="Delete beneficiary" className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <Trash2 className="h-5 w-5 text-accent" />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-4 overflow-y-auto pb-24">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                             <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                               <Landmark className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{payee.name}</p>
                                {payee.nickname && <p className="text-sm text-muted-foreground">{payee.nickname}</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Beneficiary Details</CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y">
                        <DetailRow label="Account Number" value={payee.accountNumber} />
                        <DetailRow label="Bank Name" value={payee.bank} />
                        <DetailRow label="IFSC Code" value={payee.ifsc} />
                    </CardContent>
                </Card>
                
                {lastTransaction && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Last Transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-lg text-primary flex items-center tracking-tighter">
                                        <RupeeIcon className="h-4 w-4 mr-0.5" />
                                        {formatCurrency(Math.abs(lastTransaction.amount))}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(lastTransaction.date), "dd MMM yyyy, h:mm a")}</p>
                                </div>
                                <Link href={getViewReceiptUrl(lastTransaction)}>
                                    <Button variant="link">View Receipt</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </main>
            
             <footer className="p-4 border-t bg-background fixed bottom-0 z-10 w-full max-w-md mx-auto">
                <Button className="w-full" size="lg" onClick={handleSendMoney}>
                    Send Money
                </Button>
            </footer>
        </div>
        <DialogContent className="max-h-[85dvh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Edit Beneficiary</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="edit-payee-name">Payee Name</Label>
                    <Input id="edit-payee-name" value={editValues.name} onChange={event => setEditValues(current => ({ ...current, name: event.target.value }))} maxLength={70} autoComplete="name" />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="edit-payee-nickname">Nickname (Optional)</Label>
                    <Input id="edit-payee-nickname" value={editValues.nickname} onChange={event => setEditValues(current => ({ ...current, nickname: event.target.value }))} maxLength={40} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="edit-payee-bank">Bank Name</Label>
                    <Input id="edit-payee-bank" value={editValues.bank} onChange={event => setEditValues(current => ({ ...current, bank: event.target.value }))} maxLength={70} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="edit-payee-account">Account Number</Label>
                    <Input id="edit-payee-account" value={editValues.accountNumber} onChange={event => setEditValues(current => ({ ...current, accountNumber: event.target.value.replace(/\s/g, '') }))} inputMode="numeric" autoComplete="off" maxLength={24} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="edit-payee-ifsc">IFSC Code</Label>
                    <Input id="edit-payee-ifsc" value={editValues.ifsc} onChange={event => setEditValues(current => ({ ...current, ifsc: event.target.value.toUpperCase().slice(0, 11) }))} autoCapitalize="characters" maxLength={11} />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleSaveEdit}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
}
