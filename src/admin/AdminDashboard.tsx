import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  LogOut, Save, Loader2, Upload, Settings,
  RefreshCw, AlertTriangle, CheckCircle, WifiOff, LayoutDashboard, FileText,
  Inbox as InboxIcon, Image as ImageIcon, Search, Download, RotateCcw,
  FileJson, Database, Trash2,
} from 'lucide-react';
import { DEFAULT_CONTENT, CONTENT_SECTIONS } from './content';

const DOC_PATH = 'siteContent/config';
const CONFIG_DOC_PATH = 'siteContent/adminConfig';

type Tab = 'dashboard' | 'content' | 'inbox' | 'media' | 'settings';

interface ContentItem {
  key: string;
  value: string;
  type: 'text' | 'image' | 'video';
  section: string;
  label: string;
}

interface AdminConfig {
  cloudName: string;
  uploadPreset: string;
  contactPhone: string;
  contactEmail: string;
}

interface Submission {
  id: string;
  type: string;
  name?: string;
  email?: string;
  message?: string;
  firstName?: string;
  lastName?: string;
  amountUsd?: number;
  amountLocal?: string;
  currency?: string;
  transactionId?: string;
  subject?: string;
  organization?: string;
  status?: string;
  createdAt?: any;
}

function formatType(type: string) {
  if (type === 'image') return 'Image';
  if (type === 'video') return 'Video';
  return 'Text';
}

function formatTypeColors(type: string) {
  if (type === 'image') return 'bg-amber-50 text-amber-600';
  if (type === 'video') return 'bg-blue-50 text-blue-600';
  return 'bg-gray-100 text-gray-600';
}

function buildDefaults(): ContentItem[] {
  const items: ContentItem[] = [];
  for (const [section, fields] of Object.entries(CONTENT_SECTIONS)) {
    for (const f of fields) {
      items.push({
        key: f.key,
        value: DEFAULT_CONTENT[f.key] || '',
        type: f.type,
        section,
        label: f.label,
      });
    }
  }
  return items;
}

const SECTION_ORDER = Object.keys(CONTENT_SECTIONS);

const TYPE_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-4 h-4" />,
  content: <FileText className="w-4 h-4" />,
  inbox: <InboxIcon className="w-4 h-4" />,
  media: <ImageIcon className="w-4 h-4" />,
  settings: <Settings className="w-4 h-4" />,
};

