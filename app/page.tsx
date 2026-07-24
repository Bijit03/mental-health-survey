"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import {
  FormEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  PART_LABELS,
  QUESTIONS,
  ROLE_OPTIONS,
} from "./survey-config.js";
import {
  answerValue,
  answerValues,
  assignArm,
  buildSubmissionPayload,
  createInitialState,
  downloadPayload,
  getOrderedOptions,
  getVisibleFlow,
  isDraftUsable,
  normaliseRecruitmentSource,
  pruneAnswersForFlow,
  submitSurvey,
  toggleCheckboxValue,
  validateAnswer,
} from "./survey-engine.js";

const STORAGE_KEY = "mental_health_survey_draft_v1";

type View =
  | "loading"
  | "resume"
  | "consent"
  | "arrival"
  | "survey"
  | "exit"
  | "complete";

type SurveyState = {
  schema_version: string;
  anonymous_session_id: string;
  respondent_path: "user" | "practitioner" | null;
  assigned_arm: "neutral" | "frame_a" | "frame_b" | null;
  recruitment_source: string;
  option_orders: Record<string, string[]>;
  answers: Record<string, any>;
  started_at: string;
  saved_at: string | null;
  expires_at: string;
  completed_at: string | null;
  consent: boolean;
  current_id: string;
};

type Question = Record<string, any>;
type HeadingRef = { current: HTMLElement | null };

function defaultAnswer(question: Question) {
  if (question.type === "checkbox") return { values: [] };
  if (question.type === "open-comprehension") {
    return { text: "", not_sure: false };
  }
  if (question.type === "optional-text") {
    return { text: "", prefer_not: false };
  }
  if (question.type === "consent") return false;
  return "";
}

function cloneAnswer(value: any) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function readSourceFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return normaliseRecruitmentSource(
    params.get("source") || params.get("src") || "unknown",
  );
}

function formatSavedTime(value: string | null) {
  if (!value) return "earlier on this device";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "earlier on this device";
  }
}

function Header({ onExit }: { onExit?: () => void }) {
  return (
    <header className="site-header">
      <div className="brand-lockup" aria-label="Concept survey prototype">
        <span>Concept survey</span>
        <span className="brand-dot" aria-hidden="true">
          ·
        </span>
        <span>Prototype</span>
      </div>
      {onExit ? (
        <button className="text-action" type="button" onClick={onExit}>
          Exit survey
        </button>
      ) : (
        <span aria-hidden="true" />
      )}
    </header>
  );
}

