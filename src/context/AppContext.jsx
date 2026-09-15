import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { INITIAL_NOTIFICATIONS, INITIAL_REQUESTS, INITIAL_STAGES, ROLES, USERS } from '../data/seed';
import { getMissingDocs, getNextStage, getStageById } from '../utils/workflow';

const STORAGE_KEY = 'approval-poc-state-v3';

const AppStateContext = createContext(null);
const AppDispatchContext = createContext(null);

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore corrupt storage
  }
  return {
    stages: INITIAL_STAGES,
    roles: ROLES,
    users: USERS,
    requests: INITIAL_REQUESTS,
    notifications: INITIAL_NOTIFICATIONS,
    currentUserId: null,
    nextReqNum: 1003,
  };
}

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/** Builds one notification per target role for a given stage (its approver roles). */
function notificationsForStage(state, requestId, stage, message) {
  if (!stage) return [];
  const now = new Date().toISOString();
  return stage.approverRoles.map((roleId) => ({
    id: uid('notif'),
    requestId,
    message,
    targetRoleId: roleId,
    targetUserId: null,
    timestamp: now,
    read: false,
  }));
}

function notificationForUser(requestId, userId, message) {
  return {
    id: uid('notif'),
    requestId,
    message,
    targetRoleId: null,
    targetUserId: userId,
    timestamp: new Date().toISOString(),
    read: false,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUserId: action.userId };

    case 'LOGOUT':
      return { ...state, currentUserId: null };

    case 'RESET_DEMO':
      return {
        stages: INITIAL_STAGES,
        roles: ROLES,
        users: USERS,
        requests: INITIAL_REQUESTS,
        notifications: INITIAL_NOTIFICATIONS,
        currentUserId: null,
        nextReqNum: 1003,
      };

    case 'CREATE_REQUEST': {
      const id = `REQ-${state.nextReqNum}`;
      const now = new Date().toISOString();
      const firstStage = state.stages.find((s) => s.isActive && !s.previousId) || state.stages[0];
      const requester = state.users.find((u) => u.id === action.requesterId);
      const docs = action.brdName
        ? [{ id: uid('doc'), type: 'BRD', name: action.brdName, uploadedBy: requester?.name || 'Unknown', uploadedAt: now }]
        : [];
      const newRequest = {
        id,
        title: action.title,
        description: action.description,
        riskClassification: action.riskClassification || 'Unclassified',
        requesterId: action.requesterId,
        requester: requester?.name || 'Unknown',
        currentStageId: firstStage.id,
        overallStatus: 'In Progress',
        targetVersion: '',
        linkedBacklogItems: action.linkedBacklogItems || [],
        createdAt: now,
        documents: docs,
        transitions: [
          {
            id: uid('t'),
            fromStage: null,
            toStage: firstStage.id,
            action: 'Created',
            actor: requester?.name || 'Unknown',
            role: 'role-requester',
            comment: 'Initial request submitted.',
            timestamp: now,
          },
        ],
        comments: [],
      };
      const newNotifs = notificationsForStage(
        state,
        id,
        firstStage,
        `New request ${id} "${action.title}" needs ${firstStage.name}.`
      );
      return {
        ...state,
        requests: [newRequest, ...state.requests],
        notifications: [...newNotifs, ...state.notifications],
        nextReqNum: state.nextReqNum + 1,
      };
    }

    case 'ADD_DOCUMENT': {
      const now = new Date().toISOString();
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.requestId
            ? {
                ...r,
                documents: [
                  ...r.documents,
                  { id: uid('doc'), type: action.docType, name: action.name, uploadedBy: action.uploadedBy, uploadedAt: now },
                ],
              }
            : r
        ),
      };
    }

    case 'SET_RISK_CLASSIFICATION': {
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.requestId ? { ...r, riskClassification: action.riskClassification } : r
        ),
      };
    }

    case 'ADD_COMMENT': {
      const now = new Date().toISOString();
      return {
        ...state,
        requests: state.requests.map((r) =>
          r.id === action.requestId
            ? {
                ...r,
                comments: [...r.comments, { id: uid('c'), stage: action.stageId, author: action.author, text: action.text, timestamp: now }],
              }
            : r
        ),
      };
    }

    case 'TRANSITION': {
      const now = new Date().toISOString();
      const request = state.requests.find((r) => r.id === action.requestId);
      if (!request) return state;

      const isForward = action.direction === 'forward';
      const willComplete = isForward && !action.toStageId;

      const updatedRequests = state.requests.map((r) => {
        if (r.id !== action.requestId) return r;
        return {
          ...r,
          currentStageId: willComplete ? r.currentStageId : action.toStageId,
          overallStatus: willComplete ? 'Completed' : action.direction === 'backward' ? 'In Progress (Sent Back)' : 'In Progress',
          targetVersion: action.targetVersion || r.targetVersion,
          transitions: [
            ...r.transitions,
            {
              id: uid('t'),
              fromStage: r.currentStageId,
              toStage: willComplete ? null : action.toStageId,
              action: isForward ? (willComplete ? 'Completed' : 'Approve') : 'Send Back',
              actor: action.actor,
              role: action.role,
              comment: action.comment,
              timestamp: now,
            },
          ],
        };
      });

      let newNotifs = [];
      if (willComplete) {
        newNotifs.push(notificationForUser(request.id, request.requesterId, `Your request ${request.id} "${request.title}" is now complete.`));
      } else {
        const targetStage = getStageById(state.stages, action.toStageId);
        const verb = isForward ? 'reached' : 'was sent back to';
        newNotifs = notificationsForStage(
          state,
          request.id,
          targetStage,
          `${request.id} "${request.title}" ${verb} ${targetStage?.name}.`
        );
        // Also let the requester know their request moved forward.
        if (isForward && request.requesterId) {
          newNotifs.push(
            notificationForUser(request.id, request.requesterId, `Your request ${request.id} moved to ${targetStage?.name}.`)
          );
        }
      }

      return { ...state, requests: updatedRequests, notifications: [...newNotifs, ...state.notifications] };
    }

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.notificationId ? { ...n, read: true } : n)),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.targetRoleId === action.roleId || n.targetUserId === action.userId ? { ...n, read: true } : n
        ),
      };

    // ---- Admin: stage configuration ----
    case 'ADD_STAGE': {
      const newId = uid('stg');
      const afterStage = state.stages.find((s) => s.id === action.insertAfterId);
      const oldNextId = afterStage ? afterStage.nextId : null;
      const newStage = {
        id: newId,
        name: action.name,
        previousId: afterStage ? afterStage.id : null,
        nextId: oldNextId,
        isActive: true,
        approverRoles: action.approverRoles,
        requiredDocsToEnter: action.requiredDocsToEnter,
        sendBackTargets: action.sendBackTargets,
        slaHours: action.slaHours,
      };
      const stages = state.stages.map((s) => {
        if (afterStage && s.id === afterStage.id) return { ...s, nextId: newId };
        if (oldNextId && s.id === oldNextId) return { ...s, previousId: newId };
        return s;
      });
      return { ...state, stages: [...stages, newStage] };
    }

    // Creates a floating, unconnected stage node on the diagram canvas.
    // It has no previousId/nextId until the admin drags a connection to/from it.
    case 'ADD_STAGE_NODE': {
      const newId = uid('stg');
      const newStage = {
        id: newId,
        name: action.name || 'New Stage',
        previousId: null,
        nextId: null,
        isActive: true,
        approverRoles: action.approverRoles || [],
        requiredDocsToEnter: action.requiredDocsToEnter || [],
        sendBackTargets: action.sendBackTargets || [],
        slaHours: action.slaHours ?? 24,
        posX: action.posX ?? 40,
        posY: action.posY ?? 260,
      };
      return { ...state, stages: [...state.stages, newStage] };
    }

    // Wires up a connection dragged on the diagram: sourceId's next stage becomes
    // targetId. targetId is first detached from wherever it was, and whatever used
    // to be after sourceId is spliced in after targetId instead (so nothing is lost).
    case 'CONNECT_STAGES': {
      const { sourceId, targetId } = action;
      if (sourceId === targetId) return state;
      const byId = Object.fromEntries(state.stages.map((s) => [s.id, s]));
      const source = byId[sourceId];
      const target = byId[targetId];
      if (!source || !target) return state;

      const oldTargetPrev = target.previousId;
      const oldTargetNext = target.nextId;
      const oldSourceNext = source.nextId === targetId ? null : source.nextId;

      const stages = state.stages.map((s) => {
        if (s.id === sourceId) return { ...s, nextId: targetId };
        if (s.id === targetId) return { ...s, previousId: sourceId, nextId: oldSourceNext || oldTargetNext };
        if (s.id === oldTargetPrev && oldTargetPrev !== sourceId) return { ...s, nextId: oldTargetNext };
        if (s.id === oldTargetNext && oldTargetNext !== (oldSourceNext || oldTargetNext) && s.id !== targetId) {
          return { ...s, previousId: oldTargetPrev };
        }
        if (oldSourceNext && s.id === oldSourceNext) return { ...s, previousId: targetId };
        return s;
      });
      return { ...state, stages };
    }

    // Breaks the link between a stage and its next stage (edge deleted on the diagram).
    case 'DISCONNECT_STAGES': {
      const { sourceId, targetId } = action;
      const stages = state.stages.map((s) => {
        if (s.id === sourceId && s.nextId === targetId) return { ...s, nextId: null };
        if (s.id === targetId && s.previousId === sourceId) return { ...s, previousId: null };
        return s;
      });
      return { ...state, stages };
    }

    case 'UPDATE_STAGE': {
      return {
        ...state,
        stages: state.stages.map((s) => (s.id === action.stageId ? { ...s, ...action.patch } : s)),
      };
    }

    case 'DELETE_STAGE': {
      const target = state.stages.find((s) => s.id === action.stageId);
      if (!target) return state;
      const stages = state.stages.map((s) => {
        if (s.id === target.previousId) return { ...s, nextId: target.nextId };
        if (s.id === target.nextId) return { ...s, previousId: target.previousId };
        if (s.id === target.id) return { ...s, isActive: false, previousId: null, nextId: null };
        return s;
      });
      return { ...state, stages };
    }

    case 'PURGE_STAGE': {
      return { ...state, stages: state.stages.filter((s) => s.id !== action.stageId) };
    }

    case 'MOVE_STAGE': {
      // swap the stage with its neighbor in the given direction
      const stages = [...state.stages];
      const target = stages.find((s) => s.id === action.stageId);
      if (!target) return state;
      const neighborId = action.direction === 'up' ? target.previousId : target.nextId;
      const neighbor = stages.find((s) => s.id === neighborId);
      if (!neighbor) return state; // already at edge
      const beforeNeighborId = action.direction === 'up' ? neighbor.previousId : null;
      const afterNeighborId = action.direction === 'down' ? neighbor.nextId : null;

      const updated = stages.map((s) => {
        if (action.direction === 'up') {
          if (s.id === neighbor.id) return { ...s, previousId: target.id, nextId: target.nextId };
          if (s.id === target.id) return { ...s, previousId: beforeNeighborId, nextId: neighbor.id };
          if (s.id === beforeNeighborId) return { ...s, nextId: target.id };
          if (s.id === target.nextId && s.id !== neighbor.id) return { ...s, previousId: neighbor.id };
        } else {
          if (s.id === neighbor.id) return { ...s, previousId: target.previousId, nextId: target.id };
          if (s.id === target.id) return { ...s, previousId: neighbor.id, nextId: afterNeighborId };
          if (s.id === target.previousId) return { ...s, nextId: neighbor.id };
          if (s.id === afterNeighborId) return { ...s, previousId: target.id };
        }
        return s;
      });
      return { ...state, stages: updated };
    }

    case 'ADD_ROLE': {
      const id = uid('role');
      return { ...state, roles: [...state.roles, { id, name: action.name }] };
    }

    case 'DELETE_ROLE': {
      const roleId = action.roleId;
      return {
        ...state,
        roles: state.roles.filter((r) => r.id !== roleId),
        stages: state.stages.map((s) => ({
          ...s,
          approverRoles: (s.approverRoles || []).filter((r) => r !== roleId),
        })),
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => state, [state]);

  return (
    <AppStateContext.Provider value={value}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}

export function useCurrentUser() {
  const state = useAppState();
  return state.users.find((u) => u.id === state.currentUserId) || null;
}

// Convenience derived-data helpers built on top of state
export function useWorkflowHelpers() {
  const state = useAppState();
  return {
    getStage: (id) => getStageById(state.stages, id),
    getNext: (id) => getNextStage(state.stages, id),
    getMissingDocsFor: (stage, request) => getMissingDocs(stage, request),
  };
}
