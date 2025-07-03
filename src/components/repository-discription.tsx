"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  const formatDescription = (text: string) => {
    const cleanedText = text.replace(/\*\*/g, "");
    const lines = cleanedText.split(/\n+/);
    const formatted: any[] = [];

    for (let line of lines) {
      line = line.trim();

      if (line.match(/^[A-Z].*:$/)) {
        formatted.push({ type: "section", content: line });
      } else if (line.match(/^\d+\.\s+/)) {
        const numberMatch = line.match(/^(\d+)\.\s+(.*)/);
        if (numberMatch) {
          formatted.push({
            type: "listItem",
            number: numberMatch[1],
            content: numberMatch[2],
          });
        }
      } else if (line.startsWith("* ")) {
        formatted.push({
          type: "bullet",
          content: line.replace(/^\*\s+/, ""),
        });
      } else if (line) {
        formatted.push({
          type: "text",
          content: line,
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

            <div
              className={`prose prose-sm dark:prose-invert max-w-none transition-all ${
                expanded ? "max-h-full" : "max-h-[300px] overflow-hidden"
              }`}
            >
              {formattedContent.map((item, index) => {
                switch (item.type) {
                  case "section":
                    return (
                      <h4
                        key={index}
                        className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-4"
                      >
                        {item.content}
                      </h4>
                    );
                  case "listItem":
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
                  case "bullet":
                    return (
                      <ul
                        key={index}
                        className="list-disc list-inside pl-4 text-sm text-neutral-700 dark:text-neutral-300"
                      >
                        <li>{item.content}</li>
                      </ul>
                    );
                  case "text":
                  default:
                    return (
                      <p
                        key={index}
                        className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed"
                      >
                        {item.content}
                      </p>
                    );
                }
              })}
            </div>

            {formattedContent.length > 10 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleExpanded}
                className="mt-2 text-blue-600 dark:text-blue-400"
              >
                {expanded ? "Show less" : "Show more"}
              </Button>
            )}

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
