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

// Type qui transforme l'arbre en chemins de navigation
type NavigationHelper<T> = {
  [K in keyof T]: T[K] extends object
    ? NavigationHelper<T[K]>
    : T[K] extends null
      ? readonly [...Path<Tree, []>]
      : never
};

// Helper qui génère automatiquement les chemins à partir de l'arbre
export const nav = {} as NavigationHelper<Tree>;

// Fonction qui remplit le helper avec les chemins (imbriqué)
function buildNavPaths<T extends object>(tree: T, target: any = nav, path: string[] = []): void {
  for (const key in tree) {
    const currentPath = [...path, key];
    if (tree[key] === null) {
      target[key] = currentPath as readonly string[];
    } else if (typeof tree[key] === 'object') {
      target[key] = {};
      buildNavPaths(tree[key], target[key], currentPath);
    }
  }
}

// Génère les chemins au démarrage
buildNavPaths(navigationTree); 