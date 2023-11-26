import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
} from '@chakra-ui/react'

import Image from 'next/image'
import { useState } from 'react'
import { FiArrowLeft, FiCheckCircle, FiInfo } from 'react-icons/fi'

import { useAuth } from '@/context/AuthProvider'
import { useFetcher } from '@/context/swr'
import { APIError } from '@/utils/errors'
import { useForm } from 'react-hook-form'

function Item({
  children,
  good,
  className,
}: {
  children: React.ReactNode
  good?: boolean
  className?: string
}) {
  return (
    <GridItem className={`flex flex-row items-center ${className || ''}`}>
      <FiCheckCircle
        className={`mr-2 shrink-0 ${good ? 'text-green-500' : 'text-gray-500'}`}
      />

      {children}
    </GridItem>
  )
}

function ModeSelectContent({
  selectMode,
}: {
  selectMode: (mode: 'chatgpt' | 'openai') => void
}) {
  return (
    <ModalContent>
      <ModalHeader className="text-center">Select API Mode</ModalHeader>

      <ModalBody>
        <Grid
          templateColumns="repeat(2, 1fr)"
          columnGap={4}
          className="pb-10 md:p-10 md:!pt-4"
        >
          <GridItem className="pb-4">
            <button
              className="flex w-full justify-center rounded-lg py-4 hover:bg-gray-200"
              onClick={() => selectMode('chatgpt')}
            >
              <figure>
                <Image
                  src="/chatgpt_api.svg"
                  alt="ChatGPT"
                  width={96}
                  height={96}
                />
                <figcaption className="mt-1 text-sm font-semibold">
                  ChatGPT API
                </figcaption>
              </figure>
            </button>
          </GridItem>
          <GridItem className="pb-4">
            <button
              className="flex w-full justify-center rounded-lg py-4 hover:bg-gray-200"
              onClick={() => selectMode('openai')}
            >
              <figure>
                <Image
                  src="/openai_api.svg"
                  alt="OpenAI"
                  width={96}
                  height={96}
                />
                <figcaption className="mt-1 text-sm font-semibold">
                  OpenAI API
                </figcaption>
              </figure>
            </button>
          </GridItem>
          <Item good>Free</Item>
          <Item good className="flex flex-row">
            Free
            <div className="ml-1">
              <Tooltip
                label="This app is free to use, you only need to pay to OpenAI for the token usage."
                fontSize="md"
              >
                <span>
                  <FiInfo />
                </span>
              </Tooltip>
            </div>
          </Item>
          <Item good>GPT-4 (ChatGPT Plus)</Item>
          <Item good>GPT-4 available</Item>
          <Item>Less robust</Item>
          <Item good>More robust</Item>
          <Item>Plugin system</Item>
          <Item good>Plugin system (upcoming)</Item>
        </Grid>
      </ModalBody>
    </ModalContent>
  )
}

function ModeChatGPTContent({ selectMode }) {
  return (
    <ModalContent>
      <div className="absolute left-2 top-3">
        <IconButton
          icon={<FiArrowLeft />}
          aria-label="Go back"
          size="sm"
          variant="ghost"
          onClick={() => selectMode()}
        />
      </div>
      <ModalHeader className="text-center">ChatGPT API Mode</ModalHeader>
      <ModalBody>
        <div className="pb-10 md:p-10 md:pt-4">
          <p className="text-center">
            Thank you for your interest in ChatGPT API mode. This feature is
            currently in development and will be available soon.
          </p>
        </div>
      </ModalBody>
    </ModalContent>
  )
}
function ModeOpenAIContent({ selectMode }) {
  const { token, addToken } = useAuth()
  const { register, handleSubmit, formState, setError } = useForm({
    defaultValues: { token },
  })
  const fetcher = useFetcher()
  const onSubmit = handleSubmit(async (data) => {
    try {
      await fetcher(
        '/api/models',
        {},
        { headers: { Authorization: `Bearer ${data.token}` } }
      )
      addToken(data.token)
    } catch (error) {
      if (error instanceof APIError && error.status === 401) {
        setError('token', { message: 'Invalid token' })
        return
      }
      throw error
    }
  })

  return (
    <ModalContent>
      <form onSubmit={onSubmit}>
        <div className="absolute left-2 top-3">
          <IconButton
            icon={<FiArrowLeft />}
            aria-label="Go back"
            size="sm"
            variant="ghost"
            onClick={() => selectMode()}
          />
        </div>
        <ModalHeader className="text-center">OpenAI API Mode</ModalHeader>

        <ModalBody>
          <div className="">
            <p className="">
              You can get your API token from the{' '}
              <a
                href="https://beta.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap font-medium hover:underline"
              >
                OpenAI dashboard
              </a>
              . All requests are made on the client side, so your token is never
              sent to the server. If you would like more information look at the{' '}
              <a
                href="https://github.com/trungtin/agents-playground"
                target="_blank"
                rel="noreferrer"
                className="whitespace-nowrap font-medium hover:underline"
              >
                Github Repository
              </a>
              !
            </p>

            <div className="mt-4 flex flex-col items-end space-x-2">
              <FormControl isRequired isInvalid={!!formState.errors.token}>
                <div className="flex flex-row items-center">
                  <FormLabel>Token</FormLabel>
                  <Input
                    {...register('token')}
                    placeholder="sk-NhU98cac878..."
                    size="md"
                  />
                </div>
                <FormErrorMessage>
                  {formState.errors.token?.message}
                </FormErrorMessage>
              </FormControl>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="!pt-0">
          <Button
            type="submit"
            colorScheme="green"
            className="mt-2"
            size="md"
            isLoading={formState.isSubmitting}
          >
            Save
          </Button>
        </ModalFooter>
      </form>
    </ModalContent>
  )
}

function PlaygroundModeSelector(props: {}) {
  const { token } = useAuth()
  const [mode, selectMode] = useState<'chatgpt' | 'openai' | undefined>()
  return (
    <Modal isOpen={!token} onClose={() => {}} size="xl">
      <ModalOverlay />
      {mode == undefined ? (
        <ModeSelectContent selectMode={selectMode} />
      ) : mode === 'chatgpt' ? (
        <ModeChatGPTContent selectMode={selectMode} />
      ) : (
        <ModeOpenAIContent selectMode={selectMode} />
      )}
    </Modal>
  )
}

export default PlaygroundModeSelector
