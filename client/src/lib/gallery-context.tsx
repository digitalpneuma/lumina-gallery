import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import { getThumbnailUrl, getOriginalUrl } from './api';

export interface Photo {
  id: string;
  url: string;
  originalUrl?: string;
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
  photos: Record<string, Photo[]>;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createAlbum: (title: string, description?: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  uploadPhotos: (albumId: string, files: File[]) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  setAlbumCover: (albumId: string, photoId: string) => Promise<void>;
  getAlbumPhotos: (albumId: string) => Photo[];
  getAlbumCover: (albumId: string) => string | undefined;
  refetchAlbums: () => void;
  refetchPhotos: (albumId: string) => void;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem("token"));
  const queryClient = useQueryClient();

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAdmin(!!token);
  }, []);

  // Fetch albums
  const { data: albumsData, isLoading: albumsLoading, refetch: refetchAlbums } = useQuery({
    queryKey: ['albums'],
    queryFn: api.getAlbums,
  });

  // Convert API albums to context format
  const albums: Album[] = useMemo(() => (albumsData || []).map(album => ({
    id: album.id,
    title: album.name,
    description: album.description || undefined,
    coverPhotoId: album.coverPhotoId || undefined,
    createdAt: new Date(album.createdDate).getTime(),
  })), [albumsData]);

  // Fetch photos for each album using useQueries
  const photosQueries = useQueries({
    queries: albums.map(album => ({
      queryKey: ['photos', album.id],
      queryFn: () => api.getPhotos(album.id),
      enabled: !!album.id,
    })),
  });

  // Convert API photos to context format
  const photos: Record<string, Photo[]> = useMemo(() => {
    const photosMap: Record<string, Photo[]> = {};
    albums.forEach((album, index) => {
      const query = photosQueries[index];
      if (query?.data) {
        photosMap[album.id] = query.data.map(photo => ({
          id: photo.id,
          url: getThumbnailUrl(photo.id),
          originalUrl: getOriginalUrl(photo.id),
          title: photo.originalName,
          albumId: photo.albumId,
          createdAt: new Date(photo.uploadDate).getTime(),
        }));
      } else {
        photosMap[album.id] = [];
      }
    });
    return photosMap;
  }, [albums, photosQueries]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(username, password);
      localStorage.setItem("token", response.token);
      setIsAdmin(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
    queryClient.clear();
  };

  const createAlbumMutation = useMutation({
    mutationFn: ({ name, description }: { name: string; description?: string }) =>
      api.createAlbum(name, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

  const createAlbum = async (title: string, description?: string) => {
    await createAlbumMutation.mutateAsync({ name: title, description });
  };

  const deleteAlbumMutation = useMutation({
    mutationFn: api.deleteAlbum,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });

  const deleteAlbum = async (id: string) => {
    await deleteAlbumMutation.mutateAsync(id);
  };

  const uploadPhotosMutation = useMutation({
    mutationFn: ({ albumId, files }: { albumId: string; files: File[] }) =>
      api.uploadPhotos(albumId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['photos', variables.albumId] });
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

  const uploadPhotos = async (albumId: string, files: File[]) => {
    await uploadPhotosMutation.mutateAsync({ albumId, files });
  };

  const deletePhotoMutation = useMutation({
    mutationFn: api.deletePhoto,
    onSuccess: (_data, photoId) => {
      // Find which album this photo belongs to
      const albumId = Object.keys(photos).find(id => 
        photos[id].some(p => p.id === photoId)
      );
      if (albumId) {
        queryClient.invalidateQueries({ queryKey: ['photos', albumId] });
        queryClient.invalidateQueries({ queryKey: ['albums'] });
      }
    },
  });

  const deletePhoto = async (id: string) => {
    await deletePhotoMutation.mutateAsync(id);
  };

  const setAlbumCoverMutation = useMutation({
    mutationFn: ({ albumId, photoId }: { albumId: string; photoId: string }) =>
      api.setAlbumCover(albumId, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['albums'] });
    },
  });

  const setAlbumCover = async (albumId: string, photoId: string) => {
    await setAlbumCoverMutation.mutateAsync({ albumId, photoId });
  };

  const getAlbumPhotos = (albumId: string): Photo[] => {
    return photos[albumId] || [];
  };

  const getAlbumCover = (albumId: string): string | undefined => {
    const album = albums.find(a => a.id === albumId);
    if (album?.coverPhotoId) {
      const albumPhotos = getAlbumPhotos(albumId);
      const coverPhoto = albumPhotos.find(p => p.id === album.coverPhotoId);
      if (coverPhoto) return coverPhoto.url;
    }
    // Fallback to first photo
    const albumPhotos = getAlbumPhotos(albumId);
    return albumPhotos.length > 0 ? albumPhotos[0].url : undefined;
  };

  const refetchPhotos = (albumId: string) => {
    queryClient.invalidateQueries({ queryKey: ['photos', albumId] });
  };

  const isLoading = albumsLoading || photosQueries.some(q => q.isLoading);

  return (
    <GalleryContext.Provider
      value={{
        albums,
        photos,
        isLoading,
        isAdmin,
        login,
        logout,
        createAlbum,
        deleteAlbum,
        uploadPhotos,
        deletePhoto,
        setAlbumCover,
        getAlbumPhotos,
        getAlbumCover,
        refetchAlbums: () => refetchAlbums(),
        refetchPhotos,
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
