"use client"

import { useState, useRef, useEffect } from "react"
import { useGroqChat, type ChatMessage } from "@/hooks/use-groq-chat"
import { Send, User, X, FileText, Image as ImageIcon, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { TypingIndicator } from "@/components/ui/typing-indicator" 
import ReactMarkdown from "react-markdown"

interface Attachment {
  id: string
  type: "image" | "file"
  name: string
  data: string 
  fileContent?: string
  preview?: string
}

interface ChatInterfaceProps {
  conversationId: string | null
  initialMessages: ChatMessage[]
  onMessagesChange: (messages: ChatMessage[]) => void
}

export function ChatInterface({ 
  conversationId, 
  initialMessages,
  onMessagesChange 
}: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const onMessagesChangeRef = useRef(onMessagesChange)
  const prevConversationIdRef = useRef(conversationId)

  onMessagesChangeRef.current = onMessagesChange

  const { messages, isLoading, sendMessage, setMessages } = useGroqChat({
    initialMessages,
    onFinish: (msgs) => {
      onMessagesChangeRef.current(msgs)
    },
  })

  useEffect(() => {
    if (conversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = conversationId
      setMessages(initialMessages)
      setAttachments([])
    }
  }, [conversationId, initialMessages, setMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const id = crypto.randomUUID()
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          setAttachments(prev => [...prev, { id, type: "image", name: file.name, data: base64, preview: base64 }])
        }
        reader.readAsDataURL(file)
      } else {
        const reader = new FileReader()
        reader.onload = (event) => {
          const content = event.target?.result as string
          setAttachments(prev => [...prev, { id, type: "file", name: file.name, data: file.name, fileContent: content }])
        }
        reader.readAsText(file)
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // NOVA FUNÇÃO: CAPTURAR CTRL+V (PASTE)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile()
        if (!file) continue

        const id = crypto.randomUUID()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          setAttachments(prev => [
            ...prev, 
            { 
              id, 
              type: "image", 
              name: `pasted-image-${Date.now()}.png`, 
              data: base64, 
              preview: base64 
            }
          ])
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && attachments.length === 0) || isLoading) return
    sendMessage(input, attachments.length > 0 ? attachments.map(a => ({ type: a.type, name: a.name, data: a.data, fileContent: a.fileContent })) : undefined)
    setInput("")
    setAttachments([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div 
      className="flex flex-col w-full h-full relative overflow-hidden bg-black"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('/bindback.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 45%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Área de Mensagens - Arrastável no Mobile */}
      <div className="flex-1 overflow-y-auto px-4 py-6 bg-transparent custom-scrollbar touch-pan-y overscroll-contain">
        <div className="mx-auto max-w-2xl space-y-6 pb-12">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-700">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 backdrop-blur-md ring-1 ring-primary/20 animate-in zoom-in duration-500">
                <img src="/iallogo.png" alt="BindAI" className="h-12 w-12 object-contain" />
              </div>
              <h2 className="mb-2 text-2xl font-bold tracking-tight text-foreground">BindAI</h2>
              <p className="max-w-xs text-sm text-muted-foreground leading-relaxed opacity-80">
                Estou aqui para responder suas curiosidades! Faça perguntas retire suas duvidas, estou aqui por <b>você</b>.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "animate-in fade-in duration-300"}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${message.role === "user" ? "bg-secondary" : "bg-primary"}`}>
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-foreground" />
                  ) : (
                    <img src="/ialogo.png" alt="BindAI" className="h-6 w-6 object-contain" />
                  )}
                </div>
                <div className={`flex-1 max-w-[88%] rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md ${
                  message.role === "user" 
                    ? "bg-primary/80 text-primary-foreground font-medium" 
                    : "bg-card/40 border border-white/10"
                }`}>
                  
                  {/* EXIBIÇÃO DA IMAGEM ENVIADA - CORREÇÃO DO ERRO TS(2339) */}
                  {message.attachments?.map((att: any, i: number) => att.type === "image" && (
                    <div key={i} className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
                      <img 
                        src={att.data || att.url} 
                        alt="Anexo de imagem" 
                        className="max-h-80 w-full object-contain pointer-events-none transition-opacity duration-500"
                        onLoad={(e) => (e.currentTarget.style.opacity = "1")}
                        style={{ opacity: 0 }}
                      />
                    </div>
                  ))}

                  <div className="prose prose-sm prose-invert max-w-none leading-relaxed break-words text-[15px]">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
                <img src="/iallogo.png" alt="BindAI" className="h-6 w-6 object-contain" />
              </div>
              <div className="bg-card/40 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/10">
                <TypingIndicator />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input - Fundo Preto Sólido */}
      <div className="bg-black border-t border-white/5 p-4 pb-[env(safe-area-inset-bottom,24px)] z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="mx-auto max-w-2xl">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2 animate-in slide-in-from-bottom-2 duration-300">
              {attachments.map((a) => (
                <div key={a.id} className="group relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 pr-8 shadow-md">
                  {a.type === "image" ? <ImageIcon className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-primary" />}
                  <span className="max-w-[120px] truncate text-xs font-medium text-foreground/80">{a.name}</span>
                  <button onClick={() => removeAttachment(a.id)} className="absolute right-1 top-1 p-1 text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="relative flex items-end gap-3">
            <input ref={fileInputRef} type="file" multiple accept="image/*,.txt,.json,.js,.ts,.tsx" onChange={handleFileSelect} className="hidden" />
            <div className="relative flex-1 group">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste} // <--- VINCULADO O EVENTO DE PASTE
                placeholder="Pergunte à BindAI..."
                rows={1}
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 pr-12 text-[16px] text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-0 transition-all min-h-[56px] max-h-[160px]"
                disabled={isLoading}
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-4 bottom-4 p-1 text-muted-foreground/60 hover:text-primary transition-colors focus:outline-none"
              >
                <Paperclip className="h-5 w-5" />
              </button>
            </div>
            <Button 
              type="submit" 
              disabled={(!input.trim() && attachments.length === 0) || isLoading} 
              className="h-[56px] w-[56px] shrink-0 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg active:scale-95 transition-all"
            >
              {isLoading ? <Spinner className="h-5 w-5 text-primary-foreground" /> : <Send className="h-5 w-5 text-primary-foreground" />}
            </Button>
          </form>
          <p className="mt-3 text-center text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold select-none">
              A BindAI pode cometer erros. Confira informações importantes
          </p>
        </div>
      </div>
    </div>
  )
}