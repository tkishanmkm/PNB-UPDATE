
"use client";

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/hooks/use-app-store';
import { Button } from '@/components/ui/button';
import { Check, Download, Landmark } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { RupeeIcon } from '@/components/rupee-icon';
import jsPDF from 'jspdf';

import * as numberToWords from 'number-to-words';

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex w-full justify-between items-start gap-2 py-1.5">
        <span className="shrink-0 text-left text-xs text-gray-500">{label}</span>
        <div className="min-w-0 flex-1 text-right text-xs">{children}</div>
    </div>
);

function TransferSuccess() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { state, dispatch } = useAppContext();
    const referenceId = searchParams.get('referenceId');
    const requestedPayeeId = searchParams.get('payeeId');
    const transferTransaction = referenceId
        ? state.transactions.find(transaction =>
            transaction.id === referenceId &&
            transaction.type === 'debit' &&
            transaction.category === 'Transfer' &&
            transaction.payeeId === requestedPayeeId
        )
        : undefined;

    const payee = transferTransaction
        ? state.payees.find(item => item.id === transferTransaction.payeeId)
        : undefined;
    const account = transferTransaction
        ? state.accounts.find(item => item.id === transferTransaction.accountId)
        : undefined;
    const { settings, user, currentTransfer } = state;
    const displayReferenceId = transferTransaction?.id || '';
    const displayRrn = transferTransaction?.reference || '';
    const rrnNumber = displayRrn.split('/')[1] || displayRrn;
    const amount = transferTransaction ? Math.abs(transferTransaction.amount) : 0;
    const chargeTransaction = referenceId
        ? state.transactions.find(transaction => transaction.id === `${referenceId}-CHG` && transaction.category === 'Bank Charges')
        : undefined;
    const chargeAmount = chargeTransaction ? Math.abs(chargeTransaction.amount) : 0;
    const totalDebitAmount = amount + chargeAmount;
    const amountInWords = numberToWords.toWords(amount).replace(/\b\w/g, (l: string) => l.toUpperCase()) + ' Only';
    const formattedAmountWithCommas = amount.toLocaleString('en-IN', { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const transferDate = transferTransaction ? new Date(transferTransaction.date) : new Date(NaN);
    const remarks = transferTransaction?.remarks || '';
    const transferMode = transferTransaction?.description.split('-IN/')[0] || 'Transfer';

    // A receipt is read-only. Clear only the matching completed transfer draft;
    // never create a debit or charge while opening or refreshing this route.
    useEffect(() => {
        if (referenceId && currentTransfer.transferId === referenceId) {
            dispatch({ type: 'CLEAR_TRANSFER' });
        }
    }, [referenceId, currentTransfer.transferId, dispatch]);

    if (!transferTransaction || !payee || !account || !Number.isFinite(transferDate.getTime())) {
        return (
            <div className="pnb-page flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-base font-semibold text-gray-800">Receipt not found</p>
                <p className="text-sm text-gray-500">This receipt does not match a completed transfer stored in this app.</p>
                <Link href="/fund-transfer" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Back to Fund Transfer</Link>
            </div>
        );
    }
    
    const handleShare = async () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 18;
        const right = pageWidth - margin;
        const contentWidth = pageWidth - margin * 2;
        let y = 16;

        // Keep the application logo's true aspect ratio instead of stretching it.
        if (settings.appLogo) {
            try {
                const logoInfo = doc.getImageProperties(settings.appLogo);
                const maxWidth = 42;
                const maxHeight = 18;
                const scale = Math.min(maxWidth / logoInfo.width, maxHeight / logoInfo.height);
                const logoWidth = logoInfo.width * scale;
                const logoHeight = logoInfo.height * scale;
                doc.addImage(settings.appLogo, logoInfo.fileType, (pageWidth - logoWidth) / 2, y, logoWidth, logoHeight, undefined, 'FAST');
                y += logoHeight + 7;
            } catch (error) {
                console.warn('Receipt logo could not be embedded; continuing without logo.', error);
                y += 6;
            }
        } else {
            y += 5;
        }

        doc.setTextColor(25, 65, 112);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(19);
        doc.text('Payment Successful', pageWidth / 2, y, { align: 'center' });
        y += 7;

        doc.setTextColor(90, 98, 108);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const referenceText = `Transaction reference: ${displayReferenceId}\nRRN: ${(displayRrn.split('/')[1] || displayRrn)}`;
        const referenceLines = doc.splitTextToSize(referenceText, contentWidth - 8);
        doc.text(referenceLines, pageWidth / 2, y, { align: 'center' });
        y += referenceLines.length * 4.5 + 5;

        doc.setDrawColor(160, 170, 180);
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.line(margin, y, right, y);
        doc.setLineDashPattern([], 0);
        y += 8;

        const addSectionTitle = (title: string) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(25, 65, 112);
            doc.text(title, margin, y);
            y += 5;
        };

        const addRow = (label: string, value: string, bold = false) => {
            const labelWidth = 31;
            const valueWidth = contentWidth - labelWidth;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(100, 106, 114);
            doc.text(label, margin, y);
            doc.setFont('helvetica', bold ? 'bold' : 'normal');
            doc.setTextColor(35, 40, 46);
            const lines = doc.splitTextToSize(value || '-', valueWidth);
            doc.text(lines, right, y, { align: 'right' });
            y += Math.max(6, lines.length * 4.6) + 1.5;
        };

        addSectionTitle('FROM');
        addRow('Account holder', user.name, true);
        // Account number label on the left; app logo immediately before the full number on the right.
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(100, 106, 114);
        doc.text('Account number', margin, y);
        const senderNumber = String(account.accountNumber || '-');
        const senderNumberWidth = doc.getTextWidth(senderNumber);
        let senderNumberX = right;
        if (settings.appLogo) {
            try {
                const logoInfo = doc.getImageProperties(settings.appLogo);
                const logoHeight = 4;
                const logoWidth = Math.min(logoHeight * (logoInfo.width / logoInfo.height), 10);
                senderNumberX = right - senderNumberWidth - 2;
                doc.addImage(settings.appLogo, logoInfo.fileType, senderNumberX - logoWidth - 0.4, y - 3.2, logoWidth, logoHeight, undefined, 'FAST');
            } catch (error) { console.warn('Could not add app logo to receipt.', error); }
        }
        doc.setTextColor(35, 40, 46); doc.text(senderNumber, right, y, { align: 'right' });
        y += 7.5;

        y += 2;
        addSectionTitle('TO');
        addRow('Payee name', payee.name, true);
        // Payee label left; standard bank icon immediately before account number at right.
        const payeeAccount = String(payee.accountNumber || '-');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(100, 106, 114);
        doc.text('Payee account number', margin, y);
        // Add a compact bank mark before the payee account number in the receipt.
        doc.setTextColor(35, 40, 46);
        const bankMarkX = right - doc.getTextWidth(payeeAccount) - 5;
        doc.setDrawColor(120, 128, 138);
        doc.roundedRect(bankMarkX, y - 3, 3.6, 3, 0.5, 0.5, 'S');
        doc.line(bankMarkX + 1.2, y - 1.5, bankMarkX + 2.4, y - 1.5);
        doc.text(payeeAccount, right, y, { align: 'right' }); y += 7.5;
        addRow('IFSC code', String(payee.ifsc || '-').toUpperCase());

        y += 2;
        doc.setDrawColor(215, 220, 226);
        doc.line(margin, y, right, y);
        y += 7;
        addSectionTitle('TRANSFER DETAILS');

        // Preserve the original receipt typography while placing AMOUNT left and value right.
        const amountY = y;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 106, 114);
        doc.text('AMOUNT', margin, amountY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(35, 40, 46);
        const amountText = formattedAmountWithCommas;
        const amountWidth = doc.getTextWidth(amountText);
        const rupeeSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" width="320" height="512"><path fill="#23282e" d="M.0022 64C.0022 46.33 14.33 32 32 32H288C305.7 32 320 46.33 320 64C320 81.67 305.7 96 288 96H231.8C241.4 110.4 248.5 126.6 252.4 144H288C305.7 144 320 158.3 320 176C320 193.7 305.7 208 288 208H252.4C239.2 266.3 190.5 311.2 130.3 318.9L274.6 421.1C288.1 432.2 292.3 452.2 282 466.6C271.8 480.1 251.8 484.3 237.4 474L13.4 314C2.083 305.1-2.716 291.5 1.529 278.2C5.774 264.1 18.09 256 32 256H112C144.8 256 173 236.3 185.3 208H32C14.33 208 .0022 193.7 .0022 176C.0022 158.3 14.33 144 32 144H185.3C173 115.7 144.8 96 112 96H32C14.33 96 .0022 81.67.0022 64V64z"/></svg>';
        const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(rupeeSvg);
        const rupeeImage = new window.Image();
        rupeeImage.src = svgUrl;
        await new Promise<void>((resolve, reject) => { rupeeImage.onload = () => resolve(); rupeeImage.onerror = () => reject(new Error('Could not load embedded rupee SVG')); });
        const rupeeCanvas = document.createElement('canvas');
        rupeeCanvas.width = 40; rupeeCanvas.height = 64;
        const rupeeContext = rupeeCanvas.getContext('2d');
        if (!rupeeContext) throw new Error('Could not render rupee SVG');
        rupeeContext.drawImage(rupeeImage, 0, 0, rupeeCanvas.width, rupeeCanvas.height);
        const rupeePng = rupeeCanvas.toDataURL('image/png');
        const rupeeWidth = 2.4; const rupeeHeight = 3.8;
        const rupeeX = right - amountWidth - 1.2 - rupeeWidth;
        doc.addImage(rupeePng, 'PNG', rupeeX, amountY - 3.1, rupeeWidth, rupeeHeight, undefined, 'FAST');
        doc.text(amountText, right, amountY, { align: 'right' });
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 86, 95);
        const wordsLines = doc.splitTextToSize(amountInWords, contentWidth - 45);
        doc.text(wordsLines, right, y, { align: 'right' });
        y += wordsLines.length * 4.2 + 4;

        addRow('Transfer mode', transferMode, true);
        addRow('Bank charges', transferMode === 'IMPS' ? formatCurrency(chargeAmount) : 'Not calculated in this prototype', false);
        addRow('Total debit', formatCurrency(totalDebitAmount), true);
        addRow('Remark', remarks || '-', false);
        addRow('Transfer date', format(transferDate, 'dd MMM yyyy, h:mm a'), true);
        addRow('Reference ID', displayReferenceId);
        addRow('RRN', (displayRrn.split('/')[1] || displayRrn));

        const filename = `Receipt-${displayReferenceId}.pdf`;
        // Download the PDF directly instead of opening the iOS share sheet first.
        // iOS Safari can still choose its built-in PDF viewer; this is controlled by iOS.
        doc.save(filename);
    };

    return (
        <div className="pnb-page flex flex-col min-h-screen bg-gray-50">
             <header className="flex justify-center py-2">
                {settings.appLogo && (
                    <Image src={settings.appLogo} alt="App Logo" width={100} height={40} className="h-8 w-auto object-contain" data-ai-hint="app logo"/>
                )}
            </header>
            
            <main className="flex-1 flex flex-col items-center text-center px-4">
                <div className="relative mb-[-24px] z-20">
                    <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Check className="h-8 w-8 text-white" strokeWidth={3}/>
                    </div>
                </div>
                
                <Card className="w-full text-left shadow-lg z-10">
                    <CardContent className="p-4">
                        <h1 className="text-lg font-bold text-gray-800 text-center pt-6">Success</h1>
                        <p className="text-[10px] text-gray-500 mt-1 text-center px-4 leading-relaxed">
                            Transaction with reference id {displayReferenceId} processed successfully. The RRN for the transaction is: {rrnNumber}
                        </p>
                        
                        <div className="mt-3 pt-3 border-t border-dashed space-y-0.5">
                            <DetailRow label="FROM"><span className="font-semibold text-gray-800 uppercase">{user.name}</span></DetailRow>
                            <DetailRow label="Account number">
                                <span className="inline-flex items-center justify-end gap-0.5 whitespace-nowrap text-gray-600">
                                    {settings.appLogo && <Image src={settings.appLogo} width={16} height={16} alt="PNB ONE app logo" className="shrink-0" />}
                                    <span>{account.accountNumber}</span>
                                </span>
                            </DetailRow>
                            <DetailRow label="TO"><span className="font-semibold text-gray-800">{payee.name}</span></DetailRow>
                            <DetailRow label="Payee account number"><span className="inline-flex items-center justify-end gap-1 whitespace-nowrap text-gray-600"><Landmark className="h-4 w-4 shrink-0 text-gray-500" aria-label="Bank" /><span>{payee.accountNumber}</span></span></DetailRow>
                            <DetailRow label="IFSC"><span className="text-gray-600">{String(payee.ifsc || '-').toUpperCase()}</span></DetailRow>
                            <DetailRow label="Transfer mode"><span className="font-semibold uppercase text-gray-800">{transferMode}</span></DetailRow>
                            <DetailRow label="Bank charges">
                                {transferMode === 'IMPS'
                                    ? <span className="font-semibold text-gray-800">{formatCurrency(chargeAmount)}</span>
                                    : <span className="text-[10px] text-amber-700">Not calculated in this prototype</span>}
                            </DetailRow>
                            <DetailRow label="AMOUNT">
                                <div className="flex flex-col items-end">
                                    <p className="flex items-center justify-end gap-1 text-base font-bold tracking-normal text-gray-900"><RupeeIcon className="h-4 w-4 shrink-0" />{formatCurrency(amount)}</p>
                                    <p className="max-w-48 break-words text-right text-[10px] text-gray-500">{amountInWords}</p>
                                </div>
                            </DetailRow>
                            <DetailRow label="Total debited"><span className="font-bold text-gray-900">{formatCurrency(totalDebitAmount)}</span></DetailRow>
                            <DetailRow label="Remarks"><span className="font-semibold text-gray-800">{remarks || '-'}</span></DetailRow>
                            <DetailRow label="Transfer date"><span className="font-semibold text-gray-800">{format(transferDate, 'dd MMM yyyy, h:mm a')}</span></DetailRow>
                        </div>
                    </CardContent>
                </Card>

                 <div className="flex justify-center w-full mt-4 gap-8 text-primary">
                    <button className="flex flex-col items-center gap-1" onClick={handleShare}>
                        <Download className="h-5 w-5"/>
                        <span className="text-xs">Download PDF</span>
                    </button>
                </div>
            </main>
            
            <footer className="w-full p-4 mt-auto">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg" onClick={() => router.push('/dashboard')}>
                    Home
                </Button>
            </footer>
        </div>
    )
}

export default function TransferSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TransferSuccess />
        </Suspense>
    );
}
