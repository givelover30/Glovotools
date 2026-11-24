import React from 'react';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface ResultCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ResultCard({ title, children, className = '' }: ResultCardProps) {
  const { t } = useTranslation();

  return (
    <div className={`relative ui-result-panel group transition-all duration-150 hover:border-result-icon/60 ${className}`}>
      {title && (
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-result-border/70">
          <span className="text-xs font-semibold text-result-text-secondary">{title}</span>
        </div>
      )}
      <div className="tabular-nums text-result-text">
        {children}
      </div>
    </div>
  );
}
