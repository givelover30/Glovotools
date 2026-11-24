import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { I18nProvider } from './i18n/I18nContext.tsx';
import { CurrencyProvider } from './i18n/CurrencyContext.tsx';
import ErrorBoundary from './components/common/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary scope="app">
    <I18nProvider>
      <CurrencyProvider>
        <App />
      </CurrencyProvider>
    </I18nProvider>
  </ErrorBoundary>
);
