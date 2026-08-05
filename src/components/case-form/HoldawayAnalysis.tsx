import React, { useState, useEffect, useMemo } from 'react';
import {
  HoldawayParameterKey,
  HoldawayParametersMap,
  HoldawayAnalysisData,
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
  Zap,
} from 'lucide-react';
import { StepperInput } from './StepperInput';

export interface HoldawayParameterMeta {
  key: HoldawayParameterKey;
  label: string;
  category: 'Soft Tissue Profile';
  unit: string;
  normalText: (anbVal?: number | '') => string;
  getNormalRange: (anbVal?: number | '') => { minNormal: number; maxNormal: number; target?: number };
  evaluateInference: (
    val: number,
    anbVal?: number | ''
  ) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const HOLDAWAY_PARAMETERS_META: HoldawayParameterMeta[] = [
  {
    key: 'facialContourAngle',
    label: '1. Facial Contour Angle',
    category: 'Soft Tissue Profile',
    unit: '°',
    normalText: () => '8° to 10°',
    getNormalRange: () => ({ minNormal: 8, maxNormal: 10 }),
    evaluateInference: (val: number) => {
      if (val > 10) return { inference: 'Convex Soft Tissue Profile', status: 'abnormal' };
      if (val < 8) return { inference: 'Concave Soft Tissue Profile', status: 'abnormal' };
      return { inference: 'Straight / Balanced Soft Tissue Profile', status: 'normal' };
    },
  },
  {
    key: 'upperLipStrain',
    label: '2. Upper Lip Strain',
    category: 'Soft Tissue Profile',
    unit: 'mm',
    normalText: () => '3 mm',
    getNormalRange: () => ({ minNormal: 3, maxNormal: 3 }),
    evaluateInference: (val: number) => {
      if (val > 3) return { inference: 'Excessive Upper Lip Strain', status: 'abnormal' };
      if (val < 3) return { inference: 'Minimal Upper Lip Strain', status: 'abnormal' };
      return { inference: 'Normal Upper Lip Strain', status: 'normal' };
    },
  },
  {
    key: 'softTissueChinThickness',
    label: '3. Soft Tissue Chin Thickness',
    category: 'Soft Tissue Profile',
    unit: 'mm',
    normalText: () => '10 to 12 mm',
    getNormalRange: () => ({ minNormal: 10, maxNormal: 12 }),
    evaluateInference: (val: number) => {
      if (val > 12) return { inference: 'Increased Soft Tissue Chin Thickness', status: 'abnormal' };
      if (val < 10) return { inference: 'Deficient Soft Tissue Chin Thickness', status: 'abnormal' };
      return { inference: 'Normal Soft Tissue Chin Thickness', status: 'normal' };
    },
  },
  {
    key: 'subnasaleToHLine',
    label: '4. Subnasale to H-Line',
    category: 'Soft Tissue Profile',
    unit: 'mm',
    normalText: () => '3 to 7 mm',
    getNormalRange: () => ({ minNormal: 3, maxNormal: 7 }),
    evaluateInference: (val: number) => {
      if (val > 7) return { inference: 'Subnasale Protrusion / Midface Prominence', status: 'abnormal' };
      if (val < 3) return { inference: 'Subnasale Retrusion', status: 'abnormal' };
      return { inference: 'Normal Subnasale Relationship', status: 'normal' };
    },
  },
  {
    key: 'upperLipToHLine',
    label: '5. Upper Lip to H-Line',
    category: 'Soft Tissue Profile',
    unit: 'mm',
    normalText: () => '1 to 2 mm',
    getNormalRange: () => ({ minNormal: 1, maxNormal: 2 }),
    evaluateInference: (val: number) => {
      if (val > 2) return { inference: 'Upper Lip Protrusion relative to H-Line', status: 'abnormal' };
      if (val < 1) return { inference: 'Upper Lip Retrusion relative to H-Line', status: 'abnormal' };
      return { inference: 'Balanced Upper Lip Position', status: 'normal' };
    },
  },
  {
    key: 'lowerLipToHLine',
    label: '6. Lower Lip to H-Line',
    category: 'Soft Tissue Profile',
    unit: 'mm',
    normalText: () => '0 to 0.5 mm',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 0.5 }),
    evaluateInference: (val: number) => {
      if (val > 0.5) return { inference: 'Lower Lip Protrusion relative to H-Line', status: 'abnormal' };
      if (val < 0) return { inference: 'Lower Lip Retrusion relative to H-Line', status: 'abnormal' };
      return { inference: 'Balanced Lower Lip Position', status: 'normal' };
    },
  },
  {
    key: 'softTissueFacialAngle',
    label: '7. Soft Tissue Facial Angle',
    category: 'Soft Tissue Profile',
    unit: '°',
    normalText: () => '91° ± 7° (84° - 98°)',
    getNormalRange: () => ({ minNormal: 84, maxNormal: 98 }),
    evaluateInference: (val: number) => {
      if (val > 98) return { inference: 'Prominent Soft Tissue Chin / Class III Profile', status: 'abnormal' };
      if (val < 84) return { inference: 'Retrusive Soft Tissue Chin / Class II Profile', status: 'abnormal' };
      return { inference: 'Normal Soft Tissue Facial Angle', status: 'normal' };
    },
  },
  {
    key: 'hAngle',
    label: '8. H-Angle (H-Line to NB Line)',
    category: 'Soft Tissue Profile',
    unit: '°',
    normalText: (anbVal) => {
      if (anbVal !== undefined && anbVal !== '' && !isNaN(Number(anbVal))) {
        const target = 7 + Number(anbVal);
        return `7° to 15° (Target: ${target}° for ANB ${anbVal}°)`;
      }
      return '7° to 15° (Ideal: 10°)';
    },
    getNormalRange: (anbVal) => {
      if (anbVal !== undefined && anbVal !== '' && !isNaN(Number(anbVal))) {
        const target = 7 + Number(anbVal);
        // Range is ±3° around target, clamped to realistic limits
        return {
          minNormal: Math.max(4, target - 3),
          maxNormal: target + 3,
          target,
        };
      }
      return { minNormal: 7, maxNormal: 15, target: 10 };
    },
    evaluateInference: (val: number, anbVal) => {
      const { minNormal, maxNormal } =
        anbVal !== undefined && anbVal !== '' && !isNaN(Number(anbVal))
          ? {
              minNormal: Math.max(4, 7 + Number(anbVal) - 3),
              maxNormal: 7 + Number(anbVal) + 3,
            }
          : { minNormal: 7, maxNormal: 15 };

      if (val > maxNormal)
        return { inference: 'Increased H-Angle / Soft Tissue Class II Tendency', status: 'abnormal' };
      if (val < minNormal)
        return { inference: 'Decreased H-Angle / Soft Tissue Class III Tendency', status: 'abnormal' };
      return { inference: 'Harmonious Profile Angle', status: 'normal' };
    },
  },
];

