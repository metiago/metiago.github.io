---
title: 'Git - Quick Reference'
date: "2017-06-08"
draft: false

---

### Renaming Branches

```bash
# Rename branch locally
git branch -m old_branch new_branch

# Delete old branch    
git push origin :old_branch      

# Push new branch, set local branch to track new remote           
git push --set-upstream origin new_branch   
```

### Stash
```bash
# clean git stack
git stash clear

# stash working in progress
git stash

# apply stashed changes
git stash apply
```

### Fetch Branches
```bash
git fetch
```

### Track/Checkout Remote Branch
```bash
git checkout --track origin/<brach_name>
```

### Delete Branches

```bash
# delete local branch
git branch -D <branch_name>

# delete remote
git push <remote_name> :<branch_name>
```