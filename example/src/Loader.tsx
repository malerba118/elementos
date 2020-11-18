import React, { FC } from 'react'
import { Spinner, Flex } from '@chakra-ui/react'

interface LoaderProps {
  active: boolean
}

const Loader: FC<LoaderProps> = ({ active }) => {
  if (!active) {
    return null
  }
  return (
    <Flex
      position='absolute'
      height='100%'
      width='100%'
      align='center'
      justify='center'
      bg='white'
    >
      <Spinner size='lg' color='purple.600' />
    </Flex>
  )
}

export default Loader
