const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY
const API_URL = 'https://api.anthropic.com/v1/messages'

async function callClaude(system, userMessage, maxTokens = 1024) {
  if (!API_KEY) throw new Error('NO_API_KEY')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API_ERROR: ${res.status} — ${err}`)
  }

  const data = await res.json()
  return data.content[0].text
}

function parseJSON(text) {
  // Strip markdown fences (Claude sometimes wraps despite being asked not to)
  let stripped = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    // Fallback: extract the first {...} or [...] block from the text
    const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    if (match) return JSON.parse(match[1])
    console.error('parseJSON failed. Raw response:', text)
    throw new Error('JSON_PARSE_FAILED')
  }
}

/** Returns the display name for a language ID. */
function langLabel(language) {
  const labels = { java: 'Java', python: 'Python', cpp: 'C++', c: 'C', javascript: 'JavaScript' }
  return labels[language] || language
}

/**
 * Generate a two-part lesson plan: brute force first, then step-by-step optimization.
 * Returns { brute: { intro, lessons[] }, optimal: { intro, lessons[] } }
 */
export async function generateLessons(unit, language = 'java') {
  const lang = langLabel(language)
  const starterCode = typeof unit.starterCode === 'object'
    ? unit.starterCode[language] || unit.starterCode.java
    : unit.starterCode

  const system = `You are a DSA tutor. Generate a two-part lesson plan for a ${lang} coding problem.
Return ONLY a JSON object — no markdown, no extra text.

Part 1 ("brute"): teach the simplest correct approach, step by step.
Part 2 ("optimal"): teach how to evolve that brute-force into the efficient solution, one small change at a time.

Return exactly this shape:
{
  "brute": {
    "intro": string,      // 2-3 plain-English sentences describing the brute-force idea and why it works
    "lessons": [          // exactly 3-4 lessons
      {
        "id": number,
        "title": string,       // 4-6 words, e.g. "Loop over every pair"
        "explanation": string, // 1-2 sentences explaining the concept
        "task": string         // exactly what ${lang} to write — be specific, 1-2 lines
      }
    ]
  },
  "optimal": {
    "intro": string,      // 2-3 sentences: the key insight that unlocks the faster solution and what changes
    "lessons": [          // exactly 3-4 lessons — each one a focused edit to the brute-force code
      {
        "id": number,
        "title": string,
        "explanation": string,
        "task": string    // describe modifying or replacing a specific part of the brute-force — be precise
      }
    ]
  }
}`

  const user = `Problem: ${unit.name}
Description: ${unit.description}
Language: ${lang}
Starter code:
${starterCode}`

  const text = await callClaude(system, user, 3000)
  return parseJSON(text)
}

/**
 * Evaluate a student's code for a single brute-force micro-lesson (code fragment).
 * Returns { correct: boolean, feedback: string, hint?: string }
 */
export async function evaluateCode(lesson, userCode, language = 'java') {
  const lang = langLabel(language)
  const system = `You are an encouraging ${lang} coding tutor. Evaluate if the student's code correctly implements what the lesson asks.
Be brief and kind. Focus on whether the concept is right, not style.
Return ONLY valid JSON — no markdown:
{
  "correct": boolean,
  "feedback": string,   // 1-2 sentences, encouraging either way
  "hint": string        // only if incorrect — a small nudge, not the answer
}`

  const user = `Lesson: "${lesson.title}"
Task: ${lesson.task}
Student's code:
${userCode}`

  const text = await callClaude(system, user, 512)
  return parseJSON(text)
}

/**
 * Evaluate the student's brute-force solution (lenient on time/space complexity).
 * Returns { correct, feedback, timeComplexity, spaceComplexity, hint? }
 */
export async function evaluateBruteSolution(unit, userCode, language = 'java') {
  const lang = langLabel(language)
  const system = `You are a ${lang} DSA evaluator checking a brute-force solution.
Accept any approach that produces correct output — O(n²) or worse is fine, extra space is fine.
Do NOT penalize for time or space complexity. Only check correctness of logic.
Return ONLY valid JSON — no markdown:
{
  "correct": boolean,
  "feedback": string,         // 1-2 sentences, positive if correct
  "timeComplexity": string,   // e.g. "O(n²)"
  "spaceComplexity": string,  // e.g. "O(1)"
  "hint": string              // only if incorrect — what to revisit
}`

  const user = `Problem: ${unit.name}
Description: ${unit.description}
Test cases: ${JSON.stringify(unit.testCases, null, 2)}

Student's brute-force solution:
${userCode}`

  const text = await callClaude(system, user, 512)
  return parseJSON(text)
}

/**
 * Evaluate the student's full solution.
 * Returns { correct, feedback, timeComplexity, spaceComplexity, hint? }
 */
export async function evaluateFullSolution(unit, userCode, language = 'java') {
  const lang = langLabel(language)
  const system = `You are a ${lang} DSA evaluator. Check if the student's solution correctly solves the problem.
Reason about correctness based on algorithm logic and test cases — do not run the code.
Return ONLY valid JSON — no markdown:
{
  "correct": boolean,
  "feedback": string,         // 2-3 sentences
  "timeComplexity": string,   // e.g. "O(n)"
  "spaceComplexity": string,  // e.g. "O(n)"
  "hint": string              // only if incorrect — what concept to revisit
}`

  const user = `Problem: ${unit.name}
Description: ${unit.description}
Test cases: ${JSON.stringify(unit.testCases, null, 2)}

Student's solution:
${userCode}`

  const text = await callClaude(system, user, 768)
  return parseJSON(text)
}

/**
 * Send a message to the topic AI assistant.
 * conversationHistory is [{role: 'user'|'assistant', content: string}]
 */
export async function askAssistant(milestoneName, conversationHistory) {
  if (!API_KEY) throw new Error('NO_API_KEY')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `You are a friendly DSA tutor specializing in ${milestoneName}.
Answer questions clearly and concisely. Use plain language. Give short code examples when it helps.
Keep responses to 3-5 sentences unless a longer explanation is truly necessary.`,
      messages: conversationHistory,
    }),
  })

  if (!res.ok) throw new Error(`API_ERROR: ${res.status}`)
  const data = await res.json()
  return data.content[0].text
}

/**
 * Get a hint for a stuck student.
 */
export async function getHint(lesson, userCode, language = 'java') {
  const lang = langLabel(language)
  const system = `You are a patient DSA tutor. Give a short, specific hint — don't give away the answer.
Return plain text, 1-2 sentences max.`

  const user = `Lesson: "${lesson.title}"
Task: ${lesson.task}
Language: ${lang}
Student's current code:
${userCode || '(nothing written yet)'}
Give them a nudge.`

  return callClaude(system, user, 256)
}
