import React, { useState, useEffect, useMemo } from 'react';
import {
  VerticalJawDivergenceParameterKey,
  VerticalJawDivergenceParametersMap,
  VerticalJawDivergenceAnalysisData,
  Gender,
} from '../../types';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  Compass,
} from 'lucide-react';

export interface VerticalJawDivergenceParameterMeta {
  key: VerticalJawDivergenceParameterKey;
  label: string;
  category: 'Mandibular Length & Anatomical Factors' | 'Vertical Skeletal Parameters & Jaw Divergence';
  unit: string;
  normalText: (gender: 'Male' | 'Female') => string;
  getNormalRange: (gender: 'Male' | 'Female') => { minNormal: number; maxNormal: number };
  evaluateInference: (
    val: number,
    gender: 'Male' | 'Female'
  ) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const VERTICAL_JAW_DIVERGENCE_PARAMETERS_META: VerticalJawDivergenceParameterMeta[] = [
  // --- A. Mandibular Length & Anatomical Factors (6) ---
  {
    key: 'mandibularEffectiveLength',
    label: 'Mandibular Effective Length (Co-Gn)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: 'mm',
    normalText: () => '105 to 120 mm (Age/Chart Norm)',
    getNormalRange: () => ({ minNormal: 105, maxNormal: 120 }),
    evaluateInference: (val) => {
      if (val < 105) return { inference: 'Micrognathic / Short Mandibular Length', status: 'abnormal' };
      if (val > 120) return { inference: 'Macrognathic / Long Mandibular Length', status: 'abnormal' };
      return { inference: 'Normal Mandibular Effective Length', status: 'normal' };
    },
  },
  {
    key: 'mandibularPlacement',
    label: 'Mandibular Placement (S-N-Pgon)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: '°',
    normalText: () => '78° to 82° (Rel. to Cranial Base)',
    getNormalRange: () => ({ minNormal: 78, maxNormal: 82 }),
    evaluateInference: (val) => {
      if (val < 78) return { inference: 'Retrognathic Mandibular Position', status: 'abnormal' };
      if (val > 82) return { inference: 'Prognathic Mandibular Position', status: 'abnormal' };
      return { inference: 'Normal Mandibular Placement', status: 'normal' };
    },
  },
  {
    key: 'saddleAngle',
    label: 'Saddle Angle (N-S-Ar)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: '°',
    normalText: () => '123° ± 5° (118° to 128°)',
    getNormalRange: () => ({ minNormal: 118, maxNormal: 128 }),
    evaluateInference: (val) => {
      if (val > 128) return { inference: 'Obtuse Saddle Angle (Posterior Fossa Position)', status: 'abnormal' };
      if (val < 118) return { inference: 'Acute Saddle Angle (Anterior Fossa Position)', status: 'abnormal' };
      return { inference: 'Normal Saddle Angle', status: 'normal' };
    },
  },
  {
    key: 'postCranialBase',
    label: 'Post Cranial Base (S-Ar)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: 'mm',
    normalText: () => '32 to 38 mm',
    getNormalRange: () => ({ minNormal: 32, maxNormal: 38 }),
    evaluateInference: (val) => {
      if (val < 32) return { inference: 'Short Posterior Cranial Base Length', status: 'abnormal' };
      if (val > 38) return { inference: 'Long Posterior Cranial Base Length', status: 'abnormal' };
      return { inference: 'Normal Posterior Cranial Base', status: 'normal' };
    },
  },
  {
    key: 'effectOfGonialAngle',
    label: 'Effect of Gonial Angle (Ar-Go-Me)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: '°',
    normalText: () => '120° to 130°',
    getNormalRange: () => ({ minNormal: 120, maxNormal: 130 }),
    evaluateInference: (val) => {
      if (val > 130) return { inference: 'Increased Gonial Angle Contribution (High Angle)', status: 'abnormal' };
      if (val < 120) return { inference: 'Decreased Gonial Angle Contribution (Low Angle)', status: 'abnormal' };
      return { inference: 'Harmonious Gonial Angle', status: 'normal' };
    },
  },
  {
    key: 'effectOfRamusOrientation',
    label: 'Effect of Ramus Orientation (S-Ar-Go)',
    category: 'Mandibular Length & Anatomical Factors',
    unit: '°',
    normalText: () => '140° to 146°',
    getNormalRange: () => ({ minNormal: 140, maxNormal: 146 }),
    evaluateInference: (val) => {
      if (val > 146) return { inference: 'Backward / Distal Ramus Inclination', status: 'abnormal' };
      if (val < 140) return { inference: 'Forward / Mesial Ramus Inclination', status: 'abnormal' };
      return { inference: 'Normal Ramus Orientation', status: 'normal' };
    },
  },

  // --- B. Vertical Skeletal Parameters & Jaw Divergence (12) ---
  {
    key: 'midLowerFaceHeightRatio',
    label: 'Mid / Lower Face Height Ratio (N-ANS / ANS-Me)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '%',
    normalText: () => '45 : 55 (80% to 85% Ratio)',
    getNormalRange: () => ({ minNormal: 80, maxNormal: 85 }),
    evaluateInference: (val) => {
      if (val < 80) return { inference: 'Increased Lower Anterior Facial Height (LAFH)', status: 'abnormal' };
      if (val > 85) return { inference: 'Decreased Lower Anterior Facial Height', status: 'abnormal' };
      return { inference: 'Harmonious Vertical Facial Proportions (45:55)', status: 'normal' };
    },
  },
  {
    key: 'snGoGnAngle',
    label: 'SN-Go-Gn Angle (Mandibular Plane)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '32° (28° to 36°)',
    getNormalRange: () => ({ minNormal: 28, maxNormal: 36 }),
    evaluateInference: (val) => {
      if (val > 36) return { inference: 'High Mandibular Plane Angle (Hyperdivergent)', status: 'abnormal' };
      if (val < 28) return { inference: 'Low Mandibular Plane Angle (Hypodivergent)', status: 'abnormal' };
      return { inference: 'Normodivergent Mandibular Plane', status: 'normal' };
    },
  },
  {
    key: 'fmaAngle',
    label: 'FMA Angle (FH-Go-Gn)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '25° (20° to 28°)',
    getNormalRange: () => ({ minNormal: 20, maxNormal: 28 }),
    evaluateInference: (val) => {
      if (val > 28) return { inference: 'High FMA Angle (Vertical Growth Pattern)', status: 'abnormal' };
      if (val < 20) return { inference: 'Low FMA Angle (Horizontal Growth Pattern)', status: 'abnormal' };
      return { inference: 'Normodivergent FMA Angle', status: 'normal' };
    },
  },
  {
    key: 'jarabakRatio',
    label: 'Jarabak Ratio (S-Go / N-Me)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '%',
    normalText: () => '62% to 65%',
    getNormalRange: () => ({ minNormal: 62, maxNormal: 65 }),
    evaluateInference: (val) => {
      if (val < 62) return { inference: 'Clockwise / Hyperdivergent Growth Vector', status: 'abnormal' };
      if (val > 65) return { inference: 'Counter-Clockwise / Hypodivergent Vector', status: 'abnormal' };
      return { inference: 'Neutral Growth Vector (62-65%)', status: 'normal' };
    },
  },
  {
    key: 'bjoerkSum',
    label: 'Bjoerk Sum (Saddle + Articular + Gonial)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '396° ± 6° (390° to 402°)',
    getNormalRange: () => ({ minNormal: 390, maxNormal: 402 }),
    evaluateInference: (val) => {
      if (val > 402) return { inference: 'Increased Bjoerk Sum (Hyperdivergent)', status: 'abnormal' };
      if (val < 390) return { inference: 'Decreased Bjoerk Sum (Hypodivergent)', status: 'abnormal' };
      return { inference: 'Normal Bjoerk Sum (396°)', status: 'normal' };
    },
  },
  {
    key: 'articularAngle',
    label: 'Articular Angle (S-Ar-Go)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '143° ± 6° (137° to 149°)',
    getNormalRange: () => ({ minNormal: 137, maxNormal: 149 }),
    evaluateInference: (val) => {
      if (val > 149) return { inference: 'Obtuse Articular Angle (Retro-Positioned Ramus)', status: 'abnormal' };
      if (val < 137) return { inference: 'Acute Articular Angle (Ante-Positioned Ramus)', status: 'abnormal' };
      return { inference: 'Normal Articular Angle', status: 'normal' };
    },
  },
  {
    key: 'upperGonialAngle',
    label: 'Upper Gonial Angle (U-Gonial: Ar-Go-N)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '52° to 55°',
    getNormalRange: () => ({ minNormal: 52, maxNormal: 55 }),
    evaluateInference: (val) => {
      if (val > 55) return { inference: 'Increased Upper Gonial Angle (Backward Inclination)', status: 'abnormal' };
      if (val < 52) return { inference: 'Decreased Upper Gonial Angle', status: 'abnormal' };
      return { inference: 'Normal Upper Gonial Angle', status: 'normal' };
    },
  },
  {
    key: 'lowerGonialAngle',
    label: 'Lower Gonial Angle (L-Gonial: N-Go-Me)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '70° to 75°',
    getNormalRange: () => ({ minNormal: 70, maxNormal: 75 }),
    evaluateInference: (val) => {
      if (val > 75) return { inference: 'Increased Lower Gonial Angle (Steep Mandible Body)', status: 'abnormal' };
      if (val < 70) return { inference: 'Decreased Lower Gonial Angle (Flat Mandible Body)', status: 'abnormal' };
      return { inference: 'Normal Lower Gonial Angle', status: 'normal' };
    },
  },
  {
    key: 'yAxisNsGfa',
    label: 'Y-axis N-S-Gfa / N-S-Gn',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '66° (62° to 70°)',
    getNormalRange: () => ({ minNormal: 62, maxNormal: 70 }),
    evaluateInference: (val) => {
      if (val > 70) return { inference: 'Increased Growth Axis (Vertical Direction)', status: 'abnormal' };
      if (val < 62) return { inference: 'Decreased Growth Axis (Horizontal Direction)', status: 'abnormal' };
      return { inference: 'Normal Growth Axis Angle', status: 'normal' };
    },
  },
  {
    key: 'yAxisFhSGn',
    label: 'Y-axis FH-S-Gn',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '59° (55° to 63°)',
    getNormalRange: () => ({ minNormal: 55, maxNormal: 63 }),
    evaluateInference: (val) => {
      if (val > 63) return { inference: 'Vertical Facial Growth Trend', status: 'abnormal' };
      if (val < 55) return { inference: 'Horizontal Facial Growth Trend', status: 'abnormal' };
      return { inference: 'Balanced Facial Growth Direction', status: 'normal' };
    },
  },
  {
    key: 'basalPlaneAngle',
    label: 'Basal Plane Angle (PP-MP)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: '°',
    normalText: () => '25° (20° to 28°)',
    getNormalRange: () => ({ minNormal: 20, maxNormal: 28 }),
    evaluateInference: (val) => {
      if (val > 28) return { inference: 'Increased Basal Plane Divergence', status: 'abnormal' };
      if (val < 20) return { inference: 'Decreased Basal Plane Divergence', status: 'abnormal' };
      return { inference: 'Harmonious Basal Plane Divergence', status: 'normal' };
    },
  },
  {
    key: 'vertMaxPlacementNToAns',
    label: 'Vertical Maxillary Placement (Nasion to ANS)',
    category: 'Vertical Skeletal Parameters & Jaw Divergence',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '60 ± 4 mm (56-64 mm)' : '55 ± 2 mm (53-57 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 56, maxNormal: 64 } : { minNormal: 53, maxNormal: 57 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 56, maxNormal: 64 } : { minNormal: 53, maxNormal: 57 };
      if (val > maxNormal) return { inference: 'Maxillary Vertical Excess (VME)', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Maxillary Vertical Deficiency (VMD)', status: 'abnormal' };
      return { inference: 'Normal Maxillary Vertical Height', status: 'normal' };
    },
  },
];

export const DEFAULT_VERTICAL_PARAMS: VerticalJawDivergenceParametersMap = {
  mandibularEffectiveLength: { pre: '', mid: '', post: '' },
  mandibularPlacement: { pre: '', mid: '', post: '' },
  saddleAngle: { pre: '', mid: '', post: '' },
  postCranialBase: { pre: '', mid: '', post: '' },
  effectOfGonialAngle: { pre: '', mid: '', post: '' },
  effectOfRamusOrientation: { pre: '', mid: '', post: '' },
  midLowerFaceHeightRatio: { pre: '', mid: '', post: '' },
  snGoGnAngle: { pre: '', mid: '', post: '' },
  fmaAngle: { pre: '', mid: '', post: '' },
  jarabakRatio: { pre: '', mid: '', post: '' },
  bjoerkSum: { pre: '', mid: '', post: '' },
  articularAngle: { pre: '', mid: '', post: '' },
  upperGonialAngle: { pre: '', mid: '', post: '' },
  lowerGonialAngle: { pre: '', mid: '', post: '' },
  yAxisNsGfa: { pre: '', mid: '', post: '' },
  yAxisFhSGn: { pre: '', mid: '', post: '' },
  basalPlaneAngle: { pre: '', mid: '', post: '' },
  vertMaxPlacementNToAns: { pre: '', mid: '', post: '' },
};

export const SAMPLE_VERTICAL_PARAMS: VerticalJawDivergenceParametersMap = {
  mandibularEffectiveLength: { pre: 108, mid: 110, post: 112 },
  mandibularPlacement: { pre: 76, mid: 77, post: 78 },
  saddleAngle: { pre: 131, mid: 131, post: 130 },
  postCranialBase: { pre: 30, mid: 31, post: 32 },
  effectOfGonialAngle: { pre: 134, mid: 133, post: 132 },
  effectOfRamusOrientation: { pre: 148, mid: 147, post: 146 },
  midLowerFaceHeightRatio: { pre: 75, mid: 77, post: 80 },
  snGoGnAngle: { pre: 39, mid: 37, post: 35 },
  fmaAngle: { pre: 31, mid: 29, post: 27 },
  jarabakRatio: { pre: 58, mid: 60, post: 63 },
  bjoerkSum: { pre: 411, mid: 406, post: 400 },
  articularAngle: { pre: 152, mid: 149, post: 146 },
  upperGonialAngle: { pre: 57, mid: 55, post: 54 },
  lowerGonialAngle: { pre: 78, mid: 76, post: 74 },
  yAxisNsGfa: { pre: 72, mid: 70, post: 68 },
  yAxisFhSGn: { pre: 65, mid: 62, post: 60 },
  basalPlaneAngle: { pre: 32, mid: 30, post: 27 },
  vertMaxPlacementNToAns: { pre: 66, mid: 64, post: 62 },
};

export interface VerticalJawDivergenceAnalysisProps {
  data?: VerticalJawDivergenceAnalysisData;
  onChange?: (data: VerticalJawDivergenceAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
  patientGender?: Gender;
}

export const VerticalJawDivergenceAnalysis: React.FC<VerticalJawDivergenceAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
  patientGender = 'Male',
}) => {
  const [params, setParams] = useState<VerticalJawDivergenceParametersMap>(() => {
    return { ...DEFAULT_VERTICAL_PARAMS, ...(data?.parameters || {}) };
  });

  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    patientGender === 'Female' ? 'Female' : 'Male'
  );

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  useEffect(() => {
    if (patientGender) {
      setSelectedGender(patientGender === 'Female' ? 'Female' : 'Male');
    }
  }, [patientGender]);

  // Sync external prop updates safely
  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.every((p) => {
          return (
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
          );
        });
        if (isSame) return prev;
        const next: any = { ...prev };
        VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.forEach((p) => {
          next[p.key] = {
            pre: data.parameters?.[p.key]?.pre ?? prev[p.key]?.pre ?? '',
            mid: data.parameters?.[p.key]?.mid ?? prev[p.key]?.mid ?? '',
            post: data.parameters?.[p.key]?.post ?? prev[p.key]?.post ?? '',
          };
        });
        return next;
      });
    }
    if (data?.conclusion !== undefined && data.conclusion !== conclusion) {
      setConclusion(data.conclusion);
    }
  }, [data]);

  // Real-time Inference Engine Calculation
  const computeInferenceEngine = (
    currentParams: VerticalJawDivergenceParametersMap,
    stage: 'pre' | 'mid' | 'post',
    gender: 'Male' | 'Female'
  ) => {
    const fma = currentParams.fmaAngle?.[stage];
    const snGoGn = currentParams.snGoGnAngle?.[stage];
    const jarabak = currentParams.jarabakRatio?.[stage];
    const bjoerk = currentParams.bjoerkSum?.[stage];
    const basalPlane = currentParams.basalPlaneAngle?.[stage];
    const nAns = currentParams.vertMaxPlacementNToAns?.[stage];
    const postCranial = currentParams.postCranialBase?.[stage];
    const ramusOrient = currentParams.effectOfRamusOrientation?.[stage];
    const saddle = currentParams.saddleAngle?.[stage];

    const hasValues =
      (fma !== '' && fma !== undefined) ||
      (snGoGn !== '' && snGoGn !== undefined) ||
      (jarabak !== '' && jarabak !== undefined) ||
      (bjoerk !== '' && bjoerk !== undefined);

    let divergencePattern = 'Awaiting Vertical Measurements';
    let rotationTendency = 'Not Evaluated';
    let divergenceOfJawBases = 'Normal / Parallel Basal Relationship';
    let jawFaultLocalization = 'Non-contributing / Unspecified';

    if (hasValues) {
      const fmaNum = Number(fma);
      const snGoGnNum = Number(snGoGn);
      const jarabakNum = Number(jarabak);
      const bjoerkNum = Number(bjoerk);

      const isHyper =
        (!isNaN(fmaNum) && fmaNum > 28) ||
        (!isNaN(snGoGnNum) && snGoGnNum > 36) ||
        (!isNaN(jarabakNum) && jarabakNum < 62) ||
        (!isNaN(bjoerkNum) && bjoerkNum > 402);

      const isHypo =
        (!isNaN(fmaNum) && fmaNum < 20) ||
        (!isNaN(snGoGnNum) && snGoGnNum < 28) ||
        (!isNaN(jarabakNum) && jarabakNum > 65) ||
        (!isNaN(bjoerkNum) && bjoerkNum < 390);

      if (isHyper) {
        divergencePattern = 'Hyperdivergent Growth Pattern (High Angle / Vertical Grower)';
        rotationTendency = 'Downward and Backward Rotation of Mandible';
      } else if (isHypo) {
        divergencePattern = 'Hypodivergent Growth Pattern (Low Angle / Horizontal Grower)';
        rotationTendency = 'Upward and Forward Rotation of Mandible';
      } else {
        divergencePattern = 'Normodivergent Pattern (Neutral Growth Vector)';
        rotationTendency = 'Harmonious Rotational Balance';
      }

      // 2. Divergence of Jaw Bases Classification
      const basalNum = Number(basalPlane);
      if (!isNaN(snGoGnNum) && !isNaN(basalNum) && snGoGnNum > 36 && basalNum > 28) {
        divergenceOfJawBases = 'Anterior Divergent Pattern';
      } else if (!isNaN(snGoGnNum) && !isNaN(basalNum) && snGoGnNum < 28 && basalNum < 20) {
        divergenceOfJawBases = 'Anterior Convergent Pattern';
      } else {
        divergenceOfJawBases = 'Parallel / Normal Basal Relationship';
      }

      // 3. Jaw Fault Localization
      const nAnsNum = Number(nAns);
      const postCranialNum = Number(postCranial);
      const ramusOrientNum = Number(ramusOrient);
      const saddleNum = Number(saddle);

      const maxNormRange = gender === 'Male' ? { min: 56, max: 64 } : { min: 53, max: 57 };
      const faultParts: string[] = [];

      if (!isNaN(nAnsNum)) {
        if (nAnsNum > maxNormRange.max) faultParts.push('Maxillary Vertical Excess (VME)');
        else if (nAnsNum < maxNormRange.min) faultParts.push('Maxillary Vertical Deficiency (VMD)');
      }

      const hasRamusDef =
        (!isNaN(postCranialNum) && postCranialNum < 32) ||
        (!isNaN(ramusOrientNum) && ramusOrientNum > 146) ||
        (!isNaN(saddleNum) && saddleNum > 128);

      if (hasRamusDef) {
        faultParts.push('Mandibular Ramus / Posterior Height Deficiency');
      } else if (!isNaN(postCranialNum) && postCranialNum > 38) {
        faultParts.push('Mandibular Ramus / Posterior Height Excess');
      }

      if (faultParts.length > 0) {
        jawFaultLocalization = faultParts.join(' with ');
      } else {
        jawFaultLocalization = 'Proportional Vertical Jaw & Cranial Base Height';
      }
    }

    return {
      divergencePattern,
      rotationTendency,
      divergenceOfJawBases,
      jawFaultLocalization,
    };
  };

  const generateSummary = (
    currentParams: VerticalJawDivergenceParametersMap,
    stage: 'pre' | 'mid' | 'post',
    gender: 'Male' | 'Female'
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const measuredParams: string[] = [];

    VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, gender);
        measuredParams.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    if (measuredParams.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} vertical cephalometric values to auto-generate the Vertical Relation & Jaw Divergence diagnostic conclusion.`;
    }

    const eng = computeInferenceEngine(currentParams, stage, gender);

    let summary = `Vertical Relation & Jaw Divergence Analysis (${stageLabel} Evaluation):\n`;
    summary += `• Vertical Divergence Classification: ${eng.divergencePattern}.\n`;
    summary += `• Mandibular Rotational Tendency: ${eng.rotationTendency}.\n`;
    summary += `• Jaw Bases Divergence Relation: ${eng.divergenceOfJawBases}.\n`;
    summary += `• Anatomical Fault Localization: ${eng.jawFaultLocalization}.\n`;
    summary += `• Measured Parameters: ${measuredParams.join('; ')}.`;

    return summary.trim();
  };

  const notifyChange = (
    newParams: VerticalJawDivergenceParametersMap,
    newConclusion: string,
    gender: 'Male' | 'Female'
  ) => {
    const eng = computeInferenceEngine(newParams, currentStage, gender);
    onChange?.({
      parameters: newParams,
      conclusion: newConclusion,
      divergencePattern: eng.divergencePattern,
      rotationTendency: eng.rotationTendency,
      divergenceOfJawBases: eng.divergenceOfJawBases,
      jawFaultLocalization: eng.jawFaultLocalization,
    });
  };

  const handleValueChange = (
    key: VerticalJawDivergenceParameterKey,
    stage: 'pre' | 'mid' | 'post',
    valStr: string
  ) => {
    const num = valStr === '' ? '' : parseFloat(valStr);
    const updatedParams = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: isNaN(num as number) ? '' : num,
      },
    };
    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSummary(updatedParams, currentStage, selectedGender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary, selectedGender);
  };

  const getInputClass = (key: VerticalJawDivergenceParameterKey, stage: 'pre' | 'mid' | 'post') => {
    const val = params[key]?.[stage];
    if (val === '' || val === undefined || isNaN(Number(val))) {
      return 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400 focus:border-slate-500';
    }
    const meta = VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.find((p) => p.key === key);
    if (!meta) return 'bg-white border-slate-300 text-slate-800';
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(selectedGender);
    if (num >= minNormal && num <= maxNormal) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600';
    }
    return 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600';
  };

  // Measured count computation
  const measuredCount = useMemo(() => {
    let count = 0;
    VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        count++;
      }
    });
    return count;
  }, [params, currentStage]);

  // Real-Time Engine Results
  const engineInference = useMemo(
    () => computeInferenceEngine(params, currentStage, selectedGender),
    [params, currentStage, selectedGender]
  );

  // Auto Summary
  const autoGeneratedSummary = useMemo(
    () => generateSummary(params, currentStage, selectedGender),
    [params, currentStage, selectedGender]
  );

  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    setSelectedGender(gender);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSummary(params, currentStage, gender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(params, nextSummary, gender);
  };

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, e.target.value, selectedGender);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, autoGeneratedSummary, selectedGender);
  };

  const handleLoadSample = () => {
    setParams(SAMPLE_VERTICAL_PARAMS);
    setUserEditedConclusion(false);
    const sampleSummary = generateSummary(SAMPLE_VERTICAL_PARAMS, currentStage, selectedGender);
    setConclusion(sampleSummary);
    notifyChange(SAMPLE_VERTICAL_PARAMS, sampleSummary, selectedGender);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_VERTICAL_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = generateSummary(DEFAULT_VERTICAL_PARAMS, currentStage, selectedGender);
    setConclusion(emptySummary);
    notifyChange(DEFAULT_VERTICAL_PARAMS, emptySummary, selectedGender);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sectionAParams = VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.filter(
    (p) => p.category === 'Mandibular Length & Anatomical Factors'
  );
  const sectionBParams = VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.filter(
    (p) => p.category === 'Vertical Skeletal Parameters & Jaw Divergence'
  );

  const stageLabel =
    currentStage === 'pre'
      ? 'Pre (Baseline)'
      : currentStage === 'mid'
      ? 'Mid Stage'
      : 'Post Treatment';

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Collapsible Card Header */}
      <div
        onClick={onToggle}
        className="w-full px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-50/90 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer border-b border-slate-200/80 select-none transition-colors"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                Vertical Relation & Jaw Divergence Analysis
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                18 Parameters
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Mandibular length, vertical skeletal angles, Jarabak ratio & growth divergence
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700">
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>
              {measuredCount}/{VERTICAL_JAW_DIVERGENCE_PARAMETERS_META.length} Measured
            </span>
          </div>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <div className="p-3 sm:p-5 space-y-6">
          {/* Top Bar Controls & Gender Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Active Stage:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-600 text-white shadow-2xs">
                <Zap className="w-3 h-3" />
                {stageLabel}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Gender Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Norms Gender:</span>
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Male')}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      selectedGender === 'Male'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Female')}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      selectedGender === 'Female'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sample Data</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section A: Mandibular Length & Anatomical Factors */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Layers className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                A. Mandibular Length & Anatomical Factors
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3 w-4/12 sm:w-3/12">Parameter Name</th>
                    <th className="py-2 px-3 w-3/12 sm:w-2/12">Reference Norm</th>
                    <th className="py-2 px-3 w-2/12 text-center">Input ({activeStage.toUpperCase()})</th>
                    <th className="py-2 px-3 w-3/12 sm:w-5/12">Live Auto-Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sectionAParams.map((meta) => {
                    const val = params[meta.key]?.[currentStage];
                    const hasVal = val !== '' && val !== undefined && !isNaN(Number(val));
                    const evaluation = hasVal ? meta.evaluateInference(Number(val), selectedGender) : null;
                    const inputClass = getInputClass(meta.key, currentStage);

                    return (
                      <tr key={meta.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-1.5 px-3 font-semibold text-slate-800 text-xs">
                          {meta.label}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-medium text-[11px]">
                          {meta.normalText(selectedGender)}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <div className="relative inline-block w-20 sm:w-24">
                            <input
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) => handleValueChange(meta.key, currentStage, e.target.value)}
                              placeholder="Val"
                              className={`w-full text-center py-1 px-2 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${inputClass}`}
                            />
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          {!hasVal ? (
                            <span className="text-slate-400 text-[11px] italic">Awaiting value</span>
                          ) : evaluation?.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {evaluation.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {evaluation?.inference}
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

          {/* Section B: Vertical Skeletal Parameters & Jaw Divergence */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Compass className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                B. Vertical Skeletal Parameters & Jaw Divergence
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3 w-4/12 sm:w-3/12">Parameter Name</th>
                    <th className="py-2 px-3 w-3/12 sm:w-2/12">Reference Norm</th>
                    <th className="py-2 px-3 w-2/12 text-center">Input ({activeStage.toUpperCase()})</th>
                    <th className="py-2 px-3 w-3/12 sm:w-5/12">Live Auto-Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sectionBParams.map((meta) => {
                    const val = params[meta.key]?.[currentStage];
                    const hasVal = val !== '' && val !== undefined && !isNaN(Number(val));
                    const evaluation = hasVal ? meta.evaluateInference(Number(val), selectedGender) : null;
                    const inputClass = getInputClass(meta.key, currentStage);

                    return (
                      <tr key={meta.key} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-1.5 px-3 font-semibold text-slate-800 text-xs">
                          {meta.label}
                        </td>
                        <td className="py-1.5 px-3 text-slate-500 font-medium text-[11px]">
                          {meta.normalText(selectedGender)}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <div className="relative inline-block w-20 sm:w-24">
                            <input
                              type="number"
                              step="any"
                              value={val}
                              onChange={(e) => handleValueChange(meta.key, currentStage, e.target.value)}
                              placeholder="Val"
                              className={`w-full text-center py-1 px-2 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${inputClass}`}
                            />
                          </div>
                        </td>
                        <td className="py-1.5 px-3">
                          {!hasVal ? (
                            <span className="text-slate-400 text-[11px] italic">Awaiting value</span>
                          ) : evaluation?.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {evaluation.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100/90 border border-rose-300 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {evaluation?.inference}
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

          {/* REAL-TIME AUTO-INFERENCE ENGINE DISPLAY BOX */}
          <div className="p-3 rounded-lg bg-slate-900 text-white space-y-2.5 shadow-sm border border-slate-800 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <h4 className="text-[11px] font-bold text-teal-300 uppercase tracking-wider">
                  Growth Divergence & Rotational Synthesis Engine
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Stage: {stageLabel}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Primary Divergence Pattern
                </span>
                <p className="font-extrabold text-teal-300 text-xs">
                  {engineInference.divergencePattern}
                </p>
                <p className="text-[11px] text-slate-300 font-medium">
                  Rotational Tendency: <span className="font-bold text-slate-100">{engineInference.rotationTendency}</span>
                </p>
              </div>

              <div className="p-2 rounded bg-slate-800/80 border border-slate-700/80 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                  Divergence of Jaw Bases & Fault
                </span>
                <p className="font-bold text-slate-200 text-xs">
                  {engineInference.divergenceOfJawBases}
                </p>
                <p className="text-[11px] text-teal-200/90 font-medium">
                  Anatomical Fault: <span className="font-bold text-white">{engineInference.jawFaultLocalization}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Comprehensive Auto-Generated Diagnostic Summary Box */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Comprehensive Diagnostic Summary
                </h4>
              </div>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset to Auto
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              value={conclusion}
              onChange={handleConclusionChange}
              rows={3}
              placeholder="Diagnostic conclusion auto-generates here as measurements are entered..."
              className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium leading-relaxed bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden transition-all shadow-2xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};
