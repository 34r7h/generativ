/**
 * Team member helpers.
 *
 * Members are CMS records without a slug field, so a profile URL is derived
 * from the name. Derivation lives here so the team grid and the profile page
 * always agree on what `/team/:slug` means for a given member.
 */

export function memberSlug(member) {
  return (member?.name || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function findMemberBySlug(members, slug) {
  if (!slug) return null;
  const wanted = String(slug).toLowerCase();
  return (
    members.find((member) => memberSlug(member) === wanted) ||
    members.find((member) => member.id === slug) ||
    null
  );
}
