import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const prisma = new PrismaClient()

// Directory to save avatars
const AVATAR_DIR = '/Users/soss/htdocs/fitq-vibes/frontend/public/images/avatars'

// Ensure directory exists
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true })
}

async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const filePath = path.join(AVATAR_DIR, filename)
      
      // Skip if file already exists
      if (fs.existsSync(filePath)) {
        console.log(`✓ Already exists: ${filename}`)
        resolve(true)
        return
      }

      const file = fs.createWriteStream(filePath)
      
      const protocol = url.startsWith('https') ? https : http
      
      const request = protocol.get(url, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          // Follow redirect
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            file.close()
            downloadImage(redirectUrl, filename).then(resolve)
            return
          }
        }
        
        if (response.statusCode !== 200) {
          file.close()
          fs.unlinkSync(filePath)
          resolve(false)
          return
        }
        
        response.pipe(file)
        file.on('finish', () => {
          file.close()
          console.log(`✓ Downloaded: ${filename}`)
          resolve(true)
        })
      })
      
      request.on('error', (err) => {
        file.close()
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        resolve(false)
      })

      request.setTimeout(5000, () => {
        request.destroy()
        file.close()
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
        resolve(false)
      })
    } catch (error) {
      resolve(false)
    }
  })
}

async function main() {
  console.log('Downloading all trainer avatars...')

  // Get all trainers with their user data
  const users = await prisma.user.findMany({
    where: {
      trainerUnlocked: 1
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      externalAvatar: true
    }
  })

  console.log(`Found ${users.length} trainers`)

  const urlsToTry = [
    'https://old.fitq.me/storage/',
    'https://app.fitq.me/storage/',
    'https://f5bef85cec4c638e3231-250b1cf964c3a77213444ba2f00d4811.ssl.cf3.rackcdn.com/'
  ]

  for (const user of users) {
    const filename = `trainer-${user.id}.jpg`
    let downloaded = false

    // Try external avatar first if it's a working URL
    if (user.externalAvatar) {
      if (user.externalAvatar.includes('stebby.eu')) {
        console.log(`Trying Stebby: ${user.name}`)
        downloaded = await downloadImage(user.externalAvatar, filename)
      } else if (user.externalAvatar.includes('sportid.com')) {
        console.log(`Trying SportID: ${user.name}`)
        downloaded = await downloadImage(user.externalAvatar, filename)
      } else if (user.externalAvatar.startsWith('http')) {
        console.log(`Trying external: ${user.name}`)
        downloaded = await downloadImage(user.externalAvatar, filename)
      }
    }

    // Try avatar field with different base URLs
    if (!downloaded && user.avatar && !user.avatar.includes('default.png')) {
      for (const baseUrl of urlsToTry) {
        console.log(`Trying ${baseUrl} for ${user.name}`)
        const fullUrl = baseUrl + user.avatar
        downloaded = await downloadImage(fullUrl, filename)
        if (downloaded) break
      }
    }

    // Update trainer with local path if downloaded
    if (downloaded) {
      await prisma.trainer.updateMany({
        where: { id: user.id },
        data: { avatar: `/images/avatars/${filename}` }
      })
      console.log(`✓ Updated avatar for ${user.name}`)
    } else {
      console.log(`✗ No avatar found for ${user.name}`)
    }
  }

  console.log('Download completed!')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error('Failed to download avatars:', e)
    process.exit(1)
  })