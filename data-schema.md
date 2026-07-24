# Prototype data schema

Schema version: `1.0.0`

The current deployment has no response database. `submitSurvey(payload)` returns the payload locally, clears the browser draft, and offers an optional JSON download. Nothing is transmitted.

## Envelope

| Field | Type | Notes |
|---|---|---|
| `schema_version` | string | Currently `1.0.0`. |
| `anonymous_session_id` | UUID-like string | Created with Web Crypto; not derived from the device or person. |
| `respondent_path` | `user` or `practitioner` | Chosen at arrival. |
| `assigned_arm` | `neutral`, `frame_a`, or `frame_b` | Assigned only after pathway and eligibility are known. |
| `recruitment_source` | controlled string | Read from hidden `source`/`src` URL parameter; unknown values become `unknown`. |
| `option_orders` | object | Persisted machine-value order for every randomised list. |
| `answers` | object | Analysis-variable names mapped to values. |
| `question_answers` | object | Stable question IDs mapped to raw structured answers. |
| `started_at` | ISO timestamp | Survey session creation. |
| `completed_at` | ISO timestamp | Prototype finish action. |
| `consent` | boolean | True only after the pathway consent checkbox. |
| `copy_status` | object | Makes provisional copy and eligibility status explicit. |

## Value distinctions

The schema keeps the following values separate:

- Missing because a question was not shown.
- Empty optional text.
- `not_sure`.
- `none`.
- `not_applicable`.
- `insufficient_information`.
- `prefer_not_to_say`.

No combined acceptability or demand score is calculated.

## Compound answers

- Radio with Other: `{ "value": "other", "text": "…" }`
- Checkbox with Other: `{ "values": ["…", "other"], "text": "…" }`
- Open comprehension: `{ "text": "…", "not_sure": false }`
- Optional place: `{ "text": "…", "prefer_not": false }`

The payload adapter also maps these into separate analysis variables.

## Local draft

The browser draft adds:

- `saved_at`
- `expires_at`
- `current_id`

Drafts expire after seven days, are saved after Continue rather than on each keystroke, and are cleared after prototype completion or an explicit clear action.

## Deliberately absent

The application does not collect or derive:

- Name, email, phone, employer, clinic name, or street address.
- Browser fingerprint.
- Exact geolocation.
- Advertising or cross-site identifier.
- Keystroke stream.
- IP address in application code.

Hosting-layer logging and production data handling still require review before fielding.

