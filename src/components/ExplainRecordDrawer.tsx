/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Scale,
  Copy,
  Check,
} from 'lucide-react';
import { TrustMainRecord } from '../types';
import { useApp } from '../context/AppContext';

interface ExplainRecordDrawerProps {
  record: TrustMainRecord | null;
  onClose: () => void;
}

export const ExplainRecordDrawer: React.FC<ExplainRecordDrawerProps> = ({
  record,
  onClose,
}) => {
  const { allWeightSlabs, contracts } = useApp();
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!record) return null;

  const trace = record._trace;
  const associatedSlabs = allWeightSlabs.filter((ws) => ws.id === record.id);
  const sourceContract = contracts.find((c) => c.id === trace.contractId);

  const handleAskAi = async () => {
    setIsAiLoading(true);
    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Explain why this haulage record (ID #${record.id}) was generated with Equipment '${record.equipment}', Terminal '${record.pickupZipDepotTerminal || record.dropZipDepotTerminal}', Amount '${record.amount}', and AmountType '${record.amountType}'.`,
          context: {
            record,
            associatedSlabs,
            sourceContractSummary: {
              number: sourceContract?.contractNumber,
              vendor: sourceContract?.vendorName,
              amountType: sourceContract?.amountType,
              direction: sourceContract?.direction,
            },
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.answer) {
        setAiExplanation(data.answer);
      } else {
        setAiExplanation('Unable to generate AI explanation at this time.');
      }
    } catch (e: any) {
      setAiExplanation(`AI Service unavailable. Deterministic rule trace: ${trace.explanationText}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 text-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Haulage Record Traceability</span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-100 text-blue-700">
                  ID: #{record.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Deterministic business-rule lineage and audit verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rule Transformation Summary Box */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Business Transformation Path
              </span>
              <span className="text-xs text-slate-500 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(trace.generatedAt).toLocaleTimeString()}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-3 px-4 bg-white rounded-md border border-slate-200 shadow-xs">
              <div className="text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Source Contract</div>
                <div className="font-bold text-slate-900 font-mono">{trace.contractNumber}</div>
                <div className="text-[10px] text-slate-500">Rev {trace.contractRevision}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Route Seq</div>
                <div className="font-bold text-slate-900">#{trace.routeSequence}</div>
                <div className="text-[10px] text-slate-500">{record.pickupLocation} &rarr; {record.dropLocation}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Terminal & Eqp</div>
                <div className="font-bold text-blue-700">{record.pickupZipDepotTerminal || record.dropZipDepotTerminal || 'CY'}</div>
                <div className="text-[10px] font-bold text-amber-700">{record.equipment}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Output ID</div>
                <div className="font-bold text-emerald-700">#{record.id}</div>
                <div className="text-[10px] text-emerald-700 font-bold">{record.amountType}</div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-md border border-slate-200">
              {trace.explanationText}
            </p>
          </div>

          {/* Key Rule Dimensions Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Deterministic Metadata Matrix
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Pricing Rule Source</span>
                <span className="font-semibold text-slate-900">
                  {trace.pricingSource === 'WEIGHT_SLAB'
                    ? 'Weight Slabs (Main Amount = 0)'
                    : trace.pricingSource === 'EQUIPMENT_SPECIFIC'
                    ? `Equipment-Specific (${trace.sourceAmountField})`
                    : 'Single Contract Amount'}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Contractual Amount</span>
                <span className="font-semibold text-slate-900">
                  {record.amountType === 'Wt.Slab'
                    ? 'EUR 0.00 (Tiered in Slabs)'
                    : `EUR ${record.amount.toFixed(2)}`}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Vendor & Corridor</span>
                <span className="font-semibold text-slate-900">
                  {record.vendorCode} ({record.pickupLocation} &rarr; {record.dropLocation})
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Transport Mode & Terms</span>
                <span className="font-semibold text-slate-900">
                  {record.hMode} · {record.pickupTerm} / {record.dropTerm}
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Laden Status & Eqp Units</span>
                <span className="font-semibold text-slate-900">
                  {record.ldnMty} ({record.noOfEqpUnits} Unit)
                </span>
              </div>

              <div className="p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <span className="text-slate-400 text-[10px] font-bold uppercase block mb-1">Payment Term / Port</span>
                <span className="font-semibold text-slate-900">
                  {record.payableAt} @ {record.portToPay}
                </span>
              </div>
            </div>
          </div>

          {/* Child Weight Slabs (if applicable) */}
          {record.amountType === 'Wt.Slab' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                  <Scale className="w-4 h-4 text-amber-600" />
                  <span>Associated Weight Slabs (ID #{record.id})</span>
                </h3>
                <span className="text-xs text-amber-700 font-bold">
                  {associatedSlabs.length} Active Bands
                </span>
              </div>

              {associatedSlabs.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
                  No non-zero weight slab child records were configured for this equipment tier.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Size</th>
                        <th className="px-3.5 py-2.5">From</th>
                        <th className="px-3.5 py-2.5">To</th>
                        <th className="px-3.5 py-2.5">Amount</th>
                        <th className="px-3.5 py-2.5">Parent ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {associatedSlabs.map((ws, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-3.5 py-2.5 font-bold text-blue-700">{ws.size}</td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-700">{ws.from} t</td>
                          <td className="px-3.5 py-2.5 font-mono text-slate-700">{ws.to} t</td>
                          <td className="px-3.5 py-2.5 font-bold text-emerald-700">EUR {ws.amount.toFixed(2)}</td>
                          <td className="px-3.5 py-2.5 font-mono text-amber-700 font-bold">#{ws.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AI Explanation Assistant */}
          <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 text-white space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                  AI Narrative Explanation
                </span>
              </div>
              <button
                type="button"
                onClick={handleAskAi}
                disabled={isAiLoading}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Analyzing...' : 'Generate AI Summary'}</span>
              </button>
            </div>

            {aiExplanation ? (
              <div className="text-xs text-slate-200 leading-relaxed bg-slate-800/80 p-3.5 rounded-md border border-slate-700 whitespace-pre-line">
                {aiExplanation}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click above to generate a natural language narrative explaining the business logic, terminal expansion, and pricing conditions behind this record.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Canonical JSON' : 'Copy Record JSON'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold transition-colors shadow-xs"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
