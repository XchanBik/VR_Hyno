export const navigationTree = {
  player: {
    playlist: {
      list: null,
      edit: null,
      player: null,
    }
  },
  editor: {
    sessions: {
      list: null,
      edit: null,
    },
    songs: {
      list: null,
      edit: null,
    },
    assets: {
      list: null,
      edit: null,
    }
  }
} as const;

type Tree = typeof navigationTree;

type Path<T, Prev extends string[] = []> =
  T extends object
    ? { [K in keyof T]: Path<T[K], [...Prev, K & string]> }[keyof T]
    : Prev;

export type NavigationPath = Path<Tree>; 