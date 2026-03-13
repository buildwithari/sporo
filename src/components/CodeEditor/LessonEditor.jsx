import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { getLangExtension, getCommentPrefix } from '../../lib/languages'
import { EditorState, StateField } from '@codemirror/state'
import { EditorView, Decoration } from '@codemirror/view'

// Static decoration theme — applied once, never recreated
const decoTheme = EditorView.theme({
  '.cm-locked-code': { opacity: '0.4' },
  '.cm-step-comment': { color: '#86efac !important' },
  '.cm-step-comment span': { color: '#86efac !important' },
})

function buildExtensions(lockedLen, commentLen) {
  const lockedEndPos = lockedLen + commentLen

  // Block any transaction that touches the locked region
  const readOnlyFilter = EditorState.transactionFilter.of((tr) => {
    if (!tr.docChanged) return tr
    let blocked = false
    tr.changes.iterChangedRanges((fromA) => {
      if (fromA < lockedEndPos) blocked = true
    })
    return blocked ? [] : tr
  })

  // Mark decorations for the locked code and the green comment
  const decoField = StateField.define({
    create(state) {
      const len = state.doc.length
      const marks = []
      if (lockedLen > 0 && lockedLen <= len) {
        marks.push(Decoration.mark({ class: 'cm-locked-code' }).range(0, lockedLen))
      }
      if (commentLen > 0 && lockedLen < len) {
        marks.push(
          Decoration.mark({ class: 'cm-step-comment' }).range(
            lockedLen,
            Math.min(lockedEndPos, len)
          )
        )
      }
      return marks.length ? Decoration.set(marks) : Decoration.none
    },
    // Locked content never changes within a step — decorations are stable
    update(decos) {
      return decos
    },
    provide: (f) => EditorView.decorations.from(f),
  })

  return [readOnlyFilter, decoField]
}

/**
 * A CodeMirror editor that shows previous steps' code grayed out and
 * non-editable, followed by a green comment, then the active editable region.
 *
 * Props:
 *   lockedContent  — string of all previous steps' code (may be empty)
 *   commentLine    — a single comment string, e.g. "// Declare the HashMap"
 *   value          — the user's current (editable) code
 *   onChange       — called with only the editable portion
 */
export default function LessonEditor({ lockedContent, commentLine, value, onChange, language = 'java' }) {
  const commentChar = getCommentPrefix(language)
  const prefix = lockedContent ? lockedContent + '\n' : ''
  const comment = commentLine ? `${commentChar} ${commentLine}\n` : ''
  const lockedLen = prefix.length
  const commentLen = comment.length
  const lockedEndPos = lockedLen + commentLen

  const fullValue = prefix + comment + value

  // Rebuild extensions only when the locked region changes (i.e. new step)
  const extensions = useMemo(
    () => buildExtensions(lockedLen, commentLen),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lockedEndPos]
  )

  function handleChange(val) {
    // Only expose the editable slice to the parent
    onChange(val.slice(lockedEndPos))
  }

  function handleCreateEditor(view) {
    // Place cursor at the end of the document on mount
    const end = view.state.doc.length
    view.dispatch({ selection: { anchor: end } })
  }

  return (
    <div className="rounded-lg overflow-hidden border border-stone-700 text-sm">
      <CodeMirror
        key={lockedEndPos}
        value={fullValue}
        height="auto"
        minHeight="140px"
        theme={vscodeDark}
        extensions={[getLangExtension(language), ...extensions, decoTheme]}
        onChange={handleChange}
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
