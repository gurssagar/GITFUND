"use client";

import { Box, Lock, Search, Settings, Sparkles } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Icon } from "@iconify/react";
import { useState ,useEffect} from "react";

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
    <div className="relative h-full rounded-xl border p-2 md:rounded-xl md:p-3">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
      />
      <div className="flex justify-between ">
        <div className="flex">
        <div className="mr-4">
          <img src={image} className="rounded h-[48px]" width={48} height={48} alt="avatar" />
        </div>
        <div>
          <h3>
            {Project}
          </h3>
          <div className="mt-1 flex items-center justify-between ">
            <span className="text-xs bg-gray-200 dark:bg-neutral-900 dark:border-neutral-600 px-2 py-1 rounded-full mr-2">
              {Tag}
            </span>
            
          </div>
        </div>
        
      </div>
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
      
      <div className="pt-2">
        <div>
          <h3 className="text-[13px] text-gray-400">
            {shortDescription}
          </h3>
        </div>
      </div>
      <div className='flex justify-between'>
        <div className="flex items-center text-gray-400 py-1">
          <div className="flex text-gray-400 px-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="m12 17.275l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15z"/></svg>
                <p className="text-[12px]">{Stars}</p>
              </div>
              <div className="flex px-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="my-auto"  width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M22 5a3 3 0 1 0-4 2.816V11H6V7.816a3 3 0 1 0-2 0V11a2 2 0 0 0 2 2h5v4.184a3 3 0 1 0 2 0V13h5a2 2 0 0 0 2-2V7.816A2.99 2.99 0 0 0 22 5"/></svg>                        
                <p className="text-[12px]">{Fork}</p>
              </div>
              <div className="flex px-1 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="my-auto" width="16" height="16" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20.75a1 1 0 0 0 1-1v-1.246c.004-2.806-3.974-5.004-8-5.004s-8 2.198-8 5.004v1.246a1 1 0 0 0 1 1zM15.604 6.854a3.604 3.604 0 1 1-7.208 0a3.604 3.604 0 0 1 7.208 0"/></svg>                       
                <p className="text-[12px]">{Contributors}</p>
              </div>
        </div>
        <div>
          {languages && typeof languages === 'object' && Object.keys(languages).map((language: string) => {
            const iconName = getLanguageIcon(language);
            return (
              <div key={language} className="inline-flex text-[20px] text-white py-1">
                {iconName && <Icon icon={iconName} className="ml-1 rounded-full" width="20" height="20" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}