const TAB_LABELS: Record<Tab, string> = {
  dashboard: 'Dashboard',
  content: 'Content',
  inbox: 'Submissions',
  media: 'Media',
  settings: 'Settings',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Inbox
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');

  // Content editing
  const [items, setItems] = useState<ContentItem[]>([]);
  const [currentSection, setCurrentSection] = useState(SECTION_ORDER[0] || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  // Save states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(true);

  // Media settings
  const [cloudName, setCloudName] = useState('');
  const [uploadPreset, setUploadPreset] = useState('');
  const [configSaving, setConfigSaving] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);

  // Firestore diagnostics
  const [dbTestResult, setDbTestResult] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const [dbTestError, setDbTestError] = useState('');

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const itemsRef = useRef<ContentItem[]>([]);
  itemsRef.current = items;

  // Auth check
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate('/admin/login');
        return;
      }
      setUser(u);
      loadContent();
      loadConfig();
      testDatabase();
    });
    return unsub;
  }, []);

  // Real-time subscription to content
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, DOC_PATH),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Record<string, string>;
          setItems((prev) =>
            buildDefaults().map((c) => ({ ...c, value: data[c.key] ?? c.value }))
          );
        }
        setLoading(false);
      },
      (err) => {
        console.error('Realtime content error:', err);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const loadContent = async () => {
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, DOC_PATH));
      const existing = snap.exists() ? (snap.data() as Record<string, string>) : {};
      const merged = buildDefaults().map((c) => ({
        ...c,
        value: existing[c.key] ?? c.value,
      }));
      setItems(merged);
    } catch (err) {
      console.error('Load error:', err);
      setItems(buildDefaults());
    } finally {
      setLoading(false);
    }
  };

  const loadConfig = async () => {
    try {
      const snap = await getDoc(doc(db, CONFIG_DOC_PATH));
      if (snap.exists()) {
        const cfg = snap.data() as AdminConfig;
        setCloudName(cfg.cloudName || '');
        setUploadPreset(cfg.uploadPreset || '');
      }
    } catch {}
  };

  const saveConfig = async () => {
    setConfigSaving(true);
    try {
      await setDoc(doc(db, CONFIG_DOC_PATH), {
        cloudName: cloudName.trim(),
        uploadPreset: uploadPreset.trim(),
      });
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setConfigSaving(false);
    }
  };

  // Mutate a single value locally
  const updateValue = useCallback((key: string, value: string) => {
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, value } : i)));
    setSaveStatus('dirty');
  }, []);

  // Save function
  const persistChanges = useCallback(async () => {
    const current = itemsRef.current;
    const contentMap: Record<string, string> = {};
    for (const item of current) {
      contentMap[item.key] = item.value;
    }
    setSaveStatus('saving');
    try {
      await setDoc(doc(db, DOC_PATH), contentMap, { merge: true });
      const now = new Date();
      setLastSaved(now.toLocaleTimeString());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error('Save error:', err);
      setSaveStatus('error');
      setSaveError(err?.message || 'Failed to save');
    }
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!autoSave || saveStatus !== 'dirty') return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      persistChanges();
    }, 1200);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [items, autoSave, saveStatus, persistChanges]);

  const manualSave = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    persistChanges();
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: 'POST', body: formData }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Upload failed');
    }
    const data = await res.json();
    return data.secure_url;
  };

  const processFile = useCallback(async (key: string, file: File) => {
    if (file.size > 10485760) {
      alert(`File is too large (${(file.size / 1048576).toFixed(1)}MB). Maximum is 10MB.`);
      return;
    }

    const smallLimit = 500000;
    const useBase64 = file.size <= smallLimit;

    setUploadingKey(key);
    try {
      if (useBase64) {
        const reader = new FileReader();
        reader.onload = () => {
          updateValue(key, reader.result as string);
          setUploadingKey(null);
        };
        reader.onerror = () => {
          alert('Could not read file.');
          setUploadingKey(null);
        };
        reader.readAsDataURL(file);
      } else {
        if (!cloudName || !uploadPreset) {
          alert(
            `This file is ${(file.size / 1048576).toFixed(1)}MB (max 10MB).\n\n` +
            `To upload files over 500KB, you need a free Cloudinary account (no credit card):\n\n` +
            `1. Go to cloudinary.com and sign up (takes 30 seconds)\n` +
            `2. Copy your "Cloud name" from the dashboard\n` +
            `3. Go to Settings → Upload → "Add upload preset" → set Mode to "Unsigned" → Save\n` +
            `4. Enter both in the Media Settings section in the Settings tab`
          );
          setUploadingKey(null);
          return;
        }
        const url = await uploadToCloudinary(file);
        updateValue(key, url);
        setUploadingKey(null);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      alert('Upload failed: ' + (err.message || 'Unknown error'));
      setUploadingKey(null);
    }
  }, [cloudName, uploadPreset, updateValue]);

  const handleFileUpload = (key: string, file: File) => {
    processFile(key, file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(key, file);
  };

  const testDatabase = async () => {
    setDbTestResult('testing');
    setDbTestError('');
    try {
      await getDoc(doc(db, DOC_PATH));
      setDbTestResult('ok');
    } catch (err: any) {
      setDbTestResult('fail');
      setDbTestError(err?.message || String(err));
    }
  };

  const removeValue = (key: string) => {
    updateValue(key, '');
  };

  const resetSection = async (section: string) => {
    if (!confirm(`Reset all fields in "${section}" to original defaults?`)) return;
    const sectionKeys = new Set(
      (CONTENT_SECTIONS[section] || []).map((f) => f.key)
    );
    setItems((prev) =>
      prev.map((i) =>
        sectionKeys.has(i.key) ? { ...i, value: DEFAULT_CONTENT[i.key] || '' } : i
      )
    );
    setSaveStatus('dirty');
  };

  const resetAll = async () => {
    if (!confirm('Reset ALL content to original defaults? This cannot be undone.')) return;
    setItems(buildDefaults());
    setSaveStatus('dirty');
  };

  const exportJson = () => {
    const contentMap: Record<string, string> = {};
    for (const item of items) {
      contentMap[item.key] = item.value;
    }
    const blob = new Blob([JSON.stringify(contentMap, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vios-content-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid JSON');
        setItems((prev) =>
          prev.map((i) =>
            typeof data[i.key] === 'string' ? { ...i, value: data[i.key] } : i
          )
        );
        setSaveStatus('dirty');
        alert('Content imported. Review the changes and they will auto-save.');
      } catch (err) {
        alert('Could not read file. Make sure it is a valid JSON backup.');
      }
    };
    reader.readAsText(file);
  };

  // Load submissions from all collections
  const loadSubmissions = useCallback(async () => {
    setInboxLoading(true);
    setInboxError('');
    const collections: { name: string; type: string }[] = [
      { name: 'donations', type: 'Donation' },
      { name: 'consultationRequests', type: 'Consultation' },
      { name: 'directInquiries', type: 'Direct Inquiry' },
      { name: 'partnershipInquiries', type: 'Partnership' },
    ];
    const all: Submission[] = [];
    for (const { name, type } of collections) {
      try {
        const snap = await getDocs(collection(db, name));
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          all.push({
            id: docSnap.id,
            type,
            ...data,
            createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
          });
        });
      } catch (err: any) {
        console.warn(`Failed to load ${name}:`, err);
        setInboxError('Could not read some collections. Ensure Firestore rules allow authenticated reads.');
      }
    }
    all.sort((a, b) => {
      const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
      const dbTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
      return dbTime - da;
    });
    setSubmissions(all);
    setInboxLoading(false);
  }, []);

  useEffect(() => {
    if (tab === 'inbox') loadSubmissions();
  }, [tab, loadSubmissions]);

  // Load submissions once on mount so dashboard/sidebar counts are accurate
  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const currentSectionItems = items.filter((i) => i.section === currentSection);
  const hasCloudinary = cloudName.trim() !== '' && uploadPreset.trim() !== '';
  const editedCount = items.filter((i) => i.value !== DEFAULT_CONTENT[i.key]).length;
  const activeSubmitted = submissions.length;
  const savingDisplay = saveStatus === 'saving';

  // Filtered items for search
  const filteredItems = currentSectionItems.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return i.label.toLowerCase().includes(q) || i.key.toLowerCase().includes(q);
  });

  const isVideoUrl = (value: string) => {
    if (!value) return false;
    return /\.(mp4|webm|ogg|mov)($|\?)/i.test(value) ||
      value.includes('youtube.com') || value.includes('youtu.be') ||
      value.includes('vimeo.com') || value.startsWith('data:video/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-deep flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-burnished" />
      </div>
    );
  }

  const SaveStatusBadge = () => {
    if (saveStatus === 'saving') {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </span>
      );
    }
    if (saveStatus === 'saved') {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
          <CheckCircle className="w-3 h-3" /> Saved {lastSaved ? `at ${lastSaved}` : ''}
        </span>
      );
    }
    if (saveStatus === 'error') {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-red-400 bg-red-400/10 px-2.5 py-1 rounded-full">
          <AlertTriangle className="w-3 h-3" /> Save failed
        </span>
      );
    }
    if (saveStatus === 'dirty') {
      return (
        <span className="flex items-center gap-1.5 text-[10px] text-yellow-400 bg-yellow-400/10 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" /> Unsaved changes
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-[10px] text-white/40 px-2.5 py-1 rounded-full">
        <CheckCircle className="w-3 h-3" /> All changes saved
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-emerald-deep text-white px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-3">
          <img src="./VIOS_LOGO.jpeg" alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-gold-burnished/40" />
          <div>
            <h1 className="font-bold text-sm tracking-wide">Vios Growth Academy</h1>
            <p className="text-[10px] text-white/50">Content Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SaveStatusBadge />
          <button
            onClick={manualSave}
            disabled={saveStatus === 'saving' || saveStatus === 'idle'}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold-burnished text-emerald-deep text-xs font-bold rounded-lg hover:bg-gold-burnished/90 transition-all disabled:opacity-40 shadow-sm"
          >
            {saveStatus === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 text-white text-[10px] rounded-lg hover:bg-white/20 transition-all"
          >
            <LogOut className="w-3 h-3" /> Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="lg:w-60 shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] overflow-y-auto">
          <div className="p-3 space-y-1">
            {(['dashboard', 'content', 'inbox', 'media', 'settings'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                  tab === t
                    ? 'bg-emerald-deep text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={tab === t ? 'text-gold-burnished' : 'text-gray-400'}>
                  {TYPE_ICONS[t]}
                </span>
                <span className="text-xs font-bold tracking-wide">{TAB_LABELS[t]}</span>
                {t === 'inbox' && submissions.length > 0 && (
                  <span className="ml-auto bg-gold-burnished text-emerald-deep text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {submissions.length}
                  </span>
                )}
                {t === 'content' && editedCount > 0 && (
                  <span className="ml-auto text-[9px] text-white/40">
                    {editedCount} edited
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Connection status */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <WifiOff className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Database</span>
            </div>
            {dbTestResult === 'ok' && (
              <div className="flex items-center gap-1.5 text-[10px] text-green-600">
                <CheckCircle className="w-3 h-3" /> Connected
              </div>
            )}
            {dbTestResult === 'fail' && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-600">
                <AlertTriangle className="w-3 h-3" /> Connection failed
              </div>
            )}
            {dbTestResult === 'testing' && (
              <div className="flex items-center gap-1.5 text-[10px] text-amber-600">
                <Loader2 className="w-3 h-3 animate-spin" /> Testing...
              </div>
            )}
            {dbTestResult === 'idle' && (
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Not tested
              </div>
            )}
            <button
              onClick={testDatabase}
              className="mt-2 flex items-center gap-1 text-[9px] text-gray-400 hover:text-emerald-deep transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" /> Retest
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {saveStatus === 'saved' && (
            <div className="mb-5 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5" />
              Changes saved. All visitors see them instantly.
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="mb-5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Could not save. {saveError}
            </div>
          )}

          {/* ==================== DASHBOARD ==================== */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Welcome back{user?.email ? `, ${user.email}` : ''}. Manage your website content and config in one place.
                </p>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Content Fields', value: items.length, icon: <FileText className="w-4 h-4" />, color: 'bg-emerald-deep' },
                  { label: 'Sections', value: SECTION_ORDER.length, icon: <LayoutDashboard className="w-4 h-4" />, color: 'bg-gold-burnished' },
                  { label: 'Edited Fields', value: editedCount, icon: <CheckCircle className="w-4 h-4" />, color: 'bg-blue-600' },
                  { label: 'Submissions', value: activeSubmitted, icon: <InboxIcon className="w-4 h-4" />, color: 'bg-purple-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3">
                    <div className={`w-9 h-9 rounded-lg ${s.color} bg-opacity-10 flex items-center justify-center`}>
                      <span className={s.color === 'bg-emerald-deep' ? 'text-emerald-deep' : s.color === 'bg-blue-600' ? 'text-blue-600' : s.color === 'bg-purple-600' ? 'text-purple-600' : 'text-gold-burnished'}>{s.icon}</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick access to sections */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Edit</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SECTION_ORDER.map((section) => {
                    const sectionItems = items.filter((i) => i.section === section);
                    const editedInSection = sectionItems.filter((i) => i.value !== DEFAULT_CONTENT[i.key]).length;
                    return (
                      <button
                        key={section}
                        onClick={() => { setCurrentSection(section); setTab('content'); }}
                        className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-gold-burnished hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-deep transition-colors">{section}</span>
                          {editedInSection > 0 && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">{editedInSection} edited</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400">{sectionItems.length} fields</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== CONTENT ==================== */}
          {tab === 'content' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Content Editor</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Edit website text, images, and videos. Changes save automatically.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportJson}
                    className="flex items-center gap-1.5 px-3 py-2 text-[10px] bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gold-burnished hover:text-emerald-deep transition-all"
                  >
                    <Download className="w-3 h-3" /> Export
                  </button>
                  <button
                    onClick={() => fileInputRefs.current['import-json']?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-[10px] bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gold-burnished hover:text-emerald-deep transition-all"
                  >
                    <FileJson className="w-3 h-3" /> Import
                  </button>
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current['import-json'] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) importJson(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={resetAll}
                    className="flex items-center gap-1.5 px-3 py-2 text-[10px] bg-white border border-red-200 rounded-lg text-red-500 hover:border-red-400 transition-all"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset All
                  </button>
                </div>
              </div>

              {/* Search + Auto-save */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search fields in this section..."
                    className="w-full bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-sm rounded-lg outline-none focus:border-gold-burnished transition-colors"
                  />
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                    autoSave ? 'bg-emerald-deep text-white border-emerald-deep' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >
                  <span className="relative flex w-7 h-4">
                    <span className={`absolute inset-0 rounded-full transition-colors ${autoSave ? 'bg-green-400/40' : 'bg-gray-300'}`} />
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${autoSave ? 'left-3.5' : 'left-0.5'}`} />
                  </span>
                  Auto-save
                </button>
              </div>

              {/* Section pills */}
              <div className="flex flex-wrap gap-1.5">
                {SECTION_ORDER.map((section) => (
                  <button
                    key={section}
                    onClick={() => { setCurrentSection(section); setSearchQuery(''); }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                      currentSection === section
                        ? 'bg-emerald-deep text-white'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gold-burnished'
                    }`}
                  >
                    {section}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  {filteredItems.length} field{filteredItems.length !== 1 ? 's' : ''} in {currentSection}
                  {searchQuery && ` matching "${searchQuery}"`}
                </p>
                <button
                  onClick={() => resetSection(currentSection)}
                  className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Reset section
                </button>
              </div>

              {/* Fields */}
              <div className="space-y-5">
                {filteredItems.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No fields match your search.</p>
                  </div>
                )}
                {filteredItems.map((item) => (
                  <div key={item.key} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0">
                        <label className="text-xs font-bold text-gray-700 block leading-snug">
                          {item.label}
                        </label>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400 font-mono">({item.key})</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${formatTypeColors(item.type)}`}>
                            {formatType(item.type)}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeValue(item.key)}
                        className="text-red-300 hover:text-red-500 transition-colors p-1 shrink-0"
                        title="Clear this field"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.type === 'text' ? (
                      <div>
                        <textarea
                          value={item.value}
                          onChange={(e) => updateValue(item.key, e.target.value)}
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-200 p-3 text-sm outline-none focus:border-gold-burnished transition-colors resize-y rounded-lg"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[9px] text-gray-300">Plain text — links & line breaks are supported</span>
                          <span className="text-[9px] text-gray-400">{item.value.length} chars</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          className="border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => handleDrop(e, item.key)}
                        >
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              value={item.value.indexOf(',') === -1 ? item.value : (item.value.startsWith('data:') ? '(base64 image embedded)' : item.value)}
                              onChange={(e) => updateValue(item.key, e.target.value)}
                              className="flex-1 bg-gray-50 border border-gray-200 p-3 text-xs outline-none focus:border-gold-burnished transition-colors rounded-lg"
                              placeholder="Paste URL or drag & drop a file"
                            />
                            <input
                              type="file"
                              accept={item.type === 'video' ? 'video/*' : 'image/*'}
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[item.key] = el; }}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(item.key, file);
                                e.target.value = '';
                              }}
                            />
                            <button
                              onClick={() => fileInputRefs.current[item.key]?.click()}
                              disabled={uploadingKey === item.key}
                              className="flex items-center justify-center gap-1.5 px-5 py-3 bg-emerald-deep text-white text-xs font-bold rounded-lg hover:bg-emerald-deep/90 transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {uploadingKey === item.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                              {uploadingKey === item.key ? 'Uploading...' : 'Choose File'}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2">
                            {item.type === 'video'
                              ? 'MP4, WebM, MOV — up to 10MB. Or paste a YouTube/Vimeo link.'
                              : 'JPG, PNG, GIF — up to 10MB. Or paste any image URL.'}
                            {!hasCloudinary && (
                              <span className="text-amber-600"> Files under 500KB work now. For larger files, set up Cloudinary in Settings.</span>
                            )}
                          </p>
                        </div>

                        {item.value && item.type === 'image' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-40 flex items-center justify-center">
                            <img
                              src={item.value}
                              alt=""
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        )}
                        {item.value && item.type === 'video' && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden h-48">
                            {item.value.startsWith('data:video/') || !isVideoUrl(item.value) ? (
                              <video src={item.value} controls className="w-full h-full object-contain" />
                            ) : (
                              <iframe
                                src={item.value}
                                className="w-full h-full"
                                allowFullScreen
                                allow="autoplay; encrypted-media"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom save */}
              <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={manualSave}
                  disabled={savingDisplay}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gold-burnished text-emerald-deep text-sm font-bold rounded-xl hover:bg-gold-burnished/90 transition-all disabled:opacity-50 shadow-md"
                >
                  {saveStatus === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saveStatus === 'saving' ? 'Saving...' : 'Save All Changes'}
                </button>
                {lastSaved && <span className="text-xs text-gray-400">Last saved at {lastSaved}</span>}
              </div>
            </div>
          )}

          {/* ==================== INBOX ==================== */}
          {tab === 'inbox' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Form Submissions</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    View donations, consultations, and inquiries sent through your website.
                  </p>
                </div>
                <button
                  onClick={loadSubmissions}
                  className="flex items-center gap-1.5 px-3 py-2 text-[10px] bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gold-burnished transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              {inboxError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700">
                  <p className="font-bold mb-1">Could not load submissions</p>
                  <p>To view submissions, add a Firestore rule allowing authenticated users to read them:</p>
                  <pre className="bg-red-100 text-[10px] p-2 rounded mt-2 overflow-x-auto">
{`match /{document=**} {
  allow read, write: if request.auth != null;
}`}
                  </pre>
                </div>
              )}

              {inboxLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-deep" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <InboxIcon className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-400">No submissions yet.</p>
                  <p className="text-xs text-gray-300 mt-1">When visitors submit the donation, consultation, or inquiry forms, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((s) => (
                    <div key={`${s.type}-${s.id}`} className="bg-white border border-gray-200 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                            ${s.type === 'Donation' ? 'bg-amber-50 text-amber-700' :
                              s.type === 'Consultation' ? 'bg-emerald-50 text-emerald-700' :
                              s.type === 'Partnership' ? 'bg-blue-50 text-blue-700' :
                              'bg-purple-50 text-purple-700'}">
                            {s.type}
                          </span>
                          {s.status && (
                            <span className="text-[9px] text-gray-400 uppercase tracking-wider">{s.status}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">
                          {s.createdAt instanceof Date ? s.createdAt.toLocaleString() : ''}
                        </span>
                      </div>

                      {s.type === 'Donation' && (
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-gray-800">{s.firstName} {s.lastName}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg font-bold">{s.amountLocal || `${s.currency || ''} ${s.amountUsd || ''}`}</span>
                            {s.currency && <span className="text-[10px] bg-gray-50 text-gray-500 px-2 py-1 rounded-lg">{s.currency}</span>}
                            {s.transactionId && <span className="text-[10px] font-mono bg-gray-50 text-gray-500 px-2 py-1 rounded-lg">{s.transactionId}</span>}
                          </div>
                        </div>
                      )}

                      {s.type === 'Consultation' && (
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{s.message}</p>
                        </div>
                      )}

                      {s.type === 'Partnership' && (
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-gray-800">{s.name} {s.organization ? `(${s.organization})` : ''}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{s.message}</p>
                        </div>
                      )}

                      {s.type === 'Direct Inquiry' && (
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-gray-800">{s.name}</p>
                          <p className="text-xs text-gray-500">{s.email}</p>
                          {s.subject && <p className="text-xs text-gray-500"><strong>Subject:</strong> {s.subject}</p>}
                          <p className="text-xs text-gray-600 mt-2 bg-gray-50 rounded-lg p-3">{s.message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== MEDIA ==================== */}
          {tab === 'media' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Media</h2>
                <p className="text-xs text-gray-400 mt-1">
                  All images and videos currently used on your website.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.filter((i) => i.type === 'image' && i.value).map((item) => (
                  <div key={item.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="h-32 bg-gray-50 flex items-center justify-center">
                      <img src={item.value} alt="" className="max-w-full max-h-full object-contain p-2"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] font-bold text-gray-700 truncate">{item.label}</p>
                      <p className="text-[9px] text-gray-400 font-mono truncate mt-0.5">{item.key}</p>
                      <button
                        onClick={() => { setCurrentSection(item.section); setTab('content'); }}
                        className="mt-2 text-[9px] text-emerald-deep font-bold hover:underline"
                      >
                        Edit →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {items.filter((i) => i.type === 'video' && i.value).length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-gray-700 mt-6">Videos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {items.filter((i) => i.type === 'video' && i.value).map((item) => (
                      <div key={item.key} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="h-32 bg-gray-50 flex items-center justify-center">
                          {item.value.startsWith('data:video/') ? (
                            <video src={item.value} className="max-w-full max-h-full object-contain p-2" muted />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <span className="text-3xl">▶</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-bold text-gray-700 truncate">{item.label}</p>
                          <button
                            onClick={() => { setCurrentSection(item.section); setTab('content'); }}
                            className="mt-2 text-[9px] text-emerald-deep font-bold hover:underline"
                          >
                            Edit →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ==================== SETTINGS ==================== */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                <p className="text-xs text-gray-400 mt-1">Configure media uploads and check database health.</p>
              </div>

              {/* Cloudinary */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Settings className="w-4 h-4 text-gold-burnished" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Media Upload</span>
                  </div>
                  {hasCloudinary ? (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready — 10MB uploads work</span>
                  ) : (
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Needed for files over 500KB</span>
                  )}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <p className="text-xs text-amber-800 font-bold">⚡ 30-second free setup to enable 10MB uploads:</p>
                  <ol className="text-xs text-amber-700 leading-relaxed space-y-1.5 list-decimal list-inside">
                    <li><a href="https://cloudinary.com" target="_blank" className="text-gold-burnished font-bold underline" rel="noopener">Sign up free at cloudinary.com</a> (no credit card)</li>
                    <li>Copy your <strong>Cloud name</strong> from the dashboard</li>
                    <li>Settings → Upload → <strong>Upload presets</strong> → Add → Mode: <strong>Unsigned</strong> → Save</li>
                    <li>Enter both below and click <strong>Save Settings</strong></li>
                  </ol>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={cloudName}
                    onChange={(e) => setCloudName(e.target.value)}
                    placeholder="Your Cloud name (e.g. dxxxxxxx)"
                    className="flex-1 bg-gray-50 border border-gray-200 p-3 text-xs outline-none focus:border-gold-burnished rounded-lg transition-colors"
                  />
                  <input
                    type="text"
                    value={uploadPreset}
                    onChange={(e) => setUploadPreset(e.target.value)}
                    placeholder="Your upload preset name"
                    className="flex-1 bg-gray-50 border border-gray-200 p-3 text-xs outline-none focus:border-gold-burnished rounded-lg transition-colors"
                  />
                  <button
                    onClick={saveConfig}
                    disabled={configSaving || !cloudName.trim() || !uploadPreset.trim()}
                    className="px-5 py-3 bg-emerald-deep text-white text-xs font-bold rounded-lg hover:bg-emerald-deep/90 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {configSaving ? 'Saving...' : configSaved ? 'Saved!' : 'Save Settings'}
                  </button>
                </div>
              </div>

              {/* Firestore diagnostics */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">Database Health</span>
                  </div>
                  <button
                    onClick={testDatabase}
                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Test
                  </button>
                </div>
                {dbTestResult === 'ok' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-700 font-bold flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5" /> Connected</p>
                    <p className="text-[10px] text-green-600 mt-1">Content changes save and appear instantly on the live site.</p>
                  </div>
                )}
                {dbTestResult === 'fail' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-xs font-bold text-red-700 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Connection failed</p>
                    <p className="text-[10px] text-red-600 break-all mt-1">{dbTestError}</p>
                    <p className="text-[10px] text-red-500 mt-2">Open <strong>Firebase Console</strong> → <strong>Firestore Database</strong> → <strong>Rules</strong> and publish:</p>
                    <pre className="bg-red-100 text-[10px] p-2 rounded mt-2 overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /siteContent/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}
                    </pre>
                    <button onClick={testDatabase} className="text-[10px] text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded mt-2">
                      Retry Test
                    </button>
                  </div>
                )}
                {dbTestResult === 'testing' && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Testing connection...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}