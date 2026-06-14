import type { ImGuiMenu } from '@/types/imgui';
import { generateCode } from '@/lib/codeGenerator';
import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface Props {
  menu: ImGuiMenu;
}

function highlight(code: string): string {
  return code
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/(".*?")/g, '<span class="code-str">$1</span>')
    .replace(/\b(if|for|while|return|void|const|static|float|int|bool|char|sizeof|true|false|nullptr)\b/g, '<span class="code-kw">$1</span>')
    .replace(/\b(ImGui)::/g, '<span class="code-type">$1</span>::')
    .replace(/\b(ImVec2|ImGuiCond_FirstUseEver|FLT_MIN|IM_ARRAYSIZE)\b/g, '<span class="code-type">$1</span>')
    .replace(/(\/\/.*$)/gm, '<span class="code-cmt">$1</span>')
    .replace(/#include\b/g, '<span class="code-kw">#include</span>')
    .replace(/\b(\d+(\.\d+)?f?)\b/g, '<span class="code-num">$1</span>');
}

export default function CodeView({ menu }: Props) {
  const code = generateCode(menu);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${menu.name.replace(/\s+/g, '_')}.cpp`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[hsl(var(--panel-header))]">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">
            {menu.name.replace(/\s+/g, '_')}.cpp
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground font-mono">{code.split('\n').length} строк</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={12} />
            {copied ? 'Скопировано' : 'Копировать'}
          </button>
          <button
            onClick={download}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            <Icon name="Download" size={12} />
            .cpp
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto code-view p-4">
        <pre
          className="text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlight(code) }}
        />
      </div>
    </div>
  );
}
