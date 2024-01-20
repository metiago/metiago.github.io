+++
title = ' Git - Quick References'
date = 2015-04-20T19:18:41-03:00
draft = false
+++

useful git commands for day-to-day devs

### Stash
```bash
# clean up GIT stack
git stash clear

# stash working branch
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

### Renaming Branches

```bash
# Rename branch locally
git branch -m old_branch new_branch

# Delete old branch    
git push origin :old_branch      

# Push new branch, set local branch to track new remote           
git push --set-upstream origin new_branch   
```

### Delete Branches

```bash
# delete local branch
git branch -D <branch_name>

# delete remote
git push <remote_name> :<branch_name>
```
