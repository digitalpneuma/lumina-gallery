import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useGallery } from "@/lib/gallery-context";
import { UploadZone } from "@/components/upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PhotoGrid } from "@/components/photo-grid";
import { Trash2, FolderPlus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export function AdminDashboard() {
  const { isAdmin, albums, isLoading, createAlbum, deleteAlbum, uploadPhotos, getAlbumPhotos, refetchPhotos } = useGallery();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Update selected album when albums change
  useEffect(() => {
    if (albums.length > 0 && !selectedAlbumId) {
      setSelectedAlbumId(albums[0].id);
    } else if (albums.length === 0) {
      setSelectedAlbumId("");
    } else if (!albums.find(a => a.id === selectedAlbumId)) {
      setSelectedAlbumId(albums[0]?.id || "");
    }
  }, [albums, selectedAlbumId]);

  if (!isAdmin) {
    setLocation("/login");
    return null;
  }

  const handleCreateAlbum = async () => {
    if (!newAlbumTitle.trim()) return;
    try {
      await createAlbum(newAlbumTitle, newAlbumDesc);
      setNewAlbumTitle("");
      setNewAlbumDesc("");
      setIsDialogOpen(false);
      toast({ title: "Album Created", description: `Album "${newAlbumTitle}" has been created.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create album.", variant: "destructive" });
    }
  };

  const handleAlbumDelete = async (id: string) => {
    if (confirm("Are you sure? This will delete all photos in the album.")) {
      try {
        await deleteAlbum(id);
        if (selectedAlbumId === id) setSelectedAlbumId(albums.find(a => a.id !== id)?.id || "");
        toast({ title: "Album Deleted", variant: "destructive" });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete album.", variant: "destructive" });
      }
    }
  };

  const handlePhotoUpload = async (files: File[]) => {
    if (!selectedAlbumId) {
      toast({ title: "No Album Selected", description: "Please select or create an album first.", variant: "destructive" });
      return;
    }
    
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      await uploadPhotos(selectedAlbumId, files);
      refetchPhotos(selectedAlbumId);
      toast({ title: "Photos Uploaded", description: `Successfully uploaded ${files.length} photo${files.length > 1 ? 's' : ''}.` });
    } catch (error: any) {
      toast({ 
        title: "Upload Failed", 
        description: error.message || "Failed to upload photos.", 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium">Dashboard</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <FolderPlus className="h-4 w-4" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Album Title</Label>
                <Input id="title" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} placeholder="e.g. Summer 2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description (Optional)</Label>
                <Input id="desc" value={newAlbumDesc} onChange={(e) => setNewAlbumDesc(e.target.value)} placeholder="Short description..." />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAlbum}>Create Album</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="photos">Manage Photos</TabsTrigger>
          <TabsTrigger value="albums">Manage Albums</TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : albums.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 h-fit">
                  <CardHeader>
                    <CardTitle className="text-lg">Select Album</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {albums.map(album => (
                      <Button
                        key={album.id}
                        variant={selectedAlbumId === album.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedAlbumId(album.id)}
                      >
                        {album.title}
                      </Button>
                    ))}
                  </CardContent>
                </Card>

                <div className="md:col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Upload Photos</CardTitle>
                      <CardDescription>
                        Adding to: <span className="font-semibold text-foreground">{albums.find(a => a.id === selectedAlbumId)?.title}</span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isUploading ? (
                        <div className="flex items-center justify-center p-10 gap-2 text-muted-foreground">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Uploading photos...</span>
                        </div>
                      ) : (
                        <UploadZone onDrop={handlePhotoUpload} />
                      )}
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Current Photos</h3>
                    <PhotoGrid photos={getAlbumPhotos(selectedAlbumId)} allowDelete={true} albumId={selectedAlbumId} />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              Create an album to start uploading photos.
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <Card key={album.id}>
                <CardHeader>
                  <CardTitle>{album.title}</CardTitle>
                  <CardDescription>{album.description || "No description"}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{getAlbumPhotos(album.id).length} Photos</p>
                </CardContent>
                <CardContent className="pt-0 flex justify-end">
                   <Button variant="destructive" size="sm" onClick={() => handleAlbumDelete(album.id)} className="gap-2">
                     <Trash2 className="h-4 w-4" /> Delete Album
                   </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
