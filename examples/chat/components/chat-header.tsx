"use client"

import { useRouter } from "next/navigation"
import { useEffectiveSession } from '@/hooks/use-effective-session'

import { ModelSelector } from "@/components/model-selector"
import { SidebarToggle } from "@/components/sidebar-toggle"
import { Button } from "@/components/ui/button"
import { GitHubButton } from "@/components/github-button"
import { memo } from "react"
import { PlusIcon } from "./icons"
import { useSidebar } from "./ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

function PureChatHeader({
  chatId,
  selectedModelId,
  isReadonly,
}: {
  chatId: string
  selectedModelId: string
  isReadonly: boolean
}) {
  const router = useRouter()
  const { open } = useSidebar()
  const { data: session } = useEffectiveSession()
  const isSignedIn = !!session?.user

  // Don't render the header for signed-out users
  if (!isSignedIn) {
    return null
  }

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-start px-2 md:px-2 gap-2">
      {/* Always show sidebar toggle */}
      <div className="mt-1">
        <SidebarToggle />
      </div>

      {/* Mobile layout: Show controls in left-to-right order with new chat button on the right */}
      {!isReadonly && (
        <div className="mt-1 md:hidden">
          <ModelSelector
            selectedModelId={selectedModelId}
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
            <Button
              variant="outline"
              className={`md:px-2 md:h-fit ${
                open ? 'md:hidden' : 'md:flex'
              }`}
              onClick={() => {
                router.push("/")
                router.refresh()
              }}
            >
              <PlusIcon size={16} />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
      </div>

      {/* Desktop layout: Show controls after new chat button */}
      {!isReadonly && (
        <div className="mt-1 hidden md:block">
          <ModelSelector
            selectedModelId={selectedModelId}
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
  )
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId
})
