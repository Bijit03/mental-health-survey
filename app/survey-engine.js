import {
  ASSIGNMENT_ARMS,
  COPY_STATUS,
  DRAFT_TTL_DAYS,
  PRACTITIONER_FLOW,
  QUESTIONS,
  RECRUITMENT_SOURCES,
  SCHEMA_VERSION,
  USER_FLOW,
} from "./survey-config.js";

const UINT32_RANGE = 0x100000000;

function secureUnit() {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] / UINT32_RANGE;
}

export function secureShuffle(values, unitRandom = secureUnit) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(unitRandom() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

export function createOptionOrders(unitRandom = secureUnit) {
  return Object.values(QUESTIONS).reduce((orders, question) => {
    if (!question.randomize || !question.options) return orders;
    const movable = question.options
      .filter((option) => !option.fixed)
      .map((option) => option.value);
    const fixed = question.options
      .filter((option) => option.fixed)
      .map((option) => option.value);
    orders[question.id] = [...secureShuffle(movable, unitRandom), ...fixed];
    return orders;
  }, {});
}

export function getOrderedOptions(question, optionOrders) {
  if (!question.options) return [];
  const order = optionOrders?.[question.id];
  if (!order) return question.options;
  const byValue = new Map(
    question.options.map((option) => [option.value, option]),
  );
  return order.map((value) => byValue.get(value)).filter(Boolean);
}

export function normaliseRecruitmentSource(value) {
  return RECRUITMENT_SOURCES.includes(value) ? value : "unknown";
}

function createAnonymousSessionId() {
  if (typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const values = new Uint8Array(16);
  globalThis.crypto.getRandomValues(values);
  return [...values].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export function createInitialState(recruitmentSource = "unknown", now = new Date()) {
  const expiresAt = new Date(
    now.getTime() + DRAFT_TTL_DAYS * 24 * 60 * 60 * 1000,
  );
  return {
    schema_version: SCHEMA_VERSION,
    anonymous_session_id: createAnonymousSessionId(),
    respondent_path: null,
    assigned_arm: null,
    recruitment_source: normaliseRecruitmentSource(recruitmentSource),
    option_orders: createOptionOrders(),
    answers: {},
    started_at: now.toISOString(),
    saved_at: null,
    expires_at: expiresAt.toISOString(),
    completed_at: null,
    consent: false,
    current_id: "arrival",
  };
}

export function isDraftUsable(value, now = new Date()) {
  if (!value || typeof value !== "object") return false;
  if (value.schema_version !== SCHEMA_VERSION || value.completed_at) return false;
  const expiresAt = Date.parse(value.expires_at);
  return Number.isFinite(expiresAt) && expiresAt > now.getTime();
}

export function assignArm(existingArm = null, unitRandom = secureUnit) {
  if (ASSIGNMENT_ARMS.includes(existingArm)) return existingArm;
  return ASSIGNMENT_ARMS[Math.floor(unitRandom() * ASSIGNMENT_ARMS.length)];
}

export function answerValue(answer) {
  if (answer && typeof answer === "object" && "value" in answer) {
    return answer.value;
  }
  return answer;
}

export function answerValues(answer) {
  if (Array.isArray(answer)) return answer;
  if (answer && typeof answer === "object" && Array.isArray(answer.values)) {
    return answer.values;
  }
  return [];
}

export function shouldShowQuestion(question, answers) {
  if (!question.showIf) return true;
  const current = answerValue(answers[question.showIf.questionId]);
  return question.showIf.values.includes(current);
}

export function getVisibleFlow(pathway, answers = {}) {
  if (pathway === "user") {
    const age = answerValue(answers.u_age);
    if (age && age !== "yes") {
      return ["u_intro", "u_age", "u_ineligible"];
    }
    return USER_FLOW.filter((id) => shouldShowQuestion(QUESTIONS[id], answers));
  }

  if (pathway === "practitioner") {
    const status = answerValue(answers.t_status);
    const eligible = ["current_independent", "current_supervised"];
    if (status && !eligible.includes(status)) {
      return ["t_intro", "t_consent", "t_status", "t_ineligible"];
    }
    return PRACTITIONER_FLOW.filter((id) =>
      shouldShowQuestion(QUESTIONS[id], answers),
    );
  }

  return [];
}

export function pruneAnswersForFlow(pathway, answers) {
  const visible = new Set(getVisibleFlow(pathway, answers));
  const pruned = { ...answers };
  Object.keys(pruned).forEach((questionId) => {
    const question = QUESTIONS[questionId];
    if (question && question.pathway === pathway && !visible.has(questionId)) {
      delete pruned[questionId];
    }
  });
  return pruned;
}

function selectedTextRequirement(question, answer) {
  if (!question.options) return null;
  const selected =
    question.type === "checkbox" ? answerValues(answer) : [answerValue(answer)];
  return question.options.find(
    (option) => selected.includes(option.value) && option.textInput,
  );
}

export function validateAnswer(question, answer) {
  if (
    ["information", "concept", "eligibility-exit"].includes(question.type)
  ) {
    return null;
  }

  if (question.type === "consent") {
    return answer === true
      ? null
      : "Choose the checkbox if you want to take part, or exit the survey.";
  }

  if (question.type === "radio" || question.type === "select") {
    const value = answerValue(answer);
    if (question.required && !value) {
      return "Choose one answer before continuing.";
    }
    const textRequirement = selectedTextRequirement(question, answer);
    if (
      textRequirement &&
      (!answer?.text || String(answer.text).trim().length === 0)
    ) {
      return `Complete “${textRequirement.textInput.label}” or choose a different answer.`;
    }
    return null;
  }

  if (question.type === "checkbox") {
    const values = answerValues(answer);
    if (question.required && values.length === 0) {
      return "Choose at least one answer before continuing.";
    }
    const textRequirement = selectedTextRequirement(question, answer);
    if (
      textRequirement &&
      (!answer?.text || String(answer.text).trim().length === 0)
    ) {
      return `Complete “${textRequirement.textInput.label}” or choose a different answer.`;
    }
    return null;
  }

  return null;
}

export function toggleCheckboxValue(question, answer, value, checked) {
  const currentValues = answerValues(answer);
  const option = question.options.find((item) => item.value === value);
  let nextValues;

  if (checked && option?.exclusive) {
    nextValues = [value];
  } else if (checked) {
    const withoutExclusive = currentValues.filter((currentValue) => {
      const currentOption = question.options.find(
        (item) => item.value === currentValue,
      );
      return !currentOption?.exclusive;
    });
    nextValues = [...new Set([...withoutExclusive, value])];
  } else {
    nextValues = currentValues.filter((currentValue) => currentValue !== value);
  }

  const next = { values: nextValues };
  if (answer?.text && nextValues.includes("other")) {
    next.text = answer.text;
  }
  return next;
}

function assignAnalysisValue(target, key, value) {
  if (key) target[key] = value;
}

export function buildAnalysisAnswers(questionAnswers) {
  const analysis = {};

  Object.values(QUESTIONS).forEach((question) => {
    if (!question.analysis || !(question.id in questionAnswers)) return;
    const answer = questionAnswers[question.id];
    const mapping = question.analysis;

    assignAnalysisValue(analysis, mapping.value, answerValue(answer));
    assignAnalysisValue(analysis, mapping.values, answerValues(answer));
    assignAnalysisValue(
      analysis,
      mapping.text,
      typeof answer === "object" && answer
        ? String(answer.text || "").trim() || null
        : null,
    );
    assignAnalysisValue(
      analysis,
      mapping.notSure,
      Boolean(answer && typeof answer === "object" && answer.not_sure),
    );
    assignAnalysisValue(
      analysis,
      mapping.preferNot,
      Boolean(answer && typeof answer === "object" && answer.prefer_not),
    );
  });

  return analysis;
}

export function buildSubmissionPayload(state, completedAt = new Date()) {
  return {
    schema_version: state.schema_version,
    anonymous_session_id: state.anonymous_session_id,
    respondent_path: state.respondent_path,
    assigned_arm: state.assigned_arm,
    recruitment_source: state.recruitment_source,
    option_orders: state.option_orders,
    answers: buildAnalysisAnswers(state.answers),
    question_answers: state.answers,
    started_at: state.started_at,
    completed_at: completedAt.toISOString(),
    consent: Boolean(state.consent),
    copy_status: COPY_STATUS,
  };
}

export function downloadPayload(payload) {
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mental-health-survey-${payload.anonymous_session_id}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function submitSurvey(payload) {
  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.ok) {
      return {
        status: "error",
        message: result?.error || "The response could not be submitted.",
      };
    }

    return { status: "submitted", responseId: result.responseId || null };
  } catch {
    return {
      status: "error",
      message: "The response could not be submitted.",
    };
  }
}
