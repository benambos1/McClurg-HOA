# Stillwater Crossings HOA website

Homeowner portal for Stillwater Crossings HOA (West Milton, OH).

- `public/` is the live site Vercel deploys (project root directory = `public`). One page, no build step.
- Data, logins and permissions live in Supabase (Supabase project named "Stillwater Crossing HOA"). Every table uses row-level security: homeowners only see their own home; board tools need a board login.
- The key in `public/index.html` is Supabase's public (anon) key. It is meant to be in the page; it can only do what the security rules allow. Never put the service-role key or Stripe secret keys in this repo.
- `prototype/` is the original clickable mockup with sample data. It is not deployed.

## One-time Supabase settings (Dashboard → Authentication)
- URL Configuration → Site URL: the live address (today https://west-milton-hoa-ambos-dw.vercel.app, later https://stillwatercrossinghoa.com). Add both under Redirect URLs.
- Sign In / Providers → Email: keep "Allow new users to sign up" ON (homeowners create their own login with a mailed claim code or the email the board has on file) and "Confirm email" ON.
- Attack Protection: turn on leaked password protection.

## Roles
- Site admin (Ben, Ambos Design Works): full access during setup. After the board-admin hand-off, manages logins and the website only, unless the board admin grants temporary support access. Can remove board members.
- Board admin (the old "board lead", stored as `board_lead`): everything for the HOA, and can remove board members.
- Board members: everything for the HOA, including adding board members (name now, email later, then Invite to the portal). They can't remove board members.
- Homeowners: their own home's dues, payments, reports, people; announcements, events, documents, projects.
- Renters: added by an owner; see announcements and their reports, not dues.

## Not turned on yet
- Online payments (Stripe ACH + card). Homeowners are told to mail a check; the board records checks.
- Email notifications (announcements, reminders, report updates).
