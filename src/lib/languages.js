import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { cpp } from '@codemirror/lang-cpp'
import { javascript } from '@codemirror/lang-javascript'

export const LANGUAGES = [
  { id: 'java',       label: 'Java'   },
  { id: 'python',     label: 'Python' },
  { id: 'cpp',        label: 'C++'    },
  { id: 'c',          label: 'C'      },
  { id: 'javascript', label: 'JS'     },
]

export const DEFAULT_LANGUAGE = 'java'

/** Returns the CodeMirror language extension for a given language ID. */
export function getLangExtension(languageId) {
  switch (languageId) {
    case 'python':     return python()
    case 'cpp':        return cpp()
    case 'c':          return cpp()   // CodeMirror uses the same extension for C and C++
    case 'javascript': return javascript()
    case 'java':
    default:           return java()
  }
}

/** Returns the single-line comment prefix for a language. */
export function getCommentPrefix(languageId) {
  return languageId === 'python' ? '#' : '//'
}
