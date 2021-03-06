import React, { FC } from 'react'
import debounce from 'lodash/debounce'
import { Textarea, Flex, FlexProps, Text } from '@chakra-ui/react'
import { molecule, observe, atom, batched } from 'elementos'
import { useConstructor } from './react/useConstructor'
import { createRequest$ } from './state/request'
import { useObservable } from './react/useObservable'
import Loader from './Loader'
import * as api from './api'

interface NoteProps extends FlexProps {
  noteId: number | null
}

const Note: FC<NoteProps> = ({ noteId, ...otherProps }) => {
  const { form$, fetchRequest$ } = useConstructor(
    ({ atoms, beforeUnmount }) => {
      const form$ = molecule(
        {
          title: atom(''),
          description: atom('')
        },
        {
          actions: ({ title, description }) => ({
            setData: batched((data: any) => {
              title.actions.set(data.title)
              description.actions.set(data.description)
            }),
            title,
            description
          })
        }
      )

      const debouncedUpdateNote = debounce(api.updateNote, 1000)

      const fetchRequest$ = createRequest$(api.fetchNote)
      const updateRequest$ = createRequest$(async (id, payload) => {
        debouncedUpdateNote(id, payload)
      })

      beforeUnmount(
        observe(atoms.noteId, (id) => {
          // whenever noteId changes via props, refetch note
          if (id) {
            fetchRequest$.actions.execute(id)
          }
        })
      )

      beforeUnmount(
        observe(fetchRequest$, ({ isFulfilled, data }) => {
          // whenever refetch succeeds, update the form data
          if (isFulfilled) {
            form$.actions.setData(data)
          }
        })
      )

      beforeUnmount(
        observe(form$, (form) => {
          // whenever form data changes, get note id and update note
          updateRequest$.actions.execute(atoms.noteId.get(), form)
        })
      )

      return {
        form$,
        fetchRequest$
      }
    },
    {
      noteId // track value of noteId over time as an atom
    }
  )

  const request = useObservable(fetchRequest$)
  const form = useObservable(form$)

  return (
    <Flex {...otherProps} direction='column' position='relative'>
      {noteId === null && (
        <Flex h='100%' direction='column' justify='center' align='center'>
          <img src='empty.svg' alt='No note selected' width='200' />
          <Text fontWeight='600' size='xl' p='4'>
            No note selected
          </Text>
        </Flex>
      )}
      {noteId && (
        <>
          <Loader active={request.isPending} />
          {request.isFulfilled && (
            <>
              <Textarea
                value={form.title}
                onChange={(e) => {
                  form$.actions.title.actions.set(e.target.value)
                }}
                resize='none'
                rounded='0'
                p={2}
                display='block'
                focusBorderColor='transparent'
                boxSizing='border-box'
                size='lg'
                fontStyle='bold'
                minHeight='64px'
                border='none'
              />
              <Flex borderBottom='2px' borderBottomColor='purple.300' />
              <Textarea
                value={form.description}
                onChange={(e) => {
                  form$.actions.description.actions.set(e.target.value)
                }}
                flex='1'
                resize='none'
                rounded='0'
                p={2}
                display='block'
                focusBorderColor='transparent'
                boxSizing='border-box'
                size='sm'
                border='none'
              />
            </>
          )}
        </>
      )}
    </Flex>
  )
}

export default Note
