'use client'

import { useTranslations } from "next-intl";
import styles from './form.module.css';
import { FaCheck } from "react-icons/fa";

type Props = {
  name: string;
  setName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  agree: boolean;
  setAgree: (val: boolean) => void;
  agreeHealth: boolean;
  setAgreeHealth: (val: boolean) => void;
  agreeError?: string;
  agreeHealthError?: string;
  onClearErrors: () => void;
};

export function ContactForm({ name, setName, email, setEmail, agree, setAgree, agreeHealth, setAgreeHealth, agreeError, agreeHealthError, onClearErrors }: Props) {
  const t = useTranslations('ReportForm');

  const agreementHtml = t.raw('agreementCheckboxHtml');

  return (
    <div className={styles.form}>
      <label className={styles.label}>
        {t('nameLabel')}
        <input
          type="text"
          placeholder={t('namePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onClearErrors();
          }}
          className={styles.input}
          required
        />
      </label>
      <label className={styles.label}>
        {t('emailLabel')}
        <input
          type="email"
          placeholder={t('emailPlaceholder')}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            onClearErrors();
          }}
          className={styles.input}
          required
        />
      </label>

      <div className={styles.checkboxContainer}>
        <div
          className={`${styles.checkboxLabel} ${styles.checkboxWithSpacing}`}
          onClick={() => {
            onClearErrors();
            setAgree(!agree);
          }}
        >
          <div className={`${styles.checkbox} ${agree ? styles.checkboxChecked : ''}`}>
            {agree && <FaCheck className={styles.checkboxIcon} />}
          </div>
          <span dangerouslySetInnerHTML={{ __html: String(agreementHtml) }} />
        </div>

        <div
          className={styles.checkboxLabel}
          onClick={() => {
            onClearErrors();
            setAgreeHealth(!agreeHealth);
          }}
        >
          <div className={`${styles.checkbox} ${agreeHealth ? styles.checkboxChecked : ''}`}>
            {agreeHealth && <FaCheck className={styles.checkboxIcon} />}
          </div>
          <span dangerouslySetInnerHTML={{ __html: t.raw('healthDataAgreementHtml') }} />
        </div>
      </div>

      {agreeError ? <div className={styles.error}>{agreeError}</div> : null}
      {agreeHealthError ? <div className={styles.error}>{agreeHealthError}</div> : null}
    </div>
  );
}
