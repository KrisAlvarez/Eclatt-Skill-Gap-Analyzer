# Main merge resolution - 2026-11-13

Local cleanup commit: `573b285`. Incoming main tip: `d57adfb` (including `7b20157`).

The incoming implementation changed the original 80/20 split to 60/20/20, replaced exact-skill targets with category Top-4 targets, modified the live ranker/artifacts, removed compatibility launch paths, and restored UI/documents removed by the local cleanup. These changes conflict with the approved frozen assessment and unchanged-production requirement. Associated API/schema/docs/benchmark commands depend on that alternate implementation.

Resolution: retain the local implementation, original production artifacts, frozen HR@10 assessment, compatibility entry points, and intentional deletions. The alternate benchmark is not represented as current project behavior. Teammate commits remain in the merge parent history and at local branch `backup/teammate-main-20261113`; they were not rewritten or force-pushed away.

Both final project documentation and progress checklist are tracked. No push was performed. Run normal `git push origin main` after reviewing this merge; if remote main advances, fetch and reconcile the new commits instead of force pushing.
