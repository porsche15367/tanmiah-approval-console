// Pure helper functions for the configurable stage-chain workflow engine.

/** Returns the active stages in pipeline order by walking the previousId/nextId chain. */
export function getOrderedStages(stages) {
  const active = stages.filter((s) => s.isActive);
  const byId = Object.fromEntries(active.map((s) => [s.id, s]));
  const root = active.find((s) => !s.previousId || !byId[s.previousId]);
  if (!root) return active;
  const ordered = [];
  let current = root;
  const seen = new Set();
  while (current && !seen.has(current.id)) {
    ordered.push(current);
    seen.add(current.id);
    current = current.nextId ? byId[current.nextId] : null;
  }
  return ordered;
}

export function getStageById(stages, stageId) {
  return stages.find((s) => s.id === stageId) || null;
}

export function getNextStage(stages, stageId) {
  const stage = getStageById(stages, stageId);
  if (!stage || !stage.nextId) return null;
  return getStageById(stages, stage.nextId);
}

/** Doc types present on the request (by type name). */
export function getRequestDocTypes(request) {
  return new Set(request.documents.map((d) => d.type));
}

/** Checks whether a request has all docs required to enter a given stage. */
export function getMissingDocs(stage, request) {
  if (!stage) return [];
  const present = getRequestDocTypes(request);
  return stage.requiredDocsToEnter.filter((docType) => !present.has(docType));
}

/** Checks whether a role is allowed to act (approve/send-back) on a stage. */
export function roleCanActOnStage(stage, roleId) {
  return !!stage && stage.approverRoles.includes(roleId);
}

/** Roles that may approve/send-back for a stage, resolved to display names. */
export function stageRoleNames(stage, roles) {
  if (!stage) return [];
  return stage.approverRoles.map((rid) => roles.find((r) => r.id === rid)?.name || rid);
}
