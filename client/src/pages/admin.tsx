import { useState } from "react";
import { useLocation } from "wouter";
import { useGallery, Album } from "@/lib/gallery-context";
import { UploadZone } from "@/components/upload-zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PhotoGrid } from "@/components/photo-grid";
import { Plus, Trash2, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export function AdminDashboard() {
  const { isAdmin, albums, createAlbum, deleteAlbum, addPhoto, getAlbumPhotos } = useGallery();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>(albums[0]?.id || "");
  const [newAlbumTitle, setNewAlbumTitle] = useState("");
  const [newAlbumDesc, setNewAlbumDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!isAdmin) {
    setLocation("/login");
    return null;
  }

  const handleCreateAlbum = () => {
    if (!newAlbumTitle.trim()) return;
    createAlbum(newAlbumTitle, newAlbumDesc);
    setNewAlbumTitle("");
    setNewAlbumDesc("");
    setIsDialogOpen(false);
    toast({ title: "Album Created", description: `Album "${newAlbumTitle}" has been created.` });
  };

  const handleAlbumDelete = (id: string) => {
    if (confirm("Are you sure? This will delete all photos in the album.")) {
      deleteAlbum(id);
      if (selectedAlbumId === id) setSelectedAlbumId(albums[0]?.id || "");
      toast({ title: "Album Deleted", variant: "destructive" });
    }
  };

  const handlePhotoUpload = (files: File[]) => {
    if (!selectedAlbumId) {
      toast({ title: "No Album Selected", description: "Please select or create an album first.", variant: "destructive" });
      return;
    }
    
    files.forEach(file => addPhoto(selectedAlbumId, file));
    toast({ title: "Photos Uploaded", description: `Added ${files.length} photos.` });
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
          {albums.length > 0 ? (
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
                      <UploadZone onDrop={handlePhotoUpload} />
                    </CardContent>
                  </Card>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Current Photos</h3>
                    <PhotoGrid photos={getAlbumPhotos(selectedAlbumId)} allowDelete={true} />
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
