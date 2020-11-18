import React from 'react'
import { Flex, ChakraProvider } from '@chakra-ui/react'
import { atom } from 'elementos'
import { useInit } from './react/useInit'
import { useObservable } from './react/useObservable'
// import { createRequest } from './state/request'
// import { createPagination } from './state/pagination'
import Folders from './Folders'
import Folder from './Folder'
import Note from './Note'
import { theme } from './theme'
import * as api from './api'

const App = () => {
  const { selectedFolder$, selectedNote$ } = useInit(() => {
    const selectedFolder$ = atom<string | null>(null)
    const selectedNote$ = atom<api.Note | null>(null)

    return {
      selectedFolder$,
      selectedNote$
    }
  })

  const selectedFolder = useObservable(selectedFolder$)
  const selectedNote = useObservable(selectedNote$)

  return (
    <ChakraProvider theme={theme}>
      <Flex h='100%'>
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
        <Note noteId={selectedNote?.id || null} flex={1} />
      </Flex>
    </ChakraProvider>
  )
}

export default App
