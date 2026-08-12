# Remote browser access

The browser bridge can pair another agent with an existing gstack browser session
over an authenticated HTTP tunnel. The remote participant receives a scoped,
short-lived token rather than the browser root token.

Use `gstack-pair-agent` to start pairing, choose the smallest capability set, and
share the generated connection details through a trusted channel. Revoke the
session when collaboration ends.

Remote integrations should store their connection data in their own private
configuration directory. Never commit tokens, tunnel URLs, cookies, or browser
profiles to this repository.
