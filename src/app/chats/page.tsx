"use client";
import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";
import Sidebar from "@/assets/components/sidebar";
import Topbar from "@/assets/components/topbar";
import { useSidebarContext } from "@/assets/components/SidebarContext";
import { Suspense } from "react";
const ChatPage = () => {
  const { isShrunk } = useSidebarContext();
  useEffect(() => {
    createChat({
      // webhookUrl: 'https://gursagar.app.n8n.cloud/webhook/6f77413f-7659-4ae7-8bc7-c3ec85ae0f3d/chat', // Keep your original webhook URL or update if needed
      webhookUrl: "http://localhost:4000",
      webhookConfig: {
        method: "POST",
        headers: {},
      },
      target: "#n8n-chat",
      mode: "fullscreen", // Changed back to window as per previous update
      chatInputKey: "chatInput",
      chatSessionKey: "sessionId",
      metadata: {},
      showWelcomeScreen: false, // Set to false to use initialMessages directly
      defaultLanguage: "en",
      initialMessages: [
        // Customized initial messages
        "Welcome to GitFund Project Chat! 👋",
        "How can I help you with this project today?",
      ],
      i18n: {
        en: {
          title: "GitFund Project Assistant", // Customized title
          subtitle:
            "Ask me anything about this project's issues or contributions.", // Customized subtitle
          footer: "",
          getStarted: "New Conversation",
          inputPlaceholder: "Type your question..",
          closeButtonTooltip: "Close",
        },
      },
    });
  }, []);

  // Ensure you have a target element if using 'target' option
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div>
          <Sidebar />
          <div
            className={` ${
              isShrunk
                ? "ml-[4rem] w-[calc(100%_-_4rem)]"
                : "ml-[16rem] w-[calc(100%_-_16rem)]"
            }`}
          >
            <Topbar />
            <style jsx global>{`
              :root {
                /* Dark Theme Overrides for n8n Chat */
                --chat--color-primary: #bb86fc; /* Example: Purple accent */
                --chat--color-primary-shade-50: #a775e8;
                --chat--color-primary-shade-100: #9364d4;
                --chat--color-secondary: #1d1d1d; /* Example: Teal accent */
                --chat--color-secondary-shade-50: #03c4b1;
                --chat--color-white: #121212; /* Dark background */
                --chat--color-light: #0a0a0a; /* Slightly lighter dark background */
                --chat--color-light-shade-50: #ffffff;
                --chat--color-light-shade-100: #ffffff;
                --chat--color-medium: #4a4a4a; /* Medium gray for borders/dividers */
                --chat--color-dark: #ffffff; /* Light text color */
                --chat--color-disabled: #777777; /* Dimmed text */
                --chat--color-typing: #aaaaaa; /* Typing indicator color */

                /* Optional: Adjust spacing or border radius if needed */
                /* --chat--spacing: 1rem; */
                /* --chat--border-radius: 0.5rem; */
              }
            `}</style>
            <div
              id="n8n-chat"
              className={`z-10 mt-[70px]  h-[calc(100vh_-_70px)] ${
                isShrunk ? " w-[calc(100%)]" : " w-[calc(100%)]"
              }`}
            ></div>
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default ChatPage;