export const DEFAULT_HOLDAWAY_PARAMS: HoldawayParametersMap = {
  facialContourAngle: { pre: '', mid: '', post: '' },
  upperLipStrain: { pre: '', mid: '', post: '' },
  softTissueChinThickness: { pre: '', mid: '', post: '' },
  subnasaleToHLine: { pre: '', mid: '', post: '' },
  upperLipToHLine: { pre: '', mid: '', post: '' },
  lowerLipToHLine: { pre: '', mid: '', post: '' },
  softTissueFacialAngle: { pre: '', mid: '', post: '' },
  hAngle: { pre: '', mid: '', post: '' },
};

const CLASS_II_HOLDAWAY_SAMPLE: HoldawayParametersMap = {
  facialContourAngle: { pre: 14, mid: 11, post: 9 },
  upperLipStrain: { pre: 5, mid: 4, post: 3 },
  softTissueChinThickness: { pre: 9, mid: 10, post: 11 },
  subnasaleToHLine: { pre: 9, mid: 7, post: 5 },
  upperLipToHLine: { pre: 4, mid: 3, post: 2 },
  lowerLipToHLine: { pre: 2, mid: 1, post: 0.5 },
  softTissueFacialAngle: { pre: 80, mid: 86, post: 91 },
  hAngle: { pre: 18, mid: 14, post: 10 },
};

const CLASS_III_HOLDAWAY_SAMPLE: HoldawayParametersMap = {
  facialContourAngle: { pre: 4, mid: 6, post: 9 },
  upperLipStrain: { pre: 1, mid: 2, post: 3 },
  softTissueChinThickness: { pre: 14, mid: 13, post: 11 },
  subnasaleToHLine: { pre: 1, mid: 2, post: 4 },
  upperLipToHLine: { pre: -1, mid: 0.5, post: 1.5 },
  lowerLipToHLine: { pre: -1, mid: -0.5, post: 0.2 },
  softTissueFacialAngle: { pre: 102, mid: 96, post: 91 },
  hAngle: { pre: 3, mid: 6, post: 10 },
};

export interface HoldawayAnalysisProps {
  data?: HoldawayAnalysisData;
  onChange?: (updatedData: HoldawayAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
  steinersAnalysis?: SteinersAnalysisData;
}

export const HoldawayAnalysis: React.FC<HoldawayAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
  steinersAnalysis,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  // Cross reference active ANB angle from Steiner's Analysis
  const activeAnbVal = steinersAnalysis?.parameters?.anb?.[currentStage];

