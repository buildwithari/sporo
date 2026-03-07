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
  const stripped = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(stripped)
}

/**
 * Generate a plain-English intro + 5 micro-lessons for a problem.
 * Returns { intro: { summary, example }, lessons: [...] }
 */
export async function generateLessons(unit) {
  const system = `You are a DSA tutor who teaches one tiny concept at a time.
Generate exactly 5 micro-lessons for the given Java problem.
Return ONLY a JSON array — no markdown, no extra text.

Each lesson object:
{
  "id": number,           // 1-5
  "title": string,        // 4-6 words, e.g. "Create a HashSet"
  "explanation": string,  // 1-2 plain English sentences on the concept
  "task": string          // exactly what to write — be specific, 1-2 lines of Java
}

Lesson 5 must always be titled "Put it all together" — write the complete solution.`

  const user = `Problem: ${unit.name}
Description: ${unit.description}
Language: Java
Starter code:
${unit.starterCode}`

  const text = await callClaude(system, user, 2048)
  return parseJSON(text)
}

/**
 * Evaluate a student's code for a single micro-lesson.
 * Returns { correct: boolean, feedback: string, hint?: string }
 */
export async function evaluateCode(lesson, userCode) {
  const system = `You are an encouraging Java coding tutor. Evaluate if the student's code correctly implements what the lesson asks.
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
 * Evaluate the student's full Java solution.
 * Returns { correct, feedback, timeComplexity, spaceComplexity, hint? }
 */
export async function evaluateFullSolution(unit, userCode) {
  const system = `You are a Java DSA evaluator. Check if the student's solution correctly solves the problem.
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
Answer questions clearly and concisely. Use plain language. Give short Java examples when it helps.
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
export async function getHint(lesson, userCode) {
  const system = `You are a patient DSA tutor. Give a short, specific hint — don't give away the answer.
Return plain text, 1-2 sentences max.`

  const user = `Lesson: "${lesson.title}"
Task: ${lesson.task}
Student's current code:
${userCode || '(nothing written yet)'}
Give them a nudge.`

  return callClaude(system, user, 256)
}
