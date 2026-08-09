import { useState, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { parseCSV, rowsToTransactions, type ParseResult } from '@/lib/csv';
import { useData } from '@/lib/data';
import { categoryColor } from '@/lib/categories';
import { formatINR } from '@/lib/format';
import { FileText, CheckCircle2, AlertCircle, FileUp, Download } from 'lucide-react';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

type Step = 'upload' | 'preview';

export function CSVImportModal({ open, onClose, onImported }: CSVImportModalProps) {
  const { importTransactions } = useData();
  const [step, setStep] = useState<Step>('upload');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; error: string | null } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const reset = () => {
    setStep('upload');
    setResult(null);
    setFileName('');
    setError(null);
    setImportResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setError(null);
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      setError('Please upload a valid .csv file.');
      return;
    }
    try {
      const text = await file.text();
      const res = parseCSV(text);
      if (res.rows.length === 0) {
        setError('The CSV file appears to be empty or has no data rows.');
        return;
      }
      setResult(res);
      setStep('preview');
    } catch {
      setError('Could not parse this file. Please make sure it is a valid CSV format.');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleConfirm = async () => {
    if (!result) return;
    setImporting(true);
    const rows = rowsToTransactions(result.rows);
    const out = await importTransactions(rows);
    setImporting(false);
    setImportResult(out);
    if (!out.error) {
      setTimeout(() => {
        onImported();
        handleClose();
      }, 900);
    }
  };

  const downloadSample = () => {
    const sample = 'Date,Description,Amount,Type,Category,Payment Method\n2026-08-01,Swiggy,420,Expense,Food & Dining,UPI\n2026-08-02,Amazon,2499,Expense,Shopping,Credit Card\n2026-08-03,Salary,65000,Income,Income,Bank Transfer\n2026-08-04,Uber,240,Expense,Transport,UPI\n2026-08-05,Netflix,649,Expense,Subscriptions,UPI\n';
    const blob = new Blob([sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fintrack-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Import Transactions"
      subtitle="Upload a CSV spreadsheet to bulk add transactions to your Money Path"
      size="lg"
      footer={
        step === 'preview' && !importResult ? (
          <>
            <Button variant="ghost" onClick={() => setStep('upload')} disabled={importing}>Back</Button>
            <Button onClick={handleConfirm} loading={importing} disabled={result?.validCount === 0}>
              Import {result?.validCount ?? 0} Transaction{result?.validCount === 1 ? '' : 's'}
            </Button>
          </>
        ) : null
      }
    >
      {importResult ? (
        <div className="flex flex-col items-center text-center py-6">
          {importResult.error ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-apricot-50 border border-apricot-200 flex items-center justify-center mb-4 text-apricot-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-charcoal-900 text-lg">Import Failed</h3>
              <p className="text-sm text-charcoal-600 mt-1">{importResult.error}</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center mb-4 text-forest-700">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-charcoal-900 text-lg">Import Complete</h3>
              <p className="text-sm text-charcoal-600 mt-1">
                {importResult.count} transaction{importResult.count === 1 ? '' : 's'} added to your ledger.
              </p>
            </>
          )}
        </div>
      ) : step === 'upload' ? (
        <div className="space-y-4">
          {error && (
            <div className="text-sm font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-apricot-600" /> {error}
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-forest-600 bg-forest-50/50' : 'border-charcoal-200 hover:border-forest-600/50 hover:bg-cream-200/40'
            }`}
          >
            <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center mx-auto mb-4 text-forest-700">
              <FileUp className="w-7 h-7" />
            </div>
            <p className="font-display font-bold text-charcoal-900 text-base">Drop your CSV here or click to browse</p>
            <p className="text-xs text-charcoal-500 mt-1">Supports standard CSV files up to 5MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          <div className="rounded-2xl bg-cream-200/50 border border-charcoal-100 p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-forest-700" /> Expected Columns
            </p>
            <p className="text-xs text-charcoal-600 leading-relaxed">
              Date, Description, Amount, Type, Category, Payment Method. If Category is missing, FinTrack will auto-assign based on merchant name.
            </p>
            <button onClick={downloadSample} className="pt-1 text-xs font-bold text-forest-700 hover:underline flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" /> Download Sample Template
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-charcoal-700 font-medium">
            <FileText className="w-4 h-4 text-forest-700" />
            <span className="font-bold text-charcoal-900">{fileName}</span>
            <span className="text-charcoal-400">·</span>
            <span className="text-forest-700 font-bold">{result?.validCount ?? 0} valid</span>
            {result && result.invalidCount > 0 && (
              <span className="text-apricot-600 font-bold">· {result.invalidCount} with errors</span>
            )}
          </div>

          {result && result.invalidCount > 0 && (
            <div className="text-xs font-medium text-apricot-800 bg-apricot-50 border border-apricot-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-apricot-600" />
              <span>{result.invalidCount} row{result.invalidCount === 1 ? '' : 's'} contain invalid formatting and will be skipped.</span>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-charcoal-100 max-h-72">
            <table className="w-full text-xs">
              <thead className="bg-cream-200/80 text-charcoal-700 font-bold uppercase tracking-wider sticky top-0 border-b border-charcoal-100">
                <tr>
                  <th className="text-left px-3 py-2.5">Date</th>
                  <th className="text-left px-3 py-2.5">Description</th>
                  <th className="text-right px-3 py-2.5">Amount</th>
                  <th className="text-left px-3 py-2.5">Type</th>
                  <th className="text-left px-3 py-2.5">Category</th>
                  <th className="text-left px-3 py-2.5">Method</th>
                  <th className="text-center px-3 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 bg-cream-50">
                {result?.rows.slice(0, 50).map((r, i) => (
                  <tr key={i} className={r.valid ? '' : 'bg-apricot-50/50'}>
                    <td className="px-3 py-2 text-charcoal-600 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-2 text-charcoal-900 font-semibold max-w-[160px] truncate">{r.description}</td>
                    <td className="px-3 py-2 text-right text-charcoal-900 font-bold whitespace-nowrap">{formatINR(r.amount)}</td>
                    <td className="px-3 py-2">
                      <span className={`font-bold capitalize ${r.type === 'income' ? 'text-forest-700' : 'text-charcoal-700'}`}>{r.type}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColor(r.category) }} />
                        <span className="font-medium text-charcoal-800">{r.category}</span>
                      </span>
                    </td>
                    <td className="px-3 py-2 text-charcoal-500 font-medium">{r.payment_method}</td>
                    <td className="px-3 py-2 text-center">
                      {r.valid ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-600 mx-auto" />
                      ) : (
                        <span className="text-apricot-600 font-bold" title={r.errors.join(', ')}>{r.errors[0]}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Modal>
  );
}

