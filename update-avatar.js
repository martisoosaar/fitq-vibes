const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateAvatar() {
  try {
    const user = await prisma.user.update({
      where: { id: 73 },
      data: { 
        avatar: '/users/user_73/avatar.png'
      }
    })
    console.log('Avatar updated for user:', user.name, 'New avatar:', user.avatar)
  } catch (error) {
    console.error('Error updating avatar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateAvatar()
