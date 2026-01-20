# Publishing to npm Organization

## ✅ Package Configuration Complete

Your package is now configured to publish to the `@tixel-sdk` organization:
- **Package name**: `@tixel-sdk/usdcx`
- **Repository**: https://github.com/manoahLinks/Tixel
- **Version**: 0.1.0

---

## 📋 Pre-Publishing Checklist

Before publishing, ensure:

1. **npm Organization Exists**
   ```bash
   # Check if you're logged in
   npm whoami
   
   # Create organization (if not exists)
   # Visit: https://www.npmjs.com/org/create
   # Or use CLI: npm org create tixel-sdk
   ```

2. **Build Succeeds**
   ```bash
   npm run build
   ```

3. **Tests Pass** (Optional but recommended)
   ```bash
   export ETH_PRIVATE_KEY=0x...
   npx ts-node test-bridge-local.ts
   ```

---

## 🚀 Publishing Steps

### Step 1: Login to npm

```bash
npm login
```

Enter your npm credentials when prompted.

### Step 2: Verify Organization Access

```bash
# Check your organizations
npm org ls tixel-sdk
```

If the organization doesn't exist, create it at: https://www.npmjs.com/org/create

### Step 3: Publish (Choose One)

#### Option A: Publish as Public Package (Recommended)

```bash
# Scoped packages are private by default, make it public
npm publish --access public
```

#### Option B: Publish as Beta First

```bash
# Update version to beta
npm version 0.1.0-beta.1

# Publish with beta tag
npm publish --access public --tag beta
```

### Step 4: Verify Publication

```bash
# Check if package is published
npm view @tixel-sdk/usdcx

# Test installation
npm install @tixel-sdk/usdcx
```

---

## 📦 Installation (After Publishing)

Users can install your package with:

```bash
npm install @tixel-sdk/usdcx
```

Or for beta versions:

```bash
npm install @tixel-sdk/usdcx@beta
```

---

## 🔐 Important Notes

1. **Access Level**: Scoped packages (`@org/package`) are **private by default**
   - Use `--access public` to make it publicly available
   - Private packages require a paid npm account

2. **Organization Membership**: You must be a member of `@tixel-sdk` organization
   - Create at: https://www.npmjs.com/org/create
   - Or invite yourself if it exists

3. **Version Management**: 
   - Can't republish same version
   - Use `npm version patch/minor/major` to bump versions

---

## 🛠️ Quick Publish Command

```bash
# One-liner to build and publish
npm run build && npm publish --access public
```

---

## ❌ Troubleshooting

### "You do not have permission to publish"
- Ensure you're logged in: `npm whoami`
- Check organization membership: `npm org ls tixel-sdk`
- Create organization if needed

### "Package name already exists"
- Someone else owns `@tixel-sdk` organization
- Choose a different organization name
- Update `package.json` name field

### "Cannot publish over existing version"
- Bump version: `npm version patch`
- Or use a different version number
