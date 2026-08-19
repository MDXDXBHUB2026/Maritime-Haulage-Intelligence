/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import { postJson } from '../lib/api';

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
      const data = await postJson<any>('/api/gemini/assistant', {
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
        });
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-2xl bg-white border-l border-slate-200 text-[#0F172A] h-full flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F172A] border border-[#F59E0B]/40 flex items-center justify-center text-[#FEF3C7] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F172A] flex items-center space-x-2 font-sans">
                <span>Haulage Record Traceability</span>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-full bg-blue-50 text-[#0284C7] border border-blue-200">
                  ID #{record.id}
                </span>
              </h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Deterministic business-rule lineage and audit verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Rule Transformation Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-enterprise-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] font-mono">
                Business Transformation Path
              </span>
              <span className="text-xs text-[#64748B] flex items-center space-x-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(trace.generatedAt).toLocaleTimeString()}</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs py-3.5 px-4 bg-white rounded-xl border border-slate-200 shadow-xs">
              <div className="text-center">
                <div className="text-[#64748B] text-[10px] uppercase font-bold">Source Contract</div>
                <div className="font-bold text-[#0F172A] font-mono">{trace.contractNumber}</div>
                <div className="text-[10px] text-[#64748B]">Rev {trace.contractRevision}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-[#64748B] text-[10px] uppercase font-bold">Route Seq</div>
                <div className="font-bold text-[#0F172A]">#{trace.routeSequence}</div>
                <div className="text-[10px] text-[#64748B]">{record.pickupLocation} &rarr; {record.dropLocation}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-[#64748B] text-[10px] uppercase font-bold">Terminal & Eqp</div>
                <div className="font-bold text-[#0284C7]">{record.pickupZipDepotTerminal || record.dropZipDepotTerminal || 'CY'}</div>
                <div className="text-[10px] font-bold text-[#F59E0B]">{record.equipment}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-center">
                <div className="text-[#64748B] text-[10px] uppercase font-bold">Output ID</div>
                <div className="font-bold text-emerald-700">#{record.id}</div>
                <div className="text-[10px] text-emerald-700 font-bold">{record.amountType}</div>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-3.5 rounded-xl border border-slate-200">
              {trace.explanationText}
            </p>
          </div>

          {/* Key Rule Dimensions Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3 font-mono">
              Deterministic Metadata Matrix
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Pricing Rule Source</span>
                <span className="font-bold text-[#0F172A]">
                  {trace.pricingSource === 'WEIGHT_SLAB'
                    ? 'Weight Slabs (Main Amount = 0)'
                    : trace.pricingSource === 'EQUIPMENT_SPECIFIC'
                    ? `Equipment-Specific (${trace.sourceAmountField})`
                    : 'Single Contract Amount'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Contractual Amount</span>
                <span className="font-bold text-[#0F172A]">
                  {record.amountType === 'Wt.Slab'
                    ? 'EUR 0.00 (Tiered in Slabs)'
                    : `EUR ${record.amount.toFixed(2)}`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Vendor & Corridor</span>
                <span className="font-bold text-[#0F172A]">
                  {record.vendorCode} ({record.pickupLocation} &rarr; {record.dropLocation})
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Transport Mode & Terms</span>
                <span className="font-bold text-[#0F172A]">
                  {record.hMode} · {record.pickupTerm} / {record.dropTerm}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Laden Status & Eqp Units</span>
                <span className="font-bold text-[#0F172A]">
                  {record.ldnMty} ({record.noOfEqpUnits} Unit)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
                <span className="text-[#64748B] text-[10px] font-bold uppercase block mb-1">Payment Term / Port</span>
                <span className="font-bold text-[#0F172A]">
                  {record.payableAt} @ {record.portToPay}
                </span>
              </div>
            </div>
          </div>

          {/* Child Weight Slabs (if applicable) */}
          {record.amountType === 'Wt.Slab' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center space-x-2 font-mono">
                  <Scale className="w-4 h-4 text-[#F59E0B]" />
                  <span>Associated Weight Slabs (ID #{record.id})</span>
                </h3>
                <span className="text-xs text-[#D97706] font-bold font-mono">
                  {associatedSlabs.length} Active Bands
                </span>
              </div>

              {associatedSlabs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#64748B] text-center">
                  No non-zero weight slab child records were configured for this equipment tier.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-enterprise-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[#64748B] uppercase tracking-wider font-bold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Size</th>
                        <th className="px-4 py-3">From</th>
                        <th className="px-4 py-3">To</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Parent ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {associatedSlabs.map((ws, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-[#0284C7]">{ws.size}</td>
                          <td className="px-4 py-3 font-mono text-[#0F172A]">{ws.from} t</td>
                          <td className="px-4 py-3 font-mono text-[#0F172A]">{ws.to} t</td>
                          <td className="px-4 py-3 font-bold text-emerald-700">EUR {ws.amount.toFixed(2)}</td>
                          <td className="px-4 py-3 font-mono text-[#F59E0B] font-bold">#{ws.id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* AI Explanation Assistant */}
          <div className="p-6 rounded-3xl bg-[#0F172A] border border-slate-800 text-white space-y-3.5 shadow-enterprise">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span className="text-xs font-bold text-[#FEF3C7] uppercase tracking-wider font-mono">
                  AI Narrative Lineage Explanation
                </span>
              </div>
              <button
                type="button"
                onClick={handleAskAi}
                disabled={isAiLoading}
                className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Analyzing...' : 'Generate AI Summary'}</span>
              </button>
            </div>

            {aiExplanation ? (
              <div className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-2xl border border-slate-700/60 whitespace-pre-line font-mono">
                {aiExplanation}
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed">
                Click above to generate a natural language narrative explaining the business logic, terminal expansion, and pricing conditions behind this record.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyJson}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-[#0F172A] border border-slate-200 flex items-center space-x-2 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Canonical JSON' : 'Copy Record JSON'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Close Trace
          </button>
        </div>
      </motion.div>
    </div>
  );
};
