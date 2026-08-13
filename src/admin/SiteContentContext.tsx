import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_CONTENT } from './content';

const DOC_PATH = 'siteContent/config';

function normalizePaths(data: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string' && v.startsWith('/')) {
      out[k] = './' + v.slice(1);
    } else {
      out[k] = v;
    }
  }
  return out;
}

interface SiteContentContextValue {
  content: Record<string, string>;
  getContent: (key: string) => string;
  loading: boolean;
  connectionError: string | null;
  usingCustomContent: boolean;
  refreshContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue>({
  content: DEFAULT_CONTENT,
  getContent: (key: string) => DEFAULT_CONTENT[key] || '',
  loading: true,
  connectionError: null,
  usingCustomContent: false,
  refreshContent: async () => {},
});

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [siteContent, setSiteContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const refreshContent = useCallback(async () => {
    try {
      setConnectionError(null);
      const snap = await getDoc(doc(db, DOC_PATH));
      if (snap.exists()) {
        const data = normalizePaths(snap.data() as Record<string, string>);
        setSiteContent(data);
      }
      setLoading(false);
    } catch (err: any) {
      const msg = err?.message || String(err);
      setConnectionError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, DOC_PATH),
      (snap) => {
        if (snap.exists()) {
          const data = normalizePaths(snap.data() as Record<string, string>);
          setSiteContent(data);
        }
        setConnectionError(null);
        setLoading(false);
      },
      (err: any) => {
        const msg = err?.message || String(err);
        console.error('Firestore onSnapshot error:', JSON.stringify({ code: err?.code, message: msg }));
        setConnectionError(msg);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const mergedContent = { ...DEFAULT_CONTENT, ...siteContent };
  const hasCustomKeys = Object.keys(siteContent).length > 0;
  const usingCustomContent = hasCustomKeys || !loading;

  const getContent = (key: string): string => mergedContent[key] || DEFAULT_CONTENT[key] || '';

  return (
    <SiteContentContext.Provider value={{ content: mergedContent, getContent, loading, connectionError, usingCustomContent, refreshContent }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export async function saveSiteContent(content: Record<string, string>): Promise<void> {
  await setDoc(doc(db, DOC_PATH), content, { merge: true });
}

export function useContent(key: string): string {
  const ctx = useContext(SiteContentContext);
  return ctx.getContent(key);
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
