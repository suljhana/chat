"use client"

import { useRouter } from "next/navigation"

import { ModelSelector } from "@/components/model-selector"
import { Button } from "@/components/ui/button"
import { GitHubButton } from "@/components/github-button"
import { memo } from "react"
import { PlusIcon } from "./icons"

import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "./ui/tooltip"

function PureChatHeader({
  chatId,
  selectedModelId,
  setSelectedModel,
  isReadonly,
}: {
  chatId: string
  selectedModelId: string
  setSelectedModel: (modelId: string) => void
  isReadonly: boolean
}) {
  const router = useRouter()
  

  return (
    <TooltipProvider>
      <header className="flex sticky top-0 bg-background py-1.5 items-start px-2 md:px-2 gap-2">
      {/* Always show sidebar toggle */}


      {/* Mobile layout: Show controls in left-to-right order with new chat button on the right */}
      {!isReadonly && (
        <div className="mt-1 md:hidden">
          <ModelSelector
            selectedModelId={selectedModelId}
            setSelectedModel={setSelectedModel}
            className=""
          />
        </div>
      )}


      {/* Spacer to push new chat button to the right on mobile */}
      <div className="flex-1 md:hidden"></div>

      {/* Mobile new chat button - positioned on the right with full text */}
      <div className="mt-1 md:hidden ml-auto">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="px-2"
              onClick={() => {
                router.push("/")
                router.refresh()
              }}
            >
              <PlusIcon size={16} />
              <span>New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </div>

      {/* Desktop new chat button - hidden when sidebar is open to avoid overlap */}
      <div className="mt-1 hidden md:block">
        <Tooltip>
          <TooltipTrigger asChild>

          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </div>

      {/* Desktop layout: Show controls after new chat button */}
      {!isReadonly && (
        <div className="mt-1 hidden md:block">
          <ModelSelector
            selectedModelId={selectedModelId}
            setSelectedModel={setSelectedModel}
            className=""
          />
        </div>
      )}


      {/* Spacer to push GitHub button to the right on desktop */}
      <div className="flex-1 hidden md:block"></div>

      <div className="mt-1">
        <GitHubButton className="hidden md:flex ml-auto" />
      </div>
    </header>
    </TooltipProvider>
  )
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId
})
