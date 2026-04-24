"use client"

import { useState, useEffect, useCallback } from "react"
import type { ChatMessage } from "./use-groq-chat"

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
}

const STORAGE_KEY = "bindai-conversations"

function generateId() {
  return Math.random().toString(36).substring(2, 15)
}

function generateTitle(messages: ChatMessage[]): string {
  if (messages.length === 0) return "Nova conversa"
  
  const firstUserMessage = messages.find((m) => m.role === "user")
  if (!firstUserMessage) return "Nova conversa"
  
  const text = firstUserMessage.content
  return text.length > 40 ? text.substring(0, 40) + "..." : text
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[]
        setConversations(parsed)
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id)
        }
      } catch {
        console.error("Failed to parse conversations")
      }
    }
    setIsLoaded(true)
  }, [])

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    }
  }, [conversations, isLoaded])

  const currentConversation = conversations.find((c) => c.id === currentConversationId) || null

  const createNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: generateId(),
      title: "Nova conversa",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setConversations((prev) => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
    return newConversation.id
  }, [])

  const updateConversation = useCallback((id: string, messages: ChatMessage[]) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id
          ? {
              ...conv,
              messages,
              title: generateTitle(messages),
              updatedAt: Date.now(),
            }
          : conv
      )
    )
  }, [])

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id)
      if (currentConversationId === id) {
        setCurrentConversationId(filtered.length > 0 ? filtered[0].id : null)
      }
      return filtered
    })
  }, [currentConversationId])

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id)
  }, [])

  return {
    conversations,
    currentConversation,
    currentConversationId,
    isLoaded,
    createNewConversation,
    updateConversation,
    deleteConversation,
    selectConversation,
  }
}
