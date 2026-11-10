# Project Rule: Mandatory Auto Git Commit, Push & VPS Deploy

## 1. Repository & Contributor Policy
- **Primary Remote**: `https://github.com/hannanguyen-jki/10-manage-cus-inven.git` (Private).
- **Single Contributor Enforcement**: All commits MUST use `hannanguyen-jki` (`354901575+hannanguyen-jki@users.noreply.github.com`) as both Author and Committer.
- **No Co-Author Trailers**: Never include `Co-Authored-By` trailers in commit messages so `hannanguyen-jki` remains the sole contributor on GitHub.

## 2. Mandatory Auto Commit & Push
Upon completing any code change, bug fix, refactor, or content update (after verifying build/typecheck):
```bash
git add -A
git commit -m "<concise commit message>"
git push origin <current_branch>
```

## 3. Mandatory VPS Auto-Deploy
Immediately after `git push` succeeds, deploy to VPS:
```bash
ssh -i "$env:USERPROFILE\.ssh\id_ed25519" root@37.60.226.206 "cd /opt/manage-cus-inven && git pull origin main && docker compose up -d --build"
```
Verify the container restarts cleanly so `https://manage.jkioceanhub.com` reflects the latest state immediately.
