export type Article = {
  title: string;
  url: string;
  published?: string;
  text: string;
};

export type Passage = {
  id: string;
  text: string;
  payload: {
    title?: string;
    url?: string;
    published?: string;
    chunkIndex?: number;
    preview?: string;
  };
};
