// Seed data for the Approval + Release Workflow POC.
// Stages form a linked list (previousId / nextId) so the pipeline order
// is fully data-driven and can be reconfigured at runtime (insert / reorder / disable).

export const ROLES = [
  { id: 'role-requester', name: 'مقدم الطلب / مالك الأعمال' },
  { id: 'role-product-owner', name: 'مالك المنتج / راعي الأعمال' },
  { id: 'role-tech-lead', name: 'قائد الفريق التقني' },
  { id: 'role-qa-lead', name: 'قائد ضمان الجودة' },
  { id: 'role-security-officer', name: 'مسؤول الأمن السيبراني' },
  { id: 'role-cab-board', name: 'لجنة CAB' },
  { id: 'role-release-manager', name: 'مدير الإصدارات' },
  { id: 'role-admin', name: 'مسؤول النظام' },
];

export const USERS = [
  { id: 'user-sara', name: 'سارة العتيبي', email: 'sara@tanmiah.org', roleId: 'role-requester', initials: 'سع' },
  { id: 'user-omar', name: 'عمر فتحي', email: 'omar@tanmiah.org', roleId: 'role-product-owner', initials: 'عف' },
  { id: 'user-khalid', name: 'خالد نور', email: 'khalid@tanmiah.org', roleId: 'role-tech-lead', initials: 'خن' },
  { id: 'user-huda', name: 'هدى الزهراني', email: 'huda@tanmiah.org', roleId: 'role-qa-lead', initials: 'هز' },
  { id: 'user-faisal', name: 'فيصل الحربي', email: 'faisal@tanmiah.org', roleId: 'role-security-officer', initials: 'فح' },
  { id: 'user-cab', name: 'لجنة CAB', email: 'cab@tanmiah.org', roleId: 'role-cab-board', initials: 'لج' },
  { id: 'user-noura', name: 'نورة القحطاني', email: 'noura@tanmiah.org', roleId: 'role-release-manager', initials: 'نق' },
  { id: 'user-admin', name: 'مسؤول النظام', email: 'admin@tanmiah.org', roleId: 'role-admin', initials: 'من' },
];

export const DOC_TYPES = [
  'BRD',
  'CR',
  'حزمة التطوير',
  'تقرير الاختبار',
  'تقرير الأمن',
  'خطة التراجع',
  'تأكيد النشر',
  'اعتماد الإغلاق',
];

