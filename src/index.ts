export type CollectBatchFn<K, T> = (keys: Set<K>) => Promise<Map<K, T>>;

export const batch = <K, T>(applyBatch: CollectBatchFn<K, T>) => {
  let keys = new Set<K>();
  let p: Promise<Map<K, T>> | null = null;

  return (key: K): Promise<T> => {
    keys.add(key);

    if (!p) {
      p = new Promise((resolve) => {
        setTimeout(() => {
          p = null;
          applyBatch(new Set(keys)).then((result) => {
            resolve(result);
          });
          keys = new Set();
        });
      });
    }

    return p.then((collection) => collection.get(key)!);
  };
};
