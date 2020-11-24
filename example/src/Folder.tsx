import React, { FC } from 'react'
import { Stack, StackProps, List } from '@chakra-ui/react'
import { observe } from 'elementos'
import { useConstructor } from './react/useConstructor'
import { createRequest$ } from './state/request'
import { useObservable } from './react/useObservable'
import Loader from './Loader'
import ListItem from './ListItem'
import * as api from './api'

interface FolderProps extends StackProps {
  folder: string | null
  selectedNote: number | null
  onNoteSelect: (noteId: number) => void
}

const Folder: FC<FolderProps> = ({
  folder,
  selectedNote,
  onNoteSelect,
  ...otherProps
}) => {
  const { request$ } = useConstructor(
    ({ atoms, beforeUnmount }) => {
      const request$ = createRequest$(api.fetchNotes)
      beforeUnmount(
        observe(atoms.folder, (folder) => {
          request$.actions.execute({ folder })
        })
      )
      return {
        request$
      }
    },
    {
      folder
    }
  )

  const request = useObservable(request$)

  return (
    <Stack {...otherProps} position='relative'>
      <Loader active={request.isPending} />
      <List h='100%' overflow='auto'>
        {request.data?.map((note) => (
          <ListItem
            key={note.id}
            onClick={() => {
              onNoteSelect(note.id)
            }}
            active={selectedNote === note.id}
            title={note.title}
            description={note.description}
          />
        ))}
      </List>
    </Stack>
  )
}

export default Folder
