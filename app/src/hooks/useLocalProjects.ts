import { useState, useCallback } from 'react';

export interface LocalProjectAsset {
  id: number;
  projectId?: number;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface LocalProject {
  id: number;
  name: string;
  category: 'Residential' | 'Commercial';
  subcategory: 'Interiors' | 'Exteriors';
  image: string;
  video?: string;
  aspect: '16:9' | '3:4' | '4:5';
  order: number;
  featured: boolean;
  createdAt: Date;
  assets: LocalProjectAsset[];
}

const STORAGE_KEY = 'mruipez-projects';
const MESSAGES_KEY = 'mruipez-messages';

const defaultProjects: LocalProject[] = [
  { id: 1, name: 'Villa Serena', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-01.jpg', aspect: '16:9', order: 1, featured: true, createdAt: new Date(), assets: [{ id: 1, projectId: 1, url: '/images/project-01.jpg', type: 'image', order: 0 }] },
  { id: 2, name: 'Atrium House', category: 'Residential', subcategory: 'Interiors', image: '/images/project-02.jpg', aspect: '3:4', order: 2, featured: true, createdAt: new Date(), assets: [{ id: 2, projectId: 2, url: '/images/project-02.jpg', type: 'image', order: 0 }] },
  { id: 3, name: 'Casa del Sol', category: 'Residential', subcategory: 'Interiors', image: '/images/project-03.jpg', aspect: '3:4', order: 3, featured: true, createdAt: new Date(), assets: [{ id: 3, projectId: 3, url: '/images/project-03.jpg', type: 'image', order: 0 }] },
  { id: 4, name: 'Loft Industrial', category: 'Residential', subcategory: 'Interiors', image: '/images/project-04.jpg', aspect: '3:4', order: 4, featured: true, createdAt: new Date(), assets: [{ id: 4, projectId: 4, url: '/images/project-04.jpg', type: 'image', order: 0 }] },
  { id: 5, name: 'Penthouse 360', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-05.jpg', aspect: '16:9', order: 5, featured: true, createdAt: new Date(), assets: [{ id: 5, projectId: 5, url: '/images/project-05.jpg', type: 'image', order: 0 }] },
  { id: 6, name: 'Jardin Interior', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-06.jpg', aspect: '3:4', order: 6, featured: true, createdAt: new Date(), assets: [{ id: 6, projectId: 6, url: '/images/project-06.jpg', type: 'image', order: 0 }] },
  { id: 7, name: 'Marina Residences', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-07.jpg', aspect: '16:9', order: 7, featured: false, createdAt: new Date(), assets: [{ id: 7, projectId: 7, url: '/images/project-07.jpg', type: 'image', order: 0 }] },
  { id: 8, name: 'Office Horizon', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-08.jpg', aspect: '3:4', order: 8, featured: false, createdAt: new Date(), assets: [{ id: 8, projectId: 8, url: '/images/project-08.jpg', type: 'image', order: 0 }] },
  { id: 9, name: 'Casa Blanca', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-09.jpg', aspect: '3:4', order: 9, featured: false, createdAt: new Date(), assets: [{ id: 9, projectId: 9, url: '/images/project-09.jpg', type: 'image', order: 0 }] },
  { id: 10, name: 'Urban Spa', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-10.jpg', aspect: '3:4', order: 10, featured: false, createdAt: new Date(), assets: [{ id: 10, projectId: 10, url: '/images/project-10.jpg', type: 'image', order: 0 }] },
  { id: 11, name: 'Mountain Retreat', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-11.jpg', aspect: '16:9', order: 11, featured: false, createdAt: new Date(), assets: [{ id: 11, projectId: 11, url: '/images/project-11.jpg', type: 'image', order: 0 }] },
  { id: 12, name: 'Gallery Space', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-12.jpg', aspect: '3:4', order: 12, featured: false, createdAt: new Date(), assets: [{ id: 12, projectId: 12, url: '/images/project-12.jpg', type: 'image', order: 0 }] },
];

function loadProjects(): LocalProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: any) => {
        // Migrate old projects without assets
        const assets: LocalProjectAsset[] = p.assets && p.assets.length > 0
          ? p.assets
          : [{ id: Date.now() + Math.random(), projectId: p.id, url: p.image, type: 'image' as const, order: 0 }];
        return { ...p, assets, createdAt: new Date(p.createdAt) };
      });
    }
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProjects));
  return defaultProjects;
}

function saveProjects(projects: LocalProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useLocalProjects() {
  const [projects, setProjects] = useState<LocalProject[]>(loadProjects);

  const refresh = useCallback(() => {
    setProjects(loadProjects());
  }, []);

  const add = useCallback((project: Omit<LocalProject, 'id' | 'createdAt'>) => {
    const newProject: LocalProject = {
      ...project,
      id: Date.now(),
      createdAt: new Date(),
    };
    const updated = [...loadProjects(), newProject];
    saveProjects(updated);
    setProjects(updated);
    return newProject;
  }, []);

  const update = useCallback((id: number, data: Partial<LocalProject>) => {
    const updated = loadProjects().map(p => p.id === id ? { ...p, ...data } : p);
    saveProjects(updated);
    setProjects(updated);
  }, []);

  const remove = useCallback((id: number) => {
    const updated = loadProjects().filter(p => p.id !== id);
    saveProjects(updated);
    setProjects(updated);
  }, []);

  return { projects, add, update, remove, refresh };
}

export interface LocalMessage {
  id: number;
  name: string;
  email: string;
  projectType: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

function loadMessages(): LocalMessage[] {
  try {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((m: any) => ({ ...m, createdAt: new Date(m.createdAt) }));
    }
  } catch { /* ignore */ }
  return [];
}

function saveMessages(messages: LocalMessage[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

export function useLocalMessages() {
  const [messages, setMessages] = useState<LocalMessage[]>(loadMessages);

  const add = useCallback((msg: Omit<LocalMessage, 'id' | 'read' | 'createdAt'>) => {
    const newMsg: LocalMessage = { ...msg, id: Date.now(), read: false, createdAt: new Date() };
    const updated = [newMsg, ...loadMessages()];
    saveMessages(updated);
    setMessages(updated);
  }, []);

  const markRead = useCallback((id: number) => {
    const updated = loadMessages().map(m => m.id === id ? { ...m, read: true } : m);
    saveMessages(updated);
    setMessages(updated);
  }, []);

  const remove = useCallback((id: number) => {
    const updated = loadMessages().filter(m => m.id !== id);
    saveMessages(updated);
    setMessages(updated);
  }, []);

  return { messages, add, markRead, remove };
}
