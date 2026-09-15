// Seed data for the Approval + Release Workflow POC.
// Stages form a linked list (previousId / nextId) so the pipeline order
// is fully data-driven and can be reconfigured at runtime (insert / reorder / disable).

export const ROLES = [
  { id: 'role-requester', name: 'Requester / Business Owner' },
  { id: 'role-product-owner', name: 'Product Owner / Business Sponsor' },
  { id: 'role-tech-lead', name: 'Tech Lead' },
  { id: 'role-qa-lead', name: 'QA Lead' },
  { id: 'role-security-officer', name: 'Security Officer' },
  { id: 'role-cab-board', name: 'CAB Board' },
  { id: 'role-release-manager', name: 'Release Manager' },
  { id: 'role-admin', name: 'System Admin' },
];

export const USERS = [
  { id: 'user-sara', name: 'Sara Al-Otaibi', email: 'sara@tanmiah.org', roleId: 'role-requester', initials: 'SA' },
  { id: 'user-omar', name: 'Omar Fathi', email: 'omar@tanmiah.org', roleId: 'role-product-owner', initials: 'OF' },
  { id: 'user-khalid', name: 'Khalid Noor', email: 'khalid@tanmiah.org', roleId: 'role-tech-lead', initials: 'KN' },
  { id: 'user-huda', name: 'Huda Al-Zahrani', email: 'huda@tanmiah.org', roleId: 'role-qa-lead', initials: 'HZ' },
  { id: 'user-faisal', name: 'Faisal Al-Harbi', email: 'faisal@tanmiah.org', roleId: 'role-security-officer', initials: 'FH' },
  { id: 'user-cab', name: 'CAB Board', email: 'cab@tanmiah.org', roleId: 'role-cab-board', initials: 'CB' },
  { id: 'user-noura', name: 'Noura Al-Qahtani', email: 'noura@tanmiah.org', roleId: 'role-release-manager', initials: 'NQ' },
  { id: 'user-admin', name: 'System Admin', email: 'admin@tanmiah.org', roleId: 'role-admin', initials: 'SA' },
];

export const DOC_TYPES = [
  'BRD',
  'CR',
  'Dev Package',
  'Test Report',
  'Security Report',
  'Rollback Plan',
  'Deployment Confirmation',
  'Closure Sign-off',
];

// Simulated DevOps backlog — look-and-feel only, no real Azure DevOps/Jira integration.
export const BACKLOG_ITEMS = [
  { id: 'bl-1201', title: 'SMS notifications for grievance status updates', epic: 'Grievances Management', type: 'Feature' },
  { id: 'bl-1187', title: 'Bulk export of beneficiary case history', epic: 'Community Sustainability', type: 'Feature' },
  { id: 'bl-1223', title: 'Finance reconciliation report automation', epic: 'Finance', type: 'Feature' },
  { id: 'bl-1150', title: 'Ownership transfer e-signature step', epic: 'Ownership Transfer', type: 'Feature' },
  { id: 'bl-1244', title: 'Quality review checklist digitization', epic: 'Quality', type: 'Feature' },
  { id: 'bl-1099', title: 'Impact dashboard drill-down filters', epic: 'Impact Measurement', type: 'Enhancement' },
  { id: 'bl-1256', title: 'Customer service live chat handoff', epic: 'Customer Service', type: 'Feature' },
  { id: 'bl-1268', title: 'Fix: duplicate case creation on slow network', epic: 'Community Sustainability', type: 'Bug' },
];

// Simulated DevOps repos/branches — used by the Development stage's PR picker.
export const DEVOPS_REPOS = [
  { id: 'repo-core-platform', name: 'core-platform', branches: ['main', 'develop', 'feature/sms-notifications', 'feature/bulk-export'] },
  { id: 'repo-finance-svc', name: 'finance-service', branches: ['main', 'release/2.4', 'feature/reconciliation-report'] },
  { id: 'repo-ownership-portal', name: 'ownership-portal', branches: ['main', 'feature/e-signature'] },
  { id: 'repo-shared-ui', name: 'shared-ui-kit', branches: ['main', 'develop'] },
];

// Simulated open pull requests — flattened list of repo + branch + PR number combos
// used to populate the multi-select PR picker on the Development stage.
export const DEVOPS_PRS = [
  { id: 'pr-482', repo: 'core-platform', branch: 'feature/sms-notifications', number: 482, title: 'Add SMS notification triggers' },
  { id: 'pr-486', repo: 'core-platform', branch: 'feature/bulk-export', number: 486, title: 'CSV export for case history' },
  { id: 'pr-511', repo: 'finance-service', branch: 'feature/reconciliation-report', number: 511, title: 'Automate reconciliation report' },
  { id: 'pr-498', repo: 'ownership-portal', branch: 'feature/e-signature', number: 498, title: 'E-signature step for transfer flow' },
  { id: 'pr-503', repo: 'shared-ui-kit', branch: 'develop', number: 503, title: 'New multi-select + dialog primitives' },
  { id: 'pr-515', repo: 'core-platform', branch: 'develop', number: 515, title: 'Chore: dependency bump & lint fixes' },
];

