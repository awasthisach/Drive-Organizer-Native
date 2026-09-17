/**
 * Device storage helper — internal app files + external / SD card.
 * Works only inside a Capacitor native shell. In plain browser, falls back gracefully.
 */
import { Capacitor } from '@capacitor/core';
import {
  Filesystem,
  Directory,
  Encoding,
  type FileInfo,
} from '@capacitor/filesystem';

export type StorageRoot = 'internal' | 'external' | 'cache' | 'data';

export interface DeviceFileEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  mtime?: number;
  root: StorageRoot;
}

const ROOT_MAP: Record<StorageRoot, Directory> = {
  internal: Directory.Internal,
  external: Directory.ExternalStorage,
  cache: Directory.Cache,
  data: Directory.Data,
};

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

export function getPlatform(): string {
  return Capacitor.getPlatform();
}

/** Request storage permission where required (Android). */
export async function ensureStoragePermission(): Promise<boolean> {
  if (!isNativePlatform()) return false;
  try {
    // Writing a tiny probe file surfaces the permission dialog on many OEMs
    const probe = `.drive_organizer_probe_${Date.now()}.txt`;
    await Filesystem.writeFile({
      path: probe,
      data: 'ok',
      directory: Directory.ExternalStorage,
      encoding: Encoding.UTF8,
    });
    await Filesystem.deleteFile({
      path: probe,
      directory: Directory.ExternalStorage,
    });
    return true;
  } catch (e) {
    console.warn('Storage permission probe failed:', e);
    return false;
  }
}

function mapStat(
  name: string,
  parentPath: string,
  info: FileInfo,
  root: StorageRoot
): DeviceFileEntry {
  const path = parentPath ? `${parentPath}/${name}` : name;
  return {
    name,
    path,
    type: info.type === 'directory' ? 'directory' : 'file',
    size: info.size,
    mtime: info.mtime,
    root,
  };
}

/** List files under a storage root (and optional subfolder). */
export async function listDeviceFolder(
  root: StorageRoot,
  folderPath = ''
): Promise<DeviceFileEntry[]> {
  if (!isNativePlatform()) {
    return [];
  }

  const directory = ROOT_MAP[root];
  try {
    const result = await Filesystem.readdir({
      path: folderPath || '',
      directory,
    });

    const entries: DeviceFileEntry[] = [];
    for (const item of result.files) {
      const name = item.name;
      try {
        const childPath = folderPath ? `${folderPath}/${name}` : name;
        const st = await Filesystem.stat({
          path: childPath,
          directory,
        });
        entries.push(mapStat(name, folderPath, st, root));
      } catch {
        entries.push({
          name,
          path: folderPath ? `${folderPath}/${name}` : name,
          type: item.type === 'directory' ? 'directory' : 'file',
          size: item.size,
          root,
        });
      }
    }

    entries.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
    return entries;
  } catch (err) {
    console.error(`listDeviceFolder(${root}, ${folderPath}) failed:`, err);
    throw err;
  }
}

/** Read a text file from device storage. */
export async function readDeviceTextFile(
  root: StorageRoot,
  filePath: string
): Promise<string> {
  const res = await Filesystem.readFile({
    path: filePath,
    directory: ROOT_MAP[root],
    encoding: Encoding.UTF8,
  });
  return typeof res.data === 'string' ? res.data : '';
}

/** Read binary as base64 (images, pdf, etc.). */
export async function readDeviceBinaryBase64(
  root: StorageRoot,
  filePath: string
): Promise<string> {
  const res = await Filesystem.readFile({
    path: filePath,
    directory: ROOT_MAP[root],
  });
  return typeof res.data === 'string' ? res.data : '';
}

/** Human labels for UI. */
export function rootLabel(root: StorageRoot): string {
  switch (root) {
    case 'internal':
      return 'App Internal Storage';
    case 'external':
      return 'Phone / SD Card (External)';
    case 'cache':
      return 'App Cache';
    case 'data':
      return 'App Data';
    default:
      return root;
  }
}

export function formatBytes(bytes?: number): string {
  if (bytes == null || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
