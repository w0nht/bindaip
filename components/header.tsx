import { Menu, ArrowLeft } from "lucide-react" // Adicionei o ArrowLeft
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="absolute top-0 right-0 left-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="shrink-0 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4"> {/* Aumentei o gap para o botão caber melhor */}
            {/* LOGO DA BIND IT */}
            <div className="flex items-center h-10">
              <img 
                src="/pnglogo.png" 
                alt="Bind IT" 
                className="h-8 w-auto object-contain" 
              />
            </div>

            {/* BOTÃO VOLTAR PARA HOME */}
            <a 
              href="https://bindit.com.br" 
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors border-l border-border pl-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </a>
          </div>
        </div>

        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
          Powered by bindIT
        </span>
      </div>
    </header>
  )
}