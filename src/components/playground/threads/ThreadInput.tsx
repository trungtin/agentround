import { Input, Button, IconButton, ButtonGroup } from '@chakra-ui/react'
import { useRef, useState } from 'react'

import { FiPlayCircle, FiPaperclip } from 'react-icons/fi'

function ThreadInput(props: {}) {
  const [input, setInput] = useState('')
  const [files, addFiles] = useState<File[]>([])
  const sendDisabled = !input

  return (
    <div className="space-y-2">
      <Input
        placeholder="Enter your message...."
        border="none"
        onChange={(e) => {
          setInput(e.target.value)
        }}
      ></Input>
      <ButtonGroup size="sm" className="flex space-x-2">
        <Button
          colorScheme="green"
          leftIcon={<FiPlayCircle />}
          isDisabled={sendDisabled}
        >
          Add and run
        </Button>
        <Button isDisabled={sendDisabled}>Add</Button>
        <label>
          <IconButton
            icon={<FiPaperclip />}
            aria-label="Attach file"
            as="span"
          />
          <input
            type="file"
            onChange={(e) => {
              const fileList = e.target.files
              if (fileList) {
                const filesArray = Array.from(fileList)
                addFiles((prevFiles) => [...prevFiles, ...filesArray])
              }
            }}
            multiple
            style={{ display: 'none' }}
          />
        </label>
      </ButtonGroup>
    </div>
  )
}

export default ThreadInput
