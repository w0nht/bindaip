/**
 * BindAI Chat API
 * Uses Groq API directly via fetch - NO AI SDK dependencies
 * Model: llama-4-scout-17b-16e-instruct (Vision)
 * Optimization: High precision sampling to prevent skipping letters/words.
 */

export const maxDuration = 60
export const dynamic = 'force-dynamic'

type MessageContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>

interface GroqMessage {
  role: 'user' | 'assistant' | 'system'
  content: MessageContent
}

interface IncomingPart {
  type: string
  text?: string
  image?: string
  fileType?: string
  fileName?: string
  fileContent?: string
}

interface IncomingMessage {
  role: string
  parts?: IncomingPart[]
}

const SYSTEM_PROMPT = `Você é a BindAI, uma assistente de inteligência artificial avançada criada pela bind IT. 

Sua missão é ajudar os usuários com qualquer dúvida ou tarefa, sempre de forma clara, objetiva e profissional.

Características da sua personalidade:
- Você é amigável, prestativa e profissional.
- Responde na linguagem que o usuário usar, preferencialmente português do Brasil.
- ESCREVA COM PRECISÃO ABSOLUTA: Não pule letras, não omita palavras e mantenha a gramática perfeita.
- Quando não souber algo, admite honestamente.
- Mantém respostas concisas mas completas.
- Tem um toque de humor leve quando apropriado, mas sempre respeitoso.
- Toda vez que te pedirem para analisar algo, faça resumidamente, e sempre pergunte se o usuário quer uma análise mais detalhada.
- O CEO da Bind IT é o Wanderson Dias, então trate-o com respeito. Mas não precisa puxar saco.
- Se pedirem para editar uma imagem, responda que não pode editar imagens, mas pode analisar e comentar sobre elas.
- Usa formatação markdown quando apropriado para melhorar a legibilidade.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'GROQ_API_KEY não configurada' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const hasImages = messages.some((msg: IncomingMessage) => 
      msg.parts?.some((p: IncomingPart) => p.type === 'image')
    )

    const groqMessages: GroqMessage[] = messages.map((msg: IncomingMessage) => {
      const textContent = msg.parts
        ?.filter((p: IncomingPart) => p.type === 'text')
        .map((p: IncomingPart) => p.text || '')
        .join('') || ''
      
      const imageParts = msg.parts?.filter((p: IncomingPart) => p.type === 'image') || []
      const fileParts = msg.parts?.filter((p: IncomingPart) => p.type === 'file') || []

      if (imageParts.length > 0) {
        const content: Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }> = []
        
        if (textContent) {
          content.push({ type: 'text', text: textContent })
        } else {
          content.push({ type: 'text', text: "Analise esta imagem detalhadamente." })
        }

        for (const img of imageParts) {
          const base64Image = img.image;
          if (base64Image) {
            content.push({
              type: 'image_url',
              image_url: { url: base64Image }
            })
          }
        }

        return { role: msg.role as 'user' | 'assistant', content }
      }

      let finalContent = textContent
      if (fileParts.length > 0) {
        const fileContents = fileParts
          .map((f: IncomingPart) => `\n\n--- Arquivo: ${f.fileName} ---\n${f.fileContent}`)
          .join('')
        finalContent = textContent + fileContents
      }

      return { role: msg.role as 'user' | 'assistant', content: finalContent }
    })

    const model = hasImages 
      ? 'meta-llama/llama-4-scout-17b-16e-instruct' 
      : 'llama-3.3-70b-versatile'

    const systemMessage: GroqMessage = { role: 'system', content: SYSTEM_PROMPT }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [systemMessage, ...groqMessages],
        stream: true,
        temperature: 0.1, // Reduzido drasticamente para evitar instabilidade na escrita
        top_p: 0.95,      // Mantém a fluidez sem sacrificar a precisão
        max_tokens: 4096,
        frequency_penalty: 0.2, // desencoraja o modelo de repetir tokens de forma errática
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Falha ao obter resposta da IA' }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}