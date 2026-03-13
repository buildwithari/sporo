import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { getLangExtension } from '../../lib/languages'

export default function CodeEditor({ value, onChange, readOnly = false, minHeight = '160px', language = 'java' }) {
  return (
    <div className="rounded-lg overflow-hidden border border-stone-700 text-sm">
      <CodeMirror
        value={value}
        height="auto"
        minHeight={minHeight}
        theme={vscodeDark}
        extensions={[getLangExtension(language)]}
        onChange={onChange}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: !readOnly,
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
