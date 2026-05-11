import { useState, useEffect } from 'react';
import { trpc } from '@/providers/trpc';
import { useLocalProjects } from './useLocalProjects';

export interface Project {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  video?: string | null;
  aspect: string;
  order: number;
  featured: boolean;
  createdAt?: Date;
}

// Check if backend is available
let backendChecked = false;
let backendAvailable = false;

export function useProjects() {
  const apiQuery = trpc.project.list.useQuery(undefined, { retry: false, staleTime: Infinity });
  const local = useLocalProjects();
  const [useLocalMode, setUseLocalMode] = useState(false);

  useEffect(() => {
    if (backendChecked) {
      setUseLocalMode(!backendAvailable);
      return;
    }
    // Check if API responded
    if (!apiQuery.isLoading) {
      backendChecked = true;
      if (apiQuery.error) {
        backendAvailable = false;
        setUseLocalMode(true);
      } else if (apiQuery.data && apiQuery.data.length > 0) {
        backendAvailable = true;
        setUseLocalMode(false);
      } else {
        // No data from API, fall back to local
        setUseLocalMode(true);
      }
    }
  }, [apiQuery.isLoading, apiQuery.error, apiQuery.data]);

  // Convert local projects to Project format
  const localAsProjects: Project[] = local.projects.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    image: p.image,
    video: p.video,
    aspect: p.aspect,
    order: p.order,
    featured: p.featured,
    createdAt: p.createdAt,
  }));

  const apiProjects: Project[] = (apiQuery.data ?? []).map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    image: p.image,
    video: p.video,
    aspect: p.aspect,
    order: p.order,
    featured: p.featured,
    createdAt: p.createdAt,
  }));

  return {
    projects: useLocalMode ? localAsProjects : apiProjects,
    featured: useLocalMode ? localAsProjects.filter(p => p.featured) : apiProjects.filter(p => p.featured),
    isLoading: apiQuery.isLoading,
    isLocalMode: useLocalMode,
    add: local.add,
    update: local.update,
    remove: local.remove,
    refresh: local.refresh,
  };
}
