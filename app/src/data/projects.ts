export interface ProjectAsset {
  id: number;
  projectId: number;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface Project {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  aspect: '16:9' | '4:5' | '3:4';
  assets: ProjectAsset[];
}

export const projects: Project[] = [
  { id: 1, name: 'Villa Serena', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-01.jpg', aspect: '16:9', assets: [{ id: 1, projectId: 1, url: '/images/project-01.jpg', type: 'image', order: 0 }] },
  { id: 2, name: 'Atrium House', category: 'Residential', subcategory: 'Interiors', image: '/images/project-02.jpg', aspect: '3:4', assets: [{ id: 2, projectId: 2, url: '/images/project-02.jpg', type: 'image', order: 0 }] },
  { id: 3, name: 'Casa del Sol', category: 'Residential', subcategory: 'Interiors', image: '/images/project-03.jpg', aspect: '3:4', assets: [{ id: 3, projectId: 3, url: '/images/project-03.jpg', type: 'image', order: 0 }] },
  { id: 4, name: 'Loft Industrial', category: 'Residential', subcategory: 'Interiors', image: '/images/project-04.jpg', aspect: '3:4', assets: [{ id: 4, projectId: 4, url: '/images/project-04.jpg', type: 'image', order: 0 }] },
  { id: 5, name: 'Penthouse 360', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-05.jpg', aspect: '16:9', assets: [{ id: 5, projectId: 5, url: '/images/project-05.jpg', type: 'image', order: 0 }] },
  { id: 6, name: 'Jardin Interior', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-06.jpg', aspect: '3:4', assets: [{ id: 6, projectId: 6, url: '/images/project-06.jpg', type: 'image', order: 0 }] },
  { id: 7, name: 'Marina Residences', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-07.jpg', aspect: '16:9', assets: [{ id: 7, projectId: 7, url: '/images/project-07.jpg', type: 'image', order: 0 }] },
  { id: 8, name: 'Office Horizon', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-08.jpg', aspect: '3:4', assets: [{ id: 8, projectId: 8, url: '/images/project-08.jpg', type: 'image', order: 0 }] },
  { id: 9, name: 'Casa Blanca', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-09.jpg', aspect: '3:4', assets: [{ id: 9, projectId: 9, url: '/images/project-09.jpg', type: 'image', order: 0 }] },
  { id: 10, name: 'Urban Spa', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-10.jpg', aspect: '3:4', assets: [{ id: 10, projectId: 10, url: '/images/project-10.jpg', type: 'image', order: 0 }] },
  { id: 11, name: 'Mountain Retreat', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-11.jpg', aspect: '16:9', assets: [{ id: 11, projectId: 11, url: '/images/project-11.jpg', type: 'image', order: 0 }] },
  { id: 12, name: 'Gallery Space', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-12.jpg', aspect: '3:4', assets: [{ id: 12, projectId: 12, url: '/images/project-12.jpg', type: 'image', order: 0 }] },
];

export const categories = ['All', 'Residential', 'Commercial', 'Interiors', 'Exteriors'];

export const getFilteredProjects = (filter: string): Project[] => {
  if (filter === 'All') return projects;
  if (filter === 'Interiors') return projects.filter(p => p.subcategory === 'Interiors');
  if (filter === 'Exteriors') return projects.filter(p => p.subcategory === 'Exteriors');
  return projects.filter(p => p.category === filter);
};

export const featuredProjects = projects.slice(0, 6);
