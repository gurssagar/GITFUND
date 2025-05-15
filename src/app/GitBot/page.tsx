"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Suspense } from "react";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from '@/assets/components/SidebarContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Page() {
  const { isShrunk } = useSidebarContext();
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/rag",
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [urlPreviews, setUrlPreviews] = useState<Record<string, { title: string, description: string, image?: string }>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  // Enhanced emoji regex that catches common emoji patterns
  const emojiRegex = /(:[\w+-]+:|\p{Emoji}|\p{Emoji_Presentation}|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Component})/gu;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
    // Reset copied code indicator after 2 seconds
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000);
      return () => clearTimeout(timer);
    }

    // Extract URLs from new messages to fetch previews
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urls = lastMessage.content.match(urlRegex) || [];
      
      urls.forEach(async (url) => {
        // Skip if we already have this preview
        if (urlPreviews[url]) return;
        
        try {
          // Mock URL preview data - in a real app you would fetch this
          setUrlPreviews(prev => ({
            ...prev,
            [url]: {
              title: url.split('/').pop() || 'Link',
              description: 'Click to open this link',
              image: url.includes('github') ? '/github-icon.png' : undefined
            }
          }));
        } catch (error) {
          console.error('Failed to fetch URL preview:', error);
        }
      });
    }
  }, [messages, copiedCode]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() === "") return;
    handleSubmit(e);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Suspense>
      <div className="flex">
        <Sidebar />
        <div
          className={` ${isShrunk ? "ml-[4rem] w-[calc(100%_-_4rem)]" : "ml-[16rem] w-[calc(100%_-_16rem)]"}`}
        >
          <Topbar />

          <div className="flex pt-16">
            <div className="container mx-auto px-4 py-8 ">
              <Card className="w-full ">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-primary">Git</span>Bot
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Your AI-powered assistant for Git repositories and code
                    questions
                  </p>
                </CardHeader>
                <CardContent className="p-4 h-[calc(100vh-40vh)] overflow-hidden">
                  <div className="space-y-4 mb-4 max-h-[60vh] overflow-y-auto pr-2">
                    {messages.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground flex flex-col items-center gap-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-primary/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p>
                          Ask GitBot a question about your repositories, code,
                          or git commands.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm max-w-md">
                          <div className="bg-secondary/50 p-2 rounded-md">
                            "How do I rebase my branch?"
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-md">
                            "Explain the git workflow"
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-md">
                            "How to undo a commit?"
                          </div>
                          <div className="bg-secondary/50 p-2 rounded-md">
                            "What's the difference between merge and rebase?"
                          </div>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex flex-col p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-secondary text-secondary-foreground ml-auto max-w-[80%]"
                              : "bg-muted text-foreground mr-auto max-w-[80%]"
                          }`}
                        >
                          <div className="mb-1 text-xs font-semibold">
                            {message.role === "user" ? "You" : "GitBot"}
                          </div>
                          <div className="whitespace-pre-wrap break-words prose dark:prose-invert prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-pre:my-2 prose-pre:bg-secondary/30 prose-pre:p-2 prose-pre:rounded max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({...props}: any) => <h1 className="text-xl font-bold text-primary border-b border-primary/20 pb-1" {...props} />,
                                h2: ({...props}: any) => <h2 className="text-lg font-bold text-primary/90 border-b border-primary/10 pb-1" {...props} />,
                                h3: ({...props}: any) => <h3 className="text-md font-bold text-primary/80" {...props} />,
                                h4: ({...props}: any) => <h4 className="text-base font-semibold text-primary/70" {...props} />,
                                h5: ({...props}: any) => <h5 className="text-sm font-semibold text-primary/60" {...props} />,
                                h6: ({...props}: any) => <h6 className="text-xs font-semibold text-primary/50" {...props} />,
                                a: ({href, children, ...props}: any) => {
                                  const isExternal = href?.startsWith('http');
                                  const preview = href && urlPreviews[href];
                                  
                                  return (
                                    <>
                                      <a 
                                        className="text-blue-400 hover:text-blue-300 underline transition-colors flex items-center gap-1" 
                                        target={isExternal ? "_blank" : undefined} 
                                        rel={isExternal ? "noopener noreferrer" : undefined} 
                                        href={href} 
                                        {...props}
                                      >
                                        {children}
                                        {isExternal && (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" y1="14" x2="21" y2="3"></line>
                                          </svg>
                                        )}
                                      </a>
                                      {preview && (
                                        <div className="mt-2 mb-3 border border-primary/20 rounded-md p-2 hover:bg-secondary/30 transition-colors">
                                          <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 no-underline text-foreground">
                                            {preview.image && (
                                              <div className="shrink-0 w-12 h-12 bg-secondary flex items-center justify-center rounded">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                  <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"></path>
                                                  <line x1="8" y1="12" x2="16" y2="12"></line>
                                                </svg>
                                              </div>
                                            )}
                                            <div className="flex-1 overflow-hidden">
                                              <div className="font-medium truncate">{preview.title}</div>
                                              <div className="text-xs text-muted-foreground">{preview.description}</div>
                                            </div>
                                          </a>
                                        </div>
                                      )}
                                    </>
                                  );
                                },
                                p: ({...props}: any) => <p className="my-1" {...props} />,
                                ul: ({...props}: any) => <ul className="list-disc pl-5 my-1 space-y-1" {...props} />,
                                ol: ({...props}: any) => <ol className="list-decimal pl-5 my-1 space-y-1" {...props} />,
                                li: ({...props}: any) => <li className="my-0.5" {...props} />,
                                blockquote: ({...props}: any) => <blockquote className="border-l-4 border-primary/30 pl-4 italic my-2" {...props} />,
                                hr: ({...props}: any) => <hr className="border-t border-primary/20 my-3" {...props} />,
                                table: ({...props}: any) => <div className="overflow-x-auto my-2"><table className="border-collapse table-auto w-full text-sm" {...props} /></div>,
                                th: ({...props}: any) => <th className="border border-primary/20 bg-secondary/30 px-3 py-1 text-left" {...props} />,
                                td: ({...props}: any) => <td className="border border-primary/10 px-3 py-1" {...props} />,
                                img: ({...props}: any) => <img className="rounded-md max-w-full my-2" {...props} />,
                                code: ({inline, className, children, ...props}: any) => {
                                  if (inline) {
                                    return <code className="bg-secondary/30 px-1 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>
                                  }
                                  const codeString = String(children).replace(/\n$/, '');
                                  const isCopied = copiedCode === codeString;
                                  
                                  const handleCopy = () => {
                                    navigator.clipboard.writeText(codeString);
                                    setCopiedCode(codeString);
                                  };
                                  
                                  return (
                                    <pre className="overflow-x-auto rounded bg-secondary/30 p-2 text-sm font-mono relative group">
                                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={handleCopy}
                                          className="bg-primary/10 hover:bg-primary/20 rounded p-1 transition-colors"
                                          title="Copy code"
                                        >
                                          {isCopied ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                            </svg>
                                          )}
                                        </button>
                                      </div>
                                      <code className={className} {...props}>{children}</code>
                                    </pre>
                                  )
                                }
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <form
                    onSubmit={onSubmit}
                    className="flex w-full gap-2 relative"
                  >
                    <Input
                      name="prompt"
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Type your question and press Enter..."
                      className="flex-1"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || input.trim() === ""}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {isLoading ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
