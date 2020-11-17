import React, { FC } from 'react'
import { Stack, StackProps } from '@chakra-ui/react'

interface FolderProps extends StackProps {}

const Folder: FC<FolderProps> = ({ ...otherProps }) => {
  return <Stack {...otherProps}>Folder</Stack>
}

export default Folder
