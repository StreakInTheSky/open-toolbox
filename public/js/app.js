const apiBase = '/tools';

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

		if (data[index].disabled === true) {
			listEl.addClass('disabled');
			listEl.find('.button-disable').addClass('hidden');
			listEl.find('.button-enable').removeClass('hidden');
		}

    $('ol.results').append(listEl);
  }
}

function bindEventHandlers() {
	$('.edit-form').on('submit', function(event) {
		event.preventDefault();
	})
	$('.results').on('click', '.button-edit', function() {
		let listingId = $(this).closest('.result-listing').data('id');
		window.location.pathname = '/edit-listing/' + listingId;

		$(window).on('load', function(){
			$.getJSON(apiBase + '/' + listingId, function(data) {
				$('#tool-name').val(data.toolName);
				console.log(res);
			});
		})
	})

	//disables listing
	$('.results').on('click', '.button-disable', function() {
		let listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-enable').removeClass('hidden');

		let disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: true
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};

		$.ajax(apiBase + '/' + listingId, disabledSettings).done(function(res) {
			console.log(res)
		})
	})

	//enables listing
	$('.results').on('click', '.button-enable', function() {
		let listingId = $(this).closest('.result-listing').data('id');

		$(this).closest('.result-listing').toggleClass('disabled');
		$(this).addClass('hidden');
		$(this).siblings('.button-disable').removeClass('hidden');

		let disabledSettings = {
			method: 'PUT',
			data: JSON.stringify({
				id: listingId,
				disabled: false
			}),
			dataType: 'json',
			contentType: 'application/json; charset=utf-8'
		};

		$.ajax(apiBase + '/' + listingId, disabledSettings).done(function(res) {
			console.log(res)
		})
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
