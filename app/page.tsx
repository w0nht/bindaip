"use client"

import { useState, useCallback, useEffect } from "react"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { ChatSidebar } from "@/components/chat-sidebar"
import { useConversations } from "@/hooks/use-conversations"
import type { ChatMessage } from "@/hooks/use-groq-chat"

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    conversations,
    currentConversation,
    currentConversationId,
    isLoaded,
    createNewConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
  } = useConversations()

  const handleNewChat = useCallback(() => {
    createNewConversation()
  }, [createNewConversation])

  const handleMessagesChange = useCallback(
    (messages: ChatMessage[]) => {
      if (currentConversationId) {
        updateConversation(currentConversationId, messages)
      }
    },
    [currentConversationId, updateConversation]
  )

  useEffect(() => {
    if (isLoaded && conversations.length === 0 && !currentConversationId) {
      createNewConversation()
    }
  }, [isLoaded, conversations.length, currentConversationId, createNewConversation])

  if (!isLoaded) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-black">
        <div className="text-muted-foreground animate-pulse text-xs tracking-widest uppercase">Carregando BindAI...</div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex h-[100dvh] w-screen overflow-hidden bg-black text-foreground antialiased">
      <ChatSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="relative flex min-w-0 flex-1 flex-col bg-black">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        {/* mt-16 compensa a altura do Header e o main preenche o resto sem scroll externo */}
        <main className="relative flex flex-1 flex-col overflow-hidden bg-black mt-16">
          <ChatInterface
            conversationId={currentConversationId}
            initialMessages={currentConversation?.messages || []}
            onMessagesChange={handleMessagesChange}
          />
        </main>
      </div>
    </div>
  )
}