function ErrorSummary({
  message,
  errorRef,
}: {
  message: string;
  errorRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="error-summary"
      ref={errorRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
    >
      <p className="error-kicker" id="error-summary-title">
        There is one thing to check
      </p>
      <p>{message}</p>
    </div>
  );
}

function ChoiceMark({ type }: { type: "radio" | "checkbox" }) {
  return <span className={`choice-mark ${type}`} aria-hidden="true" />;
}

function RadioQuestion({
  question,
  answer,
  setAnswer,
  options,
  error,
  headingRef,
}: {
  question: Question;
  answer: any;
  setAnswer: (value: any) => void;
  options: any[];
  error: string | null;
  headingRef: HeadingRef;
}) {
  const selected = answerValue(answer);
  return (
    <fieldset
      className={`question-fieldset ${error ? "has-error" : ""}`}
      aria-describedby={`${question.id}-support ${
        error ? `${question.id}-error` : ""
      }`}
    >
      <legend
        className="question-title"
        id={`${question.id}-title`}
        role="heading"
        aria-level={1}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </legend>
      <QuestionSupport question={question} error={error} />
      <div className="choice-list">
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <div
              className={`choice-block ${isSelected ? "is-selected" : ""}`}
              key={option.value}
            >
              <label className="choice-label">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={isSelected}
                  onChange={() =>
                    setAnswer(
                      option.textInput
                        ? {
                            value: option.value,
                            text:
                              selected === option.value && answer?.text
                                ? answer.text
                                : "",
                          }
                        : option.value,
                    )
                  }
                />
                <ChoiceMark type="radio" />
                <span>{option.label}</span>
              </label>
              {isSelected && option.textInput ? (
                <div className="followup-field">
                  <label htmlFor={`${question.id}-${option.value}-text`}>
                    {option.textInput.label}
                  </label>
                  <input
                    id={`${question.id}-${option.value}-text`}
                    className="text-input"
                    type="text"
                    value={answer?.text || ""}
                    maxLength={option.textInput.maxLength}
                    onChange={(event) =>
                      setAnswer({
                        value: option.value,
                        text: event.target.value,
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function CheckboxQuestion({
  question,
  answer,
  setAnswer,
  options,
  error,
  headingRef,
}: {
  question: Question;
  answer: any;
  setAnswer: (value: any) => void;
  options: any[];
  error: string | null;
  headingRef: HeadingRef;
}) {
  const selected = answerValues(answer);
  return (
    <fieldset
      className={`question-fieldset ${error ? "has-error" : ""}`}
      aria-describedby={`${question.id}-support ${
        error ? `${question.id}-error` : ""
      }`}
    >
      <legend
        className="question-title"
        id={`${question.id}-title`}
        role="heading"
        aria-level={1}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </legend>
      <QuestionSupport question={question} error={error} />
      <div className="choice-list">
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <div
              className={`choice-block ${isSelected ? "is-selected" : ""}`}
              key={option.value}
            >
              <label className="choice-label">
                <input
                  type="checkbox"
                  name={question.id}
                  value={option.value}
                  checked={isSelected}
                  onChange={(event) =>
                    setAnswer(
                      toggleCheckboxValue(
                        question,
                        answer,
                        option.value,
                        event.target.checked,
                      ),
                    )
                  }
                />
                <ChoiceMark type="checkbox" />
                <span>{option.label}</span>
              </label>
              {isSelected && option.textInput ? (
                <div className="followup-field">
                  <label htmlFor={`${question.id}-${option.value}-text`}>
                    {option.textInput.label}
                  </label>
                  <input
                    id={`${question.id}-${option.value}-text`}
                    className="text-input"
                    type="text"
                    value={answer?.text || ""}
                    maxLength={option.textInput.maxLength}
                    onChange={(event) =>
                      setAnswer({
                        values: selected,
                        text: event.target.value,
                      })
                    }
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}

function QuestionSupport({
  question,
  error,
}: {
  question: Question;
  error: string | null;
}) {
  return (
    <div className="question-support" id={`${question.id}-support`}>
      {question.helper ? <p>{question.helper}</p> : null}
      <p className="requirement">
        {question.required ? "An answer is required." : "Optional."}
      </p>
      {error ? (
        <p className="field-error" id={`${question.id}-error`}>
          <span aria-hidden="true">— </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ConsentQuestion({
  question,
  answer,
  setAnswer,
  error,
  headingRef,
}: {
  question: Question;
  answer: boolean;
  setAnswer: (value: boolean) => void;
  error: string | null;
  headingRef: HeadingRef;
}) {
  return (
    <fieldset
      className={`question-fieldset ${error ? "has-error" : ""}`}
      aria-describedby={`${question.id}-support ${
        error ? `${question.id}-error` : ""
      }`}
    >
      <p className="screen-eyebrow">{question.eyebrow}</p>
      <legend
        className="question-title"
        id={`${question.id}-title`}
        role="heading"
        aria-level={1}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </legend>
      <QuestionSupport question={question} error={error} />
      <div className={`choice-block consent-block ${answer ? "is-selected" : ""}`}>
        <label className="choice-label">
          <input
            type="checkbox"
            checked={Boolean(answer)}
            onChange={(event) => setAnswer(event.target.checked)}
          />
          <ChoiceMark type="checkbox" />
          <span>{question.label}</span>
        </label>
      </div>
    </fieldset>
  );
}

function OpenComprehension({
  question,
  answer,
  setAnswer,
  error,
  headingRef,
}: {
  question: Question;
  answer: any;
  setAnswer: (value: any) => void;
  error: string | null;
  headingRef: HeadingRef;
}) {
  const text = answer?.text || "";
  const notSure = Boolean(answer?.not_sure);
  return (
    <div className={`text-question ${error ? "has-error" : ""}`}>
      <h1
        className="question-title"
        id={`${question.id}-title`}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </h1>
      <QuestionSupport question={question} error={error} />
      <label className="sr-only" htmlFor={`${question.id}-text`}>
        Your answer
      </label>
      <textarea
        id={`${question.id}-text`}
        className="textarea"
        rows={7}
        maxLength={question.maxLength}
        disabled={notSure}
        value={text}
        onChange={(event) =>
          setAnswer({ text: event.target.value, not_sure: false })
        }
        aria-describedby={`${question.id}-count`}
      />
      <div className="text-meta" id={`${question.id}-count`}>
        <span>Do not include a name or contact details.</span>
        <span>{text.length} / {question.maxLength}</span>
      </div>
      <div
        className={`choice-block compact-choice ${notSure ? "is-selected" : ""}`}
      >
        <label className="choice-label">
          <input
            type="checkbox"
            checked={notSure}
            onChange={(event) =>
              setAnswer({
                text: event.target.checked ? "" : text,
                not_sure: event.target.checked,
              })
            }
          />
          <ChoiceMark type="checkbox" />
          <span>{question.notSureLabel}</span>
        </label>
      </div>
    </div>
  );
}

function OptionalTextQuestion({
  question,
  answer,
  setAnswer,
  error,
  headingRef,
}: {
  question: Question;
  answer: any;
  setAnswer: (value: any) => void;
  error: string | null;
  headingRef: HeadingRef;
}) {
  const text = answer?.text || "";
  const preferNot = Boolean(answer?.prefer_not);
  return (
    <div className={`text-question ${error ? "has-error" : ""}`}>
      <h1
        className="question-title"
        id={`${question.id}-title`}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </h1>
      <QuestionSupport question={question} error={error} />
      <label className="sr-only" htmlFor={`${question.id}-text`}>
        Current city, town, or village
      </label>
      <input
        id={`${question.id}-text`}
        className="text-input large"
        type="text"
        autoComplete="address-level2"
        maxLength={question.maxLength}
        disabled={preferNot}
        value={text}
        onChange={(event) =>
          setAnswer({ text: event.target.value, prefer_not: false })
        }
      />
      <div
        className={`choice-block compact-choice ${preferNot ? "is-selected" : ""}`}
      >
        <label className="choice-label">
          <input
            type="checkbox"
            checked={preferNot}
            onChange={(event) =>
              setAnswer({
                text: event.target.checked ? "" : text,
                prefer_not: event.target.checked,
              })
            }
          />
          <ChoiceMark type="checkbox" />
          <span>{question.preferNotLabel}</span>
        </label>
      </div>
    </div>
  );
}

function SelectQuestion({
  question,
  answer,
  setAnswer,
  error,
  headingRef,
}: {
  question: Question;
  answer: string;
  setAnswer: (value: string) => void;
  error: string | null;
  headingRef: HeadingRef;
}) {
  return (
    <div className={`text-question ${error ? "has-error" : ""}`}>
      <label
        className="question-title label-heading"
        id={`${question.id}-title`}
        htmlFor={`${question.id}-select`}
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </label>
      <QuestionSupport question={question} error={error} />
      <div className="select-wrap">
        <select
          id={`${question.id}-select`}
          className="select-input"
          value={answer || ""}
          onChange={(event) => setAnswer(event.target.value)}
          aria-describedby={`${question.id}-support ${
            error ? `${question.id}-error` : ""
          }`}
        >
          <option value="">{question.placeholder}</option>
          {question.options.map((option: any) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function InformationScreen({
  question,
  headingRef,
}: {
  question: Question;
  headingRef: HeadingRef;
}) {
  return (
    <article className="information-screen">
      <p className="screen-eyebrow">{question.eyebrow}</p>
      <h1
        className="information-title"
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </h1>
      <div className="reading-copy">
        {question.body.map((paragraph: string) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <div className="boundary-note">
        <span className="boundary-mark" aria-hidden="true">
          i
        </span>
        <p>{question.notice}</p>
      </div>
    </article>
  );
}

function ConceptScreen({
  question,
  assignedArm,
  headingRef,
}: {
  question: Question;
  assignedArm: string;
  headingRef: HeadingRef;
}) {
  const message =
    question.messages[assignedArm] || question.messages.neutral;
  return (
    <article className="concept-screen">
      <div className="concept-copy">
        <p className="screen-eyebrow">{message.eyebrow}</p>
        <h1
          className="concept-title"
          ref={(node) => {
            headingRef.current = node;
          }}
          tabIndex={-1}
        >
          {message.title}
        </h1>
        <p className="concept-body">{message.body}</p>
      </div>
      <div className="fact-ledger" aria-label="Facts in the description">
        <p className="fact-ledger-title">What is being explored</p>
        <ul>
          {question.facts.map((fact: string) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      </div>
      <p className="concept-footer">{question.footer}</p>
    </article>
  );
}

function EligibilityExit({
  question,
  headingRef,
}: {
  question: Question;
  headingRef: HeadingRef;
}) {
  return (
    <article className="information-screen eligibility-screen">
      <p className="screen-eyebrow">{question.eyebrow}</p>
      <h1
        className="information-title"
        ref={(node) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {question.title}
      </h1>
      <div className="reading-copy">
        <p>{question.body}</p>
      </div>
    </article>
  );
}

function QuestionRenderer({
  question,
  answer,
  setAnswer,
  optionOrders,
  error,
  headingRef,
}: {
  question: Question;
  answer: any;
  setAnswer: (value: any) => void;
  optionOrders: Record<string, string[]>;
  error: string | null;
  headingRef: HeadingRef;
}) {
  const options = getOrderedOptions(question, optionOrders);
  if (question.type === "radio") {
    return (
      <RadioQuestion
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        options={options}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  if (question.type === "checkbox") {
    return (
      <CheckboxQuestion
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        options={options}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  if (question.type === "consent") {
    return (
      <ConsentQuestion
        question={question}
        answer={Boolean(answer)}
        setAnswer={setAnswer}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  if (question.type === "open-comprehension") {
    return (
      <OpenComprehension
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  if (question.type === "optional-text") {
    return (
      <OptionalTextQuestion
        question={question}
        answer={answer}
        setAnswer={setAnswer}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  if (question.type === "select") {
    return (
      <SelectQuestion
        question={question}
        answer={answer || ""}
        setAnswer={setAnswer}
        error={error}
        headingRef={headingRef}
      />
    );
  }
  return null;
}

function SurveyFrame({
  survey,
  children,
}: {
  survey: SurveyState;
  children: ReactNode;
}) {
  const question = QUESTIONS[survey.current_id] as Question | undefined;
  const pathway = survey.respondent_path;
  const part = question?.part || 1;
  const labels = pathway ? PART_LABELS[pathway] : null;
  return (
    <div className={`survey-grid path-${pathway || "none"}`}>
      <aside className="survey-rail" aria-label="Survey position">
        <p className="rail-path">
          {pathway === "user" ? "User journey" : "Practitioner journey"}
        </p>
        <p className="rail-part">Part {part} of 5</p>
        <p className="rail-title">{labels?.[part]}</p>
        <div className="rail-rule" aria-hidden="true" />
        <p className="rail-note">
          Positive, negative and uncertain answers are equally useful.
        </p>
      </aside>
      <section className="survey-stage">{children}</section>
    </div>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("loading");
  const [returnView, setReturnView] = useState<View>("arrival");
  const [survey, setSurvey] = useState<SurveyState | null>(null);
  const [savedDraft, setSavedDraft] = useState<SurveyState | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [draftAnswer, setDraftAnswer] = useState<any>("");
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClearExit, setConfirmClearExit] = useState(false);
  const [exitCleared, setExitCleared] = useState(false);
  const [completedPayload, setCompletedPayload] = useState<any>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const headingRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const source = readSourceFromUrl();
    const fresh = createInitialState(source) as SurveyState;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (isDraftUsable(parsed)) {
        setSavedDraft(parsed);
        setSurvey(fresh);
        setView("resume");
        return;
      }
      if (raw) localStorage.removeItem(STORAGE_KEY);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setSurvey(fresh);
    setView("consent");
  }, []);

  useEffect(() => {
    if (view !== "survey" || !survey) return;
    const question = QUESTIONS[survey.current_id] as Question | undefined;
    if (!question) return;
    const savedAnswer = survey.answers[survey.current_id];
    setDraftAnswer(
      savedAnswer === undefined
        ? defaultAnswer(question)
        : cloneAnswer(savedAnswer),
    );
    setError(null);
    document.title = `${question.title || "Concept survey"} — Concept survey`;
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => headingRef.current?.focus(), 40);
  }, [survey, view]);

  useEffect(() => {
    if (!error) return;
    document.title = `Error: Concept survey`;
    window.setTimeout(() => errorRef.current?.focus(), 20);
  }, [error]);

  const flow = survey?.respondent_path
    ? getVisibleFlow(survey.respondent_path, survey.answers)
    : [];

  const currentQuestion = survey
    ? (QUESTIONS[survey.current_id] as Question | undefined)
    : undefined;
  const currentIndex = survey ? flow.indexOf(survey.current_id) : -1;
  const isLastQuestion =
    currentIndex >= 0 &&
    currentIndex === flow.length - 1 &&
    currentQuestion &&
    !["eligibility-exit"].includes(currentQuestion.type);

  function persistDraft(nextState: SurveyState) {
    const persisted = {
      ...nextState,
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    setSurvey(persisted);
  }

  function openExit() {
    setReturnView(view === "exit" ? "arrival" : view);
    setConfirmClearExit(false);
    setExitCleared(false);
    setView("exit");
    window.setTimeout(() => headingRef.current?.focus(), 30);
  }

  function freshState() {
    return createInitialState(readSourceFromUrl()) as SurveyState;
  }

  function clearAndStartAgain() {
    localStorage.removeItem(STORAGE_KEY);
    const fresh = freshState();
    setSurvey(fresh);
    setSavedDraft(null);
    setSelectedRole("");
    setConsentChecked(false);
    setConfirmReset(false);
    setView("consent");
  }

  function beginConsent(event: FormEvent) {
    event.preventDefault();
    if (!consentChecked) {
      setError(
        "Choose the agreement checkbox to take part, or select “I do not want to take part”.",
      );
      return;
    }
    setSurvey({ ...survey!, consent: true });
    setError(null);
    setView("arrival");
  }

  function declineConsent() {
    localStorage.removeItem(STORAGE_KEY);
    setSurvey(freshState());
    setSavedDraft(null);
    setConsentChecked(false);
    setExitCleared(true);
    setError(null);
    setView("exit");
  }

  function resumeDraft() {
    if (!savedDraft) return;
    let resumed = savedDraft;
    if (
      resumed.respondent_path === "user" &&
      ["u_age", "u_consent", "u_ineligible"].includes(resumed.current_id)
    ) {
      resumed = { ...resumed, current_id: "u1" };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumed));
    }
    const question = QUESTIONS[resumed.current_id] as Question | undefined;
    if (question?.type === "concept" && !resumed.assigned_arm) {
      resumed = { ...resumed, assigned_arm: assignArm() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumed));
    }
    setSurvey(resumed);
    setSelectedRole(resumed.respondent_path || "");
    setView(resumed.current_id === "arrival" ? "arrival" : "survey");
  }

  function beginRole(event: FormEvent) {
    event.preventDefault();
    if (!["user", "practitioner"].includes(selectedRole)) {
      setError("Choose the perspective that fits why you opened the survey.");
      return;
    }
    const next = {
      ...survey,
      respondent_path: selectedRole,
      consent: true,
      current_id: selectedRole === "user" ? "u1" : "t_status",
    } as SurveyState;
    persistDraft(next);
    setView("survey");
  }

  function handleBack() {
    if (!survey || !survey.respondent_path) return;
    if (currentIndex <= 0) {
      setSelectedRole(survey.respondent_path);
      setView("arrival");
      setError(null);
      return;
    }
    persistDraft({ ...survey, current_id: flow[currentIndex - 1] });
  }

  async function finishSurvey(nextState: SurveyState) {
    const completedAt = new Date();
    const completedState = {
      ...nextState,
      completed_at: completedAt.toISOString(),
    };
    const payload = buildSubmissionPayload(completedState, completedAt);
    const result = await submitSurvey(payload);
    if (result.status !== "submitted") {
      setError(
        "Your response could not be submitted. Your saved draft is still on this device—please try again.",
      );
      return;
    }
    localStorage.removeItem(STORAGE_KEY);
    setSurvey(completedState);
    setCompletedPayload(payload);
    setView("complete");
    document.title = "Survey complete — Concept survey";
    window.scrollTo({ top: 0, behavior: "auto" });
    window.setTimeout(() => headingRef.current?.focus(), 40);
  }

  async function handleContinue(event: FormEvent) {
    event.preventDefault();
    if (!survey || !currentQuestion || !survey.respondent_path) return;
    const answerError = validateAnswer(currentQuestion, draftAnswer);
    if (answerError) {
      setError(answerError);
      return;
    }

    let answers = survey.answers;
    if (
      !["information", "concept", "eligibility-exit"].includes(
        currentQuestion.type,
      )
    ) {
      answers = {
        ...answers,
        [currentQuestion.id]: cloneAnswer(draftAnswer),
      };
    }
    answers = pruneAnswersForFlow(survey.respondent_path, answers);

    let nextState: SurveyState = {
      ...survey,
      answers,
      consent:
        currentQuestion.type === "consent" && draftAnswer === true
          ? true
          : survey.consent,
    };
    const nextFlow = getVisibleFlow(survey.respondent_path, answers);
    const nextIndex = nextFlow.indexOf(currentQuestion.id) + 1;

    if (nextIndex <= 0 || nextIndex >= nextFlow.length) {
      await finishSurvey(nextState);
      return;
    }

    const nextId = nextFlow[nextIndex];
    const nextQuestion = QUESTIONS[nextId] as Question;
    if (nextQuestion.type === "concept") {
      nextState = {
        ...nextState,
        assigned_arm: assignArm(nextState.assigned_arm),
      };
    }
    nextState.current_id = nextId;
    persistDraft(nextState);
  }

  function clearDraftFromExit() {
    localStorage.removeItem(STORAGE_KEY);
    setSurvey(freshState());
    setSavedDraft(null);
    setExitCleared(true);
    setConfirmClearExit(false);
  }

  if (view === "loading" || !survey) {
    return (
      <main className="loading-screen">
        <span className="loading-mark" aria-hidden="true" />
        <p>Preparing the survey…</p>
      </main>
    );
  }

  if (view === "resume") {
    return (
      <main className="page-shell">
        <Header />
        <section className="decision-page">
          <p className="screen-eyebrow">Saved on this device</p>
          <h1 className="information-title">Continue your saved draft?</h1>
          <p className="decision-copy">
            This draft was saved {formatSavedTime(savedDraft?.saved_at || null)}.
            It has not been submitted.
          </p>
          <div className="boundary-note">
            <span className="boundary-mark" aria-hidden="true">
              i
            </span>
            <p>
              Starting again permanently clears the saved draft from this
              browser.
            </p>
          </div>
          {confirmReset ? (
            <div className="confirm-panel" role="group" aria-label="Confirm reset">
              <p>
                <strong>Clear this saved draft?</strong> This cannot be undone.
              </p>
              <div className="button-row">
                <button className="primary-button" onClick={clearAndStartAgain}>
                  Clear &amp; start again
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setConfirmReset(false)}
                >
                  Keep the draft
                </button>
              </div>
            </div>
          ) : (
            <div className="button-row">
              <button className="primary-button" onClick={resumeDraft}>
                Continue draft
              </button>
              <button
                className="secondary-button"
                onClick={() => setConfirmReset(true)}
              >
                Start again
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  if (view === "exit") {
    return (
      <main className="page-shell">
        <Header />
        <section className="decision-page">
          <p className="screen-eyebrow">Exit survey</p>
          <h1
            className="information-title"
            ref={(node) => {
              headingRef.current = node;
            }}
            tabIndex={-1}
          >
            {exitCleared ? "The local draft has been cleared." : "You can stop here."}
          </h1>
          <p className="decision-copy">
            {exitCleared
              ? "Nothing was sent. You can now close this tab."
              : "Nothing has been submitted. Unless you clear it, the completed-question draft remains in this browser for up to 7 days."}
          </p>
          {!exitCleared && confirmClearExit ? (
            <div className="confirm-panel" role="group" aria-label="Confirm clear">
              <p>
                <strong>Clear the saved draft?</strong> This removes completed
                answers from this browser and cannot be undone.
              </p>
              <div className="button-row">
                <button className="danger-button" onClick={clearDraftFromExit}>
                  Clear local draft
                </button>
                <button
                  className="secondary-button"
                  onClick={() => setConfirmClearExit(false)}
                >
                  Keep it
                </button>
              </div>
            </div>
          ) : !exitCleared ? (
            <div className="button-row">
              <button className="primary-button" onClick={() => setView(returnView)}>
                Return to survey
              </button>
              <button
                className="secondary-button"
                onClick={() => setConfirmClearExit(true)}
              >
                Clear draft
              </button>
            </div>
          ) : (
            <button
              className="secondary-button"
              onClick={() => {
                setSelectedRole("");
                setConsentChecked(false);
                setView("consent");
              }}
            >
              Start a new test
            </button>
          )}
        </section>
      </main>
    );
  }

  if (view === "complete") {
    return (
      <main className="page-shell completion-shell">
        <Header />
        <section className="completion-page">
          <p className="screen-eyebrow">Complete</p>
          <h1
            className="completion-title"
            ref={(node) => {
              headingRef.current = node;
            }}
            tabIndex={-1}
          >
            Thank you. Your perspective has been recorded.
          </h1>
          <p className="completion-copy">
            Your anonymous response was submitted successfully. The locally
            saved draft has been cleared.
          </p>
          <div className="completion-actions">
            <button
              className="primary-button"
              onClick={() => completedPayload && downloadPayload(completedPayload)}
            >
              Download anonymous test JSON
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setCompletedPayload(null);
                setSurvey(freshState());
                setSelectedRole("");
                setConsentChecked(false);
                setView("consent");
              }}
            >
              Start another test
            </button>
          </div>
          <p className="completion-note">
            No contact form is connected. If one is added later, it must remain
            separate and unlinked from survey answers.
          </p>
        </section>
      </main>
    );
  }

  if (view === "consent") {
    return (
      <main className="page-shell arrival-shell">
        <Header />
        <section className="arrival-page">
          <p className="screen-eyebrow">Before the survey</p>
          <h1 className="arrival-title">Do you choose to take part?</h1>
          <p className="arrival-copy">
            You are invited to take part in an anonymous research survey about
            a possible counselling or psychotherapy service and possible paid
            opportunities for mental-health practitioners.
          </p>
          <div className="reading-copy">
            <p>
              <strong>What you will do:</strong> You will choose the survey
              journey that applies to you and answer questions about the
              proposed service or platform. You may skip only questions marked
              optional.
            </p>
            <p>
              <strong>Your choice:</strong> Taking part is voluntary. You may
              stop at any time before submitting. Leaving the survey will not
              submit a response, and choosing not to take part will have no
              negative consequence.
            </p>
            <p>
              <strong>Privacy:</strong> We do not ask for your name, contact
              details, employer or clinic. Unfinished answers are stored only
              in this browser for up to 7 days. A response is sent only when
              you finish and submit the survey.
            </p>
            <p>
              <strong>Please know:</strong> Some questions concern counselling
              or psychotherapy and may feel personal. This survey is not
              therapy, diagnosis, clinical screening, emergency help,
              recruitment or an offer of care or employment. There is no
              payment or direct personal benefit for taking part.
            </p>
          </div>
          <form noValidate onSubmit={beginConsent} className="role-form">
            {error ? <ErrorSummary message={error} errorRef={errorRef} /> : null}
            <fieldset
              className={`question-fieldset ${error ? "has-error" : ""}`}
              aria-describedby={error ? "entry-consent-error" : undefined}
            >
              <legend className="sr-only">Participation agreement</legend>
              <div
                className={`choice-block consent-block ${
                  consentChecked ? "is-selected" : ""
                }`}
              >
                <label className="choice-label">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(event) => {
                      setConsentChecked(event.target.checked);
                      setError(null);
                    }}
                  />
                  <ChoiceMark type="checkbox" />
                  <span>
                    I am 18 or older, I have read and understood the information
                    above, and I freely agree to take part in this survey.
                  </span>
                </label>
              </div>
              {error ? (
                <p className="field-error" id="entry-consent-error">
                  {error}
                </p>
              ) : null}
            </fieldset>
            <div className="button-row">
              <button className="primary-button" type="submit">
                Continue
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={declineConsent}
              >
                I do not want to take part
              </button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  if (view === "arrival") {
    return (
      <main className="page-shell arrival-shell">
        <Header onExit={openExit} />
        <section className="arrival-page">
          <p className="screen-eyebrow">Independent concept research</p>
          <h1 className="arrival-title">A quieter way to tell us what you think.</h1>
          <p className="arrival-copy">
            This research explores a possible counselling or psychotherapy
            service. It is not therapy, diagnosis, recruitment, or an offer of
            care.
          </p>
          <form noValidate onSubmit={beginRole} className="role-form">
            {error ? <ErrorSummary message={error} errorRef={errorRef} /> : null}
            <fieldset
              className={`role-fieldset ${error ? "has-error" : ""}`}
              aria-describedby={error ? "role-error" : undefined}
            >
              <legend>Which perspective are you bringing today?</legend>
              <p className="role-helper">
                Choose the journey that best fits why you opened this survey.
              </p>
              {error ? (
                <p className="field-error" id="role-error">
                  {error}
                </p>
              ) : null}
              <div className="role-options">
                {ROLE_OPTIONS.map((option: any) => (
                  <label
                    className={`role-option ${
                      selectedRole === option.value ? "is-selected" : ""
                    }`}
                    key={option.value}
                  >
                    <input
                      type="radio"
                      name="respondent-role"
                      value={option.value}
                      checked={selectedRole === option.value}
                      onChange={() => {
                        setSelectedRole(option.value);
                        setError(null);
                      }}
                    />
                    <ChoiceMark type="radio" />
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.note}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="arrival-actions">
              <button className="primary-button" type="submit">
                Begin
              </button>
              <p className="privacy-note">
                No name or contact details. Your completed-question draft stays
                in this browser.
              </p>
            </div>
          </form>
        </section>
      </main>
    );
  }

  if (view === "survey" && currentQuestion) {
    const isInformation = currentQuestion.type === "information";
    const isConcept = currentQuestion.type === "concept";
    const isEligibilityExit = currentQuestion.type === "eligibility-exit";
    return (
      <main className="page-shell survey-shell">
        <Header onExit={openExit} />
        <SurveyFrame survey={survey}>
          {error ? <ErrorSummary message={error} errorRef={errorRef} /> : null}
          {isInformation ? (
            <InformationScreen question={currentQuestion} headingRef={headingRef} />
          ) : null}
          {isConcept ? (
            <ConceptScreen
              question={currentQuestion}
              assignedArm={survey.assigned_arm || "neutral"}
              headingRef={headingRef}
            />
          ) : null}
          {isEligibilityExit ? (
            <EligibilityExit question={currentQuestion} headingRef={headingRef} />
          ) : null}
          {!isInformation && !isConcept && !isEligibilityExit ? (
            <form noValidate onSubmit={handleContinue}>
              <QuestionRenderer
                question={currentQuestion}
                answer={draftAnswer}
                setAnswer={(value) => {
                  setDraftAnswer(value);
                  setError(null);
                }}
                optionOrders={survey.option_orders}
                error={error}
                headingRef={headingRef}
              />
              <nav className="survey-actions" aria-label="Survey navigation">
                <button
                  className="secondary-button back-button"
                  type="button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button className="primary-button" type="submit">
                  {isLastQuestion ? "Finish prototype" : "Continue"}
                </button>
              </nav>
            </form>
          ) : isEligibilityExit ? (
            <nav className="survey-actions" aria-label="Survey navigation">
              <button
                className="secondary-button back-button"
                type="button"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setSelectedRole("");
                  setView("arrival");
                }}
              >
                Return to start
              </button>
            </nav>
          ) : (
            <form noValidate onSubmit={handleContinue}>
              <nav className="survey-actions" aria-label="Survey navigation">
                <button
                  className="secondary-button back-button"
                  type="button"
                  onClick={handleBack}
                >
                  Back
                </button>
                <button className="primary-button" type="submit">
                  {currentQuestion.actionLabel || "Continue"}
                </button>
              </nav>
            </form>
          )}
        </SurveyFrame>
      </main>
    );
  }

  return null;
}
