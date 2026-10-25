// Netlify Scheduled Function: runs daily and calls the site's purge route, which permanently removes
// reviews/stories that were deleted more than 30 days ago (spec §8.3).
// Needs CRON_SECRET set in Netlify (the same value the route checks). Netlify provides URL automatically.
export default async () => {
  const base = process.env.URL;
  const secret = process.env.CRON_SECRET;
  if (!base || !secret) {
    console.log("purge: URL or CRON_SECRET missing, skipped");
    return;
  }
  const res = await fetch(`${base}/api/cron/purge`, { headers: { Authorization: `Bearer ${secret}` } });
  console.log("purge:", res.status, await res.text());
};

export const config = { schedule: "@daily" };
