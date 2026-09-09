# MEGA 2026 Waiting-List Capture

The waiting-list form uses Agency Brain's shared hosted-site lead pipeline.
The browser calls the public Supabase Edge Functions directly; no Supabase
client library or per-site Resend key is required.

## Site configuration

- Site ID: `mega-agency-conference-2026`
- API: `https://wjqyccbytctqwceuhzhk.functions.supabase.co`
- Sender: `leads@standardplaybook.com`
- Production recipient: managed in the Agency Brain `hosted_sites` record

The end-to-end connection was verified on August 3, 2026 against Justin's test
inbox before the production row was switched to Tara's MEGA inbox. The verified
test row is clearly labeled `MEGA Hosted Connection Test` in Agency Brain.

The public build-time values live in `.env` and are intentionally committed.

## Submission flow

1. Form changes are autosaved after 500 ms to
   `hosted-site-lead-save` with a honeypot and persistent session token.
2. Submit flushes the latest values, then calls
   `hosted-site-lead-submit` with that session token.
3. Agency Brain stores the JSON fields and sends the notification through its
   existing Resend connection.
4. The existing scheduled sweep can notify the configured test inbox about
   plausible incomplete submissions.

## Safe handoff

For a future reconnection test, temporarily set the `hosted_sites` row to
`justin@hfiagencies.com`. After the test succeeds, restore the final recipient
without sending a test message to the client inbox:

```sql
UPDATE public.hosted_sites
   SET inbox_emails = ARRAY['<production inbox>']
 WHERE id = 'mega-agency-conference-2026';
```

Do not add Resend credentials to this repository or change the per-site sender
without first verifying a new sending domain.
