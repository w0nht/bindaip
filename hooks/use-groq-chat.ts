"use client"

import { useState, useCallback, useRef } from "react"

export interface MessagePart {
  type: "text" | "image" | "file"
  text?: string
  image?: string // base64 data URL
  fileName?: string
  fileType?: string
  fileContent?: string // text content for text files
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  parts?: MessagePart[]
  attachments?: Array<{
    type: "image" | "file"
    name: string
    url?: string
  }>
}

interface UseGroqChatOptions {
  initialMessages?: ChatMessage[]
  onFinish?: (messages: ChatMessage[]) => void
}

export function useGroqChat({ initialMessages = [], onFinish }: UseGroqChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (
    content: string, 
    attachments?: Array<{ type: "image" | "file"; name: string; data: string; fileContent?: string }>
  ) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return

    // Build message parts
    const parts: MessagePart[] = []
    
    if (content.trim()) {
      parts.push({ type: "text", text: content.trim() })
    }

    if (attachments) {
      for (const attachment of attachments) {
        if (attachment.type === "image") {
          parts.push({ 
            type: "image", 
            image: attachment.data 
          })
        } else {
          parts.push({ 
            type: "file", 
            fileName: attachment.name,
            fileContent: attachment.fileContent || ""
          })
        }
      }
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      parts,
      attachments: attachments?.map(a => ({ 
        type: a.type, 
        name: a.name,
        url: a.type === "image" ? a.data : undefined
      })),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    setError(null)

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            parts: m.parts || [{ type: "text", text: m.content }],
          })),
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to get response")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const decoder = new TextDecoder()
      let assistantContent = ""

      // Add empty assistant message
      setMessages([...updatedMessages, assistantMessage])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") continue

            try {
              const json = JSON.parse(data)
              const content = json.choices?.[0]?.delta?.content
              if (content) {
                assistantContent += content
                setMessages([
                  ...updatedMessages,
                  { ...assistantMessage, content: assistantContent },
                ])
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      const finalMessages = [
        ...updatedMessages,
        { ...assistantMessage, content: assistantContent },
      ]
      setMessages(finalMessages)
      onFinish?.(finalMessages)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return
      }
      setError(err instanceof Error ? err : new Error("Unknown error"))
      console.error("Chat error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [messages, onFinish])

  const reset = useCallback((newMessages: ChatMessage[] = []) => {
    setMessages(newMessages)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    setMessages: reset,
  }
}
