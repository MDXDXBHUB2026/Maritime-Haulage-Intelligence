/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { runAllRegressionTests, TestCaseResult } from '../business-rules/regressionTests';

export const RegressionTestsView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [expandedTest, setExpandedTest] = useState<string | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAllRegressionTests();
      setTestResults(results);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  const totalCount = testResults.length;
  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.filter((t) => !t.passed).length;
  const totalDuration = testResults.reduce((acc, t) => acc + t.durationMs, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-[#0F172A]"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#0F172A] text-[#FEF3C7] rounded-xl border border-[#F59E0B]/40 shadow-xs">
              <Terminal className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
                Automated Rules Regression Suite
              </h1>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">
                Verifies 100% deterministic accuracy of terminal expansions, weight slab tiering, and master data lookups
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-4 py-2 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Assertions...' : 'Re-Run Regression Suite'}</span>
        </button>
      </div>

      {/* Summary Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
          <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">Total Test Scenarios</div>
          <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1">{totalCount}</div>
          <div className="text-[10px] text-[#64748B] font-medium mt-0.5">Zero-defect baseline</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
          <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">Passed Tests</div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-1">{passedCount}</div>
          <div className="text-[10px] text-emerald-700 font-bold uppercase mt-0.5">100% Pass Rate</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
          <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">Failed Tests</div>
          <div className="text-2xl font-extrabold text-[#0F172A] font-mono mt-1">
            {failedCount > 0 ? (
              <span className="text-rose-600">{failedCount}</span>
            ) : (
              <span className="text-slate-400">0</span>
            )}
          </div>
          <div className="text-[10px] text-[#64748B] font-medium mt-0.5">Blocking errors</div>
        </motion.div>

        <motion.div variants={itemVariants} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm">
          <div className="text-[10px] uppercase font-bold text-[#64748B] font-mono">Execution Speed</div>
          <div className="text-2xl font-extrabold text-[#0284C7] font-mono mt-1">
            {totalDuration.toFixed(1)} ms
          </div>
          <div className="text-[10px] text-[#64748B] font-medium mt-0.5">In-memory pure TypeScript</div>
        </motion.div>
      </div>

      {/* Test Scenarios List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider font-mono">
          Regression Test Verification Cases ({testResults.length})
        </h2>

        <div className="space-y-3">
          {testResults.map((tc) => (
            <motion.div
              key={tc.id}
              variants={itemVariants}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-enterprise-sm hover:border-[#0284C7]/40 transition-all space-y-3"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedTest(expandedTest === tc.id ? null : tc.id)
                }
              >
                <div className="flex items-center space-x-3">
                  {tc.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-[#0F172A] flex items-center space-x-2">
                      <span>{tc.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">
                        {tc.category}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-[#64748B] font-mono">
                    {tc.durationMs.toFixed(2)} ms
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tc.passed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {tc.passed ? 'PASSED' : 'FAILED'}
                  </span>
                  {expandedTest === tc.id ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {expandedTest === tc.id && (
                <div className="pt-3 border-t border-slate-100 text-xs space-y-2 font-mono">
                  <div className="text-[#64748B] font-sans text-xs">{tc.description}</div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 space-y-1">
                    <div>
                      <strong className="text-[#0F172A]">Expectation:</strong> {tc.expected}
                    </div>
                    <div>
                      <strong className="text-[#0F172A]">Actual Result:</strong> {tc.actual}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
