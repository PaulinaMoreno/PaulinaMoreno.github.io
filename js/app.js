var placesModel = [
  {
    name: 'Mansión Winchester',
    location: {
      lat: 37.3183318,
      long: -121.9532378
    },
    type: 'house'
  },
  {
    name: 'San Pedro Square Market',
    location: {
      lat: 37.3365008,
      long: -121.896501
    },
    type: 'restaurant'
  },
  {
    name: 'The Tech Museum of Innovation',
    location: {
      lat: 37.3317146,
      long: -121.8912447
    },
    type: 'museum'
  },
  {
    name: 'San Jose Center For The Performing Arts',
    location: {
      lat: 37.3296775,
      long: -121.8946684
    },
    type: 'art_gallery'
  },
  {
    name: 'Cathedral Basilica of St. Joseph',
    location: {
      lat: 37.3341318,
      long: -121.8925649
    },
    type: 'church'
  },
  {
    name: 'History San José',
    location: {
      lat: 37.3199852,
      long: -121.8608343
    },
    type: 'museum'
  },
  {
    name: 'Happy Hollow Park & Zoo',
    location: {
      lat: 37.3313091,
      long: -121.869764
    },
    type: 'zoo'
  },
  {
    name: 'Nijiya Market',
    location: {
      lat: 37.3489697,
      long: -121.8982458
    },
    type: 'supermarket'
  },
  {
    name: 'San Jose Market Center',
    location: {
      lat: 37.3447155,
      long: -121.9039462
    },
    type: 'shopping'
  },
  ];
  
  var map;
  var infoWindow;
  
  var stringStartsWith = function (string, startsWith) {
   string = string || "";
   if (startsWith.length > string.length) return false;
   return string.substring(0, startsWith.length) === startsWith;
  };
  
  var Place = function(data) {
    var self = this;
  
    self.name = data.name;
    self.lat = data.location.lat;
    self.long = data.location.long;
  
    self.show = ko.observable(true);
  
    self.infoWindowContent = '<div id="iw-container">' +'<div id="iw-content">' +
      '<h2 id="iw-title">' + self.name + '<h2>' ;
  
    $.getJSON('https://api.foursquare.com/v2/venues/search', {
      client_id: 'IMKTFMIU32VPQBDCZY2WO4S0YONBW4J5RJHFZILJI3DA1QV2',
      client_secret: 'O5JKLSDP4M4ZSFFFTWHW550WUDU3JTNVAKUKZ21OS2LWVOWJ',
      v: '20180630',
      ll: self.lat + "," + self.long,
      query: self.name,
      limit: 1
    }, function(data) {
      console.log(data.response.venues[0])
      var venueInfo = data.response.venues[0];
  
      var address = venueInfo.location.formattedAddress
    
      var category = venueInfo.categories[0].name

      // var address = venueInfo.location.hasOwnProperty("formattedAddress") ? venueInfo.location.formattedAddress : "Foursquare has no info at present";

      // var rating = venueInfo.hasOwnProperty("rating") ? venueInfo.rating + ' / 10' : "No rating available";

      // var tips = venueInfo.tips.hasOwnProperty("groups") ? venueInfo.tips.groups[0].items[0].text : "No tip available at present";

      
      self.infoWindowContent += 
            '<p>' + address + '</p>' +
            '<p>Category: ' + category + '</p>' +
            // '<p>Location: ' + address + '</p>' +
            // '<p>Rating: ' + rating + '</p>' +
            // '<p>Click to read more on <a href="' + venue.canonicalUrl + '?ref=' + this.client_id + '" target="_blank">Foursquare</a></p>' +
            '<p>Information powered by Foursquare</p>';
        
      
      self.infoWindowContent += '</div>' +  // end info_wrapper
      '</div>'; // end infowindow div class
    });
  
    self.marker = new google.maps.Marker({
      position: {lat: self.lat, lng: self.long},
      map: map,
      title: self.name
    });
  
    self.marker.addListener('click', function() {
      infoWindow.setContent(self.infoWindowContent);
      infoWindow.open(map, self.marker);
  
      self.marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        self.marker.setAnimation(null);
      }, 1000);
    });
  
    self.shouldShowMarker = ko.computed(function() {
        self.marker.setMap(self.show() ? map : null);
    }, self);
  
    self.triggerMarker = function() {
      new google.maps.event.trigger(self.marker, 'click');
    }
  };
  
  var AppViewModel = function() {
    var self = this;
  
    // stores all the places in the model
    self.places = ko.observableArray();
  
    // bind to search input in view
    self.searchInput = ko.observable('');
  
    placesModel.forEach(function(place) {
      self.places.push(new Place(place));
    });
  
    // the filtered list shown in the view
    self.filteredPlaces = ko.computed(function() {
      var searchText = self.searchInput().toLowerCase();
      if (!searchText) {
        ko.utils.arrayForEach(self.places(), function(place) {
          place.show(true);
        });
        return self.places();
      } else {
        return ko.utils.arrayFilter(this.places(), function(place) {
          var result = stringStartsWith(place.name.toLowerCase(), searchText);
          place.show(result);
          return result;
        });
      }
    }, self);
  
    self.placeClickListener = function(place) {
      console.log(place.name);
    }
  };
  
  function initApp() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.304167, lng: -121.872778},
      zoom: 12
    });

    infoWindow = new google.maps.InfoWindow();
  
    ko.applyBindings(new AppViewModel());
  }