export const DEPLOYMENT_PROJECTS = [
  {
    id: 'project-tanmiah-plus',
    name: 'تنمية+',
    location: 'التحول الرقمي • المملكة العربية السعودية',
    deployments: [
      { id: 'deploy-signature-flow', name: 'مسار التوقيع', start: '2020-01-01', end: '2020-01-15', color: '#4b5d73' },
      { id: 'deploy-esb-integration', name: 'تكامل ESB', start: '2020-01-08', end: '2020-01-25', color: '#b7a59a' },
      { id: 'deploy-access-governance', name: 'حوكمة الصلاحيات', start: '2020-01-20', end: '2020-02-04', color: '#8d6b4d' },
      { id: 'deploy-dashboard-analytics', name: 'تحليلات لوحة التحكم', start: '2020-01-27', end: '2020-02-15', color: '#7090ab' },
      { id: 'deploy-automation-coverage', name: 'تغطية الأتمتة', start: '2020-02-10', end: '2020-02-26', color: '#c9b7a7' },
      { id: 'deploy-readiness-approval', name: 'اعتماد الجاهزية', start: '2020-02-25', end: '2020-03-08', color: '#1f6d5a' },
    ],
  },
  {
    id: 'project-esb',
    name: 'ESB',
    location: 'Integration Layer • Saudi Arabia',
    deployments: [
      { id: 'esb-architecture', name: 'System Architecture', start: '2020-01-10', end: '2020-01-24', color: '#4b5d73' },
      { id: 'esb-api-connectors', name: 'API Channel Delivery', start: '2020-01-21', end: '2020-02-12', color: '#8099b5' },
      { id: 'esb-mapping', name: 'Message Transformation', start: '2020-02-08', end: '2020-02-25', color: '#d0b7a5' },
      { id: 'esb-go-live', name: 'Integration Sign-Off', start: '2020-02-22', end: '2020-03-14', color: '#5f7f61' },
    ],
  },
  {
    id: 'project-internal-portal',
    name: 'البوابة الداخلية',
    location: 'العمليات • المملكة العربية السعودية',
    deployments: [
      { id: 'portal-discovery', name: 'Service Discovery', start: '2020-01-04', end: '2020-01-18', color: '#4b5d73' },
      { id: 'portal-workflow', name: 'Workflow Automation', start: '2020-01-15', end: '2020-02-06', color: '#8d6b4d' },
      { id: 'portal-approvals', name: 'Approval Workflow', start: '2020-02-02', end: '2020-02-20', color: '#c9b7a7' },
      { id: 'portal-release', name: 'Release Governance', start: '2020-02-18', end: '2020-03-24', color: '#1f6d5a' },
    ],
  },
  {
    id: 'project-masar',
    name: 'مسار',
    location: 'تمكين الخدمات • المملكة العربية السعودية',
    deployments: [
      { id: 'masar-scope', name: 'Scope Definition', start: '2020-01-06', end: '2020-01-22', color: '#4b5d73' },
      { id: 'masar-integration', name: 'Service Onboarding', start: '2020-01-20', end: '2020-02-19', color: '#7090ab' },
      { id: 'masar-activation', name: 'Activation Flow', start: '2020-02-17', end: '2020-03-12', color: '#2d7b66' },
    ],
  },
];

// Simulated DevOps backlog — look-and-feel only, no real Azure DevOps/Jira integration.
export const BACKLOG_ITEMS = [
  { id: 'bl-1201', title: 'إشعارات SMS لتحديثات حالة التظلمات', epic: 'إدارة التظلمات', type: 'ميزة' },
  { id: 'bl-1187', title: 'تصدير جماعي لسجل حالات المستفيد', epic: 'استدامة المجتمع', type: 'ميزة' },
  { id: 'bl-1223', title: 'أتمتة تقرير التسويات المالية', epic: 'المالية', type: 'ميزة' },
  { id: 'bl-1150', title: 'خطوة التوقيع الإلكتروني لنقل الملكية', epic: 'نقل الملكية', type: 'ميزة' },
  { id: 'bl-1244', title: 'رقمنة قائمة التحقق من مراجعة الجودة', epic: 'الجودة', type: 'ميزة' },
  { id: 'bl-1099', title: 'فلاتر تفصيلية للوحة قياس الأثر', epic: 'قياس الأثر', type: 'تحسين' },
  { id: 'bl-1256', title: 'تحويل المحادثة المباشرة لخدمة العملاء', epic: 'خدمة العملاء', type: 'ميزة' },
  { id: 'bl-1268', title: 'إصلاح: تكرار إنشاء الحالة عند بطء الشبكة', epic: 'استدامة المجتمع', type: 'خلل' },
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
    name: 'موافقة الأعمال',
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
    name: 'التطوير',
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
    name: 'الاختبار',
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
    name: 'الأمن السيبراني',
    previousId: 'stg-testing',
    nextId: 'stg-cab',
    isActive: true,
    approverRoles: ['role-security-officer'],
    requiredDocsToEnter: ['تقرير الاختبار'],
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
    name: 'الإنتاج',
    previousId: 'stg-cab',
    nextId: 'stg-post-deployment',
    isActive: true,
    approverRoles: ['role-release-manager'],
    requiredDocsToEnter: ['BRD', 'CR', 'خطة التراجع'],
    sendBackTargets: ['stg-cab'],
    slaHours: 24,
    posX: 1440, posY: 120,
  },
  {
    id: 'stg-post-deployment',
    name: 'التحقق بعد النشر',
    previousId: 'stg-production',
    nextId: null,
    isActive: true,
    approverRoles: ['role-release-manager', 'role-requester'],
    requiredDocsToEnter: ['تأكيد النشر'],
    sendBackTargets: ['stg-production'],
    slaHours: 24,
    posX: 1720, posY: 120,
  },
];

