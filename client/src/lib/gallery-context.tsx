import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import minimalistArch from '@assets/stock_images/minimalist_architect_714047d2.jpg';
import mistyForest from '@assets/stock_images/misty_forest_landsca_7365c1be.jpg';
import abstractGeo from '@assets/stock_images/abstract_geometric_s_70cc6f7d.jpg';
import modernInterior from '@assets/stock_images/modern_interior_desi_79891cb8.jpg';

export interface Photo {
  id: string;
  url: string;
  title: string;
  albumId: string;
  createdAt: number;
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhotoId?: string;
  createdAt: number;
}

interface GalleryContextType {
  albums: Album[];
  photos: Photo[];
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  createAlbum: (title: string, description?: string) => void;
  deleteAlbum: (id: string) => void;
  addPhoto: (albumId: string, file: File) => void;
  deletePhoto: (id: string) => void;
  getAlbumPhotos: (albumId: string) => Photo[];
  getAlbumCover: (albumId: string) => string | undefined;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const INITIAL_ALBUMS: Album[] = [
  { id: '1', title: 'Architecture', description: 'Lines and structures', createdAt: Date.now() },
  { id: '2', title: 'Nature', description: 'Mist and greenery', createdAt: Date.now() },
  { id: '3', title: 'Abstract', description: 'Shapes and forms', createdAt: Date.now() },
];

const INITIAL_PHOTOS: Photo[] = [
  { id: 'p1', url: minimalistArch, title: 'White Building', albumId: '1', createdAt: Date.now() },
  { id: 'p2', url: modernInterior, title: 'Living Room', albumId: '1', createdAt: Date.now() },
  { id: 'p3', url: mistyForest, title: 'Morning Mist', albumId: '2', createdAt: Date.now() },
  { id: 'p4', url: abstractGeo, title: 'Geometric 01', albumId: '3', createdAt: Date.now() },
];

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (password: string) => {
    if (password === 'admin') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => setIsAdmin(false);

  const createAlbum = (title: string, description?: string) => {
    const newAlbum: Album = {
      id: nanoid(),
      title,
      description,
      createdAt: Date.now(),
    };
    setAlbums([newAlbum, ...albums]);
  };

  const deleteAlbum = (id: string) => {
    setAlbums(albums.filter(a => a.id !== id));
    setPhotos(photos.filter(p => p.albumId !== id));
  };

  const addPhoto = (albumId: string, file: File) => {
    const url = URL.createObjectURL(file);
    const newPhoto: Photo = {
      id: nanoid(),
      url,
      title: file.name,
      albumId,
      createdAt: Date.now(),
    };
    setPhotos([newPhoto, ...photos]);
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const getAlbumPhotos = (albumId: string) => {
    return photos.filter(p => p.albumId === albumId);
  };

  const getAlbumCover = (albumId: string) => {
    const albumPhotos = getAlbumPhotos(albumId);
    return albumPhotos.length > 0 ? albumPhotos[0].url : undefined;
  };

  return (
    <GalleryContext.Provider
      value={{
        albums,
        photos,
        isAdmin,
        login,
        logout,
        createAlbum,
        deleteAlbum,
        addPhoto,
        deletePhoto,
        getAlbumPhotos,
        getAlbumCover,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}
