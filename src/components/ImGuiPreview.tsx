import type { ImGuiMenu, ImGuiElement, ImGuiTab } from '@/types/imgui';
import { useState } from 'react';

interface Props {
  menu: ImGuiMenu;
  activeTabId: string;
}

function renderElement(el: ImGuiElement, idx: number) {
  switch (el.type) {
    case 'text':
      return (
        <div key={idx} className="imgui-text">
          {el.label}
        </div>
      );
    case 'button':
      return (
        <div key={idx} style={{ margin: '3px 0' }}>
          <button className="imgui-button">{el.label}</button>
        </div>
      );
    case 'checkbox':
      return (
        <div key={idx} className="imgui-checkbox">
          <div className="imgui-checkbox-box" />
          <span style={{ fontSize: 11 }}>{el.label}</span>
        </div>
      );
    case 'slider': {
      const min = (el.props.min as number) ?? 0;
      const max = (el.props.max as number) ?? 100;
      const val = (el.props.value as number) ?? 50;
      const pct = ((val - min) / (max - min)) * 100;
      return (
        <div key={idx} className="imgui-slider">
          <div className="imgui-slider-label">{el.label}: {val.toFixed(1)}</div>
          <div className="imgui-slider-track">
            <div className="imgui-slider-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    }
    case 'separator':
      return <div key={idx} className="imgui-separator" />;
    case 'input':
      return (
        <div key={idx}>
          <div style={{ fontSize: 11, color: '#aaaacc', marginBottom: 2 }}>{el.label}</div>
          <input className="imgui-input-field" defaultValue="" placeholder="..." readOnly />
        </div>
      );
    case 'combo':
      return (
        <div key={idx}>
          <div style={{ fontSize: 11, color: '#aaaacc', marginBottom: 2 }}>{el.label}</div>
          <div className="imgui-combo">
            <span>{((el.props.items as string[]) ?? ['Option 1'])[0]}</span>
            <span style={{ color: '#5577cc' }}>▾</span>
          </div>
        </div>
      );
    case 'collapser':
      return (
        <div key={idx} className="imgui-collapser">
          <div className="imgui-collapser-header">
            <span style={{ color: '#5577cc', fontSize: 10 }}>▶</span>
            <span>{el.label}</span>
          </div>
        </div>
      );
    case 'treenode':
      return (
        <div key={idx} className="imgui-treenode">
          <span style={{ color: '#5577cc', fontSize: 10 }}>▶</span>
          <span>{el.label}</span>
        </div>
      );
    case 'colorpicker':
      return (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '3px 0' }}>
          <div style={{ width: 14, height: 14, background: (el.props.value as string) ?? '#ff0000', border: '1px solid #5a5a7c' }} />
          <span style={{ fontSize: 11 }}>{el.label}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#6666aa' }}>{(el.props.value as string) ?? '#ff0000ff'}</span>
        </div>
      );
    case 'progressbar': {
      const val = (el.props.value as number) ?? 0.5;
      return (
        <div key={idx} style={{ margin: '3px 0' }}>
          {el.label && <div style={{ fontSize: 10, color: '#aaaacc', marginBottom: 2 }}>{el.label}</div>}
          <div style={{ height: 14, background: '#12122a', border: '1px solid #3a3a5c', position: 'relative' }}>
            <div style={{ width: `${val * 100}%`, height: '100%', background: '#5577cc' }} />
            <span style={{ position: 'absolute', top: 1, left: 0, right: 0, textAlign: 'center', fontSize: 10 }}>
              {(val * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      );
    }
    case 'listbox': {
      const items = (el.props.items as string[]) ?? ['Item 1', 'Item 2'];
      return (
        <div key={idx} style={{ margin: '3px 0' }}>
          <div style={{ fontSize: 11, color: '#aaaacc', marginBottom: 2 }}>{el.label}</div>
          <div style={{ background: '#12122a', border: '1px solid #3a3a5c', height: 60, overflow: 'hidden' }}>
            {items.slice(0, 4).map((item, i) => (
              <div key={i} style={{ padding: '1px 6px', fontSize: 11, background: i === 0 ? '#2a2a4c' : 'transparent', cursor: 'pointer' }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export default function ImGuiPreview({ menu, activeTabId }: Props) {
  const [activeTab, setActiveTab] = useState(activeTabId || menu.tabs[0]?.id);
  const currentTab: ImGuiTab | undefined = menu.tabs.find(t => t.id === activeTab) ?? menu.tabs[0];

  return (
    <div
      className="imgui-window animate-scale-in"
      style={{ width: Math.min(menu.width, 380), minHeight: 100, display: 'inline-block' }}
    >
      <div className="imgui-titlebar">
        <div style={{ width: 12, height: 12, background: '#cc3333', borderRadius: '50%', display: 'inline-block' }} />
        <span style={{ fontSize: 11 }}>{menu.name}</span>
      </div>

      {menu.tabs.length > 1 && (
        <div className="imgui-tab-bar">
          {menu.tabs.map(tab => (
            <div
              key={tab.id}
              className={`imgui-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </div>
          ))}
        </div>
      )}

      <div className="imgui-content">
        {currentTab && currentTab.elements.length === 0 && (
          <div style={{ color: '#44446a', fontSize: 11, textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
            Перетащите элементы сюда
          </div>
        )}
        {currentTab?.elements.map((el, i) => renderElement(el, i))}
      </div>
    </div>
  );
}
