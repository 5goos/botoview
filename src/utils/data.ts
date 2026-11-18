import fs from 'node:fs';
import path from 'node:path';

export interface ChangelogItem {
    category: string;
    description: string;
    type: string;
}

export interface ServiceUpdateItem {
    v: string;
    t: string;
}

export const versionModules = import.meta.glob<ChangelogItem[]>('../../public/data/versions/*.json', { eager: true, import: 'default' });
export const serviceModules = import.meta.glob<ServiceUpdateItem[]>('../../public/data/services/*.json', { eager: true, import: 'default' });

export function loadReleaseChanges(version: string): ChangelogItem[] {
    if (!version) return [];
    const globKey = `../../public/data/versions/${version}.json`;
    if (versionModules[globKey] && Array.isArray(versionModules[globKey])) {
        return versionModules[globKey];
    }
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'versions', `${version}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (e) {}
    return [];
}

export function loadServiceUpdates(service: string): ServiceUpdateItem[] {
    if (!service) return [];
    const globKey = `../../public/data/services/${service}.json`;
    if (serviceModules[globKey] && Array.isArray(serviceModules[globKey])) {
        return serviceModules[globKey];
    }
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'services', `${service}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    } catch (e) {}
    return [];
}
