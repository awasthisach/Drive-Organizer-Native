import React, { useState } from 'react';
import { HardDrive, Smartphone } from 'lucide-react';
import { DeviceStorageBrowser } from './components/DeviceStorageBrowser';
import { isNativePlatform, getPlatform } from './lib/deviceStorage';

export default function App() {
  const [tab, setTab] = useState<'device' | 'about'>('device');
  const native = isNativePlatform();

  return (
    <div className="min-h-full bg-neutral-950 text-neutral-100 flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/90 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-600/20 border border-sky-500/40 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Drive Organizer Native</div>
              <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                {native ? `Native · ${getPlatform()}` : 'Web preview (no device storage)'}
              </div>
            </div>
          </div>
          <div className="flex gap-1 text-xs">
            <button
              type="button"
              onClick={() => setTab('device')}
              className={`px-3 py-1.5 rounded-lg ${tab === 'device' ? 'bg-sky-600/20 text-sky-300' : 'text-neutral-400'}`}
            >
              Device Storage
            </button>
            <button
              type="button"
              onClick={() => setTab('about')}
              className={`px-3 py-1.5 rounded-lg ${tab === 'about' ? 'bg-sky-600/20 text-sky-300' : 'text-neutral-400'}`}
            >
              About
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-5">
        {tab === 'device' && <DeviceStorageBrowser />}
        {tab === 'about' && (
          <div className="space-y-3 text-sm text-neutral-300">
            <p>
              This Capacitor shell unlocks <strong>internal storage</strong> and{' '}
              <strong>SD card / external storage</strong> on Android.
            </p>
            <p className="text-xs text-neutral-500">
              Full Google Drive Organizer UI lives in{' '}
              <code className="text-neutral-400">Web-The-Perfect-VVF</code>. Merge that{' '}
              <code className="text-neutral-400">src/</code> here, keep{' '}
              <code className="text-neutral-400">deviceStorage</code> +{' '}
              <code className="text-neutral-400">DeviceStorageBrowser</code>, then{' '}
              <code className="text-neutral-400">npm run cap:sync</code>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
