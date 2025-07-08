// Tailwind utility classes with CSS variables
export const twColors = {
  // Text colors
  textForeground: 'text-[var(--vscode-editor-foreground)]',
  textInfo: 'text-[var(--vscode-testing-iconUnset,#3b82f6)]',
  textSuccess: 'text-[var(--vscode-testing-iconPassed,#22c55e)]',
  textError: 'text-[var(--vscode-testing-iconFailed,#ef4444)]',
  textWarning: 'text-[var(--vscode-testing-iconQueued,#f59e0b)]',
  textMuted: 'text-[var(--vscode-descriptionForeground)]',
  textAccent: 'text-[var(--vscode-textLink-foreground)]',
  textAdded: 'text-[var(--vscode-diffEditor-insertedTextForeground,#22c55e)]',
  textRemoved: 'text-[var(--vscode-diffEditor-removedTextForeground,#ef4444)]',
  textModified:
    'text-[var(--vscode-diffEditor-modifiedTextForeground,#f59e0b)]',

  // Background colors
  bgEditor: 'bg-[var(--vscode-editor-background)]',
  bgInput: 'bg-[var(--vscode-input-background)]',
  bgHover: 'hover:bg-[var(--vscode-list-hoverBackground)]',
  bgInactiveSelection: 'bg-[var(--vscode-editor-inactiveSelectionBackground)]',
  bgAdded:
    'bg-[var(--vscode-diffEditor-insertedTextBackground,rgba(34,197,94,0.2))]',
  bgRemoved:
    'bg-[var(--vscode-diffEditor-removedTextBackground,rgba(239,68,68,0.2))]',
  bgModified:
    'bg-[var(--vscode-diffEditor-modifiedTextBackground,rgba(245,158,11,0.2))]',

  // Border colors
  borderPanel: 'border-[var(--vscode-panel-border)]',
  borderInfo: 'border-[var(--vscode-testing-iconUnset,#3b82f6)]',
  borderSuccess: 'border-[var(--vscode-testing-iconPassed,#22c55e)]',
  borderError:
    'border-[var(--vscode-diffEditor-removedTextForeground,#ef4444)]',
  borderWarning:
    'border-[var(--vscode-diffEditor-modifiedTextForeground,#f59e0b)]',
  borderAdded:
    'border-[var(--vscode-diffEditor-insertedTextForeground,#22c55e)]',
  borderRemoved:
    'border-[var(--vscode-diffEditor-removedTextForeground,#ef4444)]',
  borderModified:
    'border-[var(--vscode-diffEditor-modifiedTextForeground,#f59e0b)]',
}

// Helper function to combine conditional classes
export function twMerge(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}
