import React, { FC } from 'react'
import { Stack, StackProps, List, ListItem, Text } from '@chakra-ui/react'
import { useInit } from './react/useInit'
import { createRequest } from './state/request'
import { useObservable } from './react/useObservable'
// import { createRequest } from './state/request'
// import { createPagination } from './state/pagination'
import * as api from './api'

interface FoldersProps extends StackProps {
  selectedFolder: string | null
  onFolderSelect: (folder: string) => void
}

const Folders: FC<FoldersProps> = ({ ...otherProps }) => {
  const { request$ } = useInit(() => {
    const request = createRequest(api.fetchFolders)
    request.execute()
    return request
  })

  const request = useObservable(request$)

  return (
    <Stack {...otherProps}>
      <List>
        {request.data?.map((folder) => (
          <ListItem w='100%' key={folder} onClick={() => {}} rounded={0} p={2}>
            <Text casing='uppercase' fontSize='sm'>
              {folder}
            </Text>
          </ListItem>
        ))}
      </List>
    </Stack>
  )
}

export default Folders
