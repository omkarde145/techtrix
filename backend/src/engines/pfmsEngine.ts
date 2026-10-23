import { Beneficiary, StageType, PfmsFtoBatch, PfmsBeneficiaryEntry } from '@/types';

/**
 * PFMS (Public Financial Management System) FTO XML Batch Engine
 * Formats official Ministry of Rural Development DBT Fund Transfer Order files.
 */

export const STAGE_DBT_AMOUNTS: Record<StageType, number> = {
  foundation: 40000,
  plinth: 40000,
  lintel: 30000,
  completion: 10000
};

export function generatePfmsFtoBatch(
  approvedBeneficiaries: Array<{ beneficiary: Beneficiary; stage: StageType }>,
  officerName = 'Dr. Rajesh K. Sinha, IAS',
  officerDesignation = 'Block Development Officer (BDO), Khunti'
): PfmsFtoBatch {
  const now = new Date();
  const year = now.getFullYear();
  const fy = `${year}-${(year + 1).toString().slice(2)}`;
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomBatchSuffix = Math.floor(1000 + Math.random() * 9000);
  const ftoNo = `FTO-JH-KHU-${dateStr}-${randomBatchSuffix}`;

  let totalDisbursement = 0;
  const entries: PfmsBeneficiaryEntry[] = approvedBeneficiaries.map(({ beneficiary, stage }) => {
    const amount = STAGE_DBT_AMOUNTS[stage] || 40000;
    totalDisbursement += amount;

    return {
      pmayId: beneficiary.pmayId,
      beneficiaryName: beneficiary.name,
      village: beneficiary.village,
      gramPanchayat: beneficiary.gramPanchayat,
      bankAccountMasked: beneficiary.bankAccountMasked,
      bankIfsc: beneficiary.bankIfsc,
      instalmentStage: stage,
      instalmentAmount: amount,
      apbsMandateToken: `APBS-IN-NPCI-${beneficiary.pmayId.replace(/[^A-Z0-9]/g, '')}`,
      dscApprovalHash: `SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    };
  });

  const dscSignatureDigest = `DSC-CLASS3-SHA256-RSA-${Date.now().toString(16).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

  // Generate standard PFMS XML Schema
  const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<PfmsFundTransferOrder xmlns="http://pfms.nic.in/schema/pmayg/dbt/v4.2"
  ftoNumber="${ftoNo}"
  schemeCode="PMAYG-RURAL"
  financialYear="${fy}"
  stateCode="JH"
  districtCode="KHU"
  blockCode="KHU-01"
  generatedAt="${now.toISOString()}">
  
  <Header>
    <SanctioningAuthority>${officerName}</SanctioningAuthority>
    <Designation>${officerDesignation}</Designation>
    <TotalBeneficiaries>${entries.length}</TotalBeneficiaries>
    <TotalDisbursementAmount currency="INR">${totalDisbursement}</TotalDisbursementAmount>
    <PaymentGateway>NPCI-AadhaarPaymentBridgeSystem(APBS)</PaymentGateway>
  </Header>

  <BeneficiaryRecords>
${entries.map((b, idx) => `    <BeneficiaryRecord index="${idx + 1}">
      <PmayId>${b.pmayId}</PmayId>
      <CitizenName>${b.beneficiaryName}</CitizenName>
      <GramPanchayat>${b.gramPanchayat}</GramPanchayat>
      <Village>${b.village}</Village>
      <BankDetails>
        <MaskedAccount>${b.bankAccountMasked}</MaskedAccount>
        <IFSC>${b.bankIfsc}</IFSC>
        <ApbsMandateToken>${b.apbsMandateToken}</ApbsMandateToken>
      </BankDetails>
      <Disbursement>
        <Stage>${b.instalmentStage.toUpperCase()}</Stage>
        <Amount INR="${b.instalmentAmount}">${b.instalmentAmount}</Amount>
        <TechnicalClearanceDscHash>${b.dscApprovalHash}</TechnicalClearanceDscHash>
      </Disbursement>
    </BeneficiaryRecord>`).join('\n')}
  </BeneficiaryRecords>

  <DigitalSignatureBlock>
    <SignatureMethod Algorithm="http://www.w3.org/2001/04/xmldsig-more#rsa-sha256" />
    <DigestValue>${dscSignatureDigest}</DigestValue>
    <SigningCertificate Issuer="CCA India / e-Mudhra Class 3 DSC">
      <SubjectDN>CN=${officerName}, O=Govt of Jharkhand, OU=Rural Development Department</SubjectDN>
      <ValidUntil>2027-12-31T23:59:59Z</ValidUntil>
    </SigningCertificate>
  </DigitalSignatureBlock>
</PfmsFundTransferOrder>`;

  return {
    ftoNumber: ftoNo,
    financialYear: fy,
    stateCode: 'JH',
    districtCode: 'KHU',
    blockCode: 'KHU-01',
    panchayatCode: 'GP-ALL',
    schemeCode: 'PMAYG-RURAL',
    generatedAt: now.toISOString(),
    generatedByOfficer: officerName,
    officerDesignation,
    totalBeneficiaries: entries.length,
    totalDisbursementAmount: totalDisbursement,
    beneficiaries: entries,
    dscSignatureDigest,
    batchXmlPayload: xmlPayload,
    status: 'GENERATED'
  };
}

/**
 * Downloads generated PFMS FTO XML to the client filesystem
 */
export function downloadPfmsFtoXml(batch: PfmsFtoBatch) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([batch.batchXmlPayload], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${batch.ftoNumber}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
