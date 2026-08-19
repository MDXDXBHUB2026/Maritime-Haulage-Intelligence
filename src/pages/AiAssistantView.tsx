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
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AiAssistantView: React.FC = () => {
  const {
    contracts,
    createContract,
    setSelectedContractId,
    setActiveView,
    addAuditLog,
    allTrustRecords,
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
      text: "Hello! I am your Maritime Haulage Intelligence AI Assistant. I can assist with contract terms extraction, rate anomaly analysis, and explaining deterministic haulage expansion rules. How can I help you today?",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Handle Extraction
  const handleExtract = async () => {
    setIsExtracting(true);
    setExtractedData(null);
    try {
      const response = await fetch('/api/gemini/extract-contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawContractText, direction: 'IMPORT' }),
      });
      const data = await response.json();
      if (data.success && data.extracted) {
        setExtractedData(data.extracted);
      } else {
        alert('Extraction error: ' + (data.error || 'Unknown'));
      }
    } catch (e: any) {
      alert('Extraction failed: ' + e.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyExtracted = () => {
    if (!extractedData) return;
    const newC = createContract({
      contractNumber: extractedData.contractNumber || `HC-EXTRACTED-${Date.now().toString().slice(-4)}`,
      vendorCode: extractedData.vendorCode || 'DEMO001',
      vendorName: extractedData.vendorName || 'NorthSea Haulage GmbH',
      direction: extractedData.direction || 'IMPORT',
      pickupLocationCode: extractedData.pickupLocationCode || 'DEHAM',
      pickupLocationName: extractedData.pickupLocationName || 'Hamburg',
      currency: extractedData.currency || 'EUR',
      amountType: extractedData.amountType || 'LUMPSUM',
      lumpSumMode: extractedData.lumpSumMode || 'SINGLE_AMOUNT',
      validFrom: extractedData.validFrom || '2026-03-01',
      validTo: extractedData.validTo || '2026-12-31',
      remarks: extractedData.remarks || 'Extracted via Gemini AI',
      routes: (extractedData.routes || []).map((r: any, idx: number) => ({
        id: `r-ext-${Date.now()}-${idx + 1}`,
        contractId: 'pending',
        sequence: idx + 1,
        pickupLocationName: r.pickupLocationName || 'Hamburg',
        pickupLocationCode: r.pickupLocationCode || 'DEHAM',
        pickupType: 'Terminal',
        pickupTerm: 'CY',
        dropLocationName: r.dropLocationName || 'Prague',
        dropLocationCode: r.dropLocationCode || 'CZPRG',
        dropType: 'Location',
        dropTerm: 'DEPOT',
        returnLocationName: 'Hamburg',
        returnLocationCode: 'DEHAM',
        returnType: 'Location',
        haulageMode: r.haulageMode || 'Combined',
        ladenStatus: 'Laden',
        currency: extractedData.currency || 'EUR',
        payableAt: 'POD',
        portToPay: 'DEHAM',
        negotiatedOn: new Date().toISOString().split('T')[0],
        negotiatedBy: 'AI Extractor',
        validFrom: extractedData.validFrom || '2026-03-01',
        validTo: extractedData.validTo || '2026-12-31',
        tripType: 'Drop',
        vendorCode: extractedData.vendorCode || 'DEMO001',
        generalAmount: r.generalAmount || 750,
        amount20: r.amount20 || 600,
        amount40: r.amount40 || 850,
        slabRates20: {},
        slabRates40: {},
        active: true,
      })),
    });

    addAuditLog({
      user: 'AI Extraction',
      action: 'CONTRACT_CREATE',
      entity: 'Contract',
      entityId: newC.contractNumber,
      summary: `Created new contract from AI unstructured text extraction (${newC.contractNumber}).`,
    });

    setSelectedContractId(newC.id);
    setActiveView(newC.direction === 'IMPORT' ? 'import-contract' : 'export-contract');
  };

  // Handle Anomaly Check
  const handleRunAnomalyCheck = async () => {
    const target = contracts.find((c) => c.id === selectedContractForAnomaly);
    if (!target) return;

    setIsAnomalyLoading(true);
    setAnomalies(null);
    try {
      const response = await fetch('/api/gemini/anomaly-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routes: target.routes,
          amountType: target.amountType,
          currency: target.currency,
        }),
      });
      const data = await response.json();
      if (data.success && data.anomalies) {
        setAnomalies(data.anomalies);
      }
    } catch (e: any) {
      alert('Anomaly check failed: ' + e.message);
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
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          context: {
            totalContracts: contracts.length,
            totalHaulageRecords: allTrustRecords.length,
          },
        }),
      });
      const data = await response.json();
      if (data.success && data.answer) {
        setMessages((prev) => [...prev, { sender: 'assistant', text: data.answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'assistant', text: 'Sorry, I could not process your request at this time.' },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: `Error: ${e.message}` },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>AI Haulage Intelligence & Contract Assistant</span>
          </h1>
          <p className="text-xs text-slate-500">
            Powered by Gemini &middot; Rate text parsing, anomaly detection, and interactive maritime logistics Q&A
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('extract')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'extract'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Agreement Text Extractor</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('anomaly')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'anomaly'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Rate Anomaly Detector</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`pb-3 font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Interactive Assistant Q&A</span>
        </button>
      </div>

      {/* Tab 1: Text Extractor */}
      {activeTab === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Paste Agreement Text or Rate Schedule</span>
            </h2>

            <textarea
              rows={12}
              value={rawContractText}
              onChange={(e) => setRawContractText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-3 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-indigo-500 leading-relaxed"
            />

            <button
              type="button"
              onClick={handleExtract}
              disabled={isExtracting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isExtracting ? 'Extracting with Gemini...' : 'Extract Structured Contract'}</span>
            </button>
          </div>

          {/* Extracted Preview */}
          <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Extracted Contract Schema
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
                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contract #:</span>
                    <span className="font-bold text-slate-900">{extractedData.contractNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vendor:</span>
                    <span className="font-semibold text-blue-700">{extractedData.vendorName} ({extractedData.vendorCode})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Direction & Port:</span>
                    <span className="font-semibold text-emerald-700">{extractedData.direction} via {extractedData.pickupLocationCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Identified Routes:</span>
                    <span className="font-bold text-slate-900">{extractedData.routes?.length || 0} Corridors</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyExtracted}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs transition-all"
                >
                  <span>Open as Live Draft Contract</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 border border-dashed border-slate-200 rounded-md">
                <Bot className="w-8 h-8 mb-2 opacity-40 text-indigo-500" />
                <span>Click "Extract Structured Contract" to have Gemini parse rates, locations, and validity terms.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Rate Anomaly Detector */}
      {activeTab === 'anomaly' && (
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-500 font-medium">Select Contract to Analyze:</span>
              <select
                value={selectedContractForAnomaly}
                onChange={(e) => setSelectedContractForAnomaly(e.target.value)}
                className="bg-slate-50 text-slate-800 border border-slate-200 rounded-md px-3 py-1.5 focus:outline-hidden"
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
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAnomalyLoading ? 'Analyzing Routes...' : 'Run Yield & Anomaly Analysis'}</span>
            </button>
          </div>

          {anomalies && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Analysis Observations ({anomalies.length})
              </h3>
              {anomalies.length === 0 ? (
                <div className="p-4 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  No pricing inversions or rate irregularities detected.
                </div>
              ) : (
                anomalies.map((anom, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-100 text-indigo-800">
                          {anom.severity || 'OBSERVATION'}
                        </span>
                        <span>{anom.title}</span>
                      </span>
                      {anom.routeSequence && (
                        <span className="text-[10px] text-slate-500 font-normal">Route #{anom.routeSequence}</span>
                      )}
                    </div>
                    <p className="text-slate-600 leading-relaxed">{anom.description}</p>
                    {anom.recommendation && (
                      <p className="text-[11px] text-indigo-700 font-semibold">Suggestion: {anom.recommendation}</p>
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
        <div className="p-6 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-col h-[520px]">
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
                  <div className="w-7 h-7 rounded-md bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-lg text-xs max-w-xl leading-relaxed whitespace-pre-line ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="flex items-center space-x-2 text-xs text-indigo-600 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Assistant is thinking...</span>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="py-2 border-t border-slate-200 flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setInputQuestion('How does Hamburg (DEHAM) 4-way terminal expansion work?')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            >
              Why Hamburg (DEHAM) creates 4 records?
            </button>
            <button
              type="button"
              onClick={() => setInputQuestion('Why is Col 17 Payable At in Export but Port To Pay in Import?')}
              className="px-2.5 py-1 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
            >
              Legacy Export vs Import Col 17 swapping?
            </button>
          </div>

          {/* Input Box */}
          <div className="pt-2 flex items-center space-x-2">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask anything about maritime haulage rules, terminal expansion, or canonical record formatting..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-md px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={handleSendChat}
              disabled={!inputQuestion.trim() || isChatLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-xs"
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
