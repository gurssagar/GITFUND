"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Icon } from "@iconify/react";
import { useState ,useEffect} from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, GitFork, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
interface IssueCardProps {
  image: string;
  Project: string;
  activeUser?: string;
  Stars: string;
  Fork: string;
  Contributors: number;
  shortDescription: string;
  languages?: Record<string, number>;
  Tag?: string;
}

interface Likes{
  userId: string;
  projectName: string;
  likedAt: Date;
}
export default function IssueCard({
  image,
  Project,
  Stars,
  activeUser,
  Fork,
  Contributors,
  shortDescription,
  languages,
  Tag = "General"
}: IssueCardProps) {
  const [likes, setLikes] = useState<number>(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // Check if the user has already liked the project
    const fetchLikes = async () => {
      try {
        const response = await fetch(`/api/likes?userId=${activeUser}&projectName=${Project}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        const data = await response.json();
        console.log("Fetched likes data:", data);
        if (data && data.projects) {
          setLikes(data.projects.length);
          setLiked(data.projects.some((like: Likes) => like.userId === activeUser));
        }
      } catch (error) {
        console.error("Error fetching likes:", error);
      }
    };

    fetchLikes();
  }, [likes]);


  const addLikes = async () => {
    try{
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: activeUser,
          projectName: Project,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add like');
      }

      const data = await response.json();
      console.log("Like added successfully:", data);
      setLikes(likes + 1);
      setLiked(true);
    }
    catch(error) {
      console.error("Error adding likes:", error);
    }
  }
  const deleteLike = async () => {
    try{
      const response = await fetch('/api/likes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: activeUser,
          projectName: Project,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete like');
      }

      const data = await response.json();
      console.log("Like deleted successfully:", data);
      setLikes(likes - 1);
      setLiked(false);
    }
    catch(error) {
      console.error("Error deleting like:", error);
    }
  }

  const getLanguageIcon = (language: string) => {
    // Simple fallback for language icons
    const icons: Record<string, string> = {
      javascript: 'logos:javascript',
      typescript: 'logos:typescript-icon',
      python: 'logos:python',
      java: 'logos:java',
      csharp: 'logos:c-sharp',
      php: 'logos:php',
      ruby: 'logos:ruby',
      go: 'logos:go',
      rust: 'logos:rust',
      html: 'logos:html-5',
      css: 'logos:css-3'
    };
    return icons[language.toLowerCase()] || '';
  };

  const handleLikeClick = () => {
    if (liked) {
      setLikes(likes - 1);
      deleteLike();
    } else {
      setLikes(likes + 1);
      addLikes();
    }
    setLiked(!liked);
  };

  return (
    <div className="relative h-full rounded-xl border md:rounded-xl  cursor-pointer transition-all duration-300">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={image || "/placeholder.svg"}
              alt={Project}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {Tag}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg mb-2 line-clamp-1">{Project}</h3>
            <div className="flex">
              
              <div className="flex px-1 text-gray-400 cursor-pointer" onClick={() => handleLikeClick()}>
                {liked ? (
                  <>
                  <Icon
                    icon="mdi:heart"
                    className="dark:text-red-300 text-red-800 "
                    width="16"
                    height="16"
                  />
                  
                  </>
                ) : (
                  <Icon icon="mdi:heart-outline" className="text-neutral-400" width="16" height="16" />
                )}
                <p className="text-[12px] text-neutral-400 ml-1">{likes}</p>
                
              </div>
          </div>
          </div>
          
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{shortDescription}</p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{Stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{Fork}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{Contributors}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            
            {languages && typeof languages === 'object' && Object.keys(languages).map((language: string) => {
            const iconName = getLanguageIcon(language);
            return (
              <div key={language} className="inline-flex text-[20px] text-white py-1">
                {iconName && <Icon icon={iconName} className="ml-1 rounded-full" width="20" height="20" />}
              </div>
            );
          })}
            
          </div>
        </CardContent>
      
    </div>
  );
}