import { Assistants } from '@/types'
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react'
import { FiMoreVertical, FiTrash2, FiFilePlus } from 'react-icons/fi'

function ThreadTitle(props: { assistant: Assistants.Assistant | undefined }) {
  return (
    <div>
      <span className="text-xs font-bold uppercase">
        {props.assistant?.name || 'Thread'}
      </span>
    </div>
  )
}

function ThreadActions(props: {}) {
  return (
    <div>
      <Menu>
        <MenuButton
          size={'sm'}
          as={IconButton}
          aria-label="Options"
          icon={<FiMoreVertical />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<FiFilePlus />}>New Thread</MenuItem>
          <MenuItem icon={<FiTrash2 />}>Delete</MenuItem>
        </MenuList>
      </Menu>
    </div>
  )
}

function ThreadHeader(props: { assistant: Assistants.Assistant | undefined }) {
  return (
    <div>
      <div className="flex flex-row justify-between">
        <ThreadTitle assistant={props.assistant}></ThreadTitle>
        <ThreadActions></ThreadActions>
      </div>
    </div>
  )
}

export default ThreadHeader
