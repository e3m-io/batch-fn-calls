export type CollectBatchFn<K, T> = (keys: Set<K>) => Promise<Map<K, T>>;

export const batch = <K, T>(applyBatch: CollectBatchFn<K, T>) => {
  let keys = new Set<K>();
  let p: Promise<Map<K, T>> | null = null;

  return (key: K): Promise<T> => {
    keys.add(key);

    if (!p) {
      p = new Promise((resolve, reject) => {
        setTimeout(() => {
          const run = async () => {
            p = null;
            const savedKeys = new Set(keys);
            keys = new Set();
            try {
              resolve(await applyBatch(savedKeys));
            } catch (e: unknown) {
              reject(e as Error);
            }
          };
          void run();
        });
      });
    }

    return p.then((collection) => collection.get(key)!);
  };
};
