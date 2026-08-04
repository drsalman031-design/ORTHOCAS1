import React, { useState, useEffect, useMemo } from 'react';
import {
  RickettsParameterKey,
  RickettsParametersMap,
  RickettsAnalysisData,
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

export interface RickettsParameterMeta {
  key: RickettsParameterKey;
  label: string;
  category: 'Chin in Space / Skeletal' | 'Convexity' | 'Teeth' | 'Profile';
  normalText: (age: number) => string;
  unit: string;
  getNormalRange: (age: number) => { minNormal: number; maxNormal: number };
  evaluateInference: (val: number, age: number) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const RICKETTS_PARAMETERS_META: RickettsParameterMeta[] = [
  // 1. Chin in Space / Skeletal Parameters (3)
  {
    key: 'facialAxis',
    label: '1. Facial Axis Angle',
    category: 'Chin in Space / Skeletal',
    normalText: () => '90° ± 3.5° (86.5° - 93.5°)',
    unit: '°',
    getNormalRange: () => ({ minNormal: 86.5, maxNormal: 93.5 }),
    evaluateInference: (val: number) => {
      if (val < 86.5) return { inference: 'Vertical Growth Pattern / Retrusive Chin', status: 'abnormal' };
      if (val > 93.5) return { inference: 'Horizontal Growth Pattern / Prominent Chin', status: 'abnormal' };
      return { inference: 'Normal Growth Vector', status: 'normal' };
    },
  },
  {
    key: 'facialDepth',
    label: '2. Facial Depth Angle',
    category: 'Chin in Space / Skeletal',
    normalText: () => '87° ± 3° (84° - 90°)',
    unit: '°',
    getNormalRange: () => ({ minNormal: 84, maxNormal: 90 }),
    evaluateInference: (val: number) => {
      if (val < 84) return { inference: 'Skeletal Retrusive Mandible / Class II Tendency', status: 'abnormal' };
      if (val > 90) return { inference: 'Skeletal Prognathic Mandible / Class III Tendency', status: 'abnormal' };
      return { inference: 'Normal Facial Depth', status: 'normal' };
    },
  },
  {
    key: 'mandibularPlaneAngle',
    label: '3. Mandibular Plane Angle',
    category: 'Chin in Space / Skeletal',
    normalText: () => '26° ± 4.5° (21.5° - 30.5°)',
    unit: '°',
    getNormalRange: () => ({ minNormal: 21.5, maxNormal: 30.5 }),
    evaluateInference: (val: number) => {
      if (val > 30.5) return { inference: 'Hyperdivergent / High Angle Pattern', status: 'abnormal' };
      if (val < 21.5) return { inference: 'Hypodivergent / Low Angle Pattern', status: 'abnormal' };
      return { inference: 'Normodivergent Pattern', status: 'normal' };
    },
  },

  // 2. Convexity Parameter (1)
  {
    key: 'convexityPointA',
    label: '4. Convexity Point A',
    category: 'Convexity',
    normalText: () => '2 ± 2 mm (0 - 4 mm)',
    unit: 'mm',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 4 }),
    evaluateInference: (val: number) => {
      if (val > 4) return { inference: 'Skeletal Class II Convex Profile', status: 'abnormal' };
      if (val < 0) return { inference: 'Skeletal Class III Concave Profile', status: 'abnormal' };
      return { inference: 'Normal Profile Convexity', status: 'normal' };
    },
  },

  // 3. Teeth Parameters (3)
  {
    key: 'lowerIncisorToAPogMm',
    label: '5. Lower Incisor to A-Pog (mm)',
    category: 'Teeth',
    normalText: () => '1 ± 2 mm (-1 - 3 mm)',
    unit: 'mm',
    getNormalRange: () => ({ minNormal: -1, maxNormal: 3 }),
    evaluateInference: (val: number) => {
      if (val > 3) return { inference: 'Lower Incisor Protrusion', status: 'abnormal' };
      if (val < -1) return { inference: 'Lower Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Position', status: 'normal' };
    },
  },
  {
    key: 'upperMolarToPtv',
    label: '6. Upper Molar to PTV (mm)',
    category: 'Teeth',
    normalText: (age: number) => {
      const target = age + 3;
      return `${target} mm (Age ${age} + 3 mm)`;
    },
    unit: 'mm',
    getNormalRange: (age: number) => {
      const target = age + 3;
      return { minNormal: target, maxNormal: target };
    },
    evaluateInference: (val: number, age: number) => {
      const target = age + 3;
      if (val > target) return { inference: 'Upper Molar Mesial Position', status: 'abnormal' };
      if (val < target) return { inference: 'Upper Molar Distal Position', status: 'abnormal' };
      return { inference: 'Normal Upper Molar Position', status: 'normal' };
    },
  },
  {
    key: 'lowerIncisorToAPogDeg',
    label: '7. Lower Incisor to A-Pog Angle',
    category: 'Teeth',
    normalText: () => '22° ± 4° (18° - 26°)',
    unit: '°',
    getNormalRange: () => ({ minNormal: 18, maxNormal: 26 }),
    evaluateInference: (val: number) => {
      if (val > 26) return { inference: 'Lower Incisor Proclination', status: 'abnormal' };
      if (val < 18) return { inference: 'Lower Incisor Retroclination', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Angle', status: 'normal' };
    },
  },

  // 4. Profile Parameter (1)
  {
    key: 'lowerLipToEPlane',
    label: '8. Lower Lip to E-Plane (mm)',
    category: 'Profile',
    normalText: () => '-2 ± 2 mm (-4 - 0 mm)',
    unit: 'mm',
    getNormalRange: () => ({ minNormal: -4, maxNormal: 0 }),
    evaluateInference: (val: number) => {
      if (val > 0) return { inference: 'Lower Lip Protrusion', status: 'abnormal' };
      if (val < -4) return { inference: 'Lower Lip Retrusion', status: 'abnormal' };
      return { inference: 'Balanced Soft Tissue Lip Position', status: 'normal' };
    },
  },
];

export const DEFAULT_RICKETTS_PARAMS: RickettsParametersMap = {
  facialAxis: { pre: '', mid: '', post: '' },
  facialDepth: { pre: '', mid: '', post: '' },
  mandibularPlaneAngle: { pre: '', mid: '', post: '' },
  convexityPointA: { pre: '', mid: '', post: '' },
  lowerIncisorToAPogMm: { pre: '', mid: '', post: '' },
  upperMolarToPtv: { pre: '', mid: '', post: '' },
  lowerIncisorToAPogDeg: { pre: '', mid: '', post: '' },
  lowerLipToEPlane: { pre: '', mid: '', post: '' },
};

const CLASS_II_RICKETTS_SAMPLE: RickettsParametersMap = {
  facialAxis: { pre: 82, mid: 85, post: 89 },
  facialDepth: { pre: 81, mid: 84, post: 87 },
  mandibularPlaneAngle: { pre: 34, mid: 30, post: 26 },
  convexityPointA: { pre: 6, mid: 3, post: 2 },
  lowerIncisorToAPogMm: { pre: 5, mid: 3, post: 1 },
  upperMolarToPtv: { pre: 19, mid: 17, post: 15 },
  lowerIncisorToAPogDeg: { pre: 29, mid: 25, post: 22 },
  lowerLipToEPlane: { pre: 2, mid: -1, post: -2 },
};

const CLASS_III_RICKETTS_SAMPLE: RickettsParametersMap = {
  facialAxis: { pre: 96, mid: 93, post: 90 },
  facialDepth: { pre: 93, mid: 90, post: 87 },
  mandibularPlaneAngle: { pre: 19, mid: 22, post: 26 },
  convexityPointA: { pre: -3, mid: 0, post: 2 },
  lowerIncisorToAPogMm: { pre: -3, mid: -1, post: 1 },
  upperMolarToPtv: { pre: 11, mid: 13, post: 15 },
  lowerIncisorToAPogDeg: { pre: 15, mid: 18, post: 22 },
  lowerLipToEPlane: { pre: -6, mid: -4, post: -2 },
};

export interface RickettsAnalysisProps {
  data?: RickettsAnalysisData;
  onChange?: (updatedData: RickettsAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  patientAge?: number | string;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const RickettsAnalysis: React.FC<RickettsAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  patientAge = 12,
  isOpen = true,
  onToggle,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  // Parse patient age properly
  const numericAge = useMemo(() => {
    if (typeof patientAge === 'number' && !isNaN(patientAge) && patientAge > 0) {
      return patientAge;
    }
    if (typeof patientAge === 'string') {
      const parsed = parseInt(patientAge, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 12; // default standard reference age
  }, [patientAge]);

  const [params, setParams] = useState<RickettsParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_RICKETTS_PARAMS, ...data.parameters };
    }
    return DEFAULT_RICKETTS_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = RICKETTS_PARAMETERS_META.every(
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

  const generateRickettsSummary = (
    currentParams: RickettsParametersMap,
    stage: 'pre' | 'mid' | 'post',
    age: number
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const findings: string[] = [];

    RICKETTS_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, age);
        findings.push(res.inference);
      }
    });

    if (findings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in Ricketts Analysis section to auto-generate the diagnostic conclusion.`;
    }

    return `Ricketts Summary (${stageLabel}): Patient presents with ${findings.join(', ')}.`;
  };

  const handleInputChange = (
    key: RickettsParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);
    const updatedParams: RickettsParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };
    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateRickettsSummary(updatedParams, currentStage, numericAge);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary);
  };

  const notifyChange = (updatedParams: RickettsParametersMap, updatedConclusion: string) => {
    if (onChange) {
      onChange({
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  const getFieldValidation = (val: number | '', meta: RickettsParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-amber-500/20 focus:border-amber-600',
      };
    }
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(numericAge);
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
      RickettsParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    RICKETTS_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val), numericAge);
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage, numericAge]);

  // Auto-generate Cohesive Diagnostic Summary Sentence
  const autoGeneratedSummary = useMemo(
    () => generateRickettsSummary(params, currentStage, numericAge),
    [params, currentStage, numericAge]
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

  const handleLoadSample = (sample: RickettsParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_RICKETTS_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate Ricketts Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_RICKETTS_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return RICKETTS_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return RICKETTS_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined) return false;
      return m.evaluateInference(Number(val), numericAge).status === 'abnormal';
    }).length;
  }, [params, currentStage, numericAge]);

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
    category: 'Chin in Space / Skeletal' | 'Convexity' | 'Teeth to Face' | 'Profile (E-Line)',
    title: string
  ) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        {title}
      </div>
      {RICKETTS_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
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
                <p className="text-xs font-bold text-slate-900 leading-snug whitespace-normal break-words">{meta.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-normal break-words">
                  Norm {meta.normalText(numericAge)}
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
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              Ricketts Analysis
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                8 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Chin in Space, Convexity, Teeth & Profile (Age Ref: {numericAge} yrs)
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-amber-600" />
              {activeCount}/8 Measured
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
          {/* Quick Preset Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Presets & Controls:
              </span>
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                Patient Age: <strong>{numericAge} yrs</strong> (PTV Target: {numericAge + 3} mm)
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_RICKETTS_SAMPLE)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Class II Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_RICKETTS_SAMPLE)}
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
            {renderMobileParamRows('Chin in Space / Skeletal', '1. Chin in Space / Skeletal Parameters (3)')}
            {renderMobileParamRows('Convexity', '2. Convexity Parameter (1)')}
            {renderMobileParamRows('Teeth to Face', '3. Teeth to Face Parameters (3)')}
            {renderMobileParamRows('Profile (E-Line)', '4. Soft Tissue Profile Parameter (1)')}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Normal Range</th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-amber-900 text-amber-200 font-extrabold border-b-2 border-amber-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* 1. Chin in Space / Skeletal Parameters Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      1. Chin in Space / Skeletal Parameters (3)
                    </td>
                  </tr>

                  {RICKETTS_PARAMETERS_META.filter((m) => m.category === 'Chin in Space / Skeletal').map((meta) => {
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
                          {meta.normalText(numericAge)}
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

                  {/* 2. Convexity Parameter Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      2. Convexity Parameter (1)
                    </td>
                  </tr>

                  {RICKETTS_PARAMETERS_META.filter((m) => m.category === 'Convexity').map((meta) => {
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
                          {meta.normalText(numericAge)}
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

                  {/* 3. Teeth Parameters Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      3. Teeth Parameters (3)
                    </td>
                  </tr>

                  {RICKETTS_PARAMETERS_META.filter((m) => m.category === 'Teeth').map((meta) => {
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
                          {meta.normalText(numericAge)}
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

                  {/* 4. Profile Parameter Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      4. Profile Parameter (1)
                    </td>
                  </tr>

                  {RICKETTS_PARAMETERS_META.filter((m) => m.category === 'Profile').map((meta) => {
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
                          {meta.normalText(numericAge)}
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
                <FileText className="w-4 h-4 text-amber-600" />
                Ricketts Diagnostic Conclusion ({stageDisplayLabel} Stage)
              </h5>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 underline inline-flex items-center gap-1"
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
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
