# Profile Picture Installation

## Anders Kristiansen Profile Picture

The profile picture you provided needs to be saved as:
**Location:** `apps/web/public/avatars/anders-kristiansen.jpg`

### Steps:
1. Save the profile picture image as `anders-kristiansen.jpg` in this directory
2. The image has been configured in the database seed to reference: `/avatars/anders-kristiansen.jpg`
3. Run the database seed to apply the changes:
   ```bash
   cd apps/api
   npm run prisma:seed
   ```

### Image Details:
- **Subject:** Anders Kristiansen
- **Format:** JPG (recommended) or PNG
- **Background:** Green screen/transparent background (will be handled by CSS)
- **Usage:** Player profile for anders.kristiansen@demo.com

### After Installation:
The profile picture will appear:
- In the player profile page
- In coach's athlete list
- In dashboard widgets
- In any component using the Player avatar

### Alternative: Direct Database Update
If you prefer to update just Anders Kristiansen's profile without re-seeding:
```sql
UPDATE players 
SET profile_image_url = '/avatars/anders-kristiansen.jpg'
WHERE email = 'anders.kristiansen@demo.com';
```
