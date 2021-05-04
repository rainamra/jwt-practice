function getVenueList() {
    return [
        {
            id : '1',
            name: 'Crimson Venue',
            address: 'Crismson St. no.32'
          },
          {
            id : '2',
            name: 'Oak Venue',
            address: 'Oak St. no.44'
          }
     ]
  }

function findVenueById(id) {
  const venues = getVenueList()
     const venueFound = venues.filter((venue) => {
          if (venue.id === id) {
               return venue
          }
      })
     if(venueFound.length>0){
          return venueFound
      }
      return false
  }

module.exports = { getVenueList, findVenueById }