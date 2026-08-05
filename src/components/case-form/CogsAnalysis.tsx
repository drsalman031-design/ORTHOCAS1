import React, { useState, useEffect, useMemo } from 'react';
import {
  CogsParameterKey,
  CogsParametersMap,
  CogsAnalysisData,
  CogsSoftTissueParameterKey,
  CogsSoftTissueParametersMap,
  CogsSoftTissueAnalysisData,
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
  Activity,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
} from 'lucide-react';
import { StepperInput } from './StepperInput';

// --- Hard Tissue Parameter Metadata ---
export interface CogsParameterMeta {
  key: CogsParameterKey;
  label: string;
  category: 'Skeletal AP' | 'Skeletal Hard Tissue Lengths' | 'Vertical Heights';
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

export const COGS_PARAMETERS_META: CogsParameterMeta[] = [
  // --- A. Skeletal AP (2) ---
  {
    key: 'na',
    label: 'N-A (Maxillary AP Position)',
    category: 'Skeletal AP',
    unit: 'mm',
    normalText: () => '0 ± 3 mm (-3 to 3 mm)',
    getNormalRange: () => ({ minNormal: -3, maxNormal: 3 }),
    evaluateInference: (val) => {
      if (val > 3) return { inference: 'Maxillary Prognathism / Forward Position', status: 'abnormal' };
      if (val < -3) return { inference: 'Maxillary Retrognathism / Posterior Position', status: 'abnormal' };
      return { inference: 'Normal Maxillary AP Position', status: 'normal' };
    },
  },
  {
    key: 'nb',
    label: 'N-B (Mandibular AP Position)',
    category: 'Skeletal AP',
    unit: 'mm',
    normalText: () => '-3 ± 3 mm (-6 to 0 mm)',
    getNormalRange: () => ({ minNormal: -6, maxNormal: 0 }),
    evaluateInference: (val) => {
      if (val > 0) return { inference: 'Mandibular Prognathism / Forward Position', status: 'abnormal' };
      if (val < -6) return { inference: 'Mandibular Retrognathism / Posterior Position', status: 'abnormal' };
      return { inference: 'Normal Mandibular AP Position', status: 'normal' };
    },
  },

  // --- B. Skeletal Hard Tissue Lengths (4) ---
  {
    key: 'maxillaryLengthPtmA',
    label: 'Ptm-A (Maxillary Unit Length)',
    category: 'Skeletal Hard Tissue Lengths',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '53 ± 3 mm (50 to 56 mm)' : '50 ± 3 mm (47 to 53 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 50, maxNormal: 56 } : { minNormal: 47, maxNormal: 53 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 50, maxNormal: 56 } : { minNormal: 47, maxNormal: 53 };
      if (val > maxNormal) return { inference: 'Increased Maxillary Length', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Maxillary Length', status: 'abnormal' };
      return { inference: 'Normal Maxillary Unit Length', status: 'normal' };
    },
  },
  {
    key: 'totalMandibularLengthArPg',
    label: 'Ar-Pg (Total Mandibular Length)',
    category: 'Skeletal Hard Tissue Lengths',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '118 ± 6 mm (112 to 124 mm)' : '110 ± 5 mm (105 to 115 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 112, maxNormal: 124 } : { minNormal: 105, maxNormal: 115 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 112, maxNormal: 124 } : { minNormal: 105, maxNormal: 115 };
      if (val > maxNormal) return { inference: 'Increased Total Mandibular Length', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Total Mandibular Length', status: 'abnormal' };
      return { inference: 'Normal Total Mandibular Length', status: 'normal' };
    },
  },
  {
    key: 'corpusLengthGoPg',
    label: 'Go-Pg (Mandibular Corpus Length)',
    category: 'Skeletal Hard Tissue Lengths',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '80 ± 5 mm (75 to 85 mm)' : '75 ± 4 mm (71 to 79 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 75, maxNormal: 85 } : { minNormal: 71, maxNormal: 79 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 75, maxNormal: 85 } : { minNormal: 71, maxNormal: 79 };
      if (val > maxNormal) return { inference: 'Increased Mandibular Corpus Length', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Mandibular Corpus Length', status: 'abnormal' };
      return { inference: 'Normal Mandibular Corpus Length', status: 'normal' };
    },
  },
  {
    key: 'ramusHeightArGo',
    label: 'Ar-Go (Ramus Height)',
    category: 'Skeletal Hard Tissue Lengths',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '52 ± 4 mm (48 to 56 mm)' : '47 ± 4 mm (43 to 51 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 48, maxNormal: 56 } : { minNormal: 43, maxNormal: 51 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 48, maxNormal: 56 } : { minNormal: 43, maxNormal: 51 };
      if (val > maxNormal) return { inference: 'Increased Ramus Height', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Ramus Height', status: 'abnormal' };
      return { inference: 'Normal Ramus Height', status: 'normal' };
    },
  },

  // --- C. Vertical Heights (3) ---
  {
    key: 'nAns',
    label: 'N-ANS (Upper Anterior Facial Height)',
    category: 'Vertical Heights',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '55 ± 3 mm (52 to 58 mm)' : '50 ± 3 mm (47 to 53 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 52, maxNormal: 58 } : { minNormal: 47, maxNormal: 53 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 52, maxNormal: 58 } : { minNormal: 47, maxNormal: 53 };
      if (val > maxNormal) return { inference: 'Increased Upper Anterior Facial Height', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Upper Anterior Facial Height', status: 'abnormal' };
      return { inference: 'Normal Upper Anterior Facial Height', status: 'normal' };
    },
  },
  {
    key: 'ansMe',
    label: 'ANS-Me (Lower Anterior Facial Height)',
    category: 'Vertical Heights',
    unit: 'mm',
    normalText: (gender) => (gender === 'Male' ? '68 ± 4 mm (64 to 72 mm)' : '62 ± 4 mm (58 to 66 mm)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 64, maxNormal: 72 } : { minNormal: 58, maxNormal: 66 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 64, maxNormal: 72 } : { minNormal: 58, maxNormal: 66 };
      if (val > maxNormal) return { inference: 'Increased Lower Anterior Facial Height', status: 'abnormal' };
      if (val < minNormal) return { inference: 'Decreased Lower Anterior Facial Height', status: 'abnormal' };
      return { inference: 'Normal Lower Anterior Facial Height', status: 'normal' };
    },
  },
  {
    key: 'facialHeightRatio',
    label: 'N-ANS / ANS-Me (Facial Height Ratio)',
    category: 'Vertical Heights',
    unit: 'ratio',
    normalText: () => '0.81 (0.75 to 0.87)',
    getNormalRange: () => ({ minNormal: 0.75, maxNormal: 0.87 }),
    evaluateInference: (val) => {
      if (val > 0.87) return { inference: 'Upper Facial Height Excess / Lower Deficiency', status: 'abnormal' };
      if (val < 0.75) return { inference: 'Lower Facial Height Excess / Long Face Tendency', status: 'abnormal' };
      return { inference: 'Balanced Vertical Facial Height Ratio', status: 'normal' };
    },
  },
];

// --- Soft Tissue Parameter Metadata ---
export interface CogsSoftTissueParameterMeta {
  key: CogsSoftTissueParameterKey;
  label: string;
  category: 'Facial Form' | 'Lip Position & Form' | 'Profile Indices';
  unit: string;
  normalText: string;
  minNormal: number;
  maxNormal: number;
  evaluateInference: (val: number) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const COGS_SOFT_TISSUE_PARAMETERS_META: CogsSoftTissueParameterMeta[] = [
  // --- Facial Form Parameters (6) ---
  {
    key: 'gSnPg',
    label: "G-Sn-Pg' (Facial Convexity)",
    category: 'Facial Form',
    unit: '°',
    normalText: '12° ± 4° (8° to 16°)',
    minNormal: 8,
    maxNormal: 16,
    evaluateInference: (val) => {
      if (val > 16) return { inference: 'Convex Soft Tissue Profile', status: 'abnormal' };
      if (val < 8) return { inference: 'Concave Soft Tissue Profile', status: 'abnormal' };
      return { inference: 'Straight / Straight-Convex Profile', status: 'normal' };
    },
  },
  {
    key: 'gSn',
    label: 'G-Sn (IIHP)',
    category: 'Facial Form',
    unit: 'mm',
    normalText: '6 ± 3 mm (3 to 9 mm)',
    minNormal: 3,
    maxNormal: 9,
    evaluateInference: (val) => {
      if (val > 9) return { inference: 'Increased Subnasale Cranial Base Thickness', status: 'abnormal' };
      if (val < 3) return { inference: 'Decreased Subnasale Soft Tissue Thickness', status: 'abnormal' };
      return { inference: 'Normal Subnasale Soft Tissue Thickness', status: 'normal' };
    },
  },
  {
    key: 'gPg',
    label: "G-Pg'",
    category: 'Facial Form',
    unit: 'mm',
    normalText: '0 ± 4 mm (-4 to 4 mm)',
    minNormal: -4,
    maxNormal: 4,
    evaluateInference: (val) => {
      if (val > 4) return { inference: 'Protrusive Soft Tissue Chin', status: 'abnormal' };
      if (val < -4) return { inference: 'Retrusive Soft Tissue Chin', status: 'abnormal' };
      return { inference: 'Normal Soft Tissue Chin Position', status: 'normal' };
    },
  },
  {
    key: 'gSnSnMeRatio',
    label: "G-Sn / Sn-Me' (IIHP)",
    category: 'Facial Form',
    unit: 'ratio',
    normalText: '1.0 (0.9 to 1.1)',
    minNormal: 0.9,
    maxNormal: 1.1,
    evaluateInference: (val) => {
      if (val > 1.1) return { inference: 'Upper Soft Tissue Height Excess', status: 'abnormal' };
      if (val < 0.9) return { inference: 'Lower Soft Tissue Height Excess', status: 'abnormal' };
      return { inference: 'Balanced Vertical Soft Tissue Heights', status: 'normal' };
    },
  },
  {
    key: 'snGnC',
    label: "Sn-Gn'-C",
    category: 'Facial Form',
    unit: '°',
    normalText: '100° ± 7° (93° to 107°)',
    minNormal: 93,
    maxNormal: 107,
    evaluateInference: (val) => {
      if (val > 107) return { inference: 'Obtuse Subnasale-Gnathion-Cervical Angle', status: 'abnormal' };
      if (val < 93) return { inference: 'Acute Subnasale-Gnathion-Cervical Angle', status: 'abnormal' };
      return { inference: 'Normal Subnasale-Gnathion-Cervical Angle', status: 'normal' };
    },
  },
  {
    key: 'snGnCGnRatio',
    label: "Sn-Gn' / C-Gn'",
    category: 'Facial Form',
    unit: 'ratio',
    normalText: '1.2 (1.1 to 1.3)',
    minNormal: 1.1,
    maxNormal: 1.3,
    evaluateInference: (val) => {
      if (val > 1.3) return { inference: 'Increased Submental Distance Ratio', status: 'abnormal' };
      if (val < 1.1) return { inference: 'Decreased Submental Distance Ratio', status: 'abnormal' };
      return { inference: 'Normal Submental Distance Ratio', status: 'normal' };
    },
  },

  // --- Lip Position & Form Parameters (7) ---
  {
    key: 'cmSnLs',
    label: 'Cm-Sn-Ls (Nasolabial Angle)',
    category: 'Lip Position & Form',
    unit: '°',
    normalText: '102° ± 8° (94° to 110°)',
    minNormal: 94,
    maxNormal: 110,
    evaluateInference: (val) => {
      if (val < 94) return { inference: 'Acute Nasolabial Angle / Protrusive Upper Lip', status: 'abnormal' };
      if (val > 110) return { inference: 'Obtuse Nasolabial Angle / Upper Lip Retrusion', status: 'abnormal' };
      return { inference: 'Normal Nasolabial Angle', status: 'normal' };
    },
  },
  {
    key: 'lsSnPg',
    label: "Ls-(Sn-Pg') (Upper Lip Protrusion)",
    category: 'Lip Position & Form',
    unit: 'mm',
    normalText: '3 ± 1 mm (2 to 4 mm)',
    minNormal: 2,
    maxNormal: 4,
    evaluateInference: (val) => {
      if (val > 4) return { inference: 'Upper Lip Protrusion', status: 'abnormal' };
      if (val < 2) return { inference: 'Upper Lip Retrusion', status: 'abnormal' };
      return { inference: 'Normal Upper Lip Position', status: 'normal' };
    },
  },
  {
    key: 'liSnPg',
    label: "Li-(Sn-Pg') (Lower Lip Protrusion)",
    category: 'Lip Position & Form',
    unit: 'mm',
    normalText: '2 ± 1 mm (1 to 3 mm)',
    minNormal: 1,
    maxNormal: 3,
    evaluateInference: (val) => {
      if (val > 3) return { inference: 'Lower Lip Protrusion', status: 'abnormal' };
      if (val < 1) return { inference: 'Lower Lip Retrusion', status: 'abnormal' };
      return { inference: 'Normal Lower Lip Position', status: 'normal' };
    },
  },
  {
    key: 'siLiPg',
    label: "Si-(Li-Pg') (Mentolabial Sulcus)",
    category: 'Lip Position & Form',
    unit: 'mm',
    normalText: '4 ± 2 mm (2 to 6 mm)',
    minNormal: 2,
    maxNormal: 6,
    evaluateInference: (val) => {
      if (val > 6) return { inference: 'Deep Mentolabial Sulcus', status: 'abnormal' };
      if (val < 2) return { inference: 'Shallow Mentolabial Sulcus', status: 'abnormal' };
      return { inference: 'Normal Mentolabial Sulcus Depth', status: 'normal' };
    },
  },
  {
    key: 'snStmsStmiRatio',
    label: 'Sn-Stms / Sn-Stmi',
    category: 'Lip Position & Form',
    unit: 'ratio',
    normalText: '0.5 (0.45 to 0.55)',
    minNormal: 0.45,
    maxNormal: 0.55,
    evaluateInference: (val) => {
      if (val > 0.55) return { inference: 'Increased Upper Lip Height Ratio', status: 'abnormal' };
      if (val < 0.45) return { inference: 'Decreased Upper Lip Height Ratio', status: 'abnormal' };
      return { inference: 'Balanced Lip Length Ratio', status: 'normal' };
    },
  },
  {
    key: 'stmsI',
    label: 'Stms-I (Upper Incisor Exposure)',
    category: 'Lip Position & Form',
    unit: 'mm',
    normalText: '2 ± 2 mm (0 to 4 mm)',
    minNormal: 0,
    maxNormal: 4,
    evaluateInference: (val) => {
      if (val > 4) return { inference: 'Excessive Incisor Display at Rest (Gummy Smile Risk)', status: 'abnormal' };
      if (val < 0) return { inference: 'Inadequate Incisor Display / Covered Incisors', status: 'abnormal' };
      return { inference: 'Normal Upper Incisor Display', status: 'normal' };
    },
  },
  {
    key: 'stmsStmi',
    label: 'Stms-Stmi (Interlabial Gap)',
    category: 'Lip Position & Form',
    unit: 'mm',
    normalText: '2 ± 2 mm (0 to 4 mm)',
    minNormal: 0,
    maxNormal: 4,
    evaluateInference: (val) => {
      if (val > 4) return { inference: 'Lip Incompetence / Interlabial Gap Present', status: 'abnormal' };
      if (val < 0) return { inference: 'Tight Lip Seal / Negative Gap', status: 'abnormal' };
      return { inference: 'Normal Interlabial Gap / Competent Lips', status: 'normal' };
    },
  },

  // --- Profile Indices (1) ---
  {
    key: 'merrifieldZAngle',
    label: "Merrifield's Z-Angle",
    category: 'Profile Indices',
    unit: '°',
    normalText: '80° ± 9° (71° to 89°)',
    minNormal: 71,
    maxNormal: 89,
    evaluateInference: (val) => {
      if (val < 71) return { inference: 'Retrusive Chin / Acute Z-Angle Profile', status: 'abnormal' };
      if (val > 89) return { inference: 'Obtuse Z-Angle Profile / Protrusive Chin', status: 'abnormal' };
      return { inference: 'Balanced Z-Angle Profile', status: 'normal' };
    },
  },
];

export const DEFAULT_COGS_PARAMS: CogsParametersMap = {
  na: { pre: '', mid: '', post: '' },
  nb: { pre: '', mid: '', post: '' },
  maxillaryLengthPtmA: { pre: '', mid: '', post: '' },
  totalMandibularLengthArPg: { pre: '', mid: '', post: '' },
  corpusLengthGoPg: { pre: '', mid: '', post: '' },
  ramusHeightArGo: { pre: '', mid: '', post: '' },
  nAns: { pre: '', mid: '', post: '' },
  ansMe: { pre: '', mid: '', post: '' },
  facialHeightRatio: { pre: '', mid: '', post: '' },
};

export const DEFAULT_SOFT_TISSUE_PARAMS: CogsSoftTissueParametersMap = {
  gSnPg: { pre: '', mid: '', post: '' },
  gSn: { pre: '', mid: '', post: '' },
  gPg: { pre: '', mid: '', post: '' },
  gSnSnMeRatio: { pre: '', mid: '', post: '' },
  snGnC: { pre: '', mid: '', post: '' },
  snGnCGnRatio: { pre: '', mid: '', post: '' },
  cmSnLs: { pre: '', mid: '', post: '' },
  lsSnPg: { pre: '', mid: '', post: '' },
  liSnPg: { pre: '', mid: '', post: '' },
  siLiPg: { pre: '', mid: '', post: '' },
  snStmsStmiRatio: { pre: '', mid: '', post: '' },
  stmsI: { pre: '', mid: '', post: '' },
  stmsStmi: { pre: '', mid: '', post: '' },
  merrifieldZAngle: { pre: '', mid: '', post: '' },
};

const SAMPLE_COGS_HARD_DATA: CogsParametersMap = {
  na: { pre: 5, mid: 2, post: 0 },
  nb: { pre: -8, mid: -4, post: -3 },
  maxillaryLengthPtmA: { pre: 58, mid: 55, post: 53 },
  totalMandibularLengthArPg: { pre: 108, mid: 114, post: 118 },
  corpusLengthGoPg: { pre: 72, mid: 77, post: 80 },
  ramusHeightArGo: { pre: 46, mid: 50, post: 52 },
  nAns: { pre: 55, mid: 55, post: 55 },
  ansMe: { pre: 74, mid: 70, post: 68 },
  facialHeightRatio: { pre: 0.74, mid: 0.78, post: 0.81 },
};

const SAMPLE_COGS_SOFT_DATA: CogsSoftTissueParametersMap = {
  gSnPg: { pre: 18, mid: 14, post: 12 },
  gSn: { pre: 6, mid: 6, post: 6 },
  gPg: { pre: -5, mid: -2, post: 0 },
  gSnSnMeRatio: { pre: 1.0, mid: 1.0, post: 1.0 },
  snGnC: { pre: 102, mid: 101, post: 100 },
  snGnCGnRatio: { pre: 1.2, mid: 1.2, post: 1.2 },
  cmSnLs: { pre: 90, mid: 98, post: 102 },
  lsSnPg: { pre: 5, mid: 4, post: 3 },
  liSnPg: { pre: 4, mid: 3, post: 2 },
  siLiPg: { pre: 5, mid: 4, post: 4 },
  snStmsStmiRatio: { pre: 0.5, mid: 0.5, post: 0.5 },
  stmsI: { pre: 5, mid: 3, post: 2 },
  stmsStmi: { pre: 5, mid: 2, post: 1 },
  merrifieldZAngle: { pre: 68, mid: 76, post: 80 },
};

export interface CogsAnalysisProps {
  data?: CogsAnalysisData;
  onChange?: (updatedData: CogsAnalysisData) => void;
  softTissueData?: CogsSoftTissueAnalysisData;
  onSoftTissueChange?: (updatedData: CogsSoftTissueAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
  patientGender?: Gender;
}

export const CogsAnalysis: React.FC<CogsAnalysisProps> = ({
  data,
  onChange,
  softTissueData,
  onSoftTissueChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
  patientGender = 'Male',
}) => {
  const currentStage: 'pre' | 'mid' | 'post' =
    activeStage === 'mid' ? 'mid' : activeStage === 'post' ? 'post' : 'pre';

  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    patientGender === 'Female' ? 'Female' : 'Male'
  );

