import { Beneficiary, AuditLog, JeTechnicalClearance, DscSignatureInfo, PanchayatDevelopmentWork } from '@/types';

// Helper to create visual SVG placeholders for construction stages
function createStagePhotoSvg(stageName: string, stageColor: string, details: string[]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="60%" stop-color="#bae6fd"/>
        <stop offset="100%" stop-color="#f0f9ff"/>
      </linearGradient>
      <pattern id="brickPattern" width="40" height="20" patternUnits="userSpaceOnUse">
        <rect width="40" height="20" fill="#c2410c" stroke="#9a3412" stroke-width="1.5"/>
        <line x1="20" y1="0" x2="20" y2="20" stroke="#78350f" stroke-width="1.5"/>
        <rect x="0" y="10" width="40" height="10" fill="#b45309" stroke="#78350f" stroke-width="1"/>
      </pattern>
      <pattern id="soilPattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect width="30" height="30" fill="#78350f"/>
        <circle cx="10" cy="10" r="3" fill="#451a03"/>
        <circle cx="22" cy="18" r="4" fill="#581c87"/>
        <circle cx="5" cy="25" r="2.5" fill="#3b0764"/>
      </pattern>
    </defs>
    
    <rect width="800" height="380" fill="url(#skyGrad)"/>
    <circle cx="700" cy="90" r="45" fill="#fef08a" opacity="0.9"/>
    
    <path d="M 0,380 Q 200,320 400,360 T 800,340 L 800,600 L 0,600 Z" fill="#15803d" opacity="0.7"/>
    <path d="M 0,400 Q 250,370 500,410 T 800,390 L 800,600 L 0,600 Z" fill="#166534"/>
    
    <rect y="420" width="800" height="180" fill="url(#soilPattern)"/>
    
    ${stageName === 'FOUNDATION' ? `
      <polygon points="180,430 620,430 660,560 140,560" fill="#451a03"/>
      <rect x="220" y="470" width="360" height="60" fill="#94a3b8" stroke="#475569" stroke-width="4"/>
      <line x1="260" y1="380" x2="260" y2="480" stroke="#64748b" stroke-width="5"/>
      <line x1="380" y1="360" x2="380" y2="480" stroke="#64748b" stroke-width="5"/>
      <line x1="500" y1="380" x2="500" y2="480" stroke="#64748b" stroke-width="5"/>
      <path d="M 640,490 Q 720,450 780,510 Z" fill="#cbd5e1"/>
    ` : ''}

    ${stageName === 'PLINTH' ? `
      <rect x="200" y="380" width="400" height="90" fill="url(#brickPattern)" stroke="#1e293b" stroke-width="3"/>
      <rect x="180" y="370" width="440" height="20" fill="#64748b" stroke="#334155" stroke-width="2"/>
      <line x1="220" y1="280" x2="220" y2="370" stroke="#475569" stroke-width="6"/>
      <line x1="400" y1="260" x2="400" y2="370" stroke="#475569" stroke-width="6"/>
      <line x1="580" y1="280" x2="580" y2="370" stroke="#475569" stroke-width="6"/>
      <text x="400" y="425" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">PLINTH BEAM CAST - DPC LEVEL</text>
    ` : ''}

    ${stageName === 'LINTEL' ? `
      <rect x="200" y="240" width="400" height="190" fill="url(#brickPattern)" stroke="#1e293b" stroke-width="3"/>
      <rect x="350" y="310" width="100" height="120" fill="#0f172a"/>
      <rect x="240" y="300" width="70" height="70" fill="#0f172a"/>
      <rect x="190" y="225" width="420" height="24" fill="#94a3b8" stroke="#334155" stroke-width="3"/>
      <text x="400" y="242" font-family="sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">REINFORCED LINTEL BAND CAST</text>
    ` : ''}

    ${stageName === 'COMPLETION' ? `
      <rect x="180" y="210" width="440" height="240" fill="#fef3c7" stroke="#b45309" stroke-width="4"/>
      <polygon points="150,210 400,120 650,210" fill="#dc2626"/>
      <rect x="350" y="280" width="100" height="170" fill="#78350f" stroke="#451a03" stroke-width="3"/>
      <circle cx="430" cy="370" r="4" fill="#fde047"/>
      <rect x="230" y="280" width="80" height="90" fill="#67e8f9" stroke="#0e7490" stroke-width="3"/>
      <line x1="270" y1="280" x2="270" y2="370" stroke="#0e7490" stroke-width="2"/>
      <line x1="230" y1="325" x2="310" y2="325" stroke="#0e7490" stroke-width="2"/>
      <rect x="490" y="280" width="80" height="90" fill="#67e8f9" stroke="#0e7490" stroke-width="3"/>
      <line x1="530" y1="280" x2="530" y2="370" stroke="#0e7490" stroke-width="2"/>
      <line x1="490" y1="325" x2="570" y2="325" stroke="#0e7490" stroke-width="2"/>
      <rect x="230" y="230" width="80" height="35" rx="5" fill="#ffffff" stroke="#166534" stroke-width="2"/>
      <text x="270" y="252" font-family="sans-serif" font-size="11" font-weight="900" fill="#15803d" text-anchor="middle">PMAY-G 2024</text>
    ` : ''}

    <rect x="20" y="20" width="300" height="85" rx="8" fill="#0f172a" fill-opacity="0.85" stroke="#334155" stroke-width="2"/>
    <circle cx="45" cy="45" r="10" fill="${stageColor}"/>
    <text x="65" y="50" font-family="sans-serif" font-size="18" font-weight="900" fill="#ffffff">STAGE: ${stageName}</text>
    <text x="65" y="75" font-family="sans-serif" font-size="12" fill="#cbd5e1">${details[0] || 'Pradhan Mantri Awaas Yojana - Gramin'}</text>
    <text x="65" y="92" font-family="sans-serif" font-size="11" fill="#94a3b8">${details[1] || 'Field Verification Unit - MoRD'}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const STAGE_PHOTOS = {
  foundation: createStagePhotoSvg('FOUNDATION', '#d97706', ['Excavation Depth: 1.2m', 'PCC 1:3:6 Base']),
  plinth: createStagePhotoSvg('PLINTH', '#2563eb', ['DPC Level Beam Cast', 'Brick Masonry Complete']),
  lintel: createStagePhotoSvg('LINTEL', '#7c3aed', ['Lintel Bands Placed', 'Superstructure Masonry']),
  completion: createStagePhotoSvg('COMPLETION', '#16a34a', ['RCC Roof Slab Cured', 'PMAY-G Yellow Wall Plaque Installed'])
};

export const SEED_JE_CLEARANCE: JeTechnicalClearance = {
  verified: true,
  engineerName: 'Er. Manoj Verma',
  engineerId: 'JE-RANCHI-091',
  designation: 'Junior Engineer (Rural Development Dept)',
  clearedAt: '2024-05-11T16:30:00Z',
  structuralChecklist: {
    trenchDepthVerified: true,
    mixRatioCompliant: true,
    curingPeriodSatisfied: true,
    reinforcementInspected: true
  },
  remarks: 'Foundations dug to solid moorum layer (1.2m depth). PCC 1:3:6 poured with 20mm aggregate. Complies with IS:456 rural housing code.',
  technicalScore: 98
};

export const SEED_DSC_SIGNATURE: DscSignatureInfo = {
  signed: true,
  certificateId: 'DSC-NIC-GOV-JH-2024-88410',
  officerName: 'Dr. Rajeev Sinha',
  issuer: 'National Informatics Centre (NIC) Certifying Authority',
  validUntil: '2026-12-31T23:59:59Z',
  algorithm: 'SHA256withRSA (2048-bit Class 3 DSC)',
  signedAt: '2024-05-12T14:30:00Z',
  thumbprint: '7F:B3:99:A1:4D:2E:8C:11:00:84:DE:6B:AA:29:43:91'
};

export const SEED_BENEFICIARIES: Beneficiary[] = [
  {
    id: 'BEN-JH-001',
    pmayId: 'PMAY-G-JH-2024-08201',
    name: 'Smt. Sunita Devi',
    guardianName: 'W/o Late Suresh Mahto',
    gender: 'Female',
    category: 'OBC',
    rationCardNo: 'JH-RC-8829103',
    familyMemberId: 'MEM-JH-01-A',
    annualIncome: 38000,
    village: 'Rampur Tola',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    sanctionedDate: '2024-04-12',
    sanctionedAmount: 130000,
    totalDbtReleased: 40000,
    currentStage: 'plinth',
    overallStatus: 'in_progress',
    latitude: 23.3648,
    longitude: 85.3282,
    altitude: 642.5,
    khasraNo: 'Khata 12, Khesra 88',
    ulpin: 'JH-834001-K12-88',
    targetAddress: 'Plot No. 42, Ward 3, Rampur Tola',
    contactNumber: '+91 94311 88201',
    bankAccountMasked: 'SBIN••••••4419',
    bankIfsc: 'SBIN0001234',
    stageHistory: {
      foundation: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.foundation,
        watermarkedPhotoUrl: STAGE_PHOTOS.foundation,
        submittedAt: '2024-05-10T10:15:00Z',
        approvedAt: '2024-05-12T14:30:00Z',
        dbtAmount: 40000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/994821',
        officerRemarks: 'Foundation trenches dug as per layout and PCC footing poured.',
        adminRemarks: 'Verified against sanction order. First instalment disbursed.',
        jeClearance: SEED_JE_CLEARANCE,
        dscSignature: SEED_DSC_SIGNATURE
      },
      plinth: {
        status: 'submitted',
        photoUrl: STAGE_PHOTOS.plinth,
        watermarkedPhotoUrl: STAGE_PHOTOS.plinth,
        submittedAt: '2024-06-02T11:45:00Z',
        officerRemarks: 'Plinth masonry completed to 0.9m height with DPC layer.',
        jeClearance: {
          verified: true,
          engineerName: 'Er. Manoj Verma',
          engineerId: 'JE-RANCHI-091',
          designation: 'Junior Engineer (Rural Development Dept)',
          clearedAt: '2024-06-02T15:20:00Z',
          structuralChecklist: {
            trenchDepthVerified: true,
            mixRatioCompliant: true,
            curingPeriodSatisfied: true,
            reinforcementInspected: true
          },
          remarks: 'Plinth beam level (0.9m) inspected. Damp Proof Course (DPC) applied with water-proofing compound. Recommended for BDO stage approval.',
          technicalScore: 96
        },
        aiVisionAnalysis: {
          detectedStage: 'plinth',
          targetStage: 'plinth',
          stageMatch: true,
          confidencePercent: 96,
          structuralChecklist: {
            rebarDetected: true,
            brickMasonryDetected: true,
            curedConcreteBeamDetected: true,
            roofSlabDetected: false
          },
          clarityScore: 95,
          isBlurry: false,
          glareDetected: false,
          analysisSummary: 'Edge AI verified PLINTH milestone with 96% confidence. DPC damp-proof masonry and perimeter plinth tie-beam authenticated.',
          recommendation: 'PROCEED'
        }
      },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [],
    lastInspectedAt: '2024-06-02T11:45:00Z'
  },
  {
    id: 'BEN-JH-002',
    pmayId: 'PMAY-G-JH-2024-08202',
    name: 'Shri Rameshwar Munda',
    guardianName: 'S/o Budhu Munda',
    gender: 'Male',
    category: 'ST',
    rationCardNo: 'JH-RC-8829104',
    familyMemberId: 'MEM-JH-02-A',
    annualIncome: 32000,
    village: 'Munda Basti',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    sanctionedDate: '2024-05-01',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'in_progress',
    latitude: 23.37420,
    longitude: 85.33410,
    altitude: 638.0,
    khasraNo: 'Khata 18, Khesra 104',
    ulpin: 'JH-834001-K18-104',
    targetAddress: 'Khata 18, Khesra 104, Munda Basti',
    contactNumber: '+91 98350 49102',
    bankAccountMasked: 'BOI••••••9021',
    bankIfsc: 'BKID0005432',
    stageHistory: {
      foundation: {
        status: 'pending',
        officerRemarks: 'Site cleared, foundation excavation underway.'
      },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: []
  },
  {
    id: 'BEN-JH-003',
    pmayId: 'PMAY-G-JH-2024-08203',
    name: 'Shri Anil Kumar Soren',
    guardianName: 'S/o Mangal Soren',
    gender: 'Male',
    category: 'ST',
    rationCardNo: 'JH-RC-8829999',
    familyMemberId: 'MEM-JH-03-A',
    annualIncome: 35000,
    village: 'Munda Basti',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    sanctionedDate: '2024-05-05',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'flagged',
    // Intentional Geo-Collision: 8.2m away from Rameshwar Munda (same altitude, same plot number)
    latitude: 23.37426,
    longitude: 85.33415,
    altitude: 638.2,
    khasraNo: 'Khata 18, Khesra 104', // Identical Khasra without partition!
    ulpin: 'JH-834001-K18-104',
    targetAddress: 'Khata 18, Khesra 104, Munda Basti',
    contactNumber: '+91 97712 30192',
    bankAccountMasked: 'PUNB••••••1142',
    bankIfsc: 'PUNB0182700',
    stageHistory: {
      foundation: { status: 'pending' },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [
      {
        id: 'FLG-GEO-001',
        type: 'geo_collision',
        severity: 'high',
        title: 'Geofence Proximity Collision (<15m)',
        description: 'House coordinates (23.37426, 85.33415, Alt 638m) are within 8.2 meters of sanctioned house BEN-JH-002 (Shri Rameshwar Munda) with identical Cadastral Khasra 104 and no registered homestead partition.',
        beneficiaryId: 'BEN-JH-003',
        beneficiaryName: 'Shri Anil Kumar Soren',
        collidingBeneficiaryId: 'BEN-JH-002',
        collidingBeneficiaryName: 'Shri Rameshwar Munda',
        coordinates: { lat: 23.37426, lng: 85.33415, altitude: 638.2 },
        distanceMeters: 8.2,
        horizontalDistance: 8.2,
        elevationDeltaMeters: 0.2,
        resolved: false,
        timestamp: '2024-05-06T09:20:00Z',
        evidence: {
          claimedCoords: { lat: 23.37426, lng: 85.33415, altitude: 638.2 },
          collidingCoords: { lat: 23.37420, lng: 85.33410, altitude: 638.0 },
          isDenseBastiPartition: false
        }
      }
    ]
  },
  {
    id: 'BEN-JH-004',
    pmayId: 'PMAY-G-JH-2024-09101',
    name: 'Smt. Parvati Mahato',
    guardianName: 'W/o Jagdish Mahato',
    gender: 'Female',
    category: 'OBC',
    rationCardNo: 'JH-RC-7749210',
    familyMemberId: 'MEM-JH-04-A',
    annualIncome: 42000,
    village: 'Siwandih',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    block: 'Chas',
    district: 'Bokaro',
    state: 'Jharkhand',
    pincode: '827013',
    sanctionedDate: '2024-02-15',
    sanctionedAmount: 130000,
    totalDbtReleased: 85000,
    currentStage: 'lintel',
    overallStatus: 'in_progress',
    latitude: 23.6421,
    longitude: 86.1685,
    altitude: 215.0,
    khasraNo: 'Holding No. 88, Plot 401',
    ulpin: 'JH-827013-P401-88',
    targetAddress: 'Holding No. 88, Purana Basti, Siwandih',
    contactNumber: '+91 94701 55219',
    bankAccountMasked: 'CANR••••••8832',
    bankIfsc: 'CNRB0002819',
    stageHistory: {
      foundation: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.foundation,
        watermarkedPhotoUrl: STAGE_PHOTOS.foundation,
        submittedAt: '2024-03-01T09:30:00Z',
        approvedAt: '2024-03-03T11:20:00Z',
        dbtAmount: 40000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/102911',
        officerRemarks: 'Excavation verified with correct dimensions.',
        adminRemarks: 'First installment released to Aadhaar seeded account.'
      },
      plinth: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.plinth,
        watermarkedPhotoUrl: STAGE_PHOTOS.plinth,
        submittedAt: '2024-04-10T14:15:00Z',
        approvedAt: '2024-04-12T16:00:00Z',
        dbtAmount: 45000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/188492',
        officerRemarks: 'Plinth masonry and damp proof course verified.',
        adminRemarks: 'Second installment released.'
      },
      lintel: {
        status: 'submitted',
        photoUrl: STAGE_PHOTOS.lintel,
        watermarkedPhotoUrl: STAGE_PHOTOS.lintel,
        submittedAt: '2024-05-28T16:45:00Z',
        officerRemarks: 'Brickwork completed to 7ft height. Lintel beam poured.',
        jeClearance: {
          verified: true,
          engineerName: 'Er. Sandeep Kumar',
          engineerId: 'JE-BOKARO-044',
          designation: 'Junior Engineer (Chas Block)',
          clearedAt: '2024-05-29T10:10:00Z',
          structuralChecklist: {
            trenchDepthVerified: true,
            mixRatioCompliant: true,
            curingPeriodSatisfied: true,
            reinforcementInspected: true
          },
          remarks: 'Lintel beam 150mm thick with 4x10mm Fe500 TMT bars verified. Ready for BDO approval.',
          technicalScore: 94
        }
      },
      completion: { status: 'not_started' }
    },
    flags: [],
    lastInspectedAt: '2024-05-28T16:45:00Z'
  },
  {
    id: 'BEN-JH-005',
    pmayId: 'PMAY-G-JH-2024-09102',
    name: 'Shri Birsa Mahato',
    guardianName: 'S/o Jagdish Mahato',
    gender: 'Male',
    category: 'OBC',
    rationCardNo: 'JH-RC-7749210',
    familyMemberId: 'MEM-JH-04-B',
    annualIncome: 45000,
    village: 'Siwandih',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    block: 'Chas',
    district: 'Bokaro',
    state: 'Jharkhand',
    pincode: '827013',
    sanctionedDate: '2024-05-18',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'flagged',
    latitude: 23.6495,
    longitude: 86.1730,
    altitude: 218.0,
    khasraNo: 'Holding No. 92, Plot 405',
    ulpin: 'JH-827013-P405-92',
    targetAddress: 'Holding No. 92, Siwandih',
    contactNumber: '+91 91223 88102',
    bankAccountMasked: 'BARB••••••6612',
    bankIfsc: 'BARB0SIWAND',
    stageHistory: {
      foundation: { status: 'pending' },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [
      {
        id: 'FLG-RAT-002',
        type: 'duplicate_ration_card',
        severity: 'high',
        title: 'Duplicate Ration Card (NFSA / PMAY-G Clash)',
        description: 'Ration Card number JH-RC-7749210 is already registered under Smt. Parvati Mahato (BEN-JH-004) in Siwandih village. Per PMAY-G guidelines Section 3.2, only one pucca house subsidy is permitted per ration card household.',
        beneficiaryId: 'BEN-JH-005',
        beneficiaryName: 'Shri Birsa Mahato',
        collidingBeneficiaryId: 'BEN-JH-004',
        collidingBeneficiaryName: 'Smt. Parvati Mahato',
        rationCardNo: 'JH-RC-7749210',
        resolved: false,
        timestamp: '2024-05-19T11:00:00Z'
      }
    ]
  },
  {
    id: 'BEN-JH-006',
    pmayId: 'PMAY-G-JH-2024-09103',
    name: 'Smt. Manju Hembrom',
    guardianName: 'W/o Shyamlal Hembrom',
    gender: 'Female',
    category: 'ST',
    rationCardNo: 'JH-RC-5519802',
    familyMemberId: 'MEM-JH-06-A',
    annualIncome: 29000,
    village: 'Barmasia',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    block: 'Chas',
    district: 'Bokaro',
    state: 'Jharkhand',
    pincode: '827013',
    sanctionedDate: '2023-11-10',
    sanctionedAmount: 130000,
    totalDbtReleased: 130000,
    currentStage: 'completion',
    overallStatus: 'completed',
    latitude: 23.6380,
    longitude: 86.1820,
    altitude: 212.0,
    khasraNo: 'Plot 310, Barmasia',
    ulpin: 'JH-827013-P310',
    targetAddress: 'Tola Tantisahi, Barmasia',
    contactNumber: '+91 93081 22910',
    bankAccountMasked: 'UBIN••••••2910',
    bankIfsc: 'UBIN0532101',
    stageHistory: {
      foundation: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.foundation,
        watermarkedPhotoUrl: STAGE_PHOTOS.foundation,
        submittedAt: '2023-12-01T10:00:00Z',
        approvedAt: '2023-12-04T12:00:00Z',
        dbtAmount: 40000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2023/JH/002918'
      },
      plinth: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.plinth,
        watermarkedPhotoUrl: STAGE_PHOTOS.plinth,
        submittedAt: '2024-01-15T11:30:00Z',
        approvedAt: '2024-01-18T15:00:00Z',
        dbtAmount: 45000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/019283'
      },
      lintel: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.lintel,
        watermarkedPhotoUrl: STAGE_PHOTOS.lintel,
        submittedAt: '2024-02-22T09:40:00Z',
        approvedAt: '2024-02-25T11:15:00Z',
        dbtAmount: 30000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/049102'
      },
      completion: {
        status: 'approved',
        photoUrl: STAGE_PHOTOS.completion,
        watermarkedPhotoUrl: STAGE_PHOTOS.completion,
        submittedAt: '2024-04-05T14:20:00Z',
        approvedAt: '2024-04-08T10:00:00Z',
        dbtAmount: 15000,
        dbtReleased: true,
        dbtTxnId: 'DBT/PMAY/2024/JH/078192',
        officerRemarks: 'Structure 100% complete. Plastering, white-washing, doors, windows, toilet unit done.',
        adminRemarks: 'Final DBT subsidy released. House handed over to beneficiary.',
        jeClearance: SEED_JE_CLEARANCE,
        dscSignature: SEED_DSC_SIGNATURE
      }
    },
    flags: [],
    lastInspectedAt: '2024-04-05T14:20:00Z'
  },
  {
    id: 'BEN-JH-007',
    pmayId: 'PMAY-G-JH-2024-08204',
    name: 'Shri Dilip Gope',
    guardianName: 'S/o Madhusudan Gope',
    gender: 'Male',
    category: 'OBC',
    rationCardNo: 'JH-RC-8829555',
    familyMemberId: 'MEM-JH-07-A',
    annualIncome: 36000,
    village: 'Kalyanpur',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    sanctionedDate: '2024-05-10',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'in_progress',
    latitude: 23.3590,
    longitude: 85.3410,
    altitude: 645.0,
    khasraNo: 'Khata 09, Khesra 52',
    ulpin: 'JH-834001-K09-52',
    targetAddress: 'Near Primary School, Kalyanpur',
    contactNumber: '+91 99341 77209',
    bankAccountMasked: 'SBIN••••••7721',
    bankIfsc: 'SBIN0001234',
    stageHistory: {
      foundation: {
        status: 'submitted',
        photoUrl: STAGE_PHOTOS.foundation,
        watermarkedPhotoUrl: STAGE_PHOTOS.foundation,
        submittedAt: '2024-06-03T09:10:00Z',
        officerRemarks: 'Foundation trenches inspected with depth gauge. Ready for approval.',
        jeClearance: {
          verified: true,
          engineerName: 'Er. Manoj Verma',
          engineerId: 'JE-RANCHI-091',
          designation: 'Junior Engineer (Rural Development Dept)',
          clearedAt: '2024-06-03T11:00:00Z',
          structuralChecklist: {
            trenchDepthVerified: true,
            mixRatioCompliant: true,
            curingPeriodSatisfied: true,
            reinforcementInspected: true
          },
          remarks: 'Trench excavation of 1.2m depth into rocky strata verified. PCC 1:3:6 footing ready. Recommended for BDO First Instalment release.',
          technicalScore: 97
        }
      },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [],
    lastInspectedAt: '2024-06-03T09:10:00Z'
  },
  {
    id: 'BEN-JH-008',
    pmayId: 'PMAY-G-JH-2024-08205',
    name: 'Smt. Sumitra Devi',
    guardianName: 'W/o Karu Mahto',
    gender: 'Female',
    category: 'OBC',
    rationCardNo: 'JH-RC-8831990',
    familyMemberId: 'MEM-JH-08-A',
    annualIncome: 34000,
    village: 'Rampur Tola',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    block: 'Ranchi Sadar',
    district: 'Ranchi',
    state: 'Jharkhand',
    pincode: '834001',
    sanctionedDate: '2024-05-12',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'flagged',
    latitude: 23.3670,
    longitude: 85.3260,
    altitude: 641.0,
    khasraNo: 'Khata 14, Khesra 91',
    ulpin: 'JH-834001-K14-91',
    targetAddress: 'Tola Tantisahi, Rampur Tola',
    contactNumber: '+91 94318 22109',
    bankAccountMasked: 'SBIN••••••1890',
    bankIfsc: 'SBIN0001234',
    stageHistory: {
      foundation: { status: 'pending' },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [
      {
        id: 'FLG-SCH-003',
        type: 'prior_scheme_disbursement',
        severity: 'high',
        title: 'Prior Scheme Benefit Detected (Indira Awaas Yojana - IAY)',
        description: 'Cross-check of state housing legacy databases shows applicant Smt. Sumitra Devi previously received ₹70,000 for a pucca house under Indira Awaas Yojana (Sanction Order: IAY/JH/2017/0411). Per PMAY-G Section 2.1, households with prior housing disbursements are strictly ineligible.',
        beneficiaryId: 'BEN-JH-008',
        beneficiaryName: 'Smt. Sumitra Devi',
        resolved: false,
        timestamp: '2024-05-13T10:30:00Z'
      }
    ]
  },
  {
    id: 'BEN-JH-009',
    pmayId: 'PMAY-G-JH-2024-09104',
    name: 'Shri Mahendra Prasad',
    guardianName: 'S/o Ramchandra Prasad',
    gender: 'Male',
    category: 'General',
    rationCardNo: 'JH-RC-7750119',
    familyMemberId: 'MEM-JH-09-A',
    annualIncome: 145000,
    village: 'Siwandih',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    block: 'Chas',
    district: 'Bokaro',
    state: 'Jharkhand',
    pincode: '827013',
    sanctionedDate: '2024-05-14',
    sanctionedAmount: 130000,
    totalDbtReleased: 0,
    currentStage: 'foundation',
    overallStatus: 'flagged',
    latitude: 23.6470,
    longitude: 86.1750,
    altitude: 216.0,
    khasraNo: 'Holding No. 104, Plot 418',
    ulpin: 'JH-827013-P418-104',
    targetAddress: 'Main Road, Siwandih',
    contactNumber: '+91 98351 09123',
    bankAccountMasked: 'HDFC••••••9941',
    bankIfsc: 'HDFC0001092',
    stageHistory: {
      foundation: { status: 'pending' },
      plinth: { status: 'not_started' },
      lintel: { status: 'not_started' },
      completion: { status: 'not_started' }
    },
    flags: [
      {
        id: 'FLG-MEM-004',
        type: 'ineligible_member',
        severity: 'high',
        title: 'SECC 2011 Exclusion: Ineligible Family Member & Asset Ownership',
        description: 'Verification against RTO and state government payroll databases indicates family member is an active salaried government employee with JBVNL and owns a motorized 4-wheeler (Reg: JH-01-BK-8821). Disqualified under automatic exclusion criterion #7.',
        beneficiaryId: 'BEN-JH-009',
        beneficiaryName: 'Shri Mahendra Prasad',
        resolved: false,
        timestamp: '2024-05-15T14:15:00Z'
      }
    ]
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: '2024-06-03T11:00:00Z',
    actor: 'Er. Manoj Verma (Junior Engineer)',
    role: 'JUNIOR_ENGINEER',
    action: 'JE_TECHNICAL_CLEARANCE_GRANTED',
    entityId: 'BEN-JH-007',
    entityName: 'Shri Dilip Gope',
    details: 'Completed Maker-Checker Step 2: Technical clearance granted for Foundation stage (Score: 97/100).',
    badgeType: 'success'
  },
  {
    id: 'LOG-002',
    timestamp: '2024-06-03T09:10:00Z',
    actor: 'Alok Tirkey (Field Officer ID: FO-8821)',
    role: 'FIELD_OFFICER',
    action: 'INSPECTION_SUBMITTED',
    entityId: 'BEN-JH-007',
    entityName: 'Shri Dilip Gope',
    details: 'Submitted Foundation stage inspection with compressed photo & device ECDSA signature.',
    badgeType: 'info'
  },
  {
    id: 'LOG-003',
    timestamp: '2024-05-19T11:00:00Z',
    actor: 'Automated Anti-Fraud Engine',
    role: 'SYSTEM',
    action: 'DUPLICATE_RATION_FLAGGED',
    entityId: 'BEN-JH-005',
    entityName: 'Shri Birsa Mahato',
    details: 'Flagged duplicate Ration Card JH-RC-7749210 matching existing beneficiary Smt. Parvati Mahato.',
    badgeType: 'danger'
  },
  {
    id: 'LOG-004',
    timestamp: '2024-05-06T09:20:00Z',
    actor: '3D Geofencing Engine',
    role: 'SYSTEM',
    action: 'GEOFENCE_COLLISION_FLAGGED',
    entityId: 'BEN-JH-003',
    entityName: 'Shri Anil Kumar Soren',
    details: '3D distance collision detected: Coordinates are 8.2m (<15m threshold, 0.2m elevation delta) from BEN-JH-002 with identical Khasra 104.',
    badgeType: 'danger'
  },
  {
    id: 'LOG-005',
    timestamp: '2024-04-08T10:00:00Z',
    actor: 'Dr. Rajeev Sinha (BDO Chas)',
    role: 'BLOCK_DEVELOPMENT_OFFICER',
    action: 'DSC_SIGNED_DBT_RELEASED',
    entityId: 'BEN-JH-006',
    entityName: 'Smt. Manju Hembrom',
    details: 'Approved Completion stage using NIC Class-3 DSC e-Token. Triggered final DBT subsidy of ₹15,000.',
    badgeType: 'success'
  }
];

export const SEED_PANCHAYAT_WORKS: PanchayatDevelopmentWork[] = [
  {
    id: 'PW-JH-BISH-01',
    workCode: 'PW/JH/BISH/2024/01',
    title: 'Solar-Powered Multi-Village Piped Drinking Water Scheme',
    category: 'Water & Sanitation',
    scheme: '15th Finance Commission',
    village: 'Rampur Tola',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    sanctionedCost: 840000,
    fundsDisbursed: 630000,
    executingAgency: 'Panchayat Samiti & Village Water Sanitation Committee',
    currentStage: 'Superstructure Masonry',
    physicalProgressPercent: 75,
    financialProgressPercent: 75,
    latitude: 23.3660,
    longitude: 85.3295,
    status: 'in_progress',
    lastInspectedAt: '2024-05-25T11:00:00Z',
    photoUrl: createStagePhotoSvg('CIVIC WORK', '#0284c7', ['Solar Drinking Water Facility', '15th Finance Commission'])
  },
  {
    id: 'PW-JH-BISH-02',
    workCode: 'PW/JH/BISH/2024/02',
    title: 'Model Anganwadi Centre & Early Child Care Facility',
    category: 'Anganwadi & Education',
    scheme: 'MGNREGS Convergence',
    village: 'Munda Basti',
    gramPanchayat: 'Bishnupur Gram Panchayat',
    sanctionedCost: 650000,
    fundsDisbursed: 227500,
    executingAgency: 'Gram Panchayat Construction Committee',
    currentStage: 'Substructure & Foundation',
    physicalProgressPercent: 35,
    financialProgressPercent: 35,
    latitude: 23.3755,
    longitude: 85.3350,
    status: 'in_progress',
    lastInspectedAt: '2024-05-18T14:30:00Z',
    photoUrl: createStagePhotoSvg('FOUNDATION', '#d97706', ['Anganwadi Centre Substructure', 'MGNREGS Convergence'])
  },
  {
    id: 'PW-JH-CHAS-01',
    workCode: 'PW/JH/CHAS/2024/01',
    title: 'Cement Concrete Village Paver Road & Storm Water Drainage (1.2 km)',
    category: 'Rural Connectivity',
    scheme: '15th Finance Commission',
    village: 'Siwandih',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    sanctionedCost: 1280000,
    fundsDisbursed: 1280000,
    executingAgency: 'Rural Works Department (RWD) & Gram Panchayat',
    currentStage: 'Commissioned & Handed Over',
    physicalProgressPercent: 100,
    financialProgressPercent: 100,
    latitude: 23.6450,
    longitude: 86.1710,
    status: 'completed',
    lastInspectedAt: '2024-04-15T16:00:00Z',
    photoUrl: createStagePhotoSvg('COMPLETION', '#16a34a', ['Village CC Paver Road', 'RWD & Gram Panchayat'])
  },
  {
    id: 'PW-JH-CHAS-02',
    workCode: 'PW/JH/CHAS/2024/02',
    title: 'Panchayat Community Welfare Centre & Digital Seva Kendra',
    category: 'Civic Infrastructure',
    scheme: 'District Mineral Foundation (DMFT)',
    village: 'Barmasia',
    gramPanchayat: 'Chandankiyari Gram Panchayat',
    sanctionedCost: 1450000,
    fundsDisbursed: 870000,
    executingAgency: 'Special Works Division, Chas Block',
    currentStage: 'Superstructure Masonry',
    physicalProgressPercent: 60,
    financialProgressPercent: 60,
    latitude: 23.6395,
    longitude: 86.1835,
    status: 'in_progress',
    lastInspectedAt: '2024-05-20T10:15:00Z',
    photoUrl: createStagePhotoSvg('LINTEL', '#7c3aed', ['Community Welfare Centre', 'DMFT Scheme'])
  }
];