export const INITIAL_REQUESTS = [
  {
    id: 'REQ-1001',
    title: 'إضافة إعادة تعيين كلمة المرور بالخدمة الذاتية',
    description: 'تمكين المستفيدين من إعادة تعيين كلمة مرور البوابة عبر رمز تحقق.',
    riskClassification: 'Medium',
    requesterId: 'user-sara',
    requester: 'سارة العتيبي',
    currentStageId: 'stg-testing',
    overallStatus: 'In Progress',
    targetVersion: 'v2.4.0-rc1',
    createdAt: '2026-09-01T09:00:00Z',
    documents: [
      { id: 'doc-1', type: 'BRD', name: 'BRD_PasswordReset_v1.pdf', uploadedBy: 'Sara Al-Otaibi', uploadedAt: '2026-09-01T09:05:00Z' },
    ],
    transitions: [
      { id: 't1', fromStage: null, toStage: 'stg-business-approval', action: 'تم الإنشاء', actor: 'سارة العتيبي', role: 'role-requester', comment: 'تم تقديم الطلب الأولي.', timestamp: '2026-09-01T09:00:00Z' },
      { id: 't2', fromStage: 'stg-business-approval', toStage: 'stg-development', action: 'موافقة', actor: 'عمر فتحي', role: 'role-product-owner', comment: 'تمت الموافقة، ومتوافق مع خارطة طريق الربع الثالث.', timestamp: '2026-09-02T10:00:00Z' },
      { id: 't3', fromStage: 'stg-development', toStage: 'stg-testing', action: 'موافقة', actor: 'خالد نور', role: 'role-tech-lead', comment: 'اكتمل التطوير وتمت مراجعة الكود.', timestamp: '2026-09-05T14:00:00Z' },
    ],
    comments: [],
  },
  {
    id: 'REQ-1002',
    title: 'تصعيد التظلمات تلقائيًا بعد 5 أيام',
    description: 'تصعيد التظلمات غير المعالجة تلقائيًا إلى مدير الإدارة بعد خمسة أيام عمل.',
    riskClassification: 'Low',
    requesterId: 'user-sara',
    requester: 'سارة العتيبي',
    currentStageId: 'stg-business-approval',
    overallStatus: 'In Progress',
    targetVersion: '',
    createdAt: '2026-09-10T11:30:00Z',
    documents: [
      { id: 'doc-2', type: 'BRD', name: 'BRD_GrievanceEscalation.docx', uploadedBy: 'Sara Al-Otaibi', uploadedAt: '2026-09-10T11:32:00Z' },
    ],
    transitions: [
      { id: 't1', fromStage: null, toStage: 'stg-business-approval', action: 'تم الإنشاء', actor: 'سارة العتيبي', role: 'role-requester', comment: 'تم تقديم الطلب الأولي.', timestamp: '2026-09-10T11:30:00Z' },
    ],
    comments: [],
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-seed-1',
    requestId: 'REQ-1001',
    message: 'يتطلب REQ-1001 اعتماد ضمان الجودة (مرحلة الاختبار).',
    targetRoleId: 'role-qa-lead',
    targetUserId: null,
    timestamp: '2026-09-05T14:00:00Z',
    read: false,
  },
  {
    id: 'notif-seed-2',
    requestId: 'REQ-1002',
    message: 'يتطلب REQ-1002 موافقة الأعمال الخاصة بك.',
    targetRoleId: 'role-product-owner',
    targetUserId: null,
    timestamp: '2026-09-10T11:30:00Z',
    read: false,
  },
];

