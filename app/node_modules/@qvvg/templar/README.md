# templar

> use them backticks, because they are a thing now

## Usage

```javascript
import {t7l} from "@qvvg/templar"

const template = t7l`
From: ${o => o.from}
To: ${o => o.to}
Message: ${o => o.msg}
`

const letter = template({
  from: "Bob the Builder",
  to: "Postman Pat",
  msg: "Please pick up your black and white cat.",
})

// prettier-ignore
assert( letter, `
From: Bob the Builder
To: Postman Pat
Message: Please pick up your black and white cat.
`)
```

```javascript
import {t7l} from "@qvvg/templar"

const template1 = t7l`
a: ${o => o.a}
b: ${o => o.b}
`

const template2 = t7l`
x: ${o => o.x}
y: ${o => o.y}
`

const template3 = t7l`
${template1}
${template2}
oh hello!
${template1}
${template2}
`

const rawr = template3({a: "A", b: "B", x: "X", y: "Y"})

// prettier-ignore
assert(rawr, `
a: A
b: B
x: X
y: Y
oh hello!
a: A
b: B
x: X
y: Y
`)
```

## Examples

**Role your own graphql libary**

```javascript
// gql.js
import {t7l} from "@qvvg/templar"

export const gql = t7l

export const gqlr = (...args) => (opts = {}) => {
  const params = opts.params || {}
  const headers = opts.headers || {}
  const endpoint = opts.endpoint || ""

  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      query: gql(...args)(params),
    }),
  }).then(d => d.json())
}

// somewhere-else.js
import React, {useEffect, useState} from "react"
import {gqlr, gql} from "./gql"

const USER = gql`
  fragment USER on User {
    username
  }
`

const query = gqlr`
  query {
    me { ...USER }
  }
  ${USER}
`

export const Username = () => {
  const [username, setUsername] = useState(null)

  useEffect(() => {
    query({
      endpoint: "http://...",
      headers: {authorization: "bearer ..."},
    }).then(response => setUsername(response.data.me.username))
  }, [])

  return username == null ? null : username
}
```

**Role your own pipeline thing?**

```javascript
const pipe = (fns = []) => token => {
  return fns.reduce((token, fn) => fn(token), token)
}

const param = (key, value) => token => {
  token.params = token.parms || {}
  token.params[key] = value
  return token
}

const script = (...args) => token => {
  token.type = "script"
  token.value = t7l(...args)(token.params)
  return token
}

const query = (...args) => token => {
  token.type = "query"
  token.value = t7l(...args)(token.parms)
  return token
}

const desc = (...args) => token => {
  token.description = t7l(...args)(token.params)
  return token
}

const rawr = pipe([
  param("msg", "woot woot im a boot"),
  script`
    pub fun main() {
      log("msg: ${o => o.msg}")
    }
  `,
  desc`
    the message: ${o => o.msg}
  `,
])

assert(rawr, {
  params: {
    msg: "woot woot im a boot",
  },
  type: "script",
  code: `
    pub fun main() {
      log("msg: woot woot im a boot")
    }
  `,
  descrition: `
    the message: woot woot im a boot
  `,
})
```
