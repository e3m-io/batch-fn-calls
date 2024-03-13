# batch-fn-calls

## Example

```typescript
import { batch } from "@e3m-io/batch-fn-calls";
import { searchUsers } from "./searchUsers";

type User = { id: string };

const loadUsers = async (userIds: Set<User["id"]>) => {
  const users = await searchUsers(userIds);

  return users.reduce((collection, user) => {
    collection.set(user.id, user);
    return collection;
  }, new Map<User["id"], User>());
};

const getUser = batch(loadUsers);

// Batches userId 1,2,3 in a single request to `searchUsers`
getUser("1").then(console.log);
getUser("2").then(console.log);
getUser("3").then(console.log);

// Batches userId 4 in a single request to `searchUsers`
setTimeout(() => {
  getUser("4").then(console.log);
});
```
