var MOCK_DATA = {
	listings: [
		{
			id: 'aaaaaaa',
			userId: 111111,
			category: 'home tools',
			rented: false,
			disabled: false,
			toolName: 'screwdriver',
			description: 'Brand new.',
			rate: 100,
			datePosted: '1486006613722',
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/screwdriver1.jpg']
		},
		{
			id: 'bbbbbbb',
			userId: 111111,
			category: 'home tools',
			rented: true,
			disabled: false,
			toolName: 'hammer',
			description: 'Well worn, but works.',
			rate: 50,
			datePosted: '1486006613822',
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/hammer1.jpg']
		},
		{
			id: 'ccccccc',
			userId: 111111,
			category: 'power tools',
			rented: false,
			disabled: false,
			toolName: 'drill',
			description: 'Runs strong.',
			rate: 25,
			datePosted: '1486006613922',
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/drill1.jpg']
		},
		{
			id: 'ddddddd',
			userId: 222222,
			category: 'home tools',
			rented: false,
			disabled: false,
			toolName: 'hammer',
			description: 'Well worn, but works.',
			rate: 50,
			datePosted: '1486006614722',
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/hammer1.jpg']
		},
		{
			id: 'eeeeeee',
			userId: 222222,
			category: 'power tools',
			rented: false,
			disabled: false,
			toolName: 'drill',
			description: 'Runs strong.',
			rate: 25,
			datePosted: '1486006614822',
			availability: [
				{
					start: '1486006623722',
					end: '1486006683723'
				}
			],
			images: ['../images/drill1.jpg']
		}
	]
}

function getListings(callbackFn) {
    setTimeout(function(){ callbackFn(MOCK_DATA)}, 100);
}

// this function stays the same when we connect
// to real API later
function displayListings(data) {
  for (index in data.listings) {
		// finds template elements in DOM
		// and replaces content with content from db 
		var listEl = $('.templates .result-listing').clone();
		listEl.find('.tool-name').text(data.listings[index].toolName);
		listEl.find('.rate').text('$' + ((data.listings[index].rate)/Math.pow(10, 2)).toFixed(2) + '/day');
		listEl.find('img').attr('src', data.listings[index].images[0]);
		listEl.find('.description').text(data.listings[index].description);
     $('ol.results').append(listEl);
  }
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
    getListings(displayListings);
}

$(function() {
    getAndDisplayListings();
})
