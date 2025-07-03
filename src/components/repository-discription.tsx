"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  ExternalLink,
  CheckCircle,
  Code,
  FolderTree,
  Settings,
  Users,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface RepositoryDescriptionProps {
  description: string;
  repoData?: {
    project_repository: string;
    projectOwner: string;
    languages?: Record<string, number>;
    stars?: number;
    forks?: number;
  };
}

export function RepositoryDescription({
  description,
  repoData,
}: RepositoryDescriptionProps) {
  // Check if this is an AI analysis request
  const isAnalysisRequest =
    description.includes("Please provide the link to the repository") ||
    description.includes("I need the repository's URL");

  // Check if this is a generic/placeholder description
  const isGenericDescription =
    description.includes("Open for contributions") && description.length < 200;

  // Regular description - render with better formatting
  const formatDescription = (text: string) => {
    // Remove all occurrences of **
    const cleanedText = text.replace(/\*\*/g, "");

    // Split by numbered lists
    const parts = cleanedText.split(/(\d+\.\s+)/g);
    const formatted = [];

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (/^\d+\.\s+/.test(part)) {
        // This is a number
        const nextPart = parts[i + 1] || "";
        formatted.push({
          type: "listItem",
          number: part.replace(/\.\s+/, ""),
          content: nextPart,
        });
        i++; // Skip the next part as we've already processed it
      } else if (part.trim()) {
        formatted.push({
          type: "text",
          content: part,
        });
      }
    }

    return formatted;
  };

  const formattedContent = formatDescription(description);

  return (
    <Card className="border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Repository Description
            </h3>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              {formattedContent.map((item, index) => {
                if (item.type === "listItem") {
                  return (
                    <div key={index} className="flex gap-3 mb-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400">
                        {item.number}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed m-0">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <p
                    key={index}
                    className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
                  >
                    {item.content}
                  </p>
                );
              })}
            </div>

            {repoData?.languages &&
              Object.keys(repoData.languages).length > 0 && (
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      Technologies:
                    </span>
                    {Object.keys(repoData.languages)
                      .slice(0, 5)
                      .map((lang) => (
                        <Badge
                          key={lang}
                          variant="secondary"
                          className="text-xs"
                        >
                          {lang}
                        </Badge>
                      ))}
                    {Object.keys(repoData.languages).length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{Object.keys(repoData.languages).length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
