# @vivocha/scopes

Utility library to parse, match, and filter Vivocha OpenAPI scopes.

Scopes follow a `category.operation` format (e.g. `User.read`, `Asset.delete`).  
The wildcard `*` can be used in either position. A `-` prefix negates a scope.

## Installation

```sh
npm install @vivocha/scopes
```

## Scope syntax

| Scope | Meaning |
|---|---|
| `User.read` | Allow `read` on `User` |
| `User.*` | Allow all operations on `User` |
| `*.read` | Allow `read` on all categories |
| `*` or `*.*` | Allow everything |
| `-User.create` | Deny `create` on `User` |

Scopes can be passed as a space-separated string or as an array of strings.

## API

### `new Scopes(scopes: string | string[])`

Parses the given scopes.

```ts
import { Scopes } from '@vivocha/scopes';

const s = new Scopes(['User.*', '-User.create', 'Sessions.read', '*.update']);
// or equivalently:
const s = new Scopes('User.* -User.create Sessions.read *.update');
```

---

### `match(scopes: string | string[] | Scopes): boolean`

Returns `true` if **all** of the given scopes are allowed by this instance.

```ts
const s = new Scopes(['User.*', '-User.create', 'Sessions.read', '*.update']);

s.match('User.read');      // true  — covered by User.*
s.match('User.create');    // false — explicitly denied by -User.create
s.match('Session.delete'); // false — not covered
s.match('Asset.update');   // true  — covered by *.update
```

Wildcard examples:

```ts
new Scopes('*').match('User.delete');      // true
new Scopes('*').match('Account.update');   // true

new Scopes('*.delete').match('User.delete');    // true
new Scopes('*.delete').match('Account.update'); // false

new Scopes('User.*').match('User.create'); // true
new Scopes('User.*').match('User.read');   // true
new Scopes('User.*').match('Account.read'); // false
```

---

### `filter(scopes: string | string[] | Scopes): Scopes`

Returns a new `Scopes` instance containing only the scopes from the argument that are allowed by this instance.

```ts
const s = new Scopes(['User.*']);
s.filter('User.delete').toArray(); // ['User.delete']

const s2 = new Scopes(['User.*', '-User.delete', '*.read']);
s2.filter('User.delete User.update Asset.delete Asset.update Asset.read').toArray();
// ['User.update', 'Asset.read']
```

---

### `set(category: string, operation: string, value: boolean): void`

Programmatically adds or updates a single scope entry.

```ts
const s = new Scopes([]);
s.set('User', 'read', true);
s.set('User', 'delete', false);
s.toArray(); // ['User.read', '-User.delete']
```

---

### `get(category: string): Record<string, boolean> | undefined`
### `get(category: string, operation: string): boolean | undefined`

Retrieves the stored value for a category or a specific category/operation pair.

```ts
const s = new Scopes(['User.*', '-User.delete']);
s.get('User');           // { '*': true, delete: false }
s.get('User', 'delete'); // false
s.get('User', 'read');   // undefined (resolved via '*' at match time)
```

---

### `toArray(): string[]`

Returns the scopes as an array of strings.

```ts
const s = new Scopes(['User.*', '-User.create', 'Sessions.read', '*.update']);
s.toArray(); // ['User.*', '-User.create', 'Sessions.read', '*.update']
```

---

### `toString(): string`

Returns the scopes as a space-separated string.

```ts
const s = new Scopes(['User.*', '-User.create', 'Sessions.read', '*.update']);
s.toString(); // 'User.* -User.create Sessions.read *.update'
```

## License

[MIT](LICENSE)
