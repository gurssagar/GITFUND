import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Star, Code } from "lucide-react";

interface ProjectCardProps {
  title: string;
  description: string;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  className,
}: ProjectCardProps) {
  return (
    <Card
      className={`w-full max-w-2xl border-l-4 border-l-blue-500 dark:border-l-blue-400 bg-card my-4 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 mb-2">
          <Code className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <Badge variant="secondary" className="text-xs">
            Project Suggestion
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </CardDescription>
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <span>Beginner Friendly</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3" />
            <span>Recommended</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
