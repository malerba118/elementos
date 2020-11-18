import React, { FC } from 'react'
import {
  ListItem as ChakraListItem,
  ListItemProps as ChakraListItemProps,
  Text
} from '@chakra-ui/react'

interface ListItemProps extends ChakraListItemProps {
  title: string
  description?: string
  active?: boolean
}

const ListItem: FC<ListItemProps> = ({
  title,
  description,
  active,
  ...otherProps
}) => {
  return (
    <ChakraListItem
      w='100%'
      rounded={0}
      bg={active ? 'purple.100' : 'none'}
      p={2}
      {...otherProps}
    >
      <Text noOfLines={1} casing='uppercase' fontSize='sm'>
        {title}
      </Text>
      {description && (
        <Text noOfLines={2} fontSize='xs'>
          {description}
        </Text>
      )}
    </ChakraListItem>
  )
}

export default ListItem
