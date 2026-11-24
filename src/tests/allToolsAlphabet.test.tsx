import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nProvider } from '../i18n/I18nContext.tsx';
import AllCalculatorsPage from '../components/AllCalculatorsPage.tsx';

describe('AllCalculatorsPage — Mobile & Desktop A–Z Alphabet Navigation', () => {
  it('renders all 27 alphabet navigation buttons (All + A–Z) in a responsive mobile grid with desktop horizontal layout classes', () => {
    const html = renderToStaticMarkup(
      React.createElement(
        I18nProvider,
        null,
        React.createElement(AllCalculatorsPage, {
          onSelectCalculator: () => {},
          favoriteIds: [],
          recentIds: [],
          onToggleFavorite: () => {}
        })
      )
    );

    const navMatch = html.match(/<nav aria-label="Alphabetical A–Z index"[^>]*>([\s\S]*?)<\/nav>/);
    expect(navMatch).not.toBeNull();
    const navHtml = navMatch![0];

    // Mobile responsive grid classes (6 cols below 360px, 7 cols at 360px+, 10 cols at sm+, desktop flex row at lg+)
    expect(navHtml).toContain('grid-cols-6');
    expect(navHtml).toContain('min-[360px]:grid-cols-7');
    expect(navHtml).toContain('sm:grid-cols-10');
    expect(navHtml).toContain('lg:flex');
    expect(navHtml).toContain('lg:overflow-x-auto');

    // Verify all 27 buttons: All + A–Z
    const buttonMatches = navHtml.match(/<button\b[^>]*>[\s\S]*?<\/button>/g) || [];
    expect(buttonMatches.length).toBe(27);

    expect(navHtml).toContain('>All</button>');
    for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')) {
      expect(navHtml).toContain(`>${letter}</button>`);
    }
  });
});
