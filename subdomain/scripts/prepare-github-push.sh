#!/bin/bash
# ============================================================
# Script: Prepare subdomain project for GitHub push
# ============================================================
# This script helps you push the subdomain project into the
# existing dayaberkah GitHub repo as a subfolder.
#
# PREREQUISITES:
# 1. Git installed and configured with your GitHub credentials
# 2. You have collaborator access to the dayaberkah repo
# 3. You have GitHub Personal Access Token (PAT) ready
#
# USAGE:
#   chmod +x scripts/prepare-github-push.sh
#   bash scripts/prepare-github-push.sh
# ============================================================

set -e

SUBFOLDER_NAME="subdomain"
REPO_URL="https://github.com/pampam666/dayaberkah.git"
CLONE_DIR="/tmp/dayaberkah-clone"
SOURCE_DIR="/home/z/my-project"

echo "============================================================"
echo "  Arostech Subdomain → GitHub Push Preparation"
echo "============================================================"
echo ""
echo "Subfolder name: $SUBFOLDER_NAME"
echo "Target repo: $REPO_URL"
echo "Source: $SOURCE_DIR"
echo ""

# Step 1: Clone the existing repo
echo "📦 Step 1: Cloning dayaberkah repo..."
if [ -d "$CLONE_DIR" ]; then
  echo "  → Removing old clone..."
  rm -rf "$CLONE_DIR"
fi
git clone "$REPO_URL" "$CLONE_DIR"
echo "  ✅ Cloned successfully"
echo ""

# Step 2: Create subfolder
echo "📁 Step 2: Creating subfolder '$SUBFOLDER_NAME'..."
mkdir -p "$CLONE_DIR/$SUBFOLDER_NAME"
echo "  ✅ Created"
echo ""

# Step 3: Copy project files (only git-tracked files, no secrets)
echo "📋 Step 3: Copying project files..."
cd "$SOURCE_DIR"

# Copy all git-tracked files to the subfolder
git ls-files | while read -r file; do
  # Create parent directory
  mkdir -p "$CLONE_DIR/$SUBFOLDER_NAME/$(dirname "$file")"
  # Copy file
  cp "$file" "$CLONE_DIR/$SUBFOLDER_NAME/$file"
done

echo "  ✅ All files copied"
echo ""

# Step 4: Verify no secrets
echo "🔒 Step 4: Checking for secrets in copied files..."
cd "$CLONE_DIR/$SUBFOLDER_NAME"

SECRETS_FOUND=0

if grep -rq "npg_Mex3R4hdUmrP" . 2>/dev/null; then
  echo "  ⚠️  WARNING: Database password found in files!"
  SECRETS_FOUND=1
fi
if grep -rq "re_6ZXDAbyX" . 2>/dev/null; then
  echo "  ⚠️  WARNING: Resend API key found in files!"
  SECRETS_FOUND=1
fi
if grep -rq "sk55kTL6D4Q18lLjxUcCsAbsgUs34LIBJ" . 2>/dev/null; then
  echo "  ⚠️  WARNING: Sanity API token found in files!"
  SECRETS_FOUND=1
fi
if grep -rq "skqd7bBPqF3nlKTCXOUgMMfcUCwiQPF50C3C8RVz" . 2>/dev/null; then
  echo "  ⚠️  WARNING: Sanity write token found in files!"
  SECRETS_FOUND=1
fi
if grep -rq "e0c4414019156de91986d26b0ff2990a" . 2>/dev/null; then
  echo "  ⚠️  WARNING: NextAuth secret found in files!"
  SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 0 ]; then
  echo "  ✅ No secrets found — safe to push!"
else
  echo "  ❌ SECRETS FOUND! Do NOT push. Fix the files above first."
  exit 1
fi
echo ""

# Step 5: Show summary
echo "📊 Step 5: Summary"
FILE_COUNT=$(find "$CLONE_DIR/$SUBFOLDER_NAME" -type f | wc -l)
TOTAL_SIZE=$(du -sh "$CLONE_DIR/$SUBFOLDER_NAME" | cut -f1)
echo "  Files to add: $FILE_COUNT"
echo "  Total size: $TOTAL_SIZE"
echo ""

# Step 6: Instructions for push
echo "============================================================"
echo "  NEXT STEPS (Run manually):"
echo "============================================================"
echo ""
echo "  cd $CLONE_DIR"
echo "  git add $SUBFOLDER_NAME/"
echo "  git status   # Review the changes"
echo "  git commit -m \"feat: add arostech subdomain project\""
echo "  git push origin main"
echo ""
echo "  That's it! 🎉"
echo "============================================================"
