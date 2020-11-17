interface FetchTodosOptions {
  page?: number
  perPage?: number
  folder?: string
}

const todos = [
  {
    id: 1,
    folder: 'recipes',
    title:
      'sunt aut facere repellat provident occaecati excepturi optio reprehenderit',
    body:
      'quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto'
  },
  {
    id: 2,
    folder: 'project ideas',
    title: 'qui est esse',
    body:
      'est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla'
  },
  {
    id: 3,
    folder: 'gift ideas',
    title: 'ea molestias quasi exercitationem repellat qui ipsa sit aut',
    body:
      'et iusto sed quo iure\nvoluptatem occaecati omnis eligendi aut ad\nvoluptatem doloribus vel accusantium quis pariatur\nmolestiae porro eius odio et labore et velit aut'
  },
  {
    id: 4,
    folder: 'recipes',
    title: 'eum et est occaecati',
    body:
      'ullam et saepe reiciendis voluptatem adipisci\nsit amet autem assumenda provident rerum culpa\nquis hic commodi nesciunt rem tenetur doloremque ipsam iure\nquis sunt voluptatem rerum illo velit'
  },
  {
    id: 5,
    folder: 'recipes',
    title: 'nesciunt quas odio',
    body:
      'repudiandae veniam quaerat sunt sed\nalias aut fugiat sit autem sed est\nvoluptatem omnis possimus esse voluptatibus quis\nest aut tenetur dolor neque'
  },
  {
    id: 6,
    folder: 'gift ideas',
    title: 'dolorem eum magni eos aperiam quia',
    body:
      'ut aspernatur corporis harum nihil quis provident sequi\nmollitia nobis aliquid molestiae\nperspiciatis et ea nemo ab reprehenderit accusantium quas\nvoluptate dolores velit et doloremque molestiae'
  },
  {
    id: 7,
    folder: 'gift ideas',
    title: 'magnam facilis autem',
    body:
      'dolore placeat quibusdam ea quo vitae\nmagni quis enim qui quis quo nemo aut saepe\nquidem repellat excepturi ut quia\nsunt ut sequi eos ea sed quas'
  },
  {
    id: 8,
    folder: null,
    title: 'dolorem dolore est ipsam',
    body:
      'dignissimos aperiam dolorem qui eum\nfacilis quibusdam animi sint suscipit qui sint possimus cum\nquaerat magni maiores excepturi\nipsam ut commodi dolor voluptatum modi aut vitae'
  },
  {
    id: 9,
    folder: 'project ideas',
    title: 'nesciunt iure omnis dolorem tempora et accusantium',
    body:
      'consectetur animi nesciunt iure dolore\nenim quia ad\nveniam autem ut quam aut nobis\net est aut quod aut provident voluptas autem voluptas'
  },
  {
    id: 10,
    folder: null,
    title: 'optio molestias id quia eum',
    body:
      'quo et expedita modi cum officia vel magni\ndoloribus qui repudiandae\nvero nisi sit\nquos veniam quod sed accusamus veritatis error'
  },
  {
    id: 11,
    folder: 'project ideas',
    title: 'et ea vero quia laudantium autem',
    body:
      'delectus reiciendis molestiae occaecati non minima eveniet qui voluptatibus\naccusamus in eum beatae sit\nvel qui neque voluptates ut commodi qui incidunt\nut animi commodi'
  },
  {
    id: 12,
    folder: 'project ideas',
    title: 'in quibusdam tempore odit est dolorem',
    body:
      'itaque id aut magnam\npraesentium quia et ea odit et ea voluptas et\nsapiente quia nihil amet occaecati quia id voluptatem\nincidunt ea est distinctio odio'
  },
  {
    id: 13,
    folder: 'gift ideas',
    title: 'dolorum ut in voluptas mollitia et saepe quo animi',
    body:
      'aut dicta possimus sint mollitia voluptas commodi quo doloremque\niste corrupti reiciendis voluptatem eius rerum\nsit cumque quod eligendi laborum minima\nperferendis recusandae assumenda consectetur porro architecto ipsum ipsam'
  },
  {
    id: 14,
    folder: 'project ideas',
    title: 'voluptatem eligendi optio',
    body:
      'fuga et accusamus dolorum perferendis illo voluptas\nnon doloremque neque facere\nad qui dolorum molestiae beatae\nsed aut voluptas totam sit illum'
  },
  {
    id: 15,
    folder: null,
    title: 'eveniet quod temporibus',
    body:
      'reprehenderit quos placeat\nvelit minima officia dolores impedit repudiandae molestiae nam\nvoluptas recusandae quis delectus\nofficiis harum fugiat vitae'
  }
]

const timeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const fetchFolders = async () => {
  await timeout(1500)
  const folders = todos.reduce((set, todo) => {
    if (todo.folder) {
      set.add(todo.folder)
    }
    return set
  }, new Set<string>())
  return Array.from(folders)
}

export const fetchTodos = async ({
  page = 1,
  perPage = 10,
  folder
}: FetchTodosOptions = {}) => {
  await timeout(1500)
  let filteredTodos = todos.filter((todo) => {
    return folder == null ? true : todo.folder === folder
  })
  return filteredTodos.slice((page - 1) * perPage, page * perPage)
}
