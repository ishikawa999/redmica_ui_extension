// Replace with select2 when the HTTP status of ajax request is a success.
// (by pure jquery)
$(document).ajaxSuccess(function() {
  replaceSelect2();
  initAssignToMeLink();
});

// Replace with select2 when the HTTP status of data-remote request is a success.
// (by rails-ujs)
$(document).on('ajax:success', function() {
  replaceSelect2();
  initAssignToMeLink();
});

$(function() {
  // Replace with select2 when loading page.
  replaceSelect2();

  initAssignToMeLink();

  // Fix Select2 search broken inside jQuery UI modal Dialog( https://github.com/select2/select2/issues/1246 )
  if ($.ui && $.ui.dialog && $.ui.dialog.prototype._allowInteraction) {
    var ui_dialog_interaction = $.ui.dialog.prototype._allowInteraction;
    $.ui.dialog.prototype._allowInteraction = function(e) {
      if ($(e.target).closest('.select2-dropdown').length) { return true; }
      return ui_dialog_interaction.apply(this, arguments);
    };
  };

  // Supports change of select box by filter function
  if ($('#query_form_with_buttons').length || $('form#query-form').length || $('form#query_form').length) {
    var oldAddFilter = window.addFilter;
    window.addFilter = function(field, operator, values){
      oldAddFilter(field, operator, values);
      $('#filters-table select:not([multiple]):not([data-remote]):not(.select2-hidden-accessible)').select2();
      $('#select2-add_filter_select-container.select2-selection__rendered').text('');
    }

    var oldToggleMultiSelect = window.toggleMultiSelect;
    window.toggleMultiSelect = function(el){
      oldToggleMultiSelect(el);
      if (el.attr('multiple')) {
        el.select2('destroy');
      } else {
        el.select2();
      }
    }
  }
});

function matchCustom(params, data) {
  // If there are no search terms, return all of the data
  if ($.trim(params.term) === '') {
    return data;
  }

  // Do not display the item if there is no 'text' property
  if (typeof data.text === 'undefined') {
    return null;
  }

  // `params.term` should be the term that is used for searching
  // `data.text` is the text that is displayed for the data object
  if (data.text.toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
    var modifiedData = $.extend({}, data, true);

    // You can return modified objects from here
    // This includes matching the `children` how you want in nested data sets
    return modifiedData;
  }

  let SearchStr = $(data.element).data('select2-search-str');
  if (SearchStr === null || SearchStr === void 0) {
    return null;
  }
  if (SearchStr.toString().toLowerCase().indexOf(params.term.toLowerCase()) > -1) {
    modifiedData = $.extend({}, data, true);
    return modifiedData;
  }

  // Return `null` if the term should not be displayed
  return null;
}

function applySelect2ToSelect(targets, options) {
  if (targets.length) {
    targets.select2(options).on('select2:select', function() {
      // Rails.fire cannot be used in Redmine 3.x or earlier, so it will not be executed.
      if (typeof Rails != 'undefined') { Rails.fire($(this)[0], 'change') }
    });
  }
}

function replaceSelect2() {
  // TODO: Need to support replace of select according to the click event.
  // Do not replace it with select2 until it corresponds.
  if ($('body').hasClass('controller-workflows')) {
    return;
  } else {
    applySelect2ToSelect($('.tabular .splitcontent select:not([multiple]):not([data-remote]):not(.select2-hidden-accessible)').has('option[data-select2-search-str]'), {width: 'style', matcher: matchCustom});
    applySelect2ToSelect($('.tabular .splitcontent select:not([multiple]):not([data-remote]):not(.select2-hidden-accessible)'), {width: 'style', matcher: matchCustom});
    applySelect2ToSelect($('select:not([multiple]):not([data-remote]):not(.select2-hidden-accessible)').has('option[data-select2-search-str]'), {matcher: matchCustom});
    applySelect2ToSelect($('select:not([multiple]):not([data-remote]):not(.select2-hidden-accessible)'), {});

    var excludedSelect = $('table.list td>select');
    if (excludedSelect.length) {
      excludedSelect.select2('destroy');
    }
  }
}

// Changed for a change event to occur when change a value in #issue_assigned_to_id.
// https://github.com/ishikawa999/redmine_searchable_selectbox/issues/6
function initAssignToMeLink() {
  $('form#issue-form .assign-to-me-link').click(function(event) {
    event.preventDefault();
    var element = $(event.target);
    $('#issue_assigned_to_id').val(element.data('id')).change();
    element.hide();
  });
}