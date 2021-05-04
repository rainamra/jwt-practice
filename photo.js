function getPhotoList() {
    return [
        {
            id : '1',
            venue_id: '2',
            author_id: '1'
          },
          {
            id : '2',
            venue_id: '1',
            author_id: '1'
          }
     ]
  }

function findPhotoById(id) {
  const photos = getPhotoList()
     const photoFound = photos.filter((photo) => {
          if (photo.id === id) {
               return photo
          }
      })
     if(photoFound.length>0){
          return photoFound
      }
      return false
  }

module.exports = { getPhotoList, findPhotoById }