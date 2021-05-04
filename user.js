function getUserList() {
    return [
        {
            id : '1',
            username: 'Karli',
            password: 'helloTest'
          },
          {
            id : '2',
            username: 'Jim',
            password: 'test1234'
          }
     ]
  }

function findUserById(id) {
  const users = getUserList()
     const userFound = users.filter((user) => {
          if (user.id === id) {
               return user
          }
      })
     if(userFound.length>0){
          return userFound
      }
      return false
  }

module.exports = { getUserList, findUserById }