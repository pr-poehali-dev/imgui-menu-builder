import type { ImGuiElement } from '@/types/imgui';
import Icon from '@/components/ui/icon';

interface Props {
  element: ImGuiElement | null;
  onChange: (el: ImGuiElement) => void;
  onDelete: () => void;
}

function PropInput({ label, value, onChange }: { label: string; value: string | number; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-muted-foreground mb-1 font-mono">{label}</label>
      <input
        className="w-full bg-[hsl(var(--editor-bg))] border border-border rounded px-2 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export default function ElementEditor({ element, onChange, onDelete }: Props) {
  if (!element) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
        <Icon name="MousePointer2" size={28} />
        <p className="text-xs text-center">Выберите элемент<br />для редактирования</p>
      </div>
    );
  }

  const update = (patch: Partial<ImGuiElement>) => onChange({ ...element, ...patch });
  const updateProp = (key: string, value: unknown) => onChange({ ...element, props: { ...element.props, [key]: value } });

  return (
    <div className="p-3 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{element.type}</p>
          <p className="text-sm font-medium">{element.label}</p>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Icon name="Trash2" size={14} />
        </button>
      </div>

      <PropInput
        label="Label"
        value={element.label}
        onChange={v => update({ label: v })}
      />

      {element.type === 'slider' && (
        <>
          <PropInput label="Min" value={(element.props.min as number) ?? 0} onChange={v => updateProp('min', parseFloat(v))} />
          <PropInput label="Max" value={(element.props.max as number) ?? 100} onChange={v => updateProp('max', parseFloat(v))} />
          <PropInput label="Value" value={(element.props.value as number) ?? 50} onChange={v => updateProp('value', parseFloat(v))} />
        </>
      )}

      {element.type === 'combo' && (
        <div className="mb-3">
          <label className="block text-xs text-muted-foreground mb-1 font-mono">Items (по одному)</label>
          {((element.props.items as string[]) ?? []).map((item, i) => (
            <div key={i} className="flex gap-1 mb-1">
              <input
                className="flex-1 bg-[hsl(var(--editor-bg))] border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                value={item}
                onChange={e => {
                  const arr = [...(element.props.items as string[])];
                  arr[i] = e.target.value;
                  updateProp('items', arr);
                }}
              />
              <button
                onClick={() => {
                  const arr = (element.props.items as string[]).filter((_, idx) => idx !== i);
                  updateProp('items', arr);
                }}
                className="px-1.5 text-muted-foreground hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => updateProp('items', [...(element.props.items as string[] ?? []), 'Item'])}
            className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
          >
            <Icon name="Plus" size={11} /> Добавить
          </button>
        </div>
      )}

      {element.type === 'listbox' && (
        <div className="mb-3">
          <label className="block text-xs text-muted-foreground mb-1 font-mono">Items</label>
          {((element.props.items as string[]) ?? []).map((item, i) => (
            <div key={i} className="flex gap-1 mb-1">
              <input
                className="flex-1 bg-[hsl(var(--editor-bg))] border border-border rounded px-2 py-1 text-xs font-mono text-foreground focus:outline-none focus:border-primary"
                value={item}
                onChange={e => {
                  const arr = [...(element.props.items as string[])];
                  arr[i] = e.target.value;
                  updateProp('items', arr);
                }}
              />
              <button
                onClick={() => {
                  const arr = (element.props.items as string[]).filter((_, idx) => idx !== i);
                  updateProp('items', arr);
                }}
                className="px-1.5 text-muted-foreground hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          ))}
          <button
            onClick={() => updateProp('items', [...(element.props.items as string[] ?? []), 'Item'])}
            className="text-xs text-primary hover:underline mt-1 flex items-center gap-1"
          >
            <Icon name="Plus" size={11} /> Добавить
          </button>
        </div>
      )}

      {element.type === 'colorpicker' && (
        <div className="mb-3">
          <label className="block text-xs text-muted-foreground mb-1 font-mono">Default Color</label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={((element.props.value as string) ?? '#ff0000').slice(0, 7)}
              onChange={e => updateProp('value', e.target.value + 'ff')}
              className="w-8 h-8 cursor-pointer border border-border rounded bg-transparent"
            />
            <span className="text-xs font-mono text-muted-foreground">{(element.props.value as string) ?? '#ff0000ff'}</span>
          </div>
        </div>
      )}

      {element.type === 'progressbar' && (
        <PropInput label="Value (0.0 - 1.0)" value={(element.props.value as number) ?? 0.5} onChange={v => updateProp('value', Math.min(1, Math.max(0, parseFloat(v))))} />
      )}

      {element.type === 'button' && (
        <div className="mb-3">
          <label className="block text-xs text-muted-foreground mb-1 font-mono">Color</label>
          <div className="flex gap-1">
            {['default', 'green', 'red'].map(c => (
              <button
                key={c}
                onClick={() => updateProp('color', c)}
                className={`px-2 py-1 text-xs border rounded font-mono transition-colors ${
                  (element.props.color ?? 'default') === c
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
