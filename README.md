# 🪐 BindAI - Seu Assistente Inteligente

<div align="center">
  <img src="./public/pnglogo.png" alt="BindAI Logo" height="120">
  <br>
  <p>Uma interface de chat moderna alimentada por Llama 3 via Groq API.</p>
</div>

---

## 📌 Sobre o Projeto

O **BindAI** é uma aplicação de chat com Inteligência Artificial, projetada para oferecer respostas rápidas, precisas e contextuais. Ele utiliza o modelo de linguagem **Llama 3** (da Meta) hospedado na infraestrutura da **Groq**, que é conhecida por sua velocidade de inferência extremamente baixa (baixa latência).

Esta aplicação permite que usuários interajam com a IA em uma interface escura e minimalista, focada na experiência de conversação.

## 🛠️ Stacks Utilizadas

### Front-end
- **Next.js 14+** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS** (para estilização rápida e responsiva)
- **Ícones:** Lucide React

### Back-end e IA
- **Groq API** (Para integração com Llama 3)
- **Fetch API / Node.js API Routes** (Para comunicação assíncrona segura com a API)

### Outros
- **Desenvolvido por:** [bind IT](https://bindit.com.br)

## 📁 Estrutura do Projeto

A estrutura segue o padrão moderno do Next.js com App Router.

**O CODIGO É TOTALMENTE OPENSOURCE. PODENDO SER MODIFICADO. ENTRETANTO PARA QUAISQUER FINS COMERCIAIS. TODAS AS LOGOS DA BIND AI E BINDIT, DEVEM SER REMOVIDAS. DENTRO DA PASTA "public". PROTEGENDO OS DIREITOS AUTORAIS DA EMPRESA.

```text
bindai/
├── app/                 # Core da aplicação (App Router)
│   ├── api/             # Rotas da API para fetch seguro da Groq
│   │   └── chat/        # Endpoint que processa o chat
│   ├── chat/            # Página do chat principal
│   ├── globals.css      # Estilos globais e Tailwind config
│   ├── layout.tsx       # Layout principal com Providers
│   └── page.tsx         # Página de boas-vindas / login
├── components/          # Componentes React reutilizáveis
│   ├── chat-input.tsx   # O campo de entrada de texto
│   ├── chat-message.tsx # Componente para exibir mensagens
│   └── sidebar.tsx      # Barra lateral com histórico
├── hooks/               # Hooks customizados para chat e estado
├── lib/                 # Configurações utilitárias (ex: groq-client)
├── public/              # Arquivos estáticos (Logos, fundo, etc)
├── .env                 # Variáveis de ambiente (IGNORADO NO GIT)
└── tailwind.config.ts   # Configuração avançada de temas e cores
