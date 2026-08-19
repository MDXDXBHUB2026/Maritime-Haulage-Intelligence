/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  AlertTriangle,
  Send,
  ArrowRight,
  Bot,
  User,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { postJson } from '../lib/api';

export const AiAssistantView: React.FC = () => {
  const {
    contracts,
    createContract,
    setSelectedContractId,
    setActiveView,
    addAuditLog,
    allHaulageRecords,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'extract' | 'anomaly' | 'chat'>('extract');

  // Text Extraction State
  const [rawContractText, setRawContractText] = useState(
    `Vendor: NorthSea Haulage GmbH (DEMO001)
Direction: IMPORT
Port: Hamburg (DEHAM)
Validity: 2026-03-01 to 2026-12-31
Currency: EUR
Pricing: Lump Sum (Single Amount)
Transport Mode: Combined

Routes:
1. Hamburg (DEHAM) -> Prague (CZPRG): EUR 760 (Combined)
2. Hamburg (DEHAM) -> Brno (CZBRQ): EUR 840 (Rail)
3. Hamburg (DEHAM) -> Vienna (ATVIE): EUR 920 (Combined)

Remarks: Annual German rail corridor framework rate schedule.`
  );
  const [aiError, setAiError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);

  // Anomaly Detection State
  const [selectedContractForAnomaly, setSelectedContractForAnomaly] = useState<string>(
    contracts[0]?.id || ''
  );
  const [anomalies, setAnomalies] = useState<any[] | null>(null);
  const [isAnomalyLoading, setIsAnomalyLoading] = useState(false);

  // Natural Language Chat State
  const [messages, setMessages] = useState<{ sender: 'user' | 'assistant'; text: string }[]>([
    {
      sender: 'assistant',
      text: 'Welcome to the Maritime Operations Assistant. I can assist with parsing commercial rate schedules, analyzing corridor pricing dispersion, and answering operational container haulage workflow questions. How can I assist you?',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Handle Extraction
  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractedData(null);
    setAiError(null);
    try {
      const data = await postJson<any>('/api/gemini/extract-contract', { rawText: rawContractText, direction: 'IMPORT' });
      if (data.success && data.extracted) {
        setExtractedData(data.extracted);
      } else {
        setAiError(data.error || 'Unable to parse the rate schedule text.');
      }
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtracted = () => {
    if (!extractedData) return;
    const newC = createContract({
      contractNumber: extractedData.contractNumber || `MHI-IMP-EXT-${Date.now().toString().slice(-4)}`,
      vendorCode: extractedData.vendorCode || 'DEMO1001',
      vendorName: extractedData.vendorName || 'NorthSea Haulage GmbH',
      direction: extractedData.direction || 'IMPORT',
      pickupLocationCode: extractedData.pickupLocationCode || 'DEHAM',
      pickupLocationName: extractedData.pickupLocationName || 'Hamburg',
      currency: extractedData.currency || 'EUR',
      amountType: extractedData.amountType === 'Wt.Slab' ? 'Wt.Slab' : 'Lumpsum',
      lumpSumMode: extractedData.lumpSumMode || 'SINGLE',
      validFrom: extractedData.validFrom || '2026-03-01',
      validTo: extractedData.validTo || '2026-12-31',
      remarks: extractedData.remarks || 'Ingested via Rate Schedule Parser',
      routes: (extractedData.routes || []).map((r: any, idx: number) => ({
        id: `r-ext-${Date.now()}-${idx + 1}`,
        sequence: idx + 1,
        originLocationName: 'Hamburg',
        originLocationCode: 'DEHAM',
        originType: 'CY',
        originTerm: 'Free Out',
        destinationLocationName: r.dropLocationName || 'Prague',
        destinationLocationCode: r.dropLocationCode || 'CZPRG',
        destinationType: 'Door',
        destinationTerm: 'CY/CY',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        returnType: 'CY',
        haulageMode: r.haulageMode || 'Combined',
        tripType: 'One-Way',
        ladenStatus: 'Laden',
        lumpSumAmount: r.generalAmount || 750,
        amount20: r.amount20 || 600,
        amount40: r.amount40 || 850,
        isActive: true,
      })),
    });

    addAuditLog({
      user: 'Operations Assistant',
      action: 'CONTRACT_CREATE',
      entity: 'Contract',
      entityId: newC.contractNumber,
      summary: `Created new contract from parsed rate schedule (${newC.contractNumber}).`,
    });

    setSelectedContractId(newC.id);
    setActiveView(newC.direction === 'IMPORT' ? 'import-workbench' : 'export-workbench');
  };

  // Handle Anomaly Check
  const handleRunAnomalyCheck = async () => {
    const target = contracts.find((c) => c.id === selectedContractForAnomaly);
    if (!target) return;

    setIsAnomalyLoading(true);
    setAnomalies(null);
    setAiError(null);
    try {
      const data = await postJson<any>('/api/gemini/anomaly-check', {
          routes: target.routes,
          amountType: target.amountType,
          currency: target.currency,
        });
      if (data.success && data.anomalies) {
        setAnomalies(data.anomalies);
      }
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setIsAnomalyLoading(false);
    }
  };

  // Handle Chat Question
  const handleSendChat = async () => {
    if (!inputQuestion.trim()) return;

    const userMsg = inputQuestion.trim();
    setInputQuestion('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const data = await postJson<any>('/api/gemini/assistant', {
          question: userMsg,
          context: {
            totalContracts: contracts.length,
            totalHaulageRecords: allHaulageRecords.length,
          },
        });
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { sender: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: 'Operational inquiry completed. Please verify details in the respective workbench.' },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: `Inquiry notice: ${e.message}` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-[1720px] mx-auto space-y-6 text-[#18212B]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E1E7EC]">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#17212B] text-[#FFF4DB] rounded-xl border border-[#F5A623]/40 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#18212B] tracking-tight">
              Maritime Operations Assistant
            </h1>
            <p className="text-xs text-[#5C6B78] font-mono">
              Operational rate analysis, contract schedule ingestion, and container logistics rule support.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E1E7EC] space-x-4 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('extract')}
          className={`pb-2.5 font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'extract'
              ? 'border-[#176B9B] text-[#176B9B]'
              : 'border-transparent text-[#5C6B78] hover:text-[#18212B]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Rate Schedule Parser</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anomaly')}
          className={`pb-2.5 font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'anomaly'
              ? 'border-[#176B9B] text-[#176B9B]'
              : 'border-transparent text-[#5C6B78] hover:text-[#18212B]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Commercial Rate Anomaly Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`pb-2.5 font-bold flex items-center space-x-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'chat'
              ? 'border-[#176B9B] text-[#176B9B]'
              : 'border-transparent text-[#5C6B78] hover:text-[#18212B]'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Operational Logistics Q&A</span>
        </button>
      </div>

      {aiError && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-[#E9C46A] bg-[#FDF6E3] p-4"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B7791F]" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#8A5A00]">
              AI service unavailable
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#5C4813]">{aiError}</p>
          </div>
          <button
            onClick={() => setAiError(null)}
            className="ml-auto shrink-0 text-xs font-semibold text-[#8A5A00] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: Text Extractor */}
      {activeTab === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#E1E7EC] shadow-enterprise space-y-4">
            <h2 className="text-xs font-bold text-[#18212B] uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#176B9B]" />
              <span>Input Commercial Rate Schedule Text</span>
            </h2>

            <textarea
              rows={12}
              value={rawContractText}
              onChange={(e) => setRawContractText(e.target.value)}
              className="w-full bg-[#F5F7FA] border border-[#E1E7EC] rounded-xl p-3 text-xs text-[#18212B] font-mono focus:outline-hidden focus:border-[#176B9B] leading-relaxed"
            />

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full py-2.5 bg-[#176B9B] hover:bg-[#115277] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFF4DB]" />
              <span>{isExtracting ? 'Parsing Rate Matrix...' : 'Parse Commercial Rate Schedule'}</span>
            </button>
          </div>

          {/* Extracted Preview */}
          <div className="p-6 rounded-2xl bg-white border border-[#E1E7EC] shadow-enterprise space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#18212B] uppercase tracking-wider">
                Structured Ingestion Preview
              </h2>
              {extractedData && (
                <span className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ready for Ingestion</span>
                </span>
              )}
            </div>

            {extractedData ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E1E7EC] space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#5C6B78]">Contract #:</span>
                    <span className="font-bold text-[#18212B]">{extractedData.contractNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6B78]">Vendor:</span>
                    <span className="font-semibold text-[#176B9B]">{extractedData.vendorName} ({extractedData.vendorCode})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6B78]">Direction & Port:</span>
                    <span className="font-semibold text-emerald-700">{extractedData.direction} via {extractedData.pickupLocationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6B78]">Identified Routes:</span>
                    <span className="font-bold text-[#18212B]">{extractedData.routes?.length || 0} Corridors</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyExtracted}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-all cursor-pointer"
                >
                  <span>Open as Live Draft Contract</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-[#5C6B78] text-xs text-center p-6 border border-dashed border-[#E1E7EC] rounded-xl">
                <Bot className="w-8 h-8 mb-2 opacity-40 text-[#176B9B]" />
                <span>Click "Parse Commercial Rate Schedule" to parse corridors, equipment rates, and validity periods.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Rate Anomaly Detector */}
      {activeTab === 'anomaly' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E1E7EC] shadow-enterprise space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-[#5C6B78] font-bold">Select Contract to Analyze:</span>
              <select
                value={selectedContractForAnomaly}
                onChange={(e) => setSelectedContractForAnomaly(e.target.value)}
                className="bg-[#F5F7FA] text-[#18212B] border border-[#E1E7EC] rounded-lg px-3 py-1.5 focus:outline-hidden font-bold"
              >
                {contracts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.contractNumber} — {c.vendorCode} ({c.direction})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleRunAnomalyCheck}
              disabled={isAnomalyLoading}
              className="px-4 py-2 bg-[#176B9B] hover:bg-[#115277] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFF4DB]" />
              <span>{isAnomalyLoading ? 'Evaluating Rates...' : 'Run Yield & Anomaly Analysis'}</span>
            </button>
          </div>

          {anomalies && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-[#18212B] uppercase tracking-wider">
                Analysis Observations ({anomalies.length})
              </h3>
              {anomalies.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  No pricing inversions or rate irregularities detected.
                </div>
              ) : (
                anomalies.map((anom, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E1E7EC] text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-[#18212B]">
                      <span className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 text-[#176B9B] font-mono">
                          {anom.severity || 'OBSERVATION'}
                        </span>
                        <span>{anom.title}</span>
                      </span>
                      {anom.routeSequence && (
                        <span className="text-[10px] text-[#5C6B78] font-normal">Route #{anom.routeSequence}</span>
                      )}
                    </div>
                    <p className="text-[#5C6B78] leading-relaxed">{anom.description}</p>
                    {anom.recommendation && (
                      <p className="text-[11px] text-[#176B9B] font-semibold">Suggestion: {anom.recommendation}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Interactive Chat */}
      {activeTab === 'chat' && (
        <div className="p-6 rounded-2xl bg-white border border-[#E1E7EC] shadow-enterprise flex flex-col h-[540px]">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${
                  m.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#F5F7FA] border border-[#E1E7EC] flex items-center justify-center text-[#176B9B] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-xl text-xs max-w-xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-[#176B9B] text-white rounded-br-none'
                      : 'bg-[#F5F7FA] text-[#18212B] border border-[#E1E7EC] rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#17212B] flex items-center justify-center text-[#FFF4DB] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center space-x-2 text-xs text-[#176B9B] animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assistant is processing inquiry...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="py-2 border-t border-[#E1E7EC] flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setInputQuestion('How does Hamburg (DEHAM) 4-way terminal expansion work?')}
              className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] hover:bg-[#E1E7EC] text-[#18212B] border border-[#E1E7EC] cursor-pointer"
            >
              Why does Hamburg (DEHAM) expand to 4 records?
            </button>
            <button
              type="button"
              onClick={() => setInputQuestion('What is the difference between Weight Slab and Lump Sum pricing?')}
              className="px-2.5 py-1 rounded-lg bg-[#F5F7FA] hover:bg-[#E1E7EC] text-[#18212B] border border-[#E1E7EC] cursor-pointer"
            >
              Weight Slab vs Lump Sum rules?
            </button>
          </div>

          {/* Input Box */}
          <div className="pt-2 flex items-center space-x-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask anything about container haulage rules, terminal expansion, or operational record formatting..."
              className="flex-1 bg-[#F5F7FA] border border-[#E1E7EC] rounded-xl px-4 py-2 text-xs text-[#18212B] placeholder-[#5C6B78] focus:outline-hidden focus:border-[#176B9B]"
            />
            <button
              type="button"
              onClick={handleSendChat}
              disabled={!inputQuestion.trim() || isChatLoading}
              className="px-4 py-2 bg-[#176B9B] hover:bg-[#115277] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
