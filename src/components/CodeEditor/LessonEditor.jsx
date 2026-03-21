import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { getLangExtension, getCommentPrefix } from '../../lib/languages'

/**
 * Builds the initial code for a lesson step by inserting the step's comment
 * just before the innermost function's closing brace.
 *
 * Uses brace-depth tracking: finds the first time depth drops from its
 * maximum value, which is always the innermost function's closing brace.
 * For languages without braces (Python), falls back to appending.
 */
export function buildStepCode(baseCode, stepTitle, language) {
  const commentChar = getCommentPrefix(language)
  const comment = `${commentChar} ${stepTitle}`

  if (!baseCode || !baseCode.trim()) return comment + '\n'

  const lines = baseCode.split('\n')

  // First pass: find the maximum brace depth in the code
  let depth = 0
  let maxDepth = 0
  for (const line of lines) {
    for (const ch of line) {
      if (ch === '{') depth++
      if (ch === '}') depth--
    }
    if (depth > maxDepth) maxDepth = depth
  }

  // No braces (e.g. Python) — just append the comment
  if (maxDepth === 0) return baseCode + '\n' + comment + '\n'

  // Second pass: find the first character where depth drops from maxDepth to maxDepth-1.
  // That's the closing brace of the innermost function. Insert the comment before that line.
  depth = 0
  for (let i = 0; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '{') depth++
      if (ch === '}') {
        depth--
        if (depth === maxDepth - 1) {
          // Indent the comment to match the closing brace line + one level
          const closingIndent = (lines[i].match(/^(\s*)/) || ['', ''])[1]
          const commentLine = closingIndent + '    ' + comment
          return [...lines.slice(0, i), commentLine, ...lines.slice(i)].join('\n')
        }
      }
    }
  }

  return baseCode + '\n' + comment + '\n'
}

/**
 * A simple fully-editable CodeMirror editor for micro-lesson steps.
 * The step comment is embedded in `value` (built by buildStepCode in LessonFlow).
 * On mount the cursor is placed right after the comment so the user can type immediately.
 */
export default function LessonEditor({ value, onChange, commentLine, language = 'java' }) {
  const commentChar = getCommentPrefix(language)

  function handleCreateEditor(view) {
    if (commentLine) {
      const text = view.state.doc.toString()
      const needle = `${commentChar} ${commentLine}`
      const idx = text.indexOf(needle)
      if (idx !== -1) {
        const lineEnd = text.indexOf('\n', idx + needle.length)
        const pos = lineEnd !== -1 ? lineEnd + 1 : idx + needle.length
        view.dispatch({ selection: { anchor: pos } })
        return
      }
    }
    view.dispatch({ selection: { anchor: view.state.doc.length } })
  }

  return (
    <div className="rounded-lg overflow-hidden border border-stone-700 text-sm">
      <CodeMirror
        value={value}
        height="auto"
        minHeight="140px"
        theme={vscodeDark}
        extensions={[getLangExtension(language)]}
        onChange={onChange}
        onCreateEditor={handleCreateEditor}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
        }}
      />
    </div>
  )
}
