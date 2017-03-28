const apiBase = 'http://localhost:8080/tools/';

function getListings(callbackFn) {
	$.getJSON(apiBase, data => callbackFn(data));
}

// this function stays the same when we connect
// to real API later
function displayListings(data) {
  for (index in data) {
		// finds template elements in DOM
		// and replaces content with content from db
		var listEl = $('.templates .result-listing').clone();
		listEl.find('.tool-name').text(data[index].toolName);
		listEl.find('.rate').text('$' + ((data[index].rate)/Math.pow(10, 2)).toFixed(2) + '/day');
		listEl.find('img').attr('src', data[index].images[0]);
		listEl.find('.description').text(data[index].description);
		listEl.attr('data-id', data[index].id);
     $('ol.results').append(listEl);
  }
}

function bindEventHandlers() {
	$('.edit-form').on('submit', function(event) {
		event.preventDefault();
	})
	$('.results').on('click', '.button-edit', function() {
		let listingId = $(this).closest('.result-listing').data('id')
		window.location.pathname = '/edit-listing/' + listingId;
		// get by id
		$.getJSON(apiBase + listingId, function(data) {
			$('#tool-name').val(data.toolName);
			console.log(data);
		});
	})
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
	getListings(displayListings);
	bindEventHandlers();
}

$(function() {
  getAndDisplayListings();
})
