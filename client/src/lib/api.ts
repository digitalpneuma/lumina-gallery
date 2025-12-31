const API_BASE = "/api";

export interface Album {
  id: string;
  name: string;
  description?: string | null;
  createdDate: number;
  coverPhotoId?: string | null;
}

export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  albumId: string;
  uploadDate: number;
  fileSize: number;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

// Auth
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  return response.json();
}

// Albums
export async function getAlbums(): Promise<Album[]> {
  const response = await fetch(`${API_BASE}/albums`);
  if (!response.ok) throw new Error("Failed to fetch albums");
  return response.json();
}

export async function getAlbum(id: string): Promise<Album> {
  const response = await fetch(`${API_BASE}/albums/${id}`);
  if (!response.ok) throw new Error("Failed to fetch album");
  return response.json();
}

export async function createAlbum(name: string, description?: string): Promise<Album> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/albums`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });

  if (!response.ok) throw new Error("Failed to create album");
  return response.json();
}

export async function setAlbumCover(albumId: string, photoId: string): Promise<Album> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/albums/${albumId}/cover`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ photoId }),
  });

  if (!response.ok) throw new Error("Failed to set album cover");
  return response.json();
}

export async function deleteAlbum(id: string): Promise<void> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/albums/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete album");
}

// Photos
export async function getPhotos(albumId: string): Promise<Photo[]> {
  const response = await fetch(`${API_BASE}/albums/${albumId}/photos`);
  if (!response.ok) throw new Error("Failed to fetch photos");
  return response.json();
}

export async function uploadPhotos(albumId: string, files: File[]): Promise<{ photos: Photo[] }> {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  
  // Add all files to FormData
  files.forEach((file) => {
    formData.append("photos", file);
  });

  const response = await fetch(`${API_BASE}/albums/${albumId}/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to upload photos");
  }

  return response.json();
}

export async function deletePhoto(id: string): Promise<void> {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE}/photos/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Failed to delete photo");
}

// Image URLs
export function getThumbnailUrl(photoId: string): string {
  return `${API_BASE}/photos/${photoId}/thumbnail`;
}

export function getOriginalUrl(photoId: string): string {
  return `${API_BASE}/photos/${photoId}/original`;
}