// Each stage: id, name, previousId, nextId, isActive,
// approverRoles: role ids allowed to Approve/Send-Back FROM this stage,
// requiredDocsToEnter: doc types that must already exist on the request before it can enter this stage,
// sendBackTargets: stage ids this stage is allowed to send the request back to,
// slaHours: SLA before escalation.
export const INITIAL_STAGES = [
  {
    id: 'stg-business-approval',
    name: 'Business Approval',
    previousId: null,
    nextId: 'stg-development',
    isActive: true,
    approverRoles: ['role-product-owner'],
    requiredDocsToEnter: [],
    sendBackTargets: [],
    slaHours: 24,
    posX: 40, posY: 120,
  },
  {
    id: 'stg-development',
    name: 'Development',
    previousId: 'stg-business-approval',
    nextId: 'stg-testing',
    isActive: true,
    approverRoles: ['role-tech-lead'],
    requiredDocsToEnter: ['BRD'],
    sendBackTargets: ['stg-business-approval'],
    slaHours: 72,
    posX: 320, posY: 120,
  },
  {
    id: 'stg-testing',
    name: 'Testing',
    previousId: 'stg-development',
    nextId: 'stg-cyber-security',
    isActive: true,
    approverRoles: ['role-qa-lead'],
    requiredDocsToEnter: ['BRD'],
    sendBackTargets: ['stg-development', 'stg-business-approval'],
    slaHours: 48,
    posX: 600, posY: 120,
  },
  {
    id: 'stg-cyber-security',
    name: 'Cyber Security',
    previousId: 'stg-testing',
    nextId: 'stg-cab',
    isActive: true,
    approverRoles: ['role-security-officer'],
    requiredDocsToEnter: ['Test Report'],
    sendBackTargets: ['stg-testing', 'stg-development'],
    slaHours: 48,
    posX: 880, posY: 120,
  },
  {
    id: 'stg-cab',
    name: 'CAB',
    previousId: 'stg-cyber-security',
    nextId: 'stg-production',
    isActive: true,
    approverRoles: ['role-cab-board'],
    requiredDocsToEnter: ['BRD', 'CR', 'Security Report', 'Test Report'],
    sendBackTargets: ['stg-cyber-security', 'stg-testing'],
    slaHours: 24,
    posX: 1160, posY: 120,
  },
  {
    id: 'stg-production',
    name: 'Production',
    previousId: 'stg-cab',
    nextId: 'stg-post-deployment',
    isActive: true,
    approverRoles: ['role-release-manager'],
    requiredDocsToEnter: ['BRD', 'CR', 'Rollback Plan'],
    sendBackTargets: ['stg-cab'],
    slaHours: 24,
    posX: 1440, posY: 120,
  },
  {
    id: 'stg-post-deployment',
    name: 'Post-Deployment Verification',
    previousId: 'stg-production',
    nextId: null,
    isActive: true,
    approverRoles: ['role-release-manager', 'role-requester'],
    requiredDocsToEnter: ['Deployment Confirmation'],
    sendBackTargets: ['stg-production'],
    slaHours: 24,
    posX: 1720, posY: 120,
  },
];

export const INITIAL_REQUESTS = [
  {
    id: 'REQ-1001',
    title: 'Add self-service password reset',
    description: 'Allow beneficiaries to reset their portal password via OTP.',
    riskClassification: 'Medium',
    requesterId: 'user-sara',
    requester: 'Sara Al-Otaibi',
    currentStageId: 'stg-testing',
    overallStatus: 'In Progress',
    targetVersion: 'v2.4.0-rc1',
    createdAt: '2026-09-01T09:00:00Z',
    documents: [
      { id: 'doc-1', type: 'BRD', name: 'BRD_PasswordReset_v1.pdf', uploadedBy: 'Sara Al-Otaibi', uploadedAt: '2026-09-01T09:05:00Z' },
    ],
    transitions: [
      { id: 't1', fromStage: null, toStage: 'stg-business-approval', action: 'Created', actor: 'Sara Al-Otaibi', role: 'role-requester', comment: 'Initial request submitted.', timestamp: '2026-09-01T09:00:00Z' },
      { id: 't2', fromStage: 'stg-business-approval', toStage: 'stg-development', action: 'Approve', actor: 'Omar Fathi', role: 'role-product-owner', comment: 'Approved, aligns with Q3 roadmap.', timestamp: '2026-09-02T10:00:00Z' },
      { id: 't3', fromStage: 'stg-development', toStage: 'stg-testing', action: 'Approve', actor: 'Khalid Noor', role: 'role-tech-lead', comment: 'Code complete, peer reviewed.', timestamp: '2026-09-05T14:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-1002',
    title: 'Grievance auto-escalation after 5 days',
    description: 'Automatically escalate unresolved grievances to department director after 5 business days.',
    riskClassification: 'Low',
    requesterId: 'user-sara',
    requester: 'Sara Al-Otaibi',
    currentStageId: 'stg-business-approval',
    overallStatus: 'In Progress',
    targetVersion: '',
    createdAt: '2026-09-10T11:30:00Z',
    documents: [
      { id: 'doc-2', type: 'BRD', name: 'BRD_GrievanceEscalation.docx', uploadedBy: 'Sara Al-Otaibi', uploadedAt: '2026-09-10T11:32:00Z' },
    ],
    transitions: [
      { id: 't1', fromStage: null, toStage: 'stg-business-approval', action: 'Created', actor: 'Sara Al-Otaibi', role: 'role-requester', comment: 'Initial request submitted.', timestamp: '2026-09-10T11:30:00Z' },
    ],
    comments: [],
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-seed-1',
    requestId: 'REQ-1001',
    message: 'REQ-1001 "Add self-service password reset" needs QA sign-off (Testing).',
    targetRoleId: 'role-qa-lead',
    targetUserId: null,
    timestamp: '2026-09-05T14:00:00Z',
    read: false,
  },
  {
    id: 'notif-seed-2',
    requestId: 'REQ-1002',
    message: 'REQ-1002 "Grievance auto-escalation after 5 days" needs your Business Approval.',
    targetRoleId: 'role-product-owner',
    targetUserId: null,
    timestamp: '2026-09-10T11:30:00Z',
    read: false,
  },
];

