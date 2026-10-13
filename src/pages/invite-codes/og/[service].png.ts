import type { APIRoute } from 'astro';
import { fetchInviteCodes } from '../../../services/inviteCodes';
import { getInviteShareEntries } from '../../../data/invite-share';
import { renderInviteShareImage } from '../../../services/inviteShareImage';

export async function getStaticPaths() {
  const { codes } = await fetchInviteCodes();
  return getInviteShareEntries(codes).map(({ slug, code }) => ({
    params: { service: slug }, props: { code },
  }));
}

export const GET: APIRoute = async ({ props }) => new Response(
  new Uint8Array(await renderInviteShareImage(props.code)),
  { headers: { 'Content-Type': 'image/png' } },
);
