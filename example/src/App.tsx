import React from 'react'
import { Flex, ChakraProvider } from '@chakra-ui/react'
import { atom } from 'elementos'
import { useConstructor } from './react/useConstructor'
import { useObservable } from './react/useObservable'
import Folders from './Folders'
import Folder from './Folder'
import Note from './Note'
import { theme } from './theme'

const App = () => {
  const { selectedFolder$, selectedNote$ } = useConstructor(() => {
    const selectedFolder$ = atom<string | null>(null)
    const selectedNote$ = atom<number | null>(null)

    return {
      selectedFolder$,
      selectedNote$
    }
  })

  const selectedFolder = useObservable(selectedFolder$)
  const selectedNote = useObservable(selectedNote$)

  return (
    <ChakraProvider theme={theme}>
      <Flex h='100%' color='purple.700'>
        <Folders
          w={240}
          selectedFolder={selectedFolder}
          onFolderSelect={selectedFolder$.actions.set}
          borderRight='2px'
          borderColor='purple.300'
        />
        <Folder
          folder={selectedFolder}
          selectedNote={selectedNote}
          onNoteSelect={selectedNote$.actions.set}
          w={320}
          borderRight='2px'
          borderColor='purple.300'
        />
        <Note noteId={selectedNote || null} flex={1} />
      </Flex>
    </ChakraProvider>
  )
}

export default App
