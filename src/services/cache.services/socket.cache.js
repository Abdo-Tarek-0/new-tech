import NodeCache from 'node-cache'

class SocketCache {
   constructor() {
      this.cache = new NodeCache()
   }

   #isUserExists = (userId, socketId) =>
      this.cache
         .get('users')
         ?.some((user) => user.userId === userId && user.socketId === socketId)

   addUser(userId, socketId, isAdmin) {
      if (this.#isUserExists(userId, socketId)) return
      isAdmin = isAdmin === 'true'
      this.cache.set('users', [
         ...(this.cache.get('users') || []),
         { userId, socketId, isAdmin },
      ])
   }

   removeUser(socketId) {
      this.cache.set(
         'users',
         (this.cache.get('users') || []).filter(
            (user) => user.socketId !== socketId
         )
      )
   }

   getUser(userId) {
      return (this.cache.get('users') || []).find(
         (user) => user.userId === userId
      )
   }

   getUserBySocketId(socketId) {
      return (this.cache.get('users') || []).find(
         (user) => user.socketId === socketId
      )
   }

   getUsers(filter = () => true) {
      return (this.cache.get('users') || []).filter(filter)
   }

   flush() {
      this.cache.set('users', [])
   }
}

const socketCache = new SocketCache()

export default socketCache
