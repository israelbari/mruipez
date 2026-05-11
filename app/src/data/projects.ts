export interface Project {
  id: number;
  name: string;
  category: string;
  subcategory: string;
  image: string;
  aspect: '16:9' | '4:5' | '3:4';
}

export const projects: Project[] = [
  { id: 1, name: 'Villa Serena', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-01.jpg', aspect: '16:9' },
  { id: 2, name: 'Atrium House', category: 'Residential', subcategory: 'Interiors', image: '/images/project-02.jpg', aspect: '3:4' },
  { id: 3, name: 'Casa del Sol', category: 'Residential', subcategory: 'Interiors', image: '/images/project-03.jpg', aspect: '3:4' },
  { id: 4, name: 'Loft Industrial', category: 'Residential', subcategory: 'Interiors', image: '/images/project-04.jpg', aspect: '3:4' },
  { id: 5, name: 'Penthouse 360', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-05.jpg', aspect: '16:9' },
  { id: 6, name: 'Jardin Interior', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-06.jpg', aspect: '3:4' },
  { id: 7, name: 'Marina Residences', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-07.jpg', aspect: '16:9' },
  { id: 8, name: 'Office Horizon', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-08.jpg', aspect: '3:4' },
  { id: 9, name: 'Casa Blanca', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-09.jpg', aspect: '3:4' },
  { id: 10, name: 'Urban Spa', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-10.jpg', aspect: '3:4' },
  { id: 11, name: 'Mountain Retreat', category: 'Residential', subcategory: 'Exteriors', image: '/images/project-11.jpg', aspect: '16:9' },
  { id: 12, name: 'Gallery Space', category: 'Commercial', subcategory: 'Interiors', image: '/images/project-12.jpg', aspect: '3:4' },
];

export const categories = ['All', 'Residential', 'Commercial', 'Interiors', 'Exteriors'];

export const getFilteredProjects = (filter: string): Project[] => {
  if (filter === 'All') return projects;
  if (filter === 'Interiors') return projects.filter(p => p.subcategory === 'Interiors');
  if (filter === 'Exteriors') return projects.filter(p => p.subcategory === 'Exteriors');
  return projects.filter(p => p.category === filter);
};

export const featuredProjects = projects.slice(0, 6);
