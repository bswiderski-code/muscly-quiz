"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./select-menu.module.css";

export type SelectOption = {
  value: string;
  label: React.ReactNode;   // tekst + emoji
  id?: string;
  details?: React.ReactNode; // ⬅️ zawartość po rozwinięciu
  /**
   * When `multi` is enabled: this option acts like an exclusive choice.
   * Selecting it clears all other selections and disables/greys out the rest.
   */
  exclusive?: boolean;
};

type Props = {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
  canBeEmpty?: boolean;
  multi?: boolean;
  onValidate?: (isValid: boolean) => void;
};

export default function SelectMenu({
  options,
  value,
  onChange,
  name = "select",
  className,
  canBeEmpty = false,
  multi = false,
  onValidate,
}: Props) {
  const [internal, setInternal] = useState<string | null>(value ?? null);
  const current = value ?? internal ?? "";

  const currentSet = new Set(current ? current.split(',').filter(Boolean) : []);
  const exclusiveValues = useMemo(
    () => new Set(options.filter((o) => o.exclusive).map((o) => o.value)),
    [options]
  );
  const activeExclusive = options.find((o) => o.exclusive && currentSet.has(o.value));
  const exclusiveActive = !!activeExclusive;

  function handleSelect(v: string) {
    if (canBeEmpty && v === current) {
      setInternal(null);
      onChange?.("");
    } else {
      setInternal(v);
      onChange?.(v);
    }
  }

  function toggleMulti(v: string) {
    const parts = current ? current.split(",").filter(Boolean) : [];
    const set = new Set(parts);

    const isExclusive = exclusiveValues.has(v);
    const isSelected = set.has(v);

    if (isExclusive) {
      // Exclusive cancels out everything else.
      if (isSelected) set.delete(v);
      else {
        set.clear();
        set.add(v);
      }
    } else {
      // Normal value: if an exclusive is selected, drop it.
      for (const ex of exclusiveValues) set.delete(ex);
      if (isSelected) set.delete(v);
      else set.add(v);
    }

    // Keep deterministic order (option order) for easier persistence & diffing.
    const next = options
      .map((opt) => opt.value)
      .filter((val) => set.has(val))
      .join(",");

    setInternal(next === "" ? null : next);
    onChange?.(next);
  }

  useEffect(() => {
    if (multi) {
      const parts = current ? current.split(',').filter(Boolean) : [];
      onValidate?.(parts.length > 0 || canBeEmpty);
    } else {
      onValidate?.(!!current || canBeEmpty);
    }
  }, [current, canBeEmpty, onValidate, multi]);

  return (
    <div
      className={`${styles.menu} funnel-select-menu font-display ${className ?? ""}`}
      role={multi ? "group" : "radiogroup"}
      aria-label={name}
    >
      {options.map((opt, i) => {
        const id = opt.id ?? `${name}-${i}`;
        const panelId = `${id}-panel`;
        const labelId = `${id}-label`;
        const checked = multi ? currentSet.has(opt.value) : current === opt.value;
        // When an exclusive option is active, disable non-exclusive options.
        // Exclusive options stay enabled so the user can always switch/cancel.
        const disabled = multi ? exclusiveActive && !checked && !opt.exclusive : false;

        const hasDetails = !!opt.details;

        return (
          <div
            key={id}
            className={`${styles.optionGroup} ${hasDetails ? styles.optionGroupWithDetails : ""}`}
            style={{ "--option-index": i } as React.CSSProperties}
          >
            <label
              htmlFor={id}
              className={`${styles.option} ${checked ? styles.optionChecked : ""} ${disabled ? styles.optionDisabled : ""} ${hasDetails ? styles.optionWithDetails : ""}`}
            >
              <input
                id={id}
                type={multi ? "checkbox" : "radio"}
                className={styles.input}
                name={name}
                value={opt.value}
                checked={checked}
                disabled={disabled}
                onChange={() => (multi ? toggleMulti(opt.value) : handleSelect(opt.value))}
                aria-describedby={opt.details ? panelId : undefined}
              />

              <span className={styles.box}>
                <div className={styles.boxOff} />
                <div className={styles.boxOn} />
              </span>

              <span id={labelId} className={styles.label}>{opt.label}</span>
            </label>

            {opt.details && (
              <div
                id={panelId}
                className={`${styles.details} ${checked ? styles.detailsOpen : ""}`}
                aria-hidden={!checked}
                role="region"
                aria-labelledby={labelId}
              >
                <div className={styles.detailsInner}>
                  {typeof opt.details === 'string' && opt.details.includes('<') ? (
                    <span dangerouslySetInnerHTML={{ __html: opt.details }} />
                  ) : (
                    opt.details
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
