import { Album } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface AlbumCardProps {
  album: Album;
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/album/${album.id}`}>
      <motion.div 
        whileHover={{ y: -4 }}
        className="group rounded-xl p-3 cursor-pointer transition-all hover:bg-card block"
      >
        <div className="relative aspect-square w-full mb-3 rounded-lg overflow-hidden shadow-md">
          <img 
            src={album.image || "https://placehold.co/400?text=No+Cover"} 
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
            Album
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold text-sm truncate text-foreground group-hover:text-primary transition-colors">
            {album.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {album.year} • {album.artists.join(", ")}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}