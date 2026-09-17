import React, { useCallback, useEffect, useState } from 'react';
import {
  HardDrive,
  Folder,
  File,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Smartphone,
  ArrowLeft,
  Loader2,
  Shield,
} from 'lucide-react';
import {
  type DeviceFileEntry,
  type StorageRoot,
  isNativePlatform,
  getPlatform,
  ensureStoragePermission,
  listDeviceFolder,
  rootLabel,
  formatBytes,
} from '../lib/deviceStorage';

const ROOTS: StorageRoot[] = ['external', 'internal', 'data', 'cache'];

export const DeviceStorageBrowser: React.FC = () => {
  const native = isNativePlatform();
  const platform = getPlatform();

  const [root, setRoot] = useState<StorageRoot>('external');
  const [path, setPath] = useState('');
  const [entries, setEntries] = useState<DeviceFileEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permOk, setPermOk] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    if (!native) return;
    setLoading(true);
    setError(null);
    try {
      const list = await listDeviceFolder(root, path);
      setEntries(list);
    } catch (e: any) {
      setEntries([]);
      setError(e?.message || 'Could not read this folder. Check storage permission.');
    } finally {
      setLoading(false);
    }
  }, [native, root, path]);

  useEffect(() => {
    if (!native) return;
    (async () => {
      const ok = await ensureStoragePermission();
      setPermOk(ok);
      await load();
    })();
  }, [native, load]);

  useEffect(() => {
    if (native && permOk !== null) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, path]);

  const openDir = (entry: DeviceFileEntry) => {
    if (entry.type !== 'directory') return;
    setPath(entry.path);
  };

  const goUp = () => {
    if (!path) return;
    const parts = path.split('/').filter(Boolean);
    parts.pop();
    setPath(parts.join('/'));
  };

  if (!native) {
    return (
      <div className="p-6 rounded-2xl border border-amber-800/50 bg-amber-950/30 space-y-3">
        <div className="flex items-center gap-2 text-amber-300">
          <Smartphone className="w-5 h-5" />
          <h3 className="text-sm font-semibold">Device storage only works in the native app</h3>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Browser / Vercel build cannot access internal storage or SD card.
          Build the Android APK with Capacitor:
        </p>
        <pre className="text-[11px] bg-neutral-950 border border-neutral-800 rounded-xl p-3 overflow-x-auto text-neutral-300">
{`npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android`}
        </pre>
        <p className="text-[11px] text-neutral-500">Platform detected: {platform}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-sky-400" />
            Device Storage
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Internal app files and external / SD card ({platform})
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {permOk === false && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Storage permission missing or denied. Allow Files access in system settings for Drive Organizer, then tap Refresh.
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {ROOTS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => {
              setRoot(r);
              setPath('');
            }}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition ${
              root === r
                ? 'bg-sky-600/20 border-sky-500/50 text-sky-300'
                : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            {rootLabel(r)}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono">
        {path ? (
          <button type="button" onClick={goUp} className="p-1 rounded hover:bg-neutral-800 text-neutral-300" aria-label="Go up">
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : null}
        <span className="truncate">
          {rootLabel(root)}{path ? ` / ${path}` : ''}
        </span>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 divide-y divide-neutral-800/80 min-h-[200px]">
        {loading && (
          <div className="p-8 flex justify-center text-neutral-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {!loading && entries.length === 0 && !error && (
          <div className="p-8 text-center text-xs text-neutral-500">This folder is empty or inaccessible.</div>
        )}
        {!loading &&
          entries.map((entry) => (
            <button
              key={entry.path}
              type="button"
              onClick={() => openDir(entry)}
              disabled={entry.type !== 'directory'}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-800/40 transition disabled:cursor-default"
            >
              {entry.type === 'directory' ? (
                <Folder className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <File className="w-4 h-4 text-neutral-400 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-neutral-100 truncate">{entry.name}</div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  {entry.type === 'directory' ? 'Folder' : formatBytes(entry.size)}
                </div>
              </div>
              {entry.type === 'directory' && <ChevronRight className="w-4 h-4 text-neutral-600" />}
            </button>
          ))}
      </div>
    </div>
  );
};
