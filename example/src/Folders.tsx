import React, { FC } from 'react'
import { Stack, StackProps, List } from '@chakra-ui/react'
import { useInit } from './react/useInit'
import { createRequest } from './state/request'
import { useObservable } from './react/useObservable'
import Loader from './Loader'
import ListItem from './ListItem'
import * as api from './api'

interface FoldersProps extends StackProps {
  selectedFolder: string | null
  onFolderSelect: (folder: string) => void
}

const Folders: FC<FoldersProps> = ({
  selectedFolder,
  onFolderSelect,
  ...otherProps
}) => {
  // initializer runs only once on first render
  const { request$ } = useInit(() => {
    const { execute, request$ } = createRequest(api.fetchFolders)
    execute()
    return {
      request$
    }
  })

  // request$ observable is translated to react state
  const request = useObservable(request$)

  return (
    <Stack {...otherProps} position='relative'>
      <Loader active={request.isPending} />
      <List color='purple.700' h='100%' overflow='auto'>
        {request.data?.map((folder) => (
          <ListItem
            key={folder}
            onClick={() => {
              onFolderSelect(folder)
            }}
            active={selectedFolder === folder}
            title={folder}
          />
        ))}
      </List>
    </Stack>
  )
}

export default Folders
