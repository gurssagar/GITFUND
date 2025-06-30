import { ProjectCard } from "./project-card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageParserProps {
  content: string;
  markdownComponents: any;
  className?: string;
}

export function MessageParser({
  content,
  markdownComponents,
  className,
}: MessageParserProps) {
  // Function to parse @Project tags and extract project information
  const parseProjectContent = (text: string) => {
    const projectRegex =
      /@Project\s*\n?Title:\s*([^\n]+)\s*\n?Description:\s*([\s\S]*?)(?=\n\n|\n@|$)/g;
    const parts: Array<{
      type: "text" | "project";
      content: string;
      title?: string;
      description?: string;
    }> = [];

    let lastIndex = 0;
    let match;

    while ((match = projectRegex.exec(text)) !== null) {
      // Add text before the project
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index).trim();
        if (beforeText) {
          parts.push({ type: "text", content: beforeText });
        }
      }

      // Add the project
      parts.push({
        type: "project",
        content: match[0],
        title: match[1].trim(),
        description: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText) {
        parts.push({ type: "text", content: remainingText });
      }
    }

    // If no projects found, return the original text
    if (parts.length === 0) {
      parts.push({ type: "text", content: text });
    }

    return parts;
  };

  const parsedContent = parseProjectContent(content);

  return (
    <div className={`space-y-0 ${className}`}>
      {parsedContent.map((part, index) => {
        if (part.type === "project" && part.title && part.description) {
          return (
            <ProjectCard
              key={index}
              title={part.title}
              description={part.description}
            />
          );
        } else {
          return (
            <div key={index}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {part.content}
              </ReactMarkdown>
            </div>
          );
        }
      })}
    </div>
  );
}
