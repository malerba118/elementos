import React, { FC } from 'react'
import { Text, Stack, StackProps } from '@chakra-ui/react'

interface NoteProps extends StackProps {}

const Note: FC<NoteProps> = () => {
  return (
    <Stack>
      <Text>Note</Text>
    </Stack>
  )
}

export default Note
