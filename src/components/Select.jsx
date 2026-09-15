import * as RSelect from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Styled wrapper around Radix UI Select — replaces native <select> everywhere
 * in the app so dropdowns look consistent and are easy to theme.
 */
export default function Select({ value, onValueChange, options, placeholder = 'Select...', disabled }) {
  return (
    <RSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger className="rx-select-trigger" aria-label={placeholder}>
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon className="rx-select-icon"><ChevronDown size={15} /></RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content className="rx-select-content" position="popper" sideOffset={6}>
          <RSelect.ScrollUpButton className="rx-select-scroll"><ChevronUp size={15} /></RSelect.ScrollUpButton>
          <RSelect.Viewport className="rx-select-viewport">
            {options.map((opt) => (
              <RSelect.Item key={opt.value} value={opt.value} className="rx-select-item">
                <RSelect.ItemText>{opt.label}</RSelect.ItemText>
                <RSelect.ItemIndicator className="rx-select-indicator"><Check size={14} /></RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
          <RSelect.ScrollDownButton className="rx-select-scroll"><ChevronDown size={15} /></RSelect.ScrollDownButton>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