  const [params, setParams] = useState<HoldawayParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_HOLDAWAY_PARAMS, ...data.parameters };
    }
    return DEFAULT_HOLDAWAY_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = HOLDAWAY_PARAMETERS_META.every(
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

  const generateHoldawaySummary = (
    currentParams: HoldawayParametersMap,
    stage: 'pre' | 'mid' | 'post',
    anb: number
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const findings: string[] = [];

    HOLDAWAY_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, anb);
        findings.push(res.inference);
      }
    });

    if (findings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in Holdaway Soft Tissue Analysis section to auto-generate the diagnostic conclusion.`;
    }

    return `Holdaway Summary (${stageLabel}): Patient presents with ${findings.join(', ')}.`;
  };

  const handleInputChange = (
    key: HoldawayParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);

    const updatedParams: HoldawayParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };

    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateHoldawaySummary(updatedParams, currentStage, activeAnbVal);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary);
  };

  const notifyChange = (updatedParams: HoldawayParametersMap, updatedConclusion: string) => {
    if (onChange) {
      onChange({
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  const getFieldValidation = (val: number | '', meta: HoldawayParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-rose-500/20 focus:border-rose-600',
      };
    }
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(activeAnbVal);
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
      HoldawayParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    HOLDAWAY_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val), activeAnbVal);
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage, activeAnbVal]);

  const autoGeneratedSummary = useMemo(
    () => generateHoldawaySummary(params, currentStage, activeAnbVal),
    [params, currentStage, activeAnbVal]
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

  const handleLoadSample = (sample: HoldawayParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_HOLDAWAY_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate Holdaway Soft Tissue Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_HOLDAWAY_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return HOLDAWAY_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return HOLDAWAY_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined) return false;
      return m.evaluateInference(Number(val), activeAnbVal).status === 'abnormal';
    }).length;
  }, [params, currentStage, activeAnbVal]);

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

  const renderMobileParamRows = () => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        Soft Tissue Profile & Lip-Line Parameters
      </div>
      {HOLDAWAY_PARAMETERS_META.map((meta) => {
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
                  Norm {meta.normalText(activeAnbVal)}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <StepperInput
                value={currentVal}
                onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                min={meta.getNormalRange(activeAnbVal).minNormal - 10}
                max={meta.getNormalRange(activeAnbVal).maxNormal + 10}
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
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-pink-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              Holdaway Soft Tissue Analysis
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                8 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Soft Tissue Profile, Lip Strain, Chin Thickness & Dynamic H-Angle
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-pink-600" />
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
          {/* Dynamic H-Angle Logic Banner */}
          <div className="bg-pink-50 border border-pink-200 p-2.5 sm:p-3 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 text-pink-600 shrink-0" />
              <div>
                <span className="font-bold text-pink-950">Dynamic H-Angle Target Engine: </span>
                {activeAnbVal !== undefined && activeAnbVal !== '' && !isNaN(Number(activeAnbVal)) ? (
                  <span className="text-pink-900 font-medium">
                    ANB is measured at <strong className="font-bold text-pink-950">{activeAnbVal}°</strong> ({stageDisplayLabel} stage). Expected Target H-Angle = <strong className="font-bold text-pink-950">7° + ANB ({7 + Number(activeAnbVal)}°)</strong>.
                  </span>
                ) : (
                  <span className="text-pink-900 font-medium">
                    Measure ANB angle in Steiner&apos;s Analysis section to compute personalized H-Angle target (7° + ANB). Default ideal: <strong className="font-bold text-pink-950">10°</strong> (Range: 7° - 15°).
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Presets Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Presets:
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_HOLDAWAY_SAMPLE)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Class II Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_HOLDAWAY_SAMPLE)}
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
            {renderMobileParamRows()}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Normal / Target Range</th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-pink-900 text-pink-200 font-extrabold border-b-2 border-pink-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* Category: Soft Tissue Profile Parameters */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      Soft Tissue Profile & Lip-Line Parameters
                    </td>
                  </tr>
                  {HOLDAWAY_PARAMETERS_META.map((meta) => {
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
                          {meta.normalText(activeAnbVal)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <StepperInput
                            value={currentVal}
                            onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                            min={meta.getNormalRange(activeAnbVal).minNormal - 10}
                            max={meta.getNormalRange(activeAnbVal).maxNormal + 10}
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
                <FileText className="w-4 h-4 text-pink-600" />
                Holdaway Soft Tissue Diagnostic Conclusion ({stageDisplayLabel} Stage)
              </h5>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-pink-700 hover:text-pink-800 underline inline-flex items-center gap-1"
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
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-pink-500/20 focus:border-pink-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
