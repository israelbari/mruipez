import { trpc } from '@/providers/trpc';

export interface ProjectAsset {
  id: number;
  projectId?: number;
  url: string;
  type: 'image' | 'video';
  order: number;
  createdAt?: Date;
}

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
  assets: ProjectAsset[];
}

export function useProjects() {
  const { data, isLoading, error } = trpc.project.list.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const apiProjects: Project[] = (data ?? []).map((p) => ({
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
    assets: (p.assets ?? []).map((a) => ({
      id: a.id,
      projectId: a.projectId,
      url: a.url,
      type: a.type,
      order: a.order,
      createdAt: a.createdAt,
    })),
  }));

  return {
    projects: apiProjects,
    featured: apiProjects.filter((p) => p.featured),
    isLoading,
    error,
  };
}