  useEffect(() => {
    if (patientGender === 'Female' || patientGender === 'Male') {
      setSelectedGender(patientGender);
    }
  }, [patientGender]);

  // Hard Tissue State
  const [params, setParams] = useState<CogsParametersMap>(() => {
    if (data?.parameters) {
      const merged: any = { ...DEFAULT_COGS_PARAMS };
      COGS_PARAMETERS_META.forEach((p) => {
        merged[p.key] = {
          pre: data.parameters?.[p.key]?.pre ?? '',
          mid: data.parameters?.[p.key]?.mid ?? '',
          post: data.parameters?.[p.key]?.post ?? '',
        };
      });
      return merged as CogsParametersMap;
    }
    return DEFAULT_COGS_PARAMS;
  });

  // Soft Tissue State
  const [softParams, setSoftParams] = useState<CogsSoftTissueParametersMap>(() => {
    if (softTissueData?.parameters) {
      const merged: any = { ...DEFAULT_SOFT_TISSUE_PARAMS };
      COGS_SOFT_TISSUE_PARAMETERS_META.forEach((p) => {
        merged[p.key] = {
          pre: softTissueData.parameters?.[p.key]?.pre ?? '',
          mid: softTissueData.parameters?.[p.key]?.mid ?? '',
          post: softTissueData.parameters?.[p.key]?.post ?? '',
        };
      });
      return merged as CogsSoftTissueParametersMap;
    }
    return DEFAULT_SOFT_TISSUE_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(
    data?.conclusion || softTissueData?.conclusion || ''
  );
  const [userEditedConclusion, setUserEditedConclusion] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = COGS_PARAMETERS_META.every((p) => {
          return (
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
          );
        });
        if (isSame) return prev;
        const next: any = { ...prev };
        COGS_PARAMETERS_META.forEach((p) => {
          next[p.key] = {
            pre: data.parameters?.[p.key]?.pre ?? '',
            mid: data.parameters?.[p.key]?.mid ?? '',
            post: data.parameters?.[p.key]?.post ?? '',
          };
        });
        return next;
      });
    }
  }, [data]);

  useEffect(() => {
    if (softTissueData?.parameters) {
      setSoftParams((prev) => {
        const isSame = COGS_SOFT_TISSUE_PARAMETERS_META.every((p) => {
          return (
            prev[p.key]?.pre === softTissueData.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === softTissueData.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === softTissueData.parameters?.[p.key]?.post
          );
        });
        if (isSame) return prev;
        const next: any = { ...prev };
        COGS_SOFT_TISSUE_PARAMETERS_META.forEach((p) => {
          next[p.key] = {
            pre: softTissueData.parameters?.[p.key]?.pre ?? '',
            mid: softTissueData.parameters?.[p.key]?.mid ?? '',
            post: softTissueData.parameters?.[p.key]?.post ?? '',
          };
        });
        return next;
      });
    }
  }, [softTissueData]);

  const generateCogsSummary = (
    hard: CogsParametersMap,
    soft: CogsSoftTissueParametersMap,
    stage: 'pre' | 'mid' | 'post',
    gender: 'Male' | 'Female'
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const hardFindings: string[] = [];
    COGS_PARAMETERS_META.forEach((meta) => {
      const val = hard[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, gender);
        hardFindings.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    const softFindings: string[] = [];
    COGS_SOFT_TISSUE_PARAMETERS_META.forEach((meta) => {
      const val = soft[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num);
        softFindings.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    if (hardFindings.length === 0 && softFindings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} hard & soft tissue measurement values in the COGS Surgical Analysis section to auto-generate the diagnostic conclusion.`;
    }

    let summary = `COGS Surgical Cephalometric Analysis (${stageLabel} Evaluation):\n`;
    if (hardFindings.length > 0) {
      summary += `• Hard Tissue Skeletal Findings: ${hardFindings.join('; ')}.\n`;
    }
    if (softFindings.length > 0) {
      summary += `• Soft Tissue Profile Findings: ${softFindings.join('; ')}.`;
    }

    return summary.trim();
  };

  const notifyChange = (
    newHardParams: CogsParametersMap,
    newSoftParams: CogsSoftTissueParametersMap,
    newConclusion: string
  ) => {
    onChange?.({
      parameters: newHardParams,
      conclusion: newConclusion,
    });
    onSoftTissueChange?.({
      parameters: newSoftParams,
      conclusion: newConclusion,
    });
  };

  const handleHardValueChange = (
    key: CogsParameterKey,
    stage: 'pre' | 'mid' | 'post',
    valStr: string
  ) => {
    const num = valStr === '' ? '' : parseFloat(valStr);
    const updatedHard = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: isNaN(num as number) ? '' : num,
      },
    };
    setParams(updatedHard);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateCogsSummary(updatedHard, softParams, currentStage, selectedGender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedHard, softParams, nextSummary);
  };

  const handleSoftValueChange = (
    key: CogsSoftTissueParameterKey,
    stage: 'pre' | 'mid' | 'post',
    valStr: string
  ) => {
    const num = valStr === '' ? '' : parseFloat(valStr);
    const updatedSoft = {
      ...softParams,
      [key]: {
        ...softParams[key],
        [stage]: isNaN(num as number) ? '' : num,
      },
    };
    setSoftParams(updatedSoft);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateCogsSummary(params, updatedSoft, currentStage, selectedGender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(params, updatedSoft, nextSummary);
  };

  const getHardInputClass = (key: CogsParameterKey, stage: 'pre' | 'mid' | 'post') => {
    const val = params[key]?.[stage];
    if (val === '' || val === undefined || isNaN(Number(val))) {
      return 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400 focus:border-slate-500';
    }
    const meta = COGS_PARAMETERS_META.find((p) => p.key === key);
    if (!meta) return 'bg-white border-slate-300 text-slate-800';
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(selectedGender);
    if (num >= minNormal && num <= maxNormal) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600';
    }
    return 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600';
  };

  const getSoftInputClass = (key: CogsSoftTissueParameterKey, stage: 'pre' | 'mid' | 'post') => {
    const val = softParams[key]?.[stage];
    if (val === '' || val === undefined || isNaN(Number(val))) {
      return 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400 focus:border-slate-500';
    }
    const meta = COGS_SOFT_TISSUE_PARAMETERS_META.find((p) => p.key === key);
    if (!meta) return 'bg-white border-slate-300 text-slate-800';
    const num = Number(val);
    if (num >= meta.minNormal && num <= meta.maxNormal) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600';
    }
    return 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600';
  };

  // Live inferences
  const hardInferences = useMemo(() => {
    const result: Record<
      CogsParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    COGS_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val), selectedGender);
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage, selectedGender]);

  const softInferences = useMemo(() => {
    const result: Record<
      CogsSoftTissueParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    COGS_SOFT_TISSUE_PARAMETERS_META.forEach((meta) => {
      const val = softParams[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val));
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [softParams, currentStage]);

  const autoGeneratedSummary = useMemo(() => {
    const stageLabel =
      currentStage === 'pre'
        ? 'Pre-treatment'
        : currentStage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const hardFindings: string[] = [];
    COGS_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, selectedGender);
        hardFindings.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    const softFindings: string[] = [];
    COGS_SOFT_TISSUE_PARAMETERS_META.forEach((meta) => {
      const val = softParams[meta.key]?.[currentStage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num);
        softFindings.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    if (hardFindings.length === 0 && softFindings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} hard & soft tissue measurement values in the COGS Surgical Analysis section to auto-generate the diagnostic conclusion.`;
    }

    let summary = `COGS Surgical Cephalometric Analysis (${stageLabel} Evaluation):\n`;
    if (hardFindings.length > 0) {
      summary += `• Hard Tissue Skeletal Findings: ${hardFindings.join('; ')}.\n`;
    }
    if (softFindings.length > 0) {
      summary += `• Soft Tissue Profile Findings: ${softFindings.join('; ')}.`;
    }

    return summary.trim();
  }, [params, softParams, currentStage, selectedGender]);

  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    setSelectedGender(gender);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateCogsSummary(params, softParams, currentStage, gender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(params, softParams, nextSummary);
  };

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, softParams, e.target.value);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, softParams, autoGeneratedSummary);
  };

  const handleLoadSample = () => {
    setParams(SAMPLE_COGS_HARD_DATA);
    setSoftParams(SAMPLE_COGS_SOFT_DATA);
    setUserEditedConclusion(false);
    notifyChange(SAMPLE_COGS_HARD_DATA, SAMPLE_COGS_SOFT_DATA, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_COGS_PARAMS);
    setSoftParams(DEFAULT_SOFT_TISSUE_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate the COGS Analysis (Surgical) diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_COGS_PARAMS, DEFAULT_SOFT_TISSUE_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeHardCount = useMemo(() => {
    return COGS_PARAMETERS_META.filter(
      (m) => params[m.key]?.[currentStage] !== '' && params[m.key]?.[currentStage] !== undefined
    ).length;
  }, [params, currentStage]);

  const activeSoftCount = useMemo(() => {
    return COGS_SOFT_TISSUE_PARAMETERS_META.filter(
      (m) => softParams[m.key]?.[currentStage] !== '' && softParams[m.key]?.[currentStage] !== undefined
    ).length;
  }, [softParams, currentStage]);

  const abnormalHardCount = useMemo(() => {
    return COGS_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) return false;
      return m.evaluateInference(Number(val), selectedGender).status === 'abnormal';
    }).length;
  }, [params, currentStage, selectedGender]);

  const abnormalSoftCount = useMemo(() => {
    return COGS_SOFT_TISSUE_PARAMETERS_META.filter((m) => {
      const val = softParams[m.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) return false;
      return m.evaluateInference(Number(val)).status === 'abnormal';
    }).length;
  }, [softParams, currentStage]);

  const totalActive = activeHardCount + activeSoftCount;
  const totalAbnormal = abnormalHardCount + abnormalSoftCount;

  const stageDisplayLabel =
    currentStage === 'pre' ? 'Pre' : currentStage === 'mid' ? 'Mid Stage' : 'Post Treatment';

  const hardCategories = ['Skeletal AP', 'Skeletal Hard Tissue Lengths', 'Vertical Heights'] as const;
  const softCategories = ['Facial Form', 'Lip Position & Form', 'Profile Indices'] as const;

  const renderMobileHardParamRows = (cat: 'Skeletal AP' | 'Skeletal Hard Tissue Lengths' | 'Vertical Heights', catTitle: string) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-teal-100/80 border border-teal-200 text-[11px] font-extrabold uppercase tracking-wider text-teal-900">
        {catTitle}
      </div>
      {COGS_PARAMETERS_META.filter((p) => p.category === cat).map((meta) => {
        const evalState = hardInferences[meta.key];
        const inputVal = params[meta.key]?.[currentStage] ?? '';

        return (
          <div key={meta.key} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 w-full max-w-full box-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-snug whitespace-normal break-words">{meta.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-normal break-words">
                  Norm {meta.normalText(selectedGender)}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <StepperInput
                value={inputVal}
                onChange={(v) => handleHardValueChange(meta.key, currentStage, v === '' ? '' : String(v))}
                min={meta.getNormalRange(selectedGender).minNormal - 10}
                max={meta.getNormalRange(selectedGender).maxNormal + 10}
                step={0.1}
                unit={meta.unit}
                validationClass={getHardInputClass(meta.key, currentStage)}
              />
            </div>
            <div className="whitespace-normal break-words">
              {evalState.status === 'empty' ? (
                <span className="text-slate-400 italic text-xs">Enter value</span>
              ) : evalState.status === 'normal' ? (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              ) : (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMobileSoftParamRows = (cat: 'Facial Form' | 'Lip Position & Form' | 'Profile Indices', catTitle: string) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-pink-100/80 border border-pink-200 text-[11px] font-extrabold uppercase tracking-wider text-pink-900">
        {catTitle}
      </div>
      {COGS_SOFT_TISSUE_PARAMETERS_META.filter((p) => p.category === cat).map((meta) => {
        const evalState = softInferences[meta.key];
        const inputVal = softParams[meta.key]?.[currentStage] ?? '';

        return (
          <div key={meta.key} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 w-full max-w-full box-border">
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
                value={inputVal}
                onChange={(v) => handleSoftValueChange(meta.key, currentStage, v === '' ? '' : String(v))}
                min={meta.getNormalRange().minNormal - 10}
                max={meta.getNormalRange().maxNormal + 10}
                step={0.1}
                unit={meta.unit}
                validationClass={getSoftInputClass(meta.key, currentStage)}
              />
            </div>
            <div className="whitespace-normal break-words">
              {evalState.status === 'empty' ? (
                <span className="text-slate-400 italic text-xs">Enter value</span>
              ) : evalState.status === 'normal' ? (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              ) : (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              )}
            </div>
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
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-2 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              COGS Analysis (Surgical)
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                23 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Burstone Cephalometric Analysis for Orthognathic Surgery (Skeletal AP, Hard Tissue Lengths, Vertical Heights & Soft Tissue Profile)
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-teal-600" />
              {totalActive}/23 Measured
            </span>

            {totalAbnormal > 0 ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {totalAbnormal} Deviations
              </span>
            ) : totalActive > 0 ? (
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
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-5 bg-slate-50/50">
          {/* Quick Preset Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Gender Standards:
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleGenderChange('Male')}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                    selectedGender === 'Male'
                      ? 'bg-slate-800 text-white shadow-2xs'
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
                      ? 'bg-slate-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Sample Data
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600" />
                Reset All
              </button>
            </div>
          </div>

          {/* SECTION 1: HARD TISSUE PARAMETERS (9) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-teal-800 text-white px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-300" />
                <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                  Part I: COGS Hard Tissue Parameters (9 Parameters)
                </h5>
              </div>
              <span className="text-[11px] font-semibold bg-teal-900/60 text-teal-200 px-2 py-0.5 rounded-md border border-teal-700">
                {activeHardCount}/9 Measured
              </span>
            </div>

            {/* Mobile View Part I */}
            <div className="space-y-3 md:hidden">
              {renderMobileHardParamRows('Skeletal AP', '1. Skeletal AP Parameters (2)')}
              {renderMobileHardParamRows('Skeletal Hard Tissue Lengths', '2. Skeletal Hard Tissue Lengths (4)')}
              {renderMobileHardParamRows('Vertical Heights', '3. Vertical Facial Heights (3)')}
            </div>

            {/* Desktop View Part I */}
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
                    {hardCategories.map((cat) => {
                      const catParams = COGS_PARAMETERS_META.filter((p) => p.category === cat);
                      const catTitle =
                        cat === 'Skeletal AP'
                          ? '1. Skeletal AP Parameters (2)'
                          : cat === 'Skeletal Hard Tissue Lengths'
                          ? '2. Skeletal Hard Tissue Lengths (4)'
                          : '3. Vertical Facial Heights (3)';

                      return (
                        <React.Fragment key={cat}>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                            <td
                              colSpan={4}
                              className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300"
                            >
                              {catTitle}
                            </td>
                          </tr>

                          {catParams.map((meta) => {
                            const evalState = hardInferences[meta.key];
                            const inputVal = params[meta.key]?.[currentStage] ?? '';

                            return (
                              <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-3 font-medium text-slate-900 whitespace-normal break-words">
                                  <div className="text-xs sm:text-sm font-semibold">{meta.label}</div>
                                  <div className="text-[10px] text-slate-400">Unit: {meta.unit}</div>
                                </td>

                                <td className="py-2 px-2 text-center text-xs font-mono text-slate-600 whitespace-normal break-words">
                                  {meta.normalText(selectedGender)}
                                </td>

                                <td className="py-2 px-2 text-center bg-teal-50/20">
                                  <StepperInput
                                    value={inputVal}
                                    onChange={(v) => handleHardValueChange(meta.key, currentStage, v === '' ? '' : String(v))}
                                    min={meta.getNormalRange(selectedGender).minNormal - 10}
                                    max={meta.getNormalRange(selectedGender).maxNormal + 10}
                                    step={0.1}
                                    unit={meta.unit}
                                    validationClass={getHardInputClass(meta.key, currentStage)}
                                  />
                                </td>

                                <td className="py-2 px-3 whitespace-normal break-words">
                                  {evalState.status === 'empty' ? (
                                    <span className="text-slate-400 italic text-xs">
                                      Enter {stageDisplayLabel} value
                                    </span>
                                  ) : evalState.status === 'normal' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      {evalState.inference}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      {evalState.inference}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 2: SOFT TISSUE PARAMETERS (14) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between bg-slate-800 text-white px-3 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-300" />
                <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                  Part II: COGS Soft Tissue Parameters (14 Parameters)
                </h5>
              </div>
              <span className="text-[11px] font-semibold bg-slate-900/60 text-slate-200 px-2 py-0.5 rounded-md border border-slate-700">
                {activeSoftCount}/14 Measured
              </span>
            </div>

            {/* Mobile View Part II */}
            <div className="space-y-3 md:hidden">
              {renderMobileSoftParamRows('Facial Form', '1. Facial Form Parameters (6)')}
              {renderMobileSoftParamRows('Lip Position & Form', '2. Lip Position & Form Parameters (7)')}
              {renderMobileSoftParamRows('Profile Indices', '3. Profile Indices & Esthetic Lines (1)')}
            </div>

            {/* Desktop View Part II */}
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
                    {softCategories.map((cat) => {
                      const catParams = COGS_SOFT_TISSUE_PARAMETERS_META.filter(
                        (p) => p.category === cat
                      );
                      const catTitle =
                        cat === 'Facial Form'
                          ? '1. Facial Form Parameters (6)'
                          : cat === 'Lip Position & Form'
                          ? '2. Lip Position & Form Parameters (7)'
                          : '3. Profile Indices & Esthetic Lines (1)';

                      return (
                        <React.Fragment key={cat}>
                          <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                            <td
                              colSpan={4}
                              className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300"
                            >
                              {catTitle}
                            </td>
                          </tr>

                          {catParams.map((meta) => {
                            const evalState = softInferences[meta.key];
                            const inputVal = softParams[meta.key]?.[currentStage] ?? '';

                            return (
                              <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
                                <td className="py-2 px-3 font-medium text-slate-900 whitespace-normal break-words">
                                  <div className="text-xs sm:text-sm font-semibold">{meta.label}</div>
                                  <div className="text-[10px] text-slate-400">Unit: {meta.unit}</div>
                                </td>

                                <td className="py-2 px-2 text-center text-xs font-mono text-slate-600 whitespace-normal break-words">
                                  {meta.normalText}
                                </td>

                                <td className="py-2 px-2 text-center bg-teal-50/20">
                                  <StepperInput
                                    value={inputVal}
                                    onChange={(v) => handleSoftValueChange(meta.key, currentStage, v === '' ? '' : String(v))}
                                    min={meta.getNormalRange().minNormal - 10}
                                    max={meta.getNormalRange().maxNormal + 10}
                                    step={0.1}
                                    unit={meta.unit}
                                    validationClass={getSoftInputClass(meta.key, currentStage)}
                                  />
                                </td>

                                <td className="py-2 px-3 whitespace-normal break-words">
                                  {evalState.status === 'empty' ? (
                                    <span className="text-slate-400 italic text-xs">
                                      Enter {stageDisplayLabel} value
                                    </span>
                                  ) : evalState.status === 'normal' ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      {evalState.inference}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      {evalState.inference}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DIAGNOSTIC CONCLUSION BOX */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  COGS Surgical Integrated Diagnostic Conclusion ({stageDisplayLabel})
                </h5>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                    <span>Auto-Generate</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              value={conclusion}
              onChange={handleConclusionChange}
              rows={4}
              className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-sans leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
              placeholder="Integrated hard and soft tissue diagnostic conclusion will generate automatically..."
            />
          </div>
        </div>
      )}
    </div>
  );
};
