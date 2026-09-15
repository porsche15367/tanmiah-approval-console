import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, X } from 'lucide-react';

/**
 * Styled multi-select dropdown (checkbox list) built on Radix DropdownMenu —
 * used anywhere we need to pick several items from a list without a native
 * <select multiple> or a browser popup.
 */
export default function MultiSelect({ value = [], onChange, options, placeholder = 'Select...', renderTag }) {
  const toggle = (val) => {
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  const remove = (val, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const selectedOptions = options.filter((o) => value.includes(o.value));

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="rx-multiselect-trigger">
          {selectedOptions.length === 0 ? (
            <span className="rx-multiselect-placeholder">{placeholder}</span>
          ) : (
            <span className="rx-multiselect-tags">
              {selectedOptions.map((o) => (
                <span key={o.value} className="rx-multiselect-tag">
                  {renderTag ? renderTag(o) : o.label}
                  <span role="button" tabIndex={-1} className="rx-multiselect-tag-x" onClick={(e) => remove(o.value, e)}><X size={11} /></span>
                </span>
              ))}
            </span>
          )}
          <ChevronDown size={15} className="rx-multiselect-icon" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="rx-select-content" sideOffset={6} align="start">
          {options.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <DropdownMenu.CheckboxItem
                key={opt.value}
                className="rx-select-item rx-multiselect-item"
                checked={checked}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={() => toggle(opt.value)}
              >
                <span className="rx-multiselect-checkbox">{checked && <Check size={13} />}</span>
                <span className="rx-multiselect-label">
                  {opt.label}
                  {opt.sublabel && <span className="rx-multiselect-sublabel">{opt.sublabel}</span>}
                </span>
              </DropdownMenu.CheckboxItem>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
