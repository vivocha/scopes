# Vivocha Scopes

An utility to parse and test Vivocha OpenAPI Scopes.

## How to use

### Match Scopes
```
import { Scopes } from '@vivocha/scopes';

// Scopes can be passed as string or string[]
const s = new Scopes(["User.*", "-User.create", "Sessions.read", "*.update"]);
s.match("User.read");       // true
s.match("User.create");     // false
s.match("Session.delete");  // false
s.match("Asset.update");    // true

Character '*' means 'everything'
const s2 = new Scopes("*");
s2.match("User.delete");    // true
s2.match("Account.update"); // true

const s3 = new Scopes("*.delete");
s3.match("User.delete");    // true
s3.match("Account.update"); // false

const s4 = new Scopes("User.*");
s4.match("User.create");    // true
s4.match("User.read");      // true
s4.match("User.update");    // true
s4.match("User.delete");    // true
s4.match('Accound.read');   // false
```

### Filter Scopes (returns all Scopes that match the filter condition)

```
import { Scopes } from '@vivocha/scopes';

const s5 = new Scopes(["User.*"]);
s5.filter("User.delete").toArray() // ["User.delete"]

const s6 = new Scopes(["User.*", "-User.delete", "*.read"]);
s6.filter("User.delete User.update Asset.delete Asset.update Asset.read").toArray() // ["User.update", "Asset.read"]
```

### toArray() and toString()

If you want to retrieve the Scopes value you can use `toString` and `toArray` methods.

```
import { Scopes } from '@vivocha/scopes';

const s = new Scopes(["User.*", "-User.create", "Sessions.read", "*.update"]);
s.toString()  // User.* -User.create Sessions.read *.update
s.toArray()   // ['User.*', '-User.create', 'Sessions.read', '*.update']
```