import { SavedProject, BusinessInfo, DesignTheme, User } from "../types";

const STORAGE_KEY = 'prestige_cards_projects';
const TEMPLATES_KEY = 'prestige_user_templates';

// Helper to get raw data
const getAllProjectsRaw = (): SavedProject[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveProject = (info: BusinessInfo, theme: DesignTheme, ownerEmail: string): SavedProject => {
  const newProject: SavedProject = {
    id: `proj-${Date.now()}`,
    owner: ownerEmail,
    info,
    theme,
    createdAt: Date.now()
  };

  const existing = getAllProjectsRaw();
  const updated = [newProject, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newProject;
};

export const updateProject = (id: string, info: BusinessInfo, theme: DesignTheme): SavedProject | null => {
    const existing = getAllProjectsRaw();
    const index = existing.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    const updatedProject = {
        ...existing[index],
        info,
        theme,
        // We do NOT update createdAt or owner
    };

    existing[index] = updatedProject;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    return updatedProject;
};

export const getProjects = (user: User): SavedProject[] => {
  const allProjects = getAllProjectsRaw();
  
  let filtered: SavedProject[] = [];

  // Admin sees EVERYTHING
  if (user.isAdmin) {
    filtered = allProjects;
  } else {
    // Regular user sees only their own projects
    // (We also include projects without an owner for legacy support/backward compatibility)
    filtered = allProjects.filter(p => !p.owner || p.owner === user.email);
  }

  // Sort by createdAt descending to show history (newest first)
  return filtered.sort((a, b) => b.createdAt - a.createdAt);
};

export const deleteProject = (id: string) => {
    const existing = getAllProjectsRaw();
    const updated = existing.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// --- TEMPLATES ---

export const saveTemplate = (theme: DesignTheme, ownerEmail: string) => {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    let templates: DesignTheme[] = raw ? JSON.parse(raw) : [];
    
    // Ensure unique ID for template
    const newTemplate = { ...theme, id: `tmpl-${Date.now()}` };
    
    // You could filter by owner here if you wanted private templates,
    // but typically templates are just local. For this app, let's store them globally or simple local.
    // Given the prompt asks to "Save as template", we'll just store it.
    
    templates = [newTemplate, ...templates];
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
};

export const getTemplates = (): DesignTheme[] => {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
};

export const deleteTemplate = (id: string) => {
    const templates = getTemplates();
    const updated = templates.filter(t => t.id !== id);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
};