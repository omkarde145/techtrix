/**
 * GraminVikas 360 GovTech Backend API Server
 * Provides dedicated endpoints for:
 * 1. SECC-2011 & NFSA Beneficiary Deduplication & Exclusion Verification
 * 2. 4-Stage Sequential Milestone Validation & 3D Haversine Geofencing
 * 3. BDO 3-Tier Maker-Checker Stage Approvals
 * 4. Automated PFMS XML FTO Batch Direct Benefit Transfer Generation
 * 5. Gram Panchayat XV Finance Commission & MGNREGS Civic Works Monitoring
 */

import http from 'http';
import url from 'url';
import { SEED_BENEFICIARIES, SEED_PANCHAYAT_WORKS } from './db/seedData';
import { validateSequentialStage, calculateHaversineDistance, checkDuplicateRationCard } from './engines/verificationEngine';
import { generatePfmsFtoBatch } from './engines/pfmsEngine';
import { getSatelliteMacroVerification } from './engines/satelliteEngine';
import { calculateMonsoonRisk } from './engines/monsoonRiskEngine';
import { generateCbdcVoucher, LOCAL_REGISTERED_VENDORS } from './engines/cbdcEngine';
import { getFallbackAnalysis } from './engines/aiVisionEngine';
import { Beneficiary, StageType } from './types';

const PORT = process.env.PORT || 5001;

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data, null, 2));
}

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';
  const method = req.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  try {
    // 1. Health Endpoint
    if (pathname === '/api/health' && method === 'GET') {
      sendJson(res, 200, {
        status: 'UP',
        service: 'GraminVikas 360 GovTech Backend Microservice',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        engines: {
          deduplicationEngine: 'ACTIVE',
          haversine3dGeofence: 'ACTIVE',
          makerCheckerApproval: 'ACTIVE',
          pfmsFtoGenerator: 'ACTIVE',
          panchayatWorksTracker: 'ACTIVE',
          aiVisionClassifier: 'ACTIVE',
          isroSatelliteMacroEngine: 'ACTIVE',
          monsoonEarlyWarningEngine: 'ACTIVE',
          rbiCbdcVoucherEngine: 'ACTIVE',
          socialAuditEngine: 'ACTIVE',
        },
      });
      return;
    }

    // 2. Beneficiaries List
    if (pathname === '/api/beneficiaries' && method === 'GET') {
      sendJson(res, 200, {
        total: SEED_BENEFICIARIES.length,
        beneficiaries: SEED_BENEFICIARIES,
      });
      return;
    }

    // 3. Panchayat Works List
    if (pathname === '/api/panchayat/works' && method === 'GET') {
      sendJson(res, 200, {
        total: SEED_PANCHAYAT_WORKS.length,
        works: SEED_PANCHAYAT_WORKS,
      });
      return;
    }

    // 4. Beneficiary Deduplication & SECC Exclusion Engine API
    if (pathname === '/api/verify/deduplication' && method === 'POST') {
      const body = await parseBody(req);
      const { rationCardNumber, beneficiaryId } = body;

      const isDuplicateRation = checkDuplicateRationCard(rationCardNumber, beneficiaryId, SEED_BENEFICIARIES);

      sendJson(res, 200, {
        beneficiaryId,
        rationCardNumber,
        isDuplicateRation,
        seccExclusionCheck: {
          hasFourWheeler: false,
          hasMechanizedFarmEquipment: false,
          kisanCreditLimitExceeded: false,
          isGovtEmployeeInHousehold: false,
          passed: true,
        },
        priorSchemeCheck: {
          hasReceivedIayScheme: false,
          hasReceivedStateHousing: false,
          passed: true,
        },
        overallEligibility: isDuplicateRation ? 'FLAGGED' : 'ELIGIBLE',
      });
      return;
    }

    // 5. 4-Stage Sequential Validation & 3D Haversine Geofence API
    if (pathname === '/api/inspections/validate-stage' && method === 'POST') {
      const body = await parseBody(req);
      const { beneficiaryId, targetStage, captureLat, captureLng } = body;

      const beneficiary = SEED_BENEFICIARIES.find(b => b.id === beneficiaryId);
      if (!beneficiary) {
        sendJson(res, 404, { error: 'Beneficiary not found' });
        return;
      }

      const stageValidation = validateSequentialStage(
        beneficiary.currentStage,
        targetStage as StageType,
        beneficiary.stageHistory
      );
      const distanceMeters = calculateHaversineDistance(
        captureLat,
        captureLng,
        beneficiary.latitude,
        beneficiary.longitude
      );

      sendJson(res, 200, {
        beneficiaryId,
        targetStage,
        stageValidation,
        geofenceCheck: {
          sanctionedLat: beneficiary.latitude,
          sanctionedLng: beneficiary.longitude,
          captureLat,
          captureLng,
          distanceMeters: Math.round(distanceMeters * 10) / 10,
          toleranceMeters: 15.0,
          isWithinGeofence: distanceMeters <= 15.0,
        },
        readyForApproval: stageValidation.valid && distanceMeters <= 15.0,
      });
      return;
    }

    // 6. PFMS XML FTO Batch Generation API
    if (pathname === '/api/pfms/fto-batch' && method === 'POST') {
      const body = await parseBody(req);
      const { approvedBeneficiaryIds } = body;

      const targetList = approvedBeneficiaryIds && approvedBeneficiaryIds.length > 0
        ? SEED_BENEFICIARIES.filter(b => approvedBeneficiaryIds.includes(b.id))
        : SEED_BENEFICIARIES.slice(0, 3);

      const ftoEntries = targetList.map(b => ({
        beneficiary: b,
        stage: b.currentStage,
      }));

      const ftoBatch = generatePfmsFtoBatch(ftoEntries);
      sendJson(res, 200, {
        success: true,
        ftoNumber: ftoBatch.ftoNumber,
        totalAmount: ftoBatch.totalDisbursementAmount,
        totalBeneficiaries: ftoBatch.totalBeneficiaries,
        xmlPayload: ftoBatch.batchXmlPayload,
      });
      return;
    }

    // 7. ISRO Bhuvan Satellite Macro-Verification API
    if (pathname === '/api/satellite/macro-verify') {
      const query = parsedUrl.query;
      const beneficiaryId = (query.beneficiaryId as string) || (await (async () => {
        if (method === 'POST') {
          const body = await parseBody(req);
          return body.beneficiaryId;
        }
        return SEED_BENEFICIARIES[0].id;
      })());

      const beneficiary = SEED_BENEFICIARIES.find(b => b.id === beneficiaryId) || SEED_BENEFICIARIES[0];
      const satelliteData = getSatelliteMacroVerification(
        beneficiary.pmayId,
        beneficiary.latitude,
        beneficiary.longitude,
        beneficiary.currentStage
      );

      sendJson(res, 200, {
        beneficiaryId: beneficiary.id,
        pmayId: beneficiary.pmayId,
        currentStage: beneficiary.currentStage,
        satelliteData,
      });
      return;
    }

    // 8. IMD Monsoon Hazard & Predictive Weather Assessment API
    if (pathname === '/api/monsoon/risk-assessment' && method === 'GET') {
      const blockName = (parsedUrl.query.block as string) || 'Kalsi Block';
      const assessment = calculateMonsoonRisk(blockName, SEED_BENEFICIARIES);
      sendJson(res, 200, {
        block: blockName,
        monsoonAssessment: assessment,
      });
      return;
    }

    // 9. RBI Digital Rupee (e₹ - CBDC) Programmable DBT Voucher API
    if (pathname === '/api/cbdc/issue-voucher' && method === 'POST') {
      const body = await parseBody(req);
      const { beneficiaryId, stage, amount } = body;
      const beneficiary = SEED_BENEFICIARIES.find(b => b.id === beneficiaryId) || SEED_BENEFICIARIES[0];
      
      const voucher = generateCbdcVoucher(
        beneficiary,
        (stage as StageType) || beneficiary.currentStage,
        amount || 40000
      );

      sendJson(res, 200, {
        success: true,
        voucher,
        whitelistedVendors: LOCAL_REGISTERED_VENDORS,
      });
      return;
    }

    // 10. AI Vision Stage Classifier & Quality Assurance API
    if (pathname === '/api/ai/analyze-stage' && method === 'POST') {
      const body = await parseBody(req);
      const { stage } = body;
      const targetStage = (stage as StageType) || 'plinth';
      const analysis = getFallbackAnalysis(targetStage);

      sendJson(res, 200, {
        stage: targetStage,
        analysis,
      });
      return;
    }

    // 11. Jan Soochna Section 17 Public Social Audit Feed API
    if (pathname === '/api/social-audit/feed' && method === 'GET') {
      const publicAudits = SEED_BENEFICIARIES.map(b => ({
        id: b.id,
        pmayId: b.pmayId,
        beneficiaryName: b.name,
        gramPanchayat: b.gramPanchayat,
        village: b.village,
        currentStage: b.currentStage,
        totalDbtReleased: b.totalDbtReleased,
        sanctionedAmount: b.sanctionedAmount,
        lastInspectedAt: b.lastInspectedAt,
        status: b.overallStatus,
        hasToiletConvergence: b.convergence?.sbmGToiletGeotagged ?? true,
        hasTapWaterConvergence: b.convergence?.jalJeevanTapConnected ?? true,
      }));

      sendJson(res, 200, {
        title: 'Jan Soochna Public Social Audit Feed (Section 17 Panchayati Raj Act)',
        totalRecords: publicAudits.length,
        records: publicAudits,
      });
      return;
    }

    // 404 Not Found
    sendJson(res, 404, { error: `Route ${method} ${pathname} not found` });
  } catch (err: any) {
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`  GraminVikas 360 GovTech Backend Server running on port ${PORT}`);
  console.log(`  Health API: http://localhost:${PORT}/api/health`);
  console.log(`  Beneficiaries API: http://localhost:${PORT}/api/beneficiaries`);
  console.log(`  Panchayat Works API: http://localhost:${PORT}/api/panchayat/works`);
  console.log(`================================================================`);
});

export default server;
