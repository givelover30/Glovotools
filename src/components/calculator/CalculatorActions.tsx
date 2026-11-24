import { useState, useRef, useEffect } from 'react';
import { Share2, Check, Copy, ExternalLink, Star, RotateCcw, Mail } from 'lucide-react';
import { CalculatorId } from '../../types.ts';
import { useTranslation } from '../../i18n/I18nContext.tsx';

interface CalculatorActionsProps {
  calculatorId: CalculatorId;
  calculatorName?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: CalculatorId) => void;
  onReset?: () => void;
  onCopyResults?: () => void;
  showReset?: boolean;
}

export default function CalculatorActions({
  calculatorId,
  calculatorName = 'Calculator',
  isFavorite,
  onToggleFavorite,
  onReset,
  showReset = false
}: CalculatorActionsProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useTranslation();
  const isEs = language === 'es';

  useEffect(() => {
    if (!isShareOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsShareOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsShareOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isShareOpen]);

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(window.location.href);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // Ignore clipboard failures in restricted contexts
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `CalcTools — ${calculatorName}`;

  const handleShareClick = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: currentUrl,
        });
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setIsShareOpen((prev) => !prev);
        }
        return;
      }
    }
    setIsShareOpen((prev) => !prev);
  };

  const socialLinks = [
    {
      label: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-slate-900 dark:text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-[#1877F2]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      label: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} - ${currentUrl}`)}`,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-[#25D366]" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareText)}`,
      icon: (
        <svg className="w-3.5 h-3.5 shrink-0 fill-current text-[#2AABEE]" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.534.26l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.535-.195 1.001.132.834.933z" />
        </svg>
      ),
    },
    {
      label: isEs ? 'Correo electrónico' : 'Email',
      href: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Check out this tool: ${currentUrl}`)}`,
      icon: <Mail className="w-3.5 h-3.5 shrink-0 text-purple-600 dark:text-purple-400" />,
    },
  ];

  return (
    <div className="relative flex flex-wrap items-center gap-2" ref={dropdownRef}>
      {/* Favorite Control */}
      <button
        onClick={() => onToggleFavorite(calculatorId)}
        type="button"
        aria-pressed={isFavorite}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-semibold border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 transition-colors cursor-pointer whitespace-nowrap"
        title={
          isFavorite
            ? isEs
              ? 'Quitar de favoritos'
              : 'Remove from favorites'
            : isEs
            ? 'Guardar en favoritos'
            : 'Save to favorites'
        }
      >
        <Star
          className={`w-3.5 h-3.5 shrink-0 text-amber-500 ${
            isFavorite ? 'fill-amber-400' : ''
          }`}
        />
        <span>{isFavorite ? (isEs ? 'Guardado' : 'Saved') : isEs ? 'Favorito' : 'Favorite'}</span>
      </button>

      {/* Copy Link Control */}
      <button
        onClick={handleCopyLink}
        type="button"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-semibold border border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/15 transition-colors cursor-pointer whitespace-nowrap"
        title={isEs ? 'Copiar enlace de esta herramienta' : 'Copy link to this tool'}
      >
        {copiedLink ? (
          <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        )}
        <span>{copiedLink ? (isEs ? 'Copiado' : 'Copied') : isEs ? 'Copiar enlace' : 'Copy link'}</span>
      </button>

      {/* Share Menu */}
      <button
        onClick={handleShareClick}
        type="button"
        aria-expanded={isShareOpen}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-semibold border border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/15 transition-colors cursor-pointer whitespace-nowrap"
      >
        <Share2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
        <span>{t('btn.share')}</span>
      </button>

      {showReset && onReset && (
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] text-xs font-semibold border border-border-main bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer whitespace-nowrap"
          title={isEs ? 'Restablecer herramienta' : 'Reset tool'}
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>{t('btn.reset')}</span>
        </button>
      )}

      {isShareOpen && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-1.5 w-52 rounded-xl bg-surface dark:bg-surface-elevated border border-border-main shadow-[var(--shadow-md)] p-1.5 z-50 animate-fadeIn"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-text-tertiary border-b border-border-subtle mb-1">
            {t('msg.shareTitle')}
          </div>

          <button
            role="menuitem"
            onClick={() => {
              handleCopyLink();
              setIsShareOpen(false);
            }}
            type="button"
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors text-left cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-blue-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-text-tertiary" />
              )}
              <span>{copiedLink ? t('msg.linkCopied') : t('msg.copyLink')}</span>
            </span>
            {copiedLink && <span className="text-[10px] text-blue-600 font-semibold">✓</span>}
          </button>

          {socialLinks.map((item) => (
            <a
              key={item.label}
              role="menuitem"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsShareOpen(false)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <span className="flex items-center gap-2">
                {item.icon}
                <span>{item.label}</span>
              </span>
              <ExternalLink className="w-3 h-3 text-text-tertiary" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
