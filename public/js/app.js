const apiBase = '/tools';

function getListings(callbackFn, query = '') {
	$.getJSON(apiBase + query, data => callbackFn(data)); // {disabled: 'false'}
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

		if (data[index].disabled === true) {
			listEl.addClass('disabled');
			listEl.find('.button-disable').addClass('hidden');
			listEl.find('.button-enable').removeClass('hidden');
		}

    $('ol.results').append(listEl);
  }
}

function bindEventHandlers() {
	// Edit-button handler
	$('.edit-form').on('submit', function(event) {
		event.preventDefault();
	})
	$('.results').on('click', '.button-edit', function() {
		var listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/edit-listing/' + listingId;
	})

	// Disables listing
	$('.results').on('click', '.button-disable', function() {
		var listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-enable').removeClass('hidden');

		var disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: true
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};

		$.ajax(apiBase + '/' + listingId, disabledSettings)
	})

	// Enables listing
	$('.results').on('click', '.button-enable', function() {
		var listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-disable').removeClass('hidden');

		var disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: false
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};

		$.ajax(apiBase + '/' + listingId, disabledSettings)
	})

	//Filtering by category
	$('ul.filters li').on('click', function() {
		if($(this).attr('id') === 'show-all') {
			$('ol.results').empty();
			getAndDisplayListings();
		} else {
			filterListings([$(this).attr('id').replace(/\-/, ' ')]);
		}
	})
}

function getListingItem() {
	$(window).on('load', function(){
		$.getJSON(apiBase + '/' + window.location.pathname.split('/')[2]).done(function(data) {
			console.log(data)
		});
	})
}

function filterListings(filter) {
	$('ol.results').empty();

	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false&category=' + encodeURI(filter));
			return
		case 'my-listings':
			getListings(displayListings, '?category=' + encodeURI(filter));
			return
	}
}

// this function can stay the same even when we
// are connecting to real API
function getAndDisplayListings() {
	switch(window.location.pathname.split('/')[1]) {
		case '':
			getListings(displayListings, '?disabled=false');
			return
		case 'my-listings':
			getListings(displayListings);
			return
		case 'edit-listing':
			getListingItem()
			return
	}
}


$(function() {
  getAndDisplayListings();
	bindEventHandlers();
})
