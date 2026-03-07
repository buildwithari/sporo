import CodeMirror from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

export default function CodeEditor({ value, onChange, readOnly = false, minHeight = '160px' }) {
  return (
    <div className="rounded-lg overflow-hidden border border-stone-700 text-sm">
      <CodeMirror
        value={value}
        height="auto"
        minHeight={minHeight}
        theme={vscodeDark}
        extensions={[java()]}
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
