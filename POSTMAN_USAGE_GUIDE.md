# API Key Creation Workflow Guide

## Problem Fixed
Added automatic variable extraction to Postman collection to make API key creation easier.

## How to Create an API Key for a User

### Option 1: Automatic (Recommended)
1. **List Users** - Send the "List Users" request
   - This automatically saves the first user's ID to `{{user_id}}`
   - Check the Console to see: "✓ Saved first user_id: xxx"

2. **Create API Key** - Send the "Create API Key" request
   - It will use the automatically captured `{{user_id}}`
   - This automatically saves:
     - `{{api_key_id}}` - The API key ID
     - `{{user_api_key}}` - The actual API key (for testing)
   - Check the Console to confirm both values were saved

3. **Test the API Key** - Use any Firecrawl endpoint (like "Scrape")
   - The `{{user_api_key}}` is already set as the Bearer token

### Option 2: Manual
1. **Create or List Users** - Get a user ID
2. **Set Variable** - Manually set the `{{user_id}}` variable in Postman:
   - Click "Collections" > "FireForge" > "Variables" tab
   - Find the `user_id` row
   - Paste the user ID in the "Current Value" column
   - Click "Save"

3. **Create API Key** - Send the "Create API Key" request
   - The request body uses: `{"user_id": "{{user_id}}"}`
   - Response includes the full API key (shown only once!)

## Collection Variables
The collection includes these auto-captured variables:

| Variable | Set By | Used By |
|----------|--------|---------|
| `user_id` | List Users, Create User | Create API Key, Get User, etc. |
| `api_key_id` | Create API Key | Revoke API Key |
| `user_api_key` | Create API Key | All Firecrawl endpoints |

## Troubleshooting

### "user_id is required"
- Make sure you've run "List Users" or "Create User" first
- Check if `{{user_id}}` is set in the Variables tab

### "User not found"
- The user_id might be invalid or deleted
- Run "List Users" to get a valid user ID

### API Key Not Working
- Make sure the API key wasn't revoked
- Check that you're using the correct format: `Bearer {{user_api_key}}`
- The API key is shown only once when created - copy it immediately!

## Quick Start Workflow
```
1. Create User → Auto-saves user_id
2. Add Credits → Uses auto-saved user_id
3. Create API Key → Uses auto-saved user_id, saves user_api_key
4. Test Scrape → Uses auto-saved user_api_key
```

## Console Output Examples
When requests succeed, you'll see in the Postman Console:
```
✓ Saved user_id: f6ce58b6-2610-4e7f-9dc0-1b803524f051
✓ Saved api_key_id: 1d36b681-d201-4668-a7ac-ba466e20c2bf
✓ Saved user_api_key: fg_9a8c46c9438dd73e2de7cd4d3d63c6ab...
```
