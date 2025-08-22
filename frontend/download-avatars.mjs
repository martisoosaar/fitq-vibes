import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

async function downloadAvatars() {
  try {
    // Get all users with custom avatars (not default)
    const users = await prisma.user.findMany({
      where: {
        NOT: [
          { avatar: 'users/default.png' },
          { avatar: 'users/default_female.png' },
          { avatar: 'users/default_male.png' },
          { avatar: null }
        ]
      },
      select: {
        id: true,
        name: true,
        avatar: true
      }
    })

    console.log(`Found ${users.length} users with custom avatars`)

    let successCount = 0
    let failCount = 0

    for (const user of users) {
      // Skip if already starts with /users/ (already updated)
      if (user.avatar.startsWith('/users/')) {
        console.log(`✓ User ${user.id} (${user.name}) already has local avatar`)
        continue
      }

      // Extract user folder from avatar path
      const avatarPath = user.avatar
      let userFolder = null
      let filename = 'avatar.png'

      // Check different patterns
      if (avatarPath.includes('user_')) {
        // Pattern: users/user_XXX/avatar.png or similar
        const match = avatarPath.match(/user_(\d+)/)
        if (match) {
          userFolder = `user_${match[1]}`
          // Get filename from path
          const parts = avatarPath.split('/')
          filename = parts[parts.length - 1]
        }
      } else if (avatarPath.includes('September2020/') || avatarPath.includes('October2020/')) {
        // Pattern: users/September2020/xxxxx.jpg
        const parts = avatarPath.split('/')
        filename = parts[parts.length - 1]
        userFolder = `user_${user.id}`
      }

      if (!userFolder) {
        console.log(`⚠ Skipping user ${user.id} (${user.name}) - couldn't determine folder from: ${avatarPath}`)
        continue
      }

      // Create local directory
      const localDir = `/Users/soss/htdocs/fitq-vibes/frontend/public/users/${userFolder}`
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true })
      }

      // Build source URL - try different patterns
      const baseUrl = 'https://old.fitq.me/storage/'
      const sourceUrl = `${baseUrl}${avatarPath}`
      const localPath = path.join(localDir, filename)

      // Skip if file already exists
      if (fs.existsSync(localPath)) {
        console.log(`✓ User ${user.id} (${user.name}) - file already exists`)
        successCount++
        continue
      }

      try {
        // Download the file
        console.log(`Downloading avatar for user ${user.id} (${user.name})...`)
        await execAsync(`curl -s -o "${localPath}" "${sourceUrl}"`)
        
        // Check if file was downloaded successfully (not empty)
        const stats = fs.statSync(localPath)
        if (stats.size < 100) {
          // File too small, probably 404 error
          fs.unlinkSync(localPath)
          throw new Error('File too small, probably 404')
        }

        // Update database with new path
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: `/users/${userFolder}/${filename}` }
        })

        console.log(`✅ User ${user.id} (${user.name}) - downloaded and updated`)
        successCount++
      } catch (error) {
        console.log(`❌ User ${user.id} (${user.name}) - failed: ${error.message}`)
        failCount++
        // Clean up failed download
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath)
        }
      }

      // Small delay to not overwhelm the server
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n=== Summary ===')
    console.log(`✅ Success: ${successCount} avatars`)
    console.log(`❌ Failed: ${failCount} avatars`)
    console.log(`Total processed: ${users.length} users`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

downloadAvatars()