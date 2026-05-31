const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");
    const GITHUB_REPO = Deno.env.get("GITHUB_REPO");

    if (!GITHUB_TOKEN || !GITHUB_REPO) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GitHub credentials not configured. Set GITHUB_TOKEN and GITHUB_REPO secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the latest commit on the main branch to trigger a new deployment
    const apiBase = `https://api.github.com/repos/${GITHUB_REPO}`;
    const headers = {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Home Nesto-Rebuild",
    };

    // Create an empty commit on main to trigger Cloudflare Pages rebuild
    const refRes = await fetch(`${apiBase}/git/ref/heads/main`, { headers });
    if (!refRes.ok) {
      const err = await refRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Failed to get main branch ref: ${err}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;

    // Get the current commit to create a new tree
    const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, { headers });
    if (!commitRes.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Failed to get latest commit" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const commitData = await commitRes.json();
    const treeSha = commitData.tree.sha;

    // Create a new commit (empty, just to trigger the build)
    const now = new Date().toISOString();
    const newCommitRes = await fetch(`${apiBase}/git/commits`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        message: `chore: rebuild site ${now}`,
        tree: treeSha,
        parents: [latestCommitSha],
      }),
    });

    if (!newCommitRes.ok) {
      const err = await newCommitRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create commit: ${err}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newCommitData = await newCommitRes.json();
    const newCommitSha = newCommitData.sha;

    // Update the main branch ref to point to the new commit
    const updateRefRes = await fetch(`${apiBase}/git/refs/heads/main`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ sha: newCommitSha }),
    });

    if (!updateRefRes.ok) {
      const err = await updateRefRes.text();
      return new Response(
        JSON.stringify({ success: false, error: `Failed to update branch ref: ${err}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Site rebuild triggered. A new commit was pushed to GitHub, which will trigger Cloudflare Pages to rebuild and deploy the static site.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
