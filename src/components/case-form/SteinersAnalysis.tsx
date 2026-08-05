import React, { useState, useEffect, useMemo } from 'react';
import {
  SteinersParameterKey,
  SteinersParametersMap,
  SteinersAnalysisData,
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
import { StepperInput } from './StepperInput';

export interface SteinersParameterMeta {
  key: SteinersParameterKey;
  label: string;
  category: 'Skeletal' | 'Dental' | 'Soft Tissue';
  normalText: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  evaluateInference: (val: number) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const STEINERS_PARAMETERS_META: SteinersParameterMeta[] = [
  // 1. Skeletal Parameters (5)
  {
    key: 'sna',
    label: 'SNA Angle',
    category: 'Skeletal',
    normalText: '82° (80° - 84°)',
    unit: '°',
    minNormal: 80,
    maxNormal: 84,
    evaluateInference: (val: number) => {
      if (val > 84) return { inference: 'Maxillary Prognathism', status: 'abnormal' };
      if (val < 80) return { inference: 'Maxillary Retrognathism', status: 'abnormal' };
      return { inference: 'Normal Maxillary AP Position', status: 'normal' };
    },
  },
  {
    key: 'snb',
    label: 'SNB Angle',
    category: 'Skeletal',
    normalText: '80° (78° - 82°)',
    unit: '°',
    minNormal: 78,
    maxNormal: 82,
    evaluateInference: (val: number) => {
      if (val > 82) return { inference: 'Mandibular Prognathism', status: 'abnormal' };
      if (val < 78) return { inference: 'Mandibular Retrognathism', status: 'abnormal' };
      return { inference: 'Normal Mandibular AP Position', status: 'normal' };
    },
  },
  {
    key: 'anb',
    label: 'ANB Angle',
    category: 'Skeletal',
    normalText: '2° (0° - 4°)',
    unit: '°',
    minNormal: 0,
    maxNormal: 4,
    evaluateInference: (val: number) => {
      if (val > 4) return { inference: 'Skeletal Class II Malocclusion', status: 'abnormal' };
      if (val < 0) return { inference: 'Skeletal Class III Malocclusion', status: 'abnormal' };
      return { inference: 'Skeletal Class I Pattern', status: 'normal' };
    },
  },
  {
    key: 'occlusalPlaneAngle',
    label: 'Occlusal Plane Angle',
    category: 'Skeletal',
    normalText: '14° (12° - 16°)',
    unit: '°',
    minNormal: 12,
    maxNormal: 16,
    evaluateInference: (val: number) => {
      if (val > 16) return { inference: 'Steep Occlusal Plane Angle', status: 'abnormal' };
      if (val < 12) return { inference: 'Flat Occlusal Plane Angle', status: 'abnormal' };
      return { inference: 'Normal Occlusal Plane', status: 'normal' };
    },
  },
  {
    key: 'mandibularPlaneAngle',
    label: 'Mandibular Plane Angle (GoGn-SN)',
    category: 'Skeletal',
    normalText: '32° (29° - 35°)',
    unit: '°',
    minNormal: 29,
    maxNormal: 35,
    evaluateInference: (val: number) => {
      if (val > 35) return { inference: 'Hyperdivergent / High Angle Pattern', status: 'abnormal' };
      if (val < 29) return { inference: 'Hypodivergent / Low Angle Pattern', status: 'abnormal' };
      return { inference: 'Normodivergent Pattern', status: 'normal' };
    },
  },

  // 2. Dental Parameters (5)
  {
    key: 'upperIncisorToNaMm',
    label: 'Upper Incisors to NA (mm)',
    category: 'Dental',
    normalText: '4 mm',
    unit: 'mm',
    minNormal: 4,
    maxNormal: 4,
    evaluateInference: (val: number) => {
      if (val > 4) return { inference: 'Upper Incisor Protrusion', status: 'abnormal' };
      if (val < 4) return { inference: 'Upper Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Upper Incisor Position', status: 'normal' };
    },
  },
  {
    key: 'upperIncisorToNaDeg',
    label: 'Upper Incisors to NA Angle',
    category: 'Dental',
    normalText: '22°',
    unit: '°',
    minNormal: 22,
    maxNormal: 22,
    evaluateInference: (val: number) => {
      if (val > 22) return { inference: 'Upper Incisor Proclination', status: 'abnormal' };
      if (val < 22) return { inference: 'Upper Incisor Retroclination', status: 'abnormal' };
      return { inference: 'Normal Upper Incisor Inclination', status: 'normal' };
    },
  },
  {
    key: 'lowerIncisorToNbDeg',
    label: 'Lower Incisors to NB Angle',
    category: 'Dental',
    normalText: '25°',
    unit: '°',
    minNormal: 25,
    maxNormal: 25,
    evaluateInference: (val: number) => {
      if (val > 25) return { inference: 'Lower Incisor Proclination', status: 'abnormal' };
      if (val < 25) return { inference: 'Lower Incisor Retroclination', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Inclination', status: 'normal' };
    },
  },
  {
    key: 'lowerIncisorToNbMm',
    label: 'Lower Incisors to NB (mm)',
    category: 'Dental',
    normalText: '4 mm',
    unit: 'mm',
    minNormal: 4,
    maxNormal: 4,
    evaluateInference: (val: number) => {
      if (val > 4) return { inference: 'Lower Incisor Protrusion', status: 'abnormal' };
      if (val < 4) return { inference: 'Lower Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Position', status: 'normal' };
    },
  },
  {
    key: 'interincisalAngle',
    label: 'Interincisal Angle',
    category: 'Dental',
    normalText: '130°',
    unit: '°',
    minNormal: 130,
    maxNormal: 130,
    evaluateInference: (val: number) => {
      if (val < 130) return { inference: 'Proclined Incisors / Bimaxillary Protrusion', status: 'abnormal' };
      if (val > 130) return { inference: 'Retroclined Incisors', status: 'abnormal' };
      return { inference: 'Normal Interincisal Angle', status: 'normal' };
    },
  },

  // 3. Soft Tissue Parameter (1)
  {
    key: 'steinersSLine',
    label: "Steiner's S-Line",
    category: 'Soft Tissue',
    normalText: '0 mm',
    unit: 'mm',
    minNormal: 0,
    maxNormal: 0,
    evaluateInference: (val: number) => {
      if (val > 0) return { inference: 'Soft Tissue Lip Protrusion', status: 'abnormal' };
      if (val < 0) return { inference: 'Soft Tissue Lip Retrusion', status: 'abnormal' };
      return { inference: 'Balanced Lip Profile', status: 'normal' };
    },
  },
];

export const DEFAULT_STEINERS_PARAMS: SteinersParametersMap = {
  sna: { pre: '', mid: '', post: '' },
  snb: { pre: '', mid: '', post: '' },
  anb: { pre: '', mid: '', post: '' },
  occlusalPlaneAngle: { pre: '', mid: '', post: '' },
  mandibularPlaneAngle: { pre: '', mid: '', post: '' },
  upperIncisorToNaMm: { pre: '', mid: '', post: '' },
  upperIncisorToNaDeg: { pre: '', mid: '', post: '' },
  lowerIncisorToNbDeg: { pre: '', mid: '', post: '' },
  lowerIncisorToNbMm: { pre: '', mid: '', post: '' },
  interincisalAngle: { pre: '', mid: '', post: '' },
  steinersSLine: { pre: '', mid: '', post: '' },
};

const CLASS_II_STEINERS_SAMPLE: SteinersParametersMap = {
  sna: { pre: 86, mid: 84, post: 82 },
  snb: { pre: 77, mid: 79, post: 80 },
  anb: { pre: 9, mid: 5, post: 2 },
  occlusalPlaneAngle: { pre: 18, mid: 16, post: 14 },
  mandibularPlaneAngle: { pre: 38, mid: 35, post: 32 },
  upperIncisorToNaMm: { pre: 7, mid: 5, post: 4 },
  upperIncisorToNaDeg: { pre: 28, mid: 25, post: 22 },
  lowerIncisorToNbDeg: { pre: 29, mid: 27, post: 25 },
  lowerIncisorToNbMm: { pre: 6, mid: 5, post: 4 },
  interincisalAngle: { pre: 118, mid: 124, post: 130 },
  steinersSLine: { pre: 3, mid: 1.5, post: 0 },
};

const CLASS_III_STEINERS_SAMPLE: SteinersParametersMap = {
  sna: { pre: 78, mid: 80, post: 82 },
  snb: { pre: 85, mid: 82, post: 80 },
  anb: { pre: -7, mid: -2, post: 2 },
  occlusalPlaneAngle: { pre: 10, mid: 12, post: 14 },
  mandibularPlaneAngle: { pre: 25, mid: 28, post: 32 },
  upperIncisorToNaMm: { pre: 2, mid: 3, post: 4 },
  upperIncisorToNaDeg: { pre: 18, mid: 20, post: 22 },
  lowerIncisorToNbDeg: { pre: 19, mid: 22, post: 25 },
  lowerIncisorToNbMm: { pre: 2, mid: 3, post: 4 },
  interincisalAngle: { pre: 142, mid: 136, post: 130 },
  steinersSLine: { pre: -2, mid: -1, post: 0 },
};

export interface SteinersAnalysisProps {
  data?: SteinersAnalysisData;
  onChange?: (updatedData: SteinersAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
}

export const SteinersAnalysis: React.FC<SteinersAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  const [params, setParams] = useState<SteinersParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_STEINERS_PARAMS, ...data.parameters };
    }
    return DEFAULT_STEINERS_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = STEINERS_PARAMETERS_META.every(
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

  const generateSteinersSummary = (
    currentParams: SteinersParametersMap,
    stage: 'pre' | 'mid' | 'post'
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const findings: string[] = [];

    STEINERS_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num);
        findings.push(res.inference);
      }
    });

    if (findings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in Steiner's Analysis section to auto-generate the diagnostic conclusion.`;
    }

    return `Steiner's Summary (${stageLabel}): Patient presents with ${findings.join(', ')}.`;
  };

  const handleInputChange = (
    key: SteinersParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);
    const updatedParams: SteinersParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };
    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSteinersSummary(updatedParams, currentStage);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary);
  };

  const notifyChange = (updatedParams: SteinersParametersMap, updatedConclusion: string) => {
    if (onChange) {
      onChange({
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  const getFieldValidation = (val: number | '', meta: SteinersParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/20 focus:border-teal-600',
      };
    }
    const num = Number(val);
    const isWithinRange = num >= meta.minNormal && num <= meta.maxNormal;
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
      SteinersParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    STEINERS_PARAMETERS_META.forEach((meta) => {
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

  // Auto-generate Cohesive Diagnostic Summary Sentence
  const autoGeneratedSummary = useMemo(
    () => generateSteinersSummary(params, currentStage),
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

  const handleLoadSample = (sample: SteinersParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_STEINERS_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate Steiner's Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_STEINERS_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return STEINERS_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return STEINERS_PARAMETERS_META.filter((m) => {
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

  const renderMobileParamRows = (category: 'Skeletal' | 'Dental' | 'Soft Tissue', title: string) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        {title}
      </div>
      {STEINERS_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
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
                  Norm {meta.normalText}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <StepperInput
                value={currentVal}
                onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                min={meta.minNormal - 20}
                max={meta.maxNormal + 20}
                step={0.1}
                unit={meta.unit}
                validationClass={validation.className}
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
        className="w-full p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                Steiner's Analysis
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  11 Parameters
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Skeletal, Dental, & Soft Tissue Cephalometric Standard
              </p>
            </div>
          </div>
          <div className="text-slate-500 shrink-0">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pl-0 sm:pl-9">
          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
            <Activity className="w-3 h-3 text-teal-600" />
            {activeCount}/11 Measured
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
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-4 bg-slate-50/50">
          {/* Presets — stacked on mobile so buttons never clip */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Presets & controls
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_STEINERS_SAMPLE)}
                className="min-h-9 px-1.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">Class II</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_STEINERS_SAMPLE)}
                className="min-h-9 px-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">Class III</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="min-h-9 px-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="truncate">Reset</span>
              </button>
            </div>
          </div>

          {/* Mobile: stacked parameter rows */}
          <div className="space-y-3 md:hidden">
            {renderMobileParamRows('Skeletal', '1. Skeletal Parameters (5)')}
            {renderMobileParamRows('Dental', '2. Dental Parameters (5)')}
            {renderMobileParamRows('Soft Tissue', '3. Soft Tissue Parameter (1)')}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Normal Range</th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-teal-900 text-teal-200 font-extrabold border-b-2 border-teal-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* 1. Skeletal Parameters Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      1. Skeletal Parameters (5)
                    </td>
                  </tr>

                  {STEINERS_PARAMETERS_META.filter((m) => m.category === 'Skeletal').map((meta) => {
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
                          <StepperInput
                            value={currentVal}
                            onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                            min={meta.minNormal - 20}
                            max={meta.maxNormal + 20}
                            step={0.1}
                            unit={meta.unit}
                            validationClass={validation.className}
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

                  {/* 2. Dental Parameters Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      2. Dental Parameters (5)
                    </td>
                  </tr>

                  {STEINERS_PARAMETERS_META.filter((m) => m.category === 'Dental').map((meta) => {
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
                          <StepperInput
                            value={currentVal}
                            onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                            min={meta.minNormal - 20}
                            max={meta.maxNormal + 20}
                            step={0.1}
                            unit={meta.unit}
                            validationClass={validation.className}
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

                  {/* 3. Soft Tissue Parameter Section */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      3. Soft Tissue Parameter (1)
                    </td>
                  </tr>

                  {STEINERS_PARAMETERS_META.filter((m) => m.category === 'Soft Tissue').map((meta) => {
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
                          <StepperInput
                            value={currentVal}
                            onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                            min={meta.minNormal - 20}
                            max={meta.maxNormal + 20}
                            step={0.1}
                            unit={meta.unit}
                            validationClass={validation.className}
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
                <FileText className="w-4 h-4 text-teal-600" />
                Steiner's Diagnostic Conclusion ({stageDisplayLabel} Stage)
              </h5>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1"
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
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
