import React, { useState, useEffect, useMemo } from 'react';
import {
  SchwarzTweedParameterKey,
  SchwarzTweedParametersMap,
  SchwarzTweedAnalysisData,
} from '../../types';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface SchwarzTweedParameterMeta {
  key: SchwarzTweedParameterKey;
  label: string;
  category: 'Schwarz Analysis' | 'Tweed Analysis Triangle';
  unit: string;
  normalText: string;
  getNormalRange: () => { minNormal: number; maxNormal: number };
  evaluateInference: (val: number) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const SCHWARZ_TWEED_PARAMETERS_META: SchwarzTweedParameterMeta[] = [
  // SCHWARZ ANALYSIS (4)
  {
    key: 'seNLength',
    label: '1. Se-N (Cranial Base Length)',
    category: 'Schwarz Analysis',
    unit: 'mm',
    normalText: '68 mm (66 - 70 mm)',
    getNormalRange: () => ({ minNormal: 66, maxNormal: 70 }),
    evaluateInference: (val: number) => {
      if (val > 70) return { inference: 'Increased Anterior Cranial Base Length', status: 'abnormal' };
      if (val < 66) return { inference: 'Decreased Anterior Cranial Base Length', status: 'abnormal' };
      return { inference: 'Normal Cranial Base Length', status: 'normal' };
    },
  },
  {
    key: 'mandibularLength',
    label: '2. Mandibular Length',
    category: 'Schwarz Analysis',
    unit: 'mm',
    normalText: '71 mm (69 - 73 mm)',
    getNormalRange: () => ({ minNormal: 69, maxNormal: 73 }),
    evaluateInference: (val: number) => {
      if (val > 73) return { inference: 'Increased Mandibular Length / Macrognathia', status: 'abnormal' };
      if (val < 69) return { inference: 'Decreased Mandibular Length / Micrognathia', status: 'abnormal' };
      return { inference: 'Normal Mandibular Length', status: 'normal' };
    },
  },
  {
    key: 'ascendingRamusLength',
    label: '3. Ascending Ramus Length',
    category: 'Schwarz Analysis',
    unit: 'mm',
    normalText: '50 mm (48 - 52 mm)',
    getNormalRange: () => ({ minNormal: 48, maxNormal: 52 }),
    evaluateInference: (val: number) => {
      if (val > 52) return { inference: 'Increased Ramus Height', status: 'abnormal' };
      if (val < 48) return { inference: 'Decreased Ramus Height', status: 'abnormal' };
      return { inference: 'Normal Ramus Height', status: 'normal' };
    },
  },
  {
    key: 'maxillaryLength',
    label: '4. Maxillary Length',
    category: 'Schwarz Analysis',
    unit: 'mm',
    normalText: '47.5 mm (45.5 - 49.5 mm)',
    getNormalRange: () => ({ minNormal: 45.5, maxNormal: 49.5 }),
    evaluateInference: (val: number) => {
      if (val > 49.5) return { inference: 'Increased Maxillary Length', status: 'abnormal' };
      if (val < 45.5) return { inference: 'Decreased Maxillary Length', status: 'abnormal' };
      return { inference: 'Normal Maxillary Length', status: 'normal' };
    },
  },

  // TWEED ANALYSIS TRIANGLE (3)
  {
    key: 'fmpa',
    label: '5. Frankfort Mandibular Plane Angle (FMPA)',
    category: 'Tweed Analysis Triangle',
    unit: '°',
    normalText: '25° (22° - 28°)',
    getNormalRange: () => ({ minNormal: 22, maxNormal: 28 }),
    evaluateInference: (val: number) => {
      if (val > 28) return { inference: 'High Mandibular Plane Angle / Hyperdivergent Pattern', status: 'abnormal' };
      if (val < 22) return { inference: 'Low Mandibular Plane Angle / Hypodivergent Pattern', status: 'abnormal' };
      return { inference: 'Normodivergent Pattern', status: 'normal' };
    },
  },
  {
    key: 'impa',
    label: '6. Incisor Mandibular Plane Angle (IMPA)',
    category: 'Tweed Analysis Triangle',
    unit: '°',
    normalText: '90° (88° - 92°)',
    getNormalRange: () => ({ minNormal: 88, maxNormal: 92 }),
    evaluateInference: (val: number) => {
      if (val > 92) return { inference: 'Lower Incisor Proclination', status: 'abnormal' };
      if (val < 88) return { inference: 'Lower Incisor Retroclination', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Inclination', status: 'normal' };
    },
  },
  {
    key: 'fmia',
    label: '7. Frankfort Mandibular Incisor Angle (FMIA)',
    category: 'Tweed Analysis Triangle',
    unit: '°',
    normalText: '65° (62° - 68°)',
    getNormalRange: () => ({ minNormal: 62, maxNormal: 68 }),
    evaluateInference: (val: number) => {
      if (val < 62) return { inference: 'Decreased FMIA / Lower Incisor Protrusion', status: 'abnormal' };
      if (val > 68) return { inference: 'Increased FMIA / Retrusive Incisor Position', status: 'abnormal' };
      return { inference: 'Normal FMIA Relationship', status: 'normal' };
    },
  },
];

export const DEFAULT_SCHWARZ_TWEED_PARAMS: SchwarzTweedParametersMap = {
  seNLength: { pre: '', mid: '', post: '' },
  mandibularLength: { pre: '', mid: '', post: '' },
  ascendingRamusLength: { pre: '', mid: '', post: '' },
  maxillaryLength: { pre: '', mid: '', post: '' },
  fmpa: { pre: '', mid: '', post: '' },
  impa: { pre: '', mid: '', post: '' },
  fmia: { pre: '', mid: '', post: '' },
};

const CLASS_II_SCHWARZ_TWEED_SAMPLE: SchwarzTweedParametersMap = {
  seNLength: { pre: 65, mid: 67, post: 68 },
  mandibularLength: { pre: 65, mid: 68, post: 71 },
  ascendingRamusLength: { pre: 45, mid: 48, post: 50 },
  maxillaryLength: { pre: 51, mid: 49, post: 48 },
  fmpa: { pre: 32, mid: 28, post: 25 },
  impa: { pre: 98, mid: 93, post: 90 },
  fmia: { pre: 50, mid: 59, post: 65 }, // 180 - (32+98) = 50
};

const CLASS_III_SCHWARZ_TWEED_SAMPLE: SchwarzTweedParametersMap = {
  seNLength: { pre: 72, mid: 70, post: 68 },
  mandibularLength: { pre: 78, mid: 74, post: 71 },
  ascendingRamusLength: { pre: 55, mid: 52, post: 50 },
  maxillaryLength: { pre: 43, mid: 46, post: 48 },
  fmpa: { pre: 18, mid: 22, post: 25 },
  impa: { pre: 82, mid: 86, post: 90 },
  fmia: { pre: 80, mid: 72, post: 65 }, // 180 - (18+82) = 80
};

export interface SchwarzTweedAnalysisProps {
  data?: SchwarzTweedAnalysisData;
  onChange?: (updatedData: SchwarzTweedAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
}

export const SchwarzTweedAnalysis: React.FC<SchwarzTweedAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  const [params, setParams] = useState<SchwarzTweedParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_SCHWARZ_TWEED_PARAMS, ...data.parameters };
    }
    return DEFAULT_SCHWARZ_TWEED_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = SCHWARZ_TWEED_PARAMETERS_META.every(
          (p) =>
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
        );
        return isSame ? prev : { ...prev, ...data.parameters };
      });
    }
    if (data?.conclusion !== undefined && data.conclusion !== conclusion) {
      setConclusion(data.conclusion);
    }
  }, [data]);

  const generateSchwarzSummary = (
    currentParams: SchwarzTweedParametersMap,
    stage: 'pre' | 'mid' | 'post'
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const findings: string[] = [];

    SCHWARZ_TWEED_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num);
        findings.push(res.inference);
      }
    });

    if (findings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in Schwarz & Tweed Analysis section to auto-generate the diagnostic conclusion.`;
    }

    return `Schwarz & Tweed Summary (${stageLabel}): Patient presents with ${findings.join(', ')}.`;
  };

  const handleInputChange = (
    key: SchwarzTweedParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);

    let updatedParams: SchwarzTweedParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };

    // Auto calculate Tweed Triangle FMIA = 180 - (FMPA + IMPA)
    if (key === 'fmpa' || key === 'impa') {
      const fmpaVal = key === 'fmpa' ? numVal : params.fmpa[stage];
      const impaVal = key === 'impa' ? numVal : params.impa[stage];

      if (fmpaVal !== '' && impaVal !== '' && !isNaN(Number(fmpaVal)) && !isNaN(Number(impaVal))) {
        const autoFmia = 180 - (Number(fmpaVal) + Number(impaVal));
        updatedParams.fmia = {
          ...updatedParams.fmia,
          [stage]: autoFmia,
        };
      }
    }

    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSchwarzSummary(updatedParams, currentStage);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary);
  };

  const notifyChange = (updatedParams: SchwarzTweedParametersMap, updatedConclusion: string) => {
    if (onChange) {
      onChange({
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  const getFieldValidation = (val: number | '', meta: SchwarzTweedParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-purple-500/20 focus:border-purple-600',
      };
    }
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange();
    const isWithinRange = num >= minNormal && num <= maxNormal;
    if (isWithinRange) {
      return {
        status: 'normal',
        className: 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600',
      };
    }
    return {
      status: 'abnormal',
      className: 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600',
    };
  };

  const inferences = useMemo(() => {
    const result: Record<
      SchwarzTweedParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    SCHWARZ_TWEED_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val));
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage]);

  const autoGeneratedSummary = useMemo(
    () => generateSchwarzSummary(params, currentStage),
    [params, currentStage]
  );

  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, e.target.value);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, autoGeneratedSummary);
  };

  const handleLoadSample = (sample: SchwarzTweedParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_SCHWARZ_TWEED_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate Schwarz & Tweed Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_SCHWARZ_TWEED_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return SCHWARZ_TWEED_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return SCHWARZ_TWEED_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined) return false;
      return m.evaluateInference(Number(val)).status === 'abnormal';
    }).length;
  }, [params, currentStage]);

  const stageDisplayLabel =
    currentStage === 'pre' ? 'Pre' : currentStage === 'mid' ? 'Mid' : 'Post';

  const renderInference = (activeInference: {
    inference: string;
    status: 'empty' | 'normal' | 'abnormal';
  }) => {
    if (activeInference.status === 'empty') {
      return <span className="text-slate-400 text-xs italic">Enter value</span>;
    }
    if (activeInference.status === 'normal') {
      return (
        <span className="inline-flex items-start gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{activeInference.inference}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-start gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
        <span className="leading-snug">{activeInference.inference}</span>
      </span>
    );
  };

  const renderMobileParamRows = (
    category: 'Schwarz Analysis' | 'Tweed Analysis Triangle',
    title: string
  ) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        {title}
      </div>
      {SCHWARZ_TWEED_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
        const currentVal = params[meta.key]?.[currentStage] ?? '';
        const validation = getFieldValidation(currentVal, meta);
        const activeInference = inferences[meta.key];

        return (
          <div
            key={meta.key}
            className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 w-full max-w-full box-border"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-snug whitespace-normal break-words">
                  {meta.label}
                  {meta.key === 'fmia' && (
                    <span className="ml-1.5 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded inline-block">
                      Auto
                    </span>
                  )}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-normal break-words">
                  Norm {meta.normalText}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <input
                type="number"
                step="0.1"
                value={currentVal}
                onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                placeholder="Val"
                aria-label={`${meta.label} ${stageDisplayLabel}`}
                className={`w-20 shrink-0 text-center py-1.5 px-1.5 border rounded-lg text-xs font-semibold ${validation.className}`}
              />
            </div>
            <div className="whitespace-normal break-words">{renderInference(activeInference)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all w-full max-w-full box-border">
      {/* Accordion Card Header */}
      <div
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              Schwarz & Tweed Analysis
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                7 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Linear Cranial/Mandibular Dimensions & Tweed Diagnostic Triangle
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-purple-600" />
              {activeCount}/7 Measured
            </span>

            {abnormalCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {abnormalCount} Deviations
              </span>
            ) : activeCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Normative
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-4 bg-slate-50/50">
          {/* Presets Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Presets & Triangle Calculator:
              </span>
              <span className="text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                FMIA = 180° - (FMPA + IMPA)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_SCHWARZ_TWEED_SAMPLE)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Class II Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_SCHWARZ_TWEED_SAMPLE)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                Class III Sample
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600" />
                Reset
              </button>
            </div>
          </div>

          {/* Mobile: stacked parameter rows */}
          <div className="space-y-3 md:hidden">
            {renderMobileParamRows('Schwarz Analysis', '1. Schwarz Analysis (Linear Dimensions)')}
            {renderMobileParamRows('Tweed Analysis Triangle', '2. Tweed Diagnostic Triangle Analysis')}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Normal Range</th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-purple-900 text-purple-200 font-extrabold border-b-2 border-purple-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* Category 1: Schwarz Analysis */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      1. Schwarz Analysis (Linear Dimensions)
                    </td>
                  </tr>
                  {SCHWARZ_TWEED_PARAMETERS_META.filter((m) => m.category === 'Schwarz Analysis').map((meta) => {
                    const currentVal = params[meta.key]?.[currentStage] ?? '';
                    const validation = getFieldValidation(currentVal, meta);
                    const activeInference = inferences[meta.key];

                    return (
                      <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {meta.label}
                          <span className="ml-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {meta.unit}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700 bg-slate-50/80 text-xs">
                          {meta.normalText}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category 2: Tweed Analysis Triangle */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      2. Tweed Diagnostic Triangle Analysis
                    </td>
                  </tr>
                  {SCHWARZ_TWEED_PARAMETERS_META.filter((m) => m.category === 'Tweed Analysis Triangle').map((meta) => {
                    const currentVal = params[meta.key]?.[currentStage] ?? '';
                    const validation = getFieldValidation(currentVal, meta);
                    const activeInference = inferences[meta.key];

                    return (
                      <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {meta.label}
                          <span className="ml-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {meta.unit}
                          </span>
                          {meta.key === 'fmia' && (
                            <span className="ml-2 text-[10px] font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                              Auto Computed
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-700 bg-slate-50/80 text-xs">
                          {meta.normalText}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC DIAGNOSTIC CONCLUSION BOX */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-600" />
                Schwarz & Tweed Diagnostic Conclusion ({stageDisplayLabel} Stage)
              </h5>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      Copy Conclusion
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={conclusion}
              onChange={handleConclusionChange}
              placeholder="Diagnostic summary concatenates row inferences in real time..."
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
