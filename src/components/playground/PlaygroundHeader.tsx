import { useOpenAI } from '@/context/OpenAIProvider'
import { Link } from '@chakra-ui/next-js'

import React from 'react'
import { MdChatBubbleOutline } from 'react-icons/md'
import AddTokenModal from './../auth/AddTokenModal'
import { Button, IconButton } from '@chakra-ui/react'

type Props = { rightActions?: React.ReactNode }

export default function Header({ rightActions }: Props) {
  const { conversationId } = useOpenAI()

  return (
    <div className="z-50 flex h-[52px] flex-row items-center justify-between border-b border-gray-300 bg-white px-4">
      <span className="text-lg font-bold">AgentѺ</span>

      <div className="flex flex-row gap-x-4">
        {/* <Button
          href={conversationId ? '/chat/' + conversationId : '/'}
          as={Link}
          size="sm"
          variant="outline"
        >
          <MdChatBubbleOutline />
        </Button> */}
        <AddTokenModal className="py-2" />
        {rightActions}
      </div>
    </div>
  )